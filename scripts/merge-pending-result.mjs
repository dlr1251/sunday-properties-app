#!/usr/bin/env node
/**
 * Merge MCP notion-create-pages result for a pending batch file.
 * Usage: node scripts/merge-pending-result.mjs pending-batch-004.json '<result-json>'
 * Also accepts filtered-batch-*.json (relKeys aligned to MCP response pages).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'docs', '.notion-sync.json');
const BATCH_DIR = path.join(__dirname, '.notion-sync-batches');

const pendingFile = process.argv[2];
const resultJson = process.argv[3];
if (!pendingFile || !resultJson) {
  console.error('Usage: merge-pending-result.mjs <pending-batch-file> <result-json>');
  process.exit(1);
}

const pending = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, pendingFile), 'utf8'));
const result = JSON.parse(resultJson);
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

for (let i = 0; i < pending.relKeys.length; i++) {
  const page = result.pages[i];
  if (!page?.id) throw new Error(`Missing id for ${pending.relKeys[i]}`);
  manifest.pages[pending.relKeys[i]] = page.id.replace(/-/g, '');
}

fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Merged ${pending.relKeys.length} from ${pendingFile} → ${Object.keys(manifest.pages).length} total`);
