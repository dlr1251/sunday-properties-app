#!/usr/bin/env node
/**
 * Copia PDFs de data/ai_food a public/ai_food para desarrollo.
 * Los documentos de prueba estarán disponibles en /ai_food/xxx.pdf
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const aiFoodDir = path.join(root, 'data', 'ai_food');
const publicAiFoodDir = path.join(root, 'public', 'ai_food');

if (!fs.existsSync(aiFoodDir)) {
  console.warn('⚠️ data/ai_food no existe. Saltando.');
  process.exit(0);
}

if (!fs.existsSync(publicAiFoodDir)) {
  fs.mkdirSync(publicAiFoodDir, { recursive: true });
}

// Copiar PDFs
const pdfFiles = fs.readdirSync(aiFoodDir).filter((f) => f.endsWith('.pdf'));
for (const file of pdfFiles) {
  const src = path.join(aiFoodDir, file);
  const dest = path.join(publicAiFoodDir, file);
  fs.copyFileSync(src, dest);
  console.log(`  Copiado PDF: ${file}`);
}

// Copiar imágenes de jpeg/ para fotos de propiedad de prueba (incluyendo las usadas por real properties)
const jpegDir = path.join(aiFoodDir, 'jpeg');
const publicJpegDir = path.join(publicAiFoodDir, 'jpeg');
if (fs.existsSync(jpegDir)) {
  if (!fs.existsSync(publicJpegDir)) fs.mkdirSync(publicJpegDir, { recursive: true });
  const jpegs = fs.readdirSync(jpegDir).filter((f) => /\.(jpe?g|png)$/i.test(f));
  // Copy all (or a generous number) so real property seeds and mocks have their images
  const toCopy = jpegs; // previously .slice(0,5)
  for (const file of toCopy) {
    fs.copyFileSync(path.join(jpegDir, file), path.join(publicJpegDir, file));
    console.log(`  Copiado img: ${file}`);
  }
}

console.log(`✅ ${pdfFiles.length} PDFs + imágenes copiados a public/ai_food`);
