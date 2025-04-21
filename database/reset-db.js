import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URL de la base de datos
const DATABASE_URL = "postgresql://postgres:35115415@localhost:5432/fasty";

/**
 * Reinicia la base de datos con el nuevo esquema
 */
async function resetDatabase() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('Reiniciando base de datos...');
    
    // Leer el esquema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Ejecutar el esquema
    await pool.query(schema);
    
    console.log('Base de datos reiniciada exitosamente');
  } catch (error) {
    console.error('Error al reiniciar la base de datos:', error);
  } finally {
    await pool.end();
  }
}

resetDatabase(); 