const { fetchLatestNews } = require('../services/rssService');
const { processNewsItem } = require('../services/processNewsService');
const sequelize = require('../../database');
const News = require('../models/News');

/**
 * Script para procesar una noticia específica del feed
 * @param {number} newsIndex - Índice de la noticia a procesar (0 = más reciente)
 */
async function processNews(newsIndex = 0) {
  try {
    // Obtener las últimas noticias del feed RSS
    const newsItems = await fetchLatestNews();
    console.log(`Se encontraron ${newsItems.length} noticias en el feed RSS`);

    if (newsItems.length === 0) {
      console.log('No hay noticias nuevas para procesar');
      process.exit(0);
    }

    if (newsIndex >= newsItems.length) {
      console.log(`Error: El índice ${newsIndex} está fuera de rango. Solo hay ${newsItems.length} noticias disponibles.`);
      process.exit(1);
    }

    const selectedNews = newsItems[newsIndex];
    console.log(`Procesando noticia [${newsIndex}]: ${selectedNews.title}`);

    // Verificar si la noticia ya existe
    const existingNews = await News.findOne({
      where: { link: selectedNews.link }
    });

    if (existingNews) {
      console.log('Esta noticia ya existe en la base de datos');
      process.exit(0);
    }

    // Procesar la noticia (resumen, traducción y audio)
    console.log('\nIniciando procesamiento completo de la noticia...');
    const processedNews = await processNewsItem(selectedNews);
    
    // Crear la noticia en la base de datos
    const newsData = {
      title: processedNews.title,
      title_es: processedNews.title_es,
      link: processedNews.link,
      description: processedNews.description,
      pubDate: processedNews.pubDate,
      imagen: processedNews.imageUrl,
      audio: processedNews.audio,
      noticia: await getNextNoticiaId()
    };

    const savedNews = await News.create(newsData);
    console.log(`\n✓ Noticia guardada exitosamente con ID: ${savedNews.id}`);
    process.exit(0);

  } catch (error) {
    console.error('Error al procesar la noticia:', error);
    process.exit(1);
  }
}

async function getNextNoticiaId() {
  const maxNoticia = await News.max('noticia');
  return (maxNoticia || 0) + 1;
}

// Obtener el índice de la noticia de los argumentos de la línea de comandos
const newsIndex = parseInt(process.argv[2] || '0', 10);
processNews(newsIndex); 