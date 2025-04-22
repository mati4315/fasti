import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function cleanDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Limpiando tabla News...');
    await pool.query('TRUNCATE TABLE News RESTART IDENTITY CASCADE;');
    console.log('Tabla News limpiada exitosamente');
  } catch (error) {
    console.error('Error al limpiar la tabla:', error);
  } finally {
    await pool.end();
  }
}

cleanDatabase(); 