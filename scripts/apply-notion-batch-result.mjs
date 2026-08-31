#!/usr/bin/env node
/** Merge MCP result from stdin: echo '<json>' | apply-notion-batch-result.mjs batch-000.json */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const batchFile = process.argv[2];
if (!batchFile) {
  console.error('Usage: apply-notion-batch-result.mjs <batch-file> < result.json');
  process.exit(1);
}

const resultJson = fs.readFileSync(0, 'utf8').trim();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const merge = path.join(__dirname, 'merge-notion-batch-result.mjs');
const r = spawnSync(process.execPath, [merge, batchFile, resultJson], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
});
process.exit(r.status ?? 1);
