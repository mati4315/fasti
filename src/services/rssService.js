const Parser = require('rss-parser');
const config = require('../config');

/**
 * Cliente RSS Parser
 * @type {Parser}
 */
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      'enclosure',
      'image',
      ['content:encoded', 'contentEncoded']
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
    
    console.log(`Se encontraron ${feed.items.length} noticias en total`);
    
    const news = feed.items
      .slice(0, config.rss.numItems)
      .map(item => {
        // Intentar obtener la URL de la imagen de diferentes fuentes
        const imageUrl = item.enclosure?.url ||
          item.mediaContent?.url ||
          item.mediaThumbnail?.url ||
          item.image?.url ||
          extractImageFromContent(item.contentEncoded);

        return {
          title: item.title?.trim() || '',
          link: item.link?.trim() || '',
          description: item.contentSnippet?.trim() || item.description?.trim() || '',
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          imageUrl: imageUrl
        };
      });

    return news;
  } catch (error) {
    console.error('Error al obtener noticias del feed RSS:', error);
    throw error;
  }
}

function extractImageFromContent(content) {
  if (!content) return null;
  
  // Buscar una etiqueta img en el contenido HTML
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
}

module.exports = {
  fetchLatestNews
}; 