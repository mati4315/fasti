/**
 * Modelo para interactuar con la tabla News
 */
class News {
  /**
   * @param {Object} db - Pool de conexión a la base de datos
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Crea una nueva noticia
   * @param {Object} newsData - Datos de la noticia
   * @returns {Promise<Object>} Noticia creada
   */
  async create(newsData) {
    const query = `
      INSERT INTO News (
        title, title_es, link, description, 
        pubDate, imagen, audioUrl, timestamps
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      newsData.title,
      newsData.title_es,
      newsData.link,
      newsData.description,
      newsData.pubDate,
      newsData.imagen,
      newsData.audioUrl,
      JSON.stringify(newsData.timestamps),
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Busca una noticia por su ID
   * @param {number} id - ID numérico de la noticia
   * @returns {Promise<Object|null>} Noticia encontrada o null
   */
  async findById(id) {
    const query = 'SELECT * FROM News WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Busca una noticia por su link
   * @param {string} link - URL de la noticia
   * @returns {Promise<Object|null>} Noticia encontrada o null
   */
  async findByLink(link) {
    const query = 'SELECT * FROM News WHERE link = $1';
    const result = await this.db.query(query, [link]);
    return result.rows[0] || null;
  }

  /**
   * Obtiene todas las noticias con paginación
   * @param {number} page - Número de página (comienza en 1)
   * @param {number} limit - Cantidad de noticias por página
   * @returns {Promise<Object>} Objeto con noticias y metadatos de paginación
   */
  async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT * FROM News 
      ORDER BY pubDate DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = 'SELECT COUNT(*) FROM News';
    
    const [result, countResult] = await Promise.all([
      this.db.query(query, [limit, offset]),
      this.db.query(countQuery),
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      news: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}

export default News; 