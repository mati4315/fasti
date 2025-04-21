import { exec } from 'child_process';
import { promisify } from 'util';
import config from '../src/config/index.js';

const execAsync = promisify(exec);

/**
 * Inicializa la base de datos ejecutando el script SQL
 */
async function initDatabase() {
  try {
    console.log('Inicializando base de datos...');
    
    // Ejecutar el script SQL usando psql
    const { stdout, stderr } = await execAsync(
      `psql -U postgres -f ${process.cwd()}/database/schema.sql`
    );

    if (stderr) {
      console.error('Error al ejecutar el script SQL:', stderr);
      return;
    }

    console.log('Base de datos inicializada correctamente');
    console.log('Salida:', stdout);
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
}

// Ejecutar la inicialización
initDatabase(); 