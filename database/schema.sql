-- Crear la base de datos si no existe
SELECT 'CREATE DATABASE fasty'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fasty')\gexec

-- Conectar a la base de datos
\c fasty

-- Crear extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla News
CREATE TABLE IF NOT EXISTS News (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_es TEXT,
  link TEXT UNIQUE NOT NULL,
  description TEXT,
  pubDate TIMESTAMP WITH TIME ZONE NOT NULL,
  imagen TEXT,
  audioUrl TEXT,
  timestamps JSONB,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear función para actualizar updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updatedAt automáticamente
DROP TRIGGER IF EXISTS update_news_updated_at ON News;
CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON News
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 