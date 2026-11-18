#!/usr/bin/env node
/**
 * Fails when the compiled eve manifest exposes a built-in tool Sunny must never have.
 * Run after `eve info` so .eve/compile/compiled-agent-manifest.json is fresh.
 */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const manifestPath = join(root, '.eve', 'compile', 'compiled-agent-manifest.json');

const expected = process.argv
  .filter((arg) => arg.startsWith('--expect='))
  .map((arg) => arg.slice('--expect='.length));
const FORBIDDEN = [
  'bash',
  'read_file',
  'write_file',
  'web_fetch',
  'web_search',
  'agent',
  'glob',
  'grep',
  'sleep',
];

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch {
  console.error(`Missing ${manifestPath}. Run \`npx eve info\` first.`);
  process.exit(1);
}
const active = (manifest.tools ?? []).map((tool) => tool.name);
const leaked = FORBIDDEN.filter((name) => active.includes(name));

const sandboxProvider = manifest.sandbox?.providerName;
if (sandboxProvider !== 'sunny-none') {
  console.error(
    `Expected inert sandbox provider "sunny-none" in compiled manifest; got ${JSON.stringify(sandboxProvider)}.`,
  );
  process.exit(1);
}
if (manifest.sandbox?.sourceId === 'eve:defaults:sandbox.ts') {
  console.error('Production agent still uses eve DefaultSandbox (provisions Vercel Sandbox per session).');
  process.exit(1);
}

console.log(`eve tools: ${active.join(', ') || '(none)'}`);
if (leaked.length > 0) {
  console.error(`Forbidden built-in tools are active: ${leaked.join(', ')}`);
  process.exit(1);
}
const missing = expected.filter((name) => !active.includes(name));
if (missing.length > 0) {
  console.error(`Expected tools are missing: ${missing.join(', ')}`);
  process.exit(1);
}
