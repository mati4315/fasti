import axios from 'axios';
import config from '../config/index.js';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';

/**
 * Limpia el texto de la respuesta de DeepSeek
 * @param {string} text - Texto a limpiar
 * @returns {string} Texto limpio
 */
function cleanDeepSeekResponse(text) {
  return text
    // Eliminar comillas al inicio y final
    .replace(/^["'\s]+|["'\s]+$/g, '')
    // Eliminar caracteres de escape
    .replace(/\\"/g, '"')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    // Eliminar comentarios entre paréntesis
    .replace(/\(Nota:.*?\)/g, '')
    // Eliminar texto después de un salto de línea (suelen ser comentarios)
    .split('\n')[0]
    .trim();
}

/**
 * Genera un resumen conciso del texto proporcionado
 * @param {string} text - Texto a resumir
 * @returns {Promise<string>} Resumen generado
 */
async function generateSummary(text) {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('El texto para resumir no puede estar vacío');
    }

    const response = await axios.post(
      `${DEEPSEEK_API_URL}/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en generar resúmenes concisos y precisos de noticias. Genera un resumen que capture los puntos clave en 2-3 oraciones.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${config.deepseek.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return cleanDeepSeekResponse(response.data.choices[0].message.content.trim());
  } catch (error) {
    console.error('Error en generateSummary:', error.response?.data || error.message);
    throw new Error('Error al generar el resumen');
  }
}

/**
 * Traduce un texto al español
 * @param {string} text - Texto a traducir
 * @returns {Promise<string>} Texto traducido
 */
async function translateTitle(text) {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('El texto a traducir no puede estar vacío');
    }

    const response = await axios.post(
      `${DEEPSEEK_API_URL}/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Eres un traductor profesional. Traduce el texto al español de forma natural y concisa. NO incluyas comillas, paréntesis ni caracteres especiales en tu respuesta.'
          },
          {
            role: 'user',
            content: `Traduce este texto al español: ${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${config.deepseek.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const translatedText = response.data.choices[0].message.content.trim();
    return translatedText
      .replace(/^["'\s]+|["'\s]+$/g, '') // Eliminar comillas y espacios al inicio y final
      .replace(/\\"/g, '') // Eliminar comillas escapadas
      .replace(/\\n/g, ' ') // Reemplazar saltos de línea por espacios
      .replace(/\s+/g, ' ') // Normalizar espacios
      .replace(/["""'']/g, '') // Eliminar comillas tipográficas
      .trim();
  } catch (error) {
    console.error('Error en translateTitle:', error.response?.data || error.message);
    throw new Error('Error al traducir el título');
  }
}

export default {
  generateSummary,
  translateTitle,
};