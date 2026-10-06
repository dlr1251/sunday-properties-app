#!/usr/bin/env node
/**
 * Process remaining Notion sync batches via @notionhq/client.
 * Skips pages already present in docs/.notion-sync.json.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@notionhq/client';
import { markdownToBlocks } from '@tryfabric/martian';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BATCH_DIR = path.join(__dirname, '.notion-sync-batches');
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

async function main() {
  loadEnvFile(path.join(ROOT, '.env'));
  loadEnvFile(path.join(ROOT, '.env.local'));

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    console.error('NOTION_TOKEN required. See .env.example');
    process.exit(1);
  }

  const notion = new Client({ auth: token });
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const batchFiles = fs.readdirSync(BATCH_DIR).filter((f) => f.startsWith('batch-')).sort();

  let created = 0;
  let skipped = 0;

  for (const file of batchFiles) {
    const batch = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, file), 'utf8'));
    const parentId = batch.parent.page_id.replace(/-/g, '');

    for (let i = 0; i < batch.relKeys.length; i++) {
      const relKey = batch.relKeys[i];
      if (manifest.pages[relKey]) {
        skipped += 1;
        continue;
      }
      const page = batch.pages[i];
      console.log(`+ ${relKey}`);
      const pageId = await createDocPage(notion, parentId, page.properties.title, page.content);
      manifest.pages[relKey] = pageId;
      created += 1;
      fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped, ${Object.keys(manifest.pages).length} total`);
}

main().catch((e) => {
  console.error(e.body?.message || e.message || e);
  process.exit(1);
});
