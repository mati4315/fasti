import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';

const client = new TextToSpeechClient();

/**
 * Genera un archivo de audio a partir del texto proporcionado
 * @param {string} text - Texto a convertir en audio
 * @returns {Promise<string>} URL del archivo de audio generado
 */
async function generateAudio(text) {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('El texto para generar audio no puede estar vacío');
    }

    // Configuración de la solicitud de síntesis de voz
    const request = {
      input: { text },
      voice: {
        languageCode: 'es-ES',
        name: 'es-ES-Neural2-A',
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0
      }
    };

    // Generar el audio
    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent;

    // Generar nombre único para el archivo
    const fileName = `${uuidv4()}.mp3`;
    const filePath = path.join(config.audio.storagePath, fileName);

    // Asegurarse de que el directorio existe
    await fs.mkdir(config.audio.storagePath, { recursive: true });

    // Guardar el archivo
    await fs.writeFile(filePath, audioContent, 'binary');

    // Generar URL del archivo
    const audioUrl = `${config.audio.baseUrl}/${fileName}`;
    console.log(`Archivo de audio generado: ${audioUrl}`);

    return audioUrl;
  } catch (error) {
    console.error('Error en generateAudio:', error);
    throw new Error('Error al generar el archivo de audio');
  }
}

export default {
  generateAudio,
}; 