#!/usr/bin/env node
/**
 * Merge MCP notion-create-pages results into docs/.notion-sync.json
 * Usage: node scripts/merge-notion-batch-result.mjs batch-000.json '<json response pages array>'
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'docs', '.notion-sync.json');

const batchFile = process.argv[2];
const resultJson = process.argv[3];
if (!batchFile || !resultJson) {
  console.error('Usage: merge-notion-batch-result.mjs <batch-file> <result-json>');
  process.exit(1);
}

const batch = JSON.parse(fs.readFileSync(path.join(__dirname, '.notion-sync-batches', batchFile), 'utf8'));
const result = JSON.parse(resultJson);
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

for (let i = 0; i < batch.relKeys.length; i++) {
  const page = result.pages[i];
  if (!page?.id) throw new Error(`Missing page id for ${batch.relKeys[i]}`);
  manifest.pages[batch.relKeys[i]] = page.id.replace(/-/g, '');
}

fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Merged ${batch.relKeys.length} pages from ${batchFile}`);
