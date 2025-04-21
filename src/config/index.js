import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Configuración del servidor
 * @type {Object}
 */
const config = {
  // Base de datos
  database: {
    url: process.env.DATABASE_URL,
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

export default config; 