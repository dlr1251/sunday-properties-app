#!/usr/bin/env node
/**
 * Push .env.local (or .env) to Vercel environment variables via CLI.
 * Usage: node scripts/vercel-env-push.mjs [.env.local|.env] [production|preview|development]
 * Default: .env.local and production
 */
import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envFile = process.argv[2] || '.env.local';
const environment = process.argv[3] || 'production';
const root = resolve(process.cwd());
const filePath = resolve(root, envFile);

if (!existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const content = readFileSync(filePath, 'utf8');
const lines = content.split('\n');
const vars = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq <= 0) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  vars.push([key, value]);
}

async function addVar(name, value) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('npx', ['vercel', 'env', 'add', name, environment, '--force'], {
      cwd: root,
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    child.stdin.write(value, (err) => {
      if (err) reject(err);
      else child.stdin.end(() => resolvePromise());
    });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolvePromise() : reject(new Error(`exit ${code}`))));
  });
}

async function main() {
  console.log(`Pushing ${vars.length} variables from ${envFile} to Vercel (${environment})...`);
  for (const [key, value] of vars) {
    process.stdout.write(`  ${key}... `);
    try {
      await addVar(key, value);
      console.log('OK');
    } catch (e) {
      console.log('FAIL', e.message);
    }
  }
  console.log('Done.');
}

main();
