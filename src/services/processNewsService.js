import aiService from './aiService.js';
import audioService from './audioService.js';
import timestampService from './timestampService.js';

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

export default {
  processAndSaveNewsItem,
}; 