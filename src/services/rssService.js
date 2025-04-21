import Parser from 'rss-parser';
import config from '../config/index.js';

/**
 * Cliente RSS Parser
 * @type {Parser}
 */
const parser = new Parser({
  customFields: {
    item: [
      'media:content',
      'media:thumbnail',
      'enclosure',
      'image',
      'content:encoded'
    ]
  }
});

/**
 * Obtiene las últimas noticias del feed RSS
 * @returns {Promise<Array<Object>>} Array de noticias del feed
 */
async function fetchLatestNews() {
  try {
    console.log('Obteniendo noticias del feed RSS...');

    const feed = await parser.parseURL(config.rss.feedUrl);
    console.log(`Se encontraron ${feed.items.length} noticias en el feed`);

    // Mapear y limpiar los datos del feed
    const news = feed.items
      .slice(0, config.rss.numItems)
      .map(item => {
        // Imprimir la estructura del ítem para debugging
        console.log('Estructura del ítem:', JSON.stringify(item, null, 2));

        // Extraer la URL de la imagen
        let imageUrl = null;
        
        // Intentar obtener la imagen de diferentes fuentes
        if (item.enclosure?.url) {
          imageUrl = item.enclosure.url;
        } else if (item['media:content']?.url) {
          imageUrl = item['media:content'].url;
        } else if (item['media:thumbnail']?.url) {
          imageUrl = item['media:thumbnail'].url;
        } else if (item.image?.url) {
          imageUrl = item.image.url;
        } else if (item['content:encoded']) {
          // Buscar imagen en el contenido HTML
          const imgMatch = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) {
            imageUrl = imgMatch[1];
          }
        }

        return {
          title: item.title?.trim() || '',
          link: item.link?.trim() || '',
          description: item.contentSnippet?.trim() || item.description?.trim() || '',
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          enclosure: item.enclosure,
          image: item.image,
          mediaContent: item['media:content'],
          mediaThumbnail: item['media:thumbnail'],
          contentEncoded: item['content:encoded'],
          imageUrl // Agregar la URL de la imagen extraída
        };
      });

    // Filtrar noticias inválidas
    const validNews = news.filter(item => 
      item.title && 
      item.link && 
      item.description
    );

    console.log(`Se procesaron ${validNews.length} noticias válidas`);
    return validNews;
  } catch (error) {
    console.error('Error en fetchLatestNews:', error);
    throw new Error('Error al obtener noticias del feed RSS');
  }
}

export default {
  fetchLatestNews,
}; 