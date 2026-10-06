#!/usr/bin/env node
/**
 * Merge MCP result with explicit relKeys list (for split batches).
 * Usage: node scripts/merge-partial-result.mjs 'key1,key2' '<result-json>'
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = path.join(path.resolve(__dirname, '..'), 'docs', '.notion-sync.json');

const relKeys = process.argv[2].split(',').filter(Boolean);
const result = JSON.parse(process.argv[3]);
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

for (let i = 0; i < relKeys.length; i++) {
  const page = result.pages[i];
  if (!page?.id) throw new Error(`Missing id for ${relKeys[i]}`);
  manifest.pages[relKeys[i]] = page.id.replace(/-/g, '');
}

fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Merged ${relKeys.length} → ${Object.keys(manifest.pages).length} total`);
