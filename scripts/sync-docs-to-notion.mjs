#!/usr/bin/env node
/**
 * Sync docs/en and docs/es to Notion under NOTION_DOCS_ROOT_PAGE_ID.
 * Idempotent upsert via docs/.notion-sync.json manifest.
 *
 * Requires NOTION_TOKEN (internal integration) with access to the docs root page.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@notionhq/client';
import { markdownToBlocks } from '@tryfabric/martian';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const MANIFEST_PATH = path.join(DOCS_DIR, '.notion-sync.json');
const LANG_DIRS = ['en', 'es'];
const RATE_LIMIT_MS = 350;
const BLOCK_CHUNK_SIZE = 100;

const DEFAULT_DOCS_ROOT_PAGE_ID = '386a689f002581b69441c5ce00d1b9ff';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { version: 1, folders: {}, pages: {} };
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

function stripFrontmatter(content) {
  if (!content.startsWith('---')) return content;
  const end = content.indexOf('---', 3);
  if (end === -1) return content;
  return content.slice(end + 3).trim();
}

function extractTitle(content, filename) {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  return filename
    .replace(/\.md$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function bodyWithoutTitle(content) {
  return content.replace(/^#\s+.+\n?/, '').trim();
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function collectMarkdownFiles(dir, baseRel = '') {
  const entries = [];
  if (!fs.existsSync(dir)) return entries;

  for (const name of fs.readdirSync(dir).sort()) {
    if (name === 'README.md' || name.startsWith('.')) continue;
    const abs = path.join(dir, name);
    const rel = baseRel ? `${baseRel}/${name}` : name;
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      entries.push({ type: 'dir', rel, abs });
      entries.push(...collectMarkdownFiles(abs, rel));
    } else if (name.endsWith('.md')) {
      entries.push({ type: 'file', rel, abs });
    }
  }
  return entries;
}

async function clearPageBlocks(notion, pageId) {
  let cursor;
  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const block of response.results) {
      await notion.blocks.delete({ block_id: block.id });
      await sleep(RATE_LIMIT_MS);
    }
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
}

async function appendBlocks(notion, pageId, blocks) {
  if (!blocks.length) return;
  for (const chunk of chunkArray(blocks, BLOCK_CHUNK_SIZE)) {
    await notion.blocks.children.append({
      block_id: pageId,
      children: chunk,
    });
    await sleep(RATE_LIMIT_MS);
  }
}

async function createPage(notion, parentId, title) {
  const page = await notion.pages.create({
    parent: { page_id: parentId },
    properties: {
      title: {
        title: [{ type: 'text', text: { content: title.slice(0, 2000) } }],
      },
    },
  });
  await sleep(RATE_LIMIT_MS);
  return page.id;
}

async function updatePageTitle(notion, pageId, title) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      title: {
        title: [{ type: 'text', text: { content: title.slice(0, 2000) } }],
      },
    },
  });
  await sleep(RATE_LIMIT_MS);
}

function markdownToNotionBlocks(markdown) {
  try {
    const blocks = markdownToBlocks(markdown);
    return blocks.length ? blocks : [{ object: 'block', type: 'paragraph', paragraph: { rich_text: [] } }];
  } catch (error) {
    console.warn('  ⚠ markdownToBlocks failed, using code block fallback:', error.message);
    return [
      {
        object: 'block',
        type: 'code',
        code: {
          rich_text: [{ type: 'text', text: { content: markdown.slice(0, 1900) } }],
          language: 'markdown',
        },
      },
    ];
  }
}

async function syncPageContent(notion, pageId, title, markdown) {
  await updatePageTitle(notion, pageId, title);
  await clearPageBlocks(notion, pageId);
  await appendBlocks(notion, pageId, markdownToNotionBlocks(markdown));
}

async function ensureFolderPage(notion, manifest, folderKey, parentId, displayName) {
  if (manifest.folders[folderKey]) return manifest.folders[folderKey];

  const pageId = await createPage(notion, parentId, displayName);
  manifest.folders[folderKey] = pageId;
  saveManifest(manifest);
  console.log(`  + folder: ${folderKey}`);
  return pageId;
}

async function syncMarkdownFile(notion, manifest, relKey, absPath, parentId) {
  const raw = fs.readFileSync(absPath, 'utf8');
  const withoutFrontmatter = stripFrontmatter(raw);
  const title = extractTitle(withoutFrontmatter, path.basename(absPath));
  const body = bodyWithoutTitle(withoutFrontmatter) || withoutFrontmatter;

  if (manifest.pages[relKey]) {
    console.log(`  ~ update: ${relKey}`);
    await syncPageContent(notion, manifest.pages[relKey], title, body);
    return manifest.pages[relKey];
  }

  console.log(`  + create: ${relKey}`);
  const pageId = await createPage(notion, parentId, title);
  manifest.pages[relKey] = pageId;
  saveManifest(manifest);
  await appendBlocks(notion, pageId, markdownToNotionBlocks(body));
  return pageId;
}

async function syncLanguageTree(notion, manifest, lang, docsRootPageId) {
  const langDir = path.join(DOCS_DIR, lang);
  if (!fs.existsSync(langDir)) {
    console.warn(`Skipping missing ${langDir}`);
    return;
  }

  const langPageId = await ensureFolderPage(
    notion,
    manifest,
    lang,
    docsRootPageId,
    lang.toUpperCase()
  );

  const entries = collectMarkdownFiles(langDir);
  const folderIds = new Map([[lang, langPageId]]);

  for (const entry of entries) {
    if (entry.type === 'dir') {
      const parts = entry.rel.split('/');
      const folderKey = entry.rel;
      const parentKey = parts.slice(0, -1).join('/') || lang;
      const parentId = folderIds.get(parentKey);
      if (!parentId) {
        throw new Error(`Missing parent folder for ${folderKey}`);
      }
      const displayName = parts[parts.length - 1]
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const pageId = await ensureFolderPage(notion, manifest, folderKey, parentId, displayName);
      folderIds.set(folderKey, pageId);
      continue;
    }

    const parts = entry.rel.split('/');
    const parentKey = parts.slice(0, -1).join('/') || lang;
    const parentId = folderIds.get(parentKey);
    if (!parentId) {
      throw new Error(`Missing parent folder for file ${entry.rel}`);
    }

    const relKey = `${lang}/${entry.rel}`;
    await syncMarkdownFile(notion, manifest, relKey, entry.abs, parentId);
  }
}

async function main() {
  loadEnvFile(path.join(ROOT, '.env'));
  loadEnvFile(path.join(ROOT, '.env.local'));

  const token = process.env.NOTION_TOKEN;
  const docsRootPageId =
    process.env.NOTION_DOCS_ROOT_PAGE_ID?.replace(/-/g, '') || DEFAULT_DOCS_ROOT_PAGE_ID;

  if (!token) {
    console.error('❌ NOTION_TOKEN is required.');
    console.error('   Create an internal integration at https://www.notion.so/my-integrations');
    console.error('   Share the "📚 Documentación" page with the integration.');
    console.error('   Add NOTION_TOKEN and NOTION_DOCS_ROOT_PAGE_ID to .env.local');
    process.exit(1);
  }

  const notion = new Client({ auth: token });
  const manifest = loadManifest();
  manifest.rootPageId = docsRootPageId;

  console.log(`Syncing docs → Notion (root: ${docsRootPageId})`);

  for (const lang of LANG_DIRS) {
    console.log(`\n[${lang}]`);
    await syncLanguageTree(notion, manifest, lang, docsRootPageId);
  }

  saveManifest(manifest);
  const pageCount = Object.keys(manifest.pages).length;
  const folderCount = Object.keys(manifest.folders).length;
  console.log(`\n✅ Sync complete: ${pageCount} pages, ${folderCount} folders`);
  console.log(`   Manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main().catch((error) => {
  console.error('❌ Sync failed:', error.body?.message || error.message || error);
  process.exit(1);
});
