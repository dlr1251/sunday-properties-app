#!/usr/bin/env node
/**
 * Copia docs bilingües (es/en) a public/docs manteniendo estructura.
 * El visor en /docs hace fetch('/docs/<lang>/...'); los archivos deben estar en public/docs/<lang>/.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const docsDir = path.join(root, 'docs');
const publicDocsDir = path.join(root, 'public', 'docs');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      if (name === 'README.md') continue;
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
    return;
  }
  fs.copyFileSync(src, dest);
}

// Crear directorio public/docs si no existe
if (!fs.existsSync(publicDocsDir)) {
  fs.mkdirSync(publicDocsDir, { recursive: true });
}

// Copiar docs/es -> public/docs/es
const esSourceDir = path.join(docsDir, 'es');
const esDestDir = path.join(publicDocsDir, 'es');
if (fs.existsSync(esSourceDir)) {
  console.log('Copiando docs/es -> public/docs/es...');
  copyRecursive(esSourceDir, esDestDir);
} else {
  console.warn('docs/es no existe. Saltando.');
}

// Copiar docs/en -> public/docs/en
const enSourceDir = path.join(docsDir, 'en');
const enDestDir = path.join(publicDocsDir, 'en');
if (fs.existsSync(enSourceDir)) {
  console.log('Copiando docs/en -> public/docs/en...');
  copyRecursive(enSourceDir, enDestDir);
} else {
  console.warn('docs/en no existe. Saltando.');
}

console.log('✅ public/docs actualizado con versiones ES/EN.');
