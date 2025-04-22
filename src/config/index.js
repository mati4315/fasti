const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Configuración del servidor
 * @type {Object}
 */
const config = {
  // Base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '3306',
    user: process.env.DB_USER || 'fasty',
    password: process.env.DB_PASSWORD || '35115415',
    database: process.env.DB_NAME || 'fasty',
    dialect: 'mysql'
  },

  // APIs Externas
  google: {
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  // Configuración del Procesador RSS
  rss: {
    feedUrl: process.env.RSS_FEED_URL,
    fetchInterval: parseInt(process.env.RSS_FETCH_INTERVAL || '900000', 10),
    numItems: parseInt(process.env.RSS_NUM || '4', 10),
  },

  // Configuración del Servidor
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development',
  },

  // Configuración de Audio
  audio: {
    storagePath: process.env.AUDIO_STORAGE_PATH || './audio_files',
  },
};

module.exports = config; 