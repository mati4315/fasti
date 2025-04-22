const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const staticFiles = require('@fastify/static');
const path = require('path');
const config = require('./config');
const sequelize = require('../database');
const News = require('./models/News');

// Registrar plugins
fastify.register(cors);
fastify.register(staticFiles, {
  root: path.join(__dirname, 'audio_files'),
  prefix: '/audio/'
});

// Rutas
fastify.get('/api/news', async (request, reply) => {
  try {
    const news = await News.findAll({
      order: [['pubDate', 'DESC']]
    });
    return { news };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Error al obtener las noticias' });
  }
});

fastify.get('/api/news/:id', async (request, reply) => {
  try {
    const news = await News.findByPk(request.params.id);
    if (!news) {
      return reply.code(404).send({ error: 'Noticia no encontrada' });
    }
    return news;
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Error al obtener la noticia' });
  }
});

// Iniciar el servidor
const start = async () => {
  try {
    // Sincronizar la base de datos
    await sequelize.sync();
    
    // Iniciar el servidor
    await fastify.listen({ 
      port: config.server.port, 
      host: config.server.host 
    });
    console.log(`Servidor iniciado en http://${config.server.host}:${config.server.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 