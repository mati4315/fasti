import cron from 'node-cron';
import rssService from '../services/rssService.js';
import processNewsService from '../services/processNewsService.js';
import config from '../config/index.js';

/**
 * Procesa las últimas noticias del feed RSS
 * @param {Object} db - Pool de conexión a la base de datos
 */
async function processLatestNews(db) {
  try {
    console.log('Iniciando procesamiento de noticias...');

    // Obtener las últimas noticias del feed
    const news = await rssService.fetchLatestNews();
    console.log(`Se encontraron ${news.length} noticias para procesar`);

    // Procesar cada noticia
    for (const item of news) {
      try {
        // Verificar si la noticia ya existe
        const exists = await db.query('SELECT id FROM News WHERE link = $1', [item.link]);
        
        if (exists.rows.length > 0) {
          console.log(`La noticia ${item.link} ya existe, saltando...`);
          continue;
        }

        // Procesar y guardar la noticia
        await processNewsService.processAndSaveNewsItem(item, db);
        console.log(`Noticia procesada exitosamente: ${item.link}`);
      } catch (error) {
        console.error(`Error procesando noticia ${item.link}:`, error);
        // Continuar con la siguiente noticia
        continue;
      }
    }

    console.log('Procesamiento de noticias completado');
  } catch (error) {
    console.error('Error en el procesamiento de noticias:', error);
  }
}

/**
 * Inicia el cron job para procesar noticias
 * @param {Object} db - Pool de conexión a la base de datos
 */
function startNewsProcessor(db) {
  // Validar la configuración
  if (!config.rss.feedUrl) {
    throw new Error('RSS_FEED_URL no está configurado');
  }

  const interval = Math.max(config.rss.fetchInterval, 60000); // Mínimo 1 minuto
  const minutes = Math.floor(interval / 60000);

  // Crear expresión cron (cada X minutos)
  const cronExpression = `*/${minutes} * * * *`;

  console.log(`Configurando cron job para ejecutarse cada ${minutes} minutos`);
  
  // Iniciar el cron job
  cron.schedule(cronExpression, () => {
    processLatestNews(db);
  });
}

export default {
  startNewsProcessor,
}; 