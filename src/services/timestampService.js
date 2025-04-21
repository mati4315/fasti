import OpenAI from 'openai';
import config from '../config/index.js';

/**
 * Cliente de OpenAI
 */
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Genera timestamps para sincronizar el texto con el audio
 * @param {string} text - Texto a analizar
 * @returns {Promise<Array<{start: string, end: string, text: string}>>} Array de timestamps
 */
async function generateTimestamps(text) {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('El texto para generar timestamps no puede estar vacío');
    }

    const prompt = `Analiza el siguiente texto y genera timestamps precisos para cada fragmento significativo. 
    El formato debe ser un array JSON donde cada elemento tiene:
    - start: tiempo de inicio en formato HH:MM:SS
    - end: tiempo de fin en formato HH:MM:SS
    - text: el fragmento de texto correspondiente

    Considera que:
    1. El texto será leído en voz alta en español
    2. Los timestamps deben ser precisos y naturales
    3. Divide el texto en fragmentos lógicos
    4. El tiempo total estimado debe ser realista para una lectura en voz alta

    Texto a analizar:
    "${text}"

    Responde SOLO con el array JSON, sin explicaciones adicionales.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en análisis de texto y generación de timestamps para sincronización de audio.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const timestampsJson = response.choices[0].message.content.trim();
    const timestamps = JSON.parse(timestampsJson);

    // Validar el formato de los timestamps
    if (!Array.isArray(timestamps)) {
      throw new Error('La respuesta no es un array válido');
    }

    for (const ts of timestamps) {
      if (!ts.start || !ts.end || !ts.text) {
        throw new Error('Formato de timestamp inválido');
      }
      if (!/^\d{2}:\d{2}:\d{2}$/.test(ts.start) || !/^\d{2}:\d{2}:\d{2}$/.test(ts.end)) {
        throw new Error('Formato de tiempo inválido');
      }
    }

    console.log(`Timestamps generados: ${timestamps.length} fragmentos`);
    return timestamps;
  } catch (error) {
    console.error('Error en generateTimestamps:', error);
    throw new Error('Error al generar los timestamps');
  }
}

export default {
  generateTimestamps,
}; 