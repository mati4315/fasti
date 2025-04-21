# RSS News Processor API con Fastify (9News QLD Edition)


## **Scrip para generar noticia manualmente** 
npm run process-news

## **Por defecto se carga la mas nueva si quieres cargar otra coloca el numero ej**
npm run process-news 2


## Descripción

Sistema API automatizado que procesa noticias del feed RSS de 9News Queensland. Obtiene las últimas noticias, genera resúmenes concisos con IA, traduce títulos al español, crea versiones en audio y genera timestamps sincronizados. Construido con Fastify para un rendimiento óptimo.

**Feed RSS Principal:** `https://www.9news.com.au/queensland/rss`

## Características Principales

1.  **Obtención y Filtrado de Noticias RSS**
    *   **Scraping Automatizado:** Obtiene periódicamente las noticias del feed RSS de 9News Queensland.
    *   **Verificación de Duplicados:** Compara las noticias entrantes (usando el `link` como identificador único) con las existentes en la base de datos para procesar solo las novedades.
    *   **Procesamiento Asíncrono:** Maneja el procesamiento de cada nueva noticia de forma independiente.
    *   **Selección de Noticias:** Permite procesar noticias específicas por índice (0 = más reciente).
    *   **Configuración Flexible:** Número de noticias a procesar configurable mediante variable de entorno.

2.  **Procesamiento con IA (DeepSeek)**
    *   **Generación de Resúmenes:** Toma el contenido del campo `description` original de la noticia y utiliza DeepSeek AI para generar un resumen conciso. **Este resumen reemplaza el contenido original en el campo `description` de la base de datos.**
    *   **Traducción de Títulos:** Toma el campo `title` original de la noticia y utiliza DeepSeek AI (u otro servicio configurado) para traducirlo al español. El resultado se guarda en el campo `title_es`.

3.  **Generación de Audio (Google Cloud TTS)**
    *   **Texto a Audio:** Convierte el **resumen generado por IA** (el nuevo contenido del campo `description`) en un archivo de audio utilizando Google Cloud Text-to-Speech con voces naturales.
    *   **Almacenamiento de Audio:** Guarda el archivo de audio generado (ej. MP3) en una ubicación accesible (local o almacenamiento en la nube) y almacena la URL correspondiente en el campo `audioUrl`.

4.  **Generación de Timestamps (LLM)**
    *   **Sincronización Texto-Audio:** Utiliza un modelo de lenguaje grande (LLM) potente (como la API de OpenAI - ChatGPT) para analizar el **resumen generado por IA** y generar timestamps precisos que indican qué fragmento de texto corresponde a qué intervalo de tiempo en el audio.
    *   **Formato JSON:** Guarda los timestamps en el campo `timestamps` de la base de datos como un objeto JSON con la estructura: `[{"start": "HH:MM:SS", "end": "HH:MM:SS", "text": "Fragmento de texto..."}]`.

5.  **Manejo de Imágenes**
    *   **Extracción Robusta:** Obtiene URLs de imágenes de múltiples fuentes en el feed RSS (enclosure, media:content, media:thumbnail, etc.).
    *   **Almacenamiento Eficiente:** Guarda la URL de la imagen de portada en el campo `imagen` de la base de datos.

## Variables de Entorno (`.env`)

```env
# Base de Datos PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# APIs Externas
GOOGLE_APPLICATION_CREDENTIALS="./path/to/your-google-credentials.json"
DEEPSEEK_API_KEY="sk-xxxxxxxxxxxxxxxxxxxx"
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxx"

# Configuración del Procesador RSS
RSS_FEED_URL="https://www.9news.com.au/queensland/rss"
RSS_FETCH_INTERVAL="900000"  # Intervalo de chequeo en ms (ej. 15 minutos)
RSS_NUM="4"                  # Número de noticias a procesar

# Configuración del Servidor Fastify
PORT=3000
HOST="0.0.0.0"
NODE_ENV="development"

# Configuración de Audio
AUDIO_STORAGE_PATH="./audio_files"
AUDIO_BASE_URL="http://localhost:3000/audio"
```

## Uso del Script de Procesamiento

El script `processNews.js` permite procesar noticias específicas del feed:

```bash
# Procesar la noticia más reciente (índice 0)
npm run process-news

# Procesar una noticia específica por índice
npm run process-news 1  # Procesa la segunda noticia más reciente
```

## API Endpoints

```javascript
// Obtener todas las noticias procesadas (paginado)
GET /api/news?page=1&limit=10

// Obtener una noticia específica por su ID
GET /api/news/:id

// Obtener el archivo de audio de una noticia
GET /api/news/:id/audio
```

## Modelo de Datos (PostgreSQL)

```sql
CREATE TABLE News (
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
```

## Versiones

Para ver el historial completo de cambios, consulta el archivo [CHANGELOG.md](CHANGELOG.md).