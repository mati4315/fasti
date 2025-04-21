import News from '../models/News.js';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import config from '../config/index.js';

/**
 * Registra las rutas de noticias en la aplicación Fastify
 * @param {Object} fastify - Instancia de Fastify
 */
async function newsRoutes(fastify) {
  // Registrar el modelo de noticias
  const newsModel = new News(fastify.pg);

  // Registrar ruta estática para archivos de audio
  await fastify.register(fastifyStatic, {
    root: join(process.cwd(), config.audio.storagePath),
    prefix: '/audio/',
  });

  // Obtener todas las noticias (paginado)
  fastify.get('/api/news', async (request, reply) => {
    try {
      const { page = 1, limit = 10 } = request.query;
      const result = await newsModel.getAll(parseInt(page), parseInt(limit));
      return result;
    } catch (error) {
      console.error('Error al obtener noticias:', error);
      reply.status(500).send({ error: 'Error interno del servidor' });
    }
  });

  // Obtener una noticia por ID
  fastify.get('/api/news/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const news = await newsModel.findById(parseInt(id));

      if (!news) {
        return reply.status(404).send({ error: 'Noticia no encontrada' });
      }

      return news;
    } catch (error) {
      console.error('Error al obtener noticia:', error);
      reply.status(500).send({ error: 'Error interno del servidor' });
    }
  });

  // Obtener el archivo de audio de una noticia
  fastify.get('/api/news/:id/audio', async (request, reply) => {
    try {
      const { id } = request.params;
      const news = await newsModel.findById(parseInt(id));

      if (!news) {
        return reply.status(404).send({ error: 'Noticia no encontrada' });
      }

      if (!news.audioUrl) {
        return reply.status(404).send({ error: 'Audio no disponible' });
      }

      // Redirigir al archivo de audio
      return reply.redirect(news.audioUrl);
    } catch (error) {
      console.error('Error al obtener audio:', error);
      reply.status(500).send({ error: 'Error interno del servidor' });
    }
  });
}

export default newsRoutes; 