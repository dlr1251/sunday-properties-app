#!/usr/bin/env node
/** Output parent+pages JSON for MCP notion-create-pages */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const batchFile = process.argv[2];
if (!batchFile) {
  console.error('Usage: load-notion-batch.mjs <batch-file>');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batch = JSON.parse(
  fs.readFileSync(path.join(__dirname, '.notion-sync-batches', batchFile), 'utf8')
);
console.log(JSON.stringify({ parent: batch.parent, pages: batch.pages }));
