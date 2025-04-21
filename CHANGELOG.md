# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-03-21

### Añadido
- Configuración de número de noticias a procesar mediante variable de entorno `RSS_NUM`
- Mejora en la extracción de imágenes del feed RSS
- Soporte para procesar noticias específicas por índice
- Logging detallado de la estructura del feed RSS

### Cambiado
- Refactorización del servicio RSS para manejar múltiples formatos de imágenes
- Mejora en la lógica de extracción de URLs de imágenes
- Actualización del script de procesamiento para aceptar índice de noticia

### Corregido
- Problema con la extracción y guardado de URLs de imágenes
- Manejo de campos opcionales en el feed RSS

## [1.0.0] - 2024-03-20

### Añadido
- Implementación inicial del procesador de noticias RSS
- Integración con DeepSeek AI para resúmenes y traducciones
- Generación de audio con Google Cloud TTS
- Generación de timestamps con LLM
- Base de datos PostgreSQL para almacenamiento
- API REST con Fastify
- Sistema de tareas programadas con node-cron
- Documentación completa en README.md 