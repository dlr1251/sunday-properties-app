#!/usr/bin/env node
/**
 * Process filtered Notion sync batches via MCP args files.
 * Generates mcp-args-NNN.json for each filtered batch needing sync.
 * After MCP call, merge with: node scripts/merge-pending-result.mjs filtered-batch-NNN.json '<result>'
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BATCH_DIR = path.join(__dirname, '.notion-sync-batches');
const MANIFEST_PATH = path.join(__dirname, '..', 'docs', '.notion-sync.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const done = new Set(Object.keys(manifest.pages));

const filtered = fs
  .readdirSync(BATCH_DIR)
  .filter((f) => f.startsWith('filtered-batch-'))
  .sort();

let totalRemaining = 0;
for (const f of filtered) {
  const batch = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, f), 'utf8'));
  const remaining = batch.relKeys.filter((k) => !done.has(k));
  if (!remaining.length) {
    console.log(`${f}: SKIP`);
    continue;
  }
  const indices = batch.relKeys.map((k, i) => (!done.has(k) ? i : -1)).filter((i) => i >= 0);
  const payload = {
    parent: batch.parent,
    pages: indices.map((i) => batch.pages[i]),
    relKeys: indices.map((i) => batch.relKeys[i]),
  };
  const num = f.match(/(\d+)/)[1];
  fs.writeFileSync(path.join(BATCH_DIR, `mcp-args-${num}.json`), JSON.stringify({ parent: payload.parent, pages: payload.pages }));
  fs.writeFileSync(path.join(BATCH_DIR, f), JSON.stringify({ ...batch, relKeys: payload.relKeys, pages: payload.pages }));
  console.log(`${f}: ${payload.relKeys.length} pages → mcp-args-${num}.json`);
  totalRemaining += payload.relKeys.length;
}

console.log(`\nManifest: ${done.size} synced, ${totalRemaining} remaining, target 110`);
