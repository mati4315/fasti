import Fastify from 'fastify';
import cors from '@fastify/cors';
import pkg from 'pg';
const { Pool } = pkg;
import config from './config/index.js';
import newsRoutes from './routes/news.js';
import newsProcessor from './jobs/newsProcessor.js';

/**
 * Inicializa y configura el servidor Fastify
 * @returns {Promise<FastifyInstance>} Instancia del servidor Fastify
 */
async function buildServer() {
  // Crear instancia de Fastify
  const fastify = Fastify({
    logger: true,
  });

  // Registrar plugin de CORS
  await fastify.register(cors, {
    origin: true, // En producción, especificar los orígenes permitidos
  });

  // Configurar pool de conexiones a PostgreSQL
  const pool = new Pool({
    connectionString: config.database.url,
  });

  // Decorar fastify con el pool de conexiones
  fastify.decorate('pg', pool);

  // Registrar rutas
  await fastify.register(newsRoutes);

  // Ruta de health check
  fastify.get('/health', async () => {
    return { status: 'ok' };
  });

  // Iniciar el procesador de noticias
  newsProcessor.startNewsProcessor(pool);

  return fastify;
}

/**
 * Inicia el servidor
 */
async function startServer() {
  try {
    const server = await buildServer();
    
    // Iniciar el servidor
    await server.listen({
      port: config.server.port,
      host: config.server.host,
    });

    console.log(`Servidor iniciado en http://${config.server.host}:${config.server.port}`);
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer(); 