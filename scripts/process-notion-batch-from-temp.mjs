#!/usr/bin/env node
/**
 * Apply saved MCP response for a batch loaded in /tmp/notion-batch-NNN.json
 * Usage: process-notion-batch-from-temp.mjs 007 '<json-response>'
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const num = process.argv[2];
const resultJson = process.argv[3];
if (!num || !resultJson) {
  console.error('Usage: process-notion-batch-from-temp.mjs <num> <result-json>');
  process.exit(1);
}

const batchFile = `batch-${num}.json`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const merge = path.join(__dirname, 'merge-notion-batch-result.mjs');
const r = spawnSync(process.execPath, [merge, batchFile, resultJson], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
});
process.exit(r.status ?? 1);
