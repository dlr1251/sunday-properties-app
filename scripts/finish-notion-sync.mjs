#!/usr/bin/env node
/**
 * Finish initial Notion sync for remaining pending batches using NOTION_TOKEN.
 * Reads /tmp/pending-batch-*-filtered.json files or scripts/.notion-sync-batches/pending-*.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@notionhq/client';
import { markdownToBlocks } from '@tryfabric/martian';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'docs', '.notion-sync.json');
const RATE_LIMIT_MS = 350;
const BLOCK_CHUNK_SIZE = 100;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

function markdownToNotionBlocks(markdown) {
  try {
    const blocks = markdownToBlocks(markdown);
    return blocks.length ? blocks : [{ object: 'block', type: 'paragraph', paragraph: { rich_text: [] } }];
  } catch {
    return [{
      object: 'block',
      type: 'code',
      code: { rich_text: [{ type: 'text', text: { content: markdown.slice(0, 1900) } }], language: 'markdown' },
    }];
  }
}

async function appendBlocks(notion, pageId, blocks) {
  for (const chunk of chunkArray(blocks, BLOCK_CHUNK_SIZE)) {
    await notion.blocks.children.append({ block_id: pageId, children: chunk });
    await sleep(RATE_LIMIT_MS);
  }
}

async function createDocPage(notion, parentId, title, content) {
  const page = await notion.pages.create({
    parent: { page_id: parentId },
    properties: { title: { title: [{ type: 'text', text: { content: title.slice(0, 2000) } }] } },
  });
  await sleep(RATE_LIMIT_MS);
  await appendBlocks(notion, page.id, markdownToNotionBlocks(content));
  return page.id.replace(/-/g, '');
}

async function processBatch(notion, manifest, batch) {
  const parentId = batch.parent.page_id.replace(/-/g, '');
  for (let i = 0; i < batch.relKeys.length; i++) {
    const relKey = batch.relKeys[i];
    if (manifest.pages[relKey]) continue;
    const page = batch.pages[i];
    console.log(`+ ${relKey}`);
    manifest.pages[relKey] = await createDocPage(notion, parentId, page.properties.title, page.content);
    fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  }
}

async function main() {
  loadEnvFile(path.join(ROOT, '.env'));
  loadEnvFile(path.join(ROOT, '.env.local'));
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    console.error('NOTION_TOKEN required');
    process.exit(1);
  }

  const notion = new Client({ auth: token });
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const batchDir = path.join(__dirname, '.notion-sync-batches');
  const done = new Set(Object.keys(manifest.pages));

  for (const file of fs.readdirSync(batchDir).filter((f) => f.startsWith('pending-batch-')).sort()) {
    const batch = JSON.parse(fs.readFileSync(path.join(batchDir, file), 'utf8'));
    const idx = batch.relKeys.map((k, i) => (done.has(k) ? -1 : i)).filter((i) => i >= 0);
    if (!idx.length) continue;
    const filtered = {
      parent: batch.parent,
      pages: idx.map((i) => batch.pages[i]),
      relKeys: idx.map((i) => batch.relKeys[i]),
    };
    await processBatch(notion, manifest, filtered);
    idx.forEach((i) => done.add(batch.relKeys[i]));
  }

  console.log(`\nDone: ${Object.keys(manifest.pages).length} pages in manifest`);
}

main().catch((e) => {
  console.error(e.body?.message || e.message || e);
  process.exit(1);
});
