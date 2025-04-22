const { OpenAI } = require('openai');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

// Inicializar clientes de APIs
const openai = new OpenAI({
  apiKey: config.openai.apiKey
});

const textToSpeech = new TextToSpeechClient({
  keyFilename: config.google.credentialsPath
});

/**
 * Procesa y guarda un ítem de noticia del RSS
 * @param {Object} rssItem - Ítem de noticia del feed RSS
 * @param {Object} db - Pool de conexión a la base de datos
 * @returns {Promise<void>}
 */
async function processAndSaveNewsItem(rssItem, db) {
  try {
    // 1. Generar resumen con IA
    const summaryText = await aiService.generateSummary(rssItem.description || '');
    console.log('Resumen generado exitosamente');

    // 2. Traducir título con IA
    const translatedTitle = await aiService.translateTitle(rssItem.title || '');
    console.log('Título traducido exitosamente');

    // 3. Generar audio del resumen
    const audioUrl = await audioService.generateAudio(summaryText);
    console.log('Audio generado exitosamente');

    // 4. Generar timestamps del resumen
    const timestamps = await timestampService.generateTimestamps(summaryText);
    console.log('Timestamps generados exitosamente');

    // 5. Preparar datos para guardar
    const newsData = {
      title: rssItem.title,
      title_es: translatedTitle,
      link: rssItem.link,
      description: summaryText,
      pubDate: new Date(rssItem.pubDate),
      imagen: rssItem.imageUrl || null,
      audioUrl,
      timestamps,
    };

    // 6. Guardar en base de datos
    const query = `
      INSERT INTO News (
        title, title_es, link, description, pubDate, 
        imagen, audioUrl, timestamps
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    const values = [
      newsData.title,
      newsData.title_es,
      newsData.link,
      newsData.description,
      newsData.pubDate,
      newsData.imagen,
      newsData.audioUrl,
      JSON.stringify(newsData.timestamps)
    ];

    const result = await db.query(query, values);
    console.log(`Noticia guardada con ID: ${result.rows[0].id}`);

  } catch (error) {
    console.error('Error en processAndSaveNewsItem:', error);
    throw error;
  }
}

/**
 * Procesa una noticia: genera resumen, traduce y crea audio
 * @param {Object} newsData - Datos de la noticia a procesar
 * @returns {Promise<Object>} Noticia procesada con resumen, traducción y audio
 */
async function processNewsItem(newsData) {
  try {
    console.log('Iniciando procesamiento de noticia...');

    // Generar resumen en inglés
    const summary = await generateSummary(newsData.description);
    console.log('✓ Resumen generado');

    // Traducir título y resumen al español
    const [titleEs, summaryEs] = await Promise.all([
      translateText(newsData.title),
      translateText(summary)
    ]);
    console.log('✓ Traducción completada');

    // Generar audio del resumen en español
    const audioFileName = await generateAudio(summaryEs);
    console.log('✓ Audio generado');

    return {
      ...newsData,
      title_es: titleEs,
      description_es: summaryEs,
      audio: audioFileName
    };
  } catch (error) {
    console.error('Error en processNewsItem:', error);
    throw error;
  }
}

/**
 * Genera un resumen del texto usando OpenAI
 * @param {string} text - Texto a resumir
 * @returns {Promise<string>} Resumen generado
 */
async function generateSummary(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise summaries of news articles. Keep the summary to 2-3 sentences."
        },
        {
          role: "user",
          content: `Please summarize this news article: ${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error al generar resumen:', error);
    throw error;
  }
}

/**
 * Traduce texto al español usando OpenAI
 * @param {string} text - Texto a traducir
 * @returns {Promise<string>} Texto traducido
 */
async function translateText(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional translator. Translate the text to Spanish, maintaining the original meaning and tone."
        },
        {
          role: "user",
          content: `Translate this text to Spanish: ${text}`
        }
      ],
      temperature: 0.3,
      max_tokens: 150
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error al traducir texto:', error);
    throw error;
  }
}

/**
 * Genera archivo de audio a partir de texto
 * @param {string} text - Texto para convertir a audio
 * @returns {Promise<string>} Nombre del archivo de audio generado
 */
async function generateAudio(text) {
  try {
    const request = {
      input: { text },
      voice: {
        languageCode: 'es-ES',
        name: 'es-ES-Standard-A'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: 0,
        speakingRate: 0.9
      },
    };

    const [response] = await textToSpeech.synthesizeSpeech(request);
    const audioFileName = `${uuidv4()}.mp3`;
    const audioPath = path.join(config.audio.storagePath, audioFileName);

    await fs.writeFile(audioPath, response.audioContent, 'binary');
    return audioFileName;
  } catch (error) {
    console.error('Error al generar audio:', error);
    throw error;
  }
}

module.exports = {
  processAndSaveNewsItem,
  processNewsItem
}; 