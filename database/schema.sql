-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS fasty;

USE fasty;

-- Crear extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla News
CREATE TABLE IF NOT EXISTS News (
  id INT AUTO_INCREMENT PRIMARY KEY,
  noticia INT UNIQUE,
  title VARCHAR(255) NOT NULL,
  title_es TEXT,
  link VARCHAR(255) NOT NULL,
  description TEXT,
  pubDate DATETIME,
  imagen TEXT,
  audio TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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