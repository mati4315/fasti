import pkg from 'pg';
const { Pool } = pkg;
import config from '../config/index.js';
import rssService from '../services/rssService.js';
import processNewsService from '../services/processNewsService.js';

/**
 * Script para procesar una noticia específica del feed
 * @param {number} newsIndex - Índice de la noticia a procesar (0 = más reciente)
 */
async function processNews(newsIndex = 0) {
  let pool;
  try {
    console.log(`Iniciando procesamiento de la noticia en el índice ${newsIndex}...`);

    // Crear pool de conexión a la base de datos
    pool = new Pool({
      connectionString: config.database.url,
    });

    // Obtener las últimas noticias del feed
    const news = await rssService.fetchLatestNews();
    
    if (news.length === 0) {
      console.log('No se encontraron noticias en el feed');
      return;
    }

    // Verificar que el índice sea válido
    if (newsIndex < 0 || newsIndex >= news.length) {
      console.log(`Error: El índice ${newsIndex} está fuera de rango. Hay ${news.length} noticias disponibles.`);
      return;
    }

    // Obtener la noticia en el índice especificado
    const selectedNews = news[newsIndex];
    console.log(`\nNoticia seleccionada:`);
    console.log(`Título: ${selectedNews.title}`);
    console.log(`Fecha: ${selectedNews.pubDate}`);

    // Verificar si ya existe
    const exists = await pool.query('SELECT id FROM News WHERE link = $1', [selectedNews.link]);
    
    if (exists.rows.length > 0) {
      console.log('\nEsta noticia ya existe en la base de datos');
      return;
    }

    // Preguntar si desea continuar
    console.log('\n¿Deseas procesar esta noticia? (Ctrl+C para cancelar)');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Procesar la noticia
    console.log('\nProcesando noticia...');
    await processNewsService.processAndSaveNewsItem(selectedNews, pool);
    console.log('✓ Noticia procesada exitosamente');

  } catch (error) {
    console.error('Error en el procesamiento:', error);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Obtener el índice de la noticia desde los argumentos de línea de comandos
const newsIndex = process.argv[2] ? parseInt(process.argv[2], 10) : 0;

// Ejecutar el script con el índice especificado
processNews(newsIndex); 