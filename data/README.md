# Datos de desarrollo

Assets que no forman parte del bundle de la app pero se usan en seeds y pruebas locales.

| Carpeta | Contenido | Uso |
|---------|-----------|-----|
| `ai_food/` | PDFs legales e imágenes JPEG de propiedades de prueba | Copiados a `public/ai_food/` con `npm run copy:ai-food` (también en `predev` / `prebuild`) |

Los archivos en `public/ai_food/` son generados y están en `.gitignore`. La fuente canónica vive aquí.
