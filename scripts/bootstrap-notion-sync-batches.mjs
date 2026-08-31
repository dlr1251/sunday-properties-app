#!/usr/bin/env node
/**
 * One-time helper: writes docs/.notion-sync.json folder map and
 * scripts/.notion-sync-batches/*.json for MCP initial sync.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const MANIFEST_PATH = path.join(DOCS_DIR, '.notion-sync.json');
const BATCH_DIR = path.join(__dirname, '.notion-sync-batches');

const FOLDERS = {
  en: '386a689f002581da979bcfabe17ed801',
  es: '386a689f002581c1a3a9d78e1ac8551e',
  'en/arriendos': '386a689f00258188815fc1143501df85',
  'en/decisions': '386a689f00258182b966f39f5a0c947f',
  'en/guide': '386a689f0025811b8f57ffdba5a1094e',
  'en/legal': '386a689f002581858739d96bfe1b44f0',
  'en/operations': '386a689f002581709ff8e5868ef88a5d',
  'en/processes': '386a689f002581ca93d5f8f08e28e0a2',
  'en/reference': '386a689f002581d786a0eab24242daaf',
  'en/tech': '386a689f00258192ae0ce1fff6a61bc1',
  'en/user': '386a689f00258140a832fc5aeccb6d93',
  'en/reference/api': '386a689f00258169b61efbd6aaf6c453',
  'en/reference/components': '386a689f00258148b3a7ff089bb6d52a',
  'en/reference/database': '386a689f002581dca136c28cc77bf7e7',
  'es/arriendos': '386a689f002581d1b5cad36b840ac417',
  'es/decisiones': '386a689f0025811fb190e054b9dc792c',
  'es/guia': '386a689f002581f28558ef72cbcc7670',
  'es/legal': '386a689f002581e2bd09f56aef22018b',
  'es/operaciones': '386a689f00258102bcabdff03bfe562b',
  'es/procesos': '386a689f002581719547fe0ac7d3058b',
  'es/referencia': '386a689f0025817da52ed91c396c8adf',
  'es/tech': '386a689f002581a6aae9f49abd1eb47f',
  'es/user': '386a689f002581eb9a21d357f42821f7',
  'es/referencia/api': '386a689f0025815ab469d215eb739ebb',
  'es/referencia/base-de-datos': '386a689f002581e38813e62fe09497cd',
  'es/referencia/componentes': '386a689f002581aaa853e46d6b66989f',
};

function stripFrontmatter(content) {
  if (!content.startsWith('---')) return content;
  const end = content.indexOf('---', 3);
  if (end === -1) return content;
  return content.slice(end + 3).trim();
}

function extractTitle(content, filename) {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  return filename.replace(/\.md$/i, '').replace(/[-_]/g, ' ');
}

function bodyWithoutTitle(content) {
  return content.replace(/^#\s+.+\n?/, '').trim();
}

function collectFiles() {
  const files = [];
  for (const lang of ['en', 'es']) {
    const langDir = path.join(DOCS_DIR, lang);
    function walk(dir, rel) {
      for (const name of fs.readdirSync(dir).sort()) {
        if (name === 'README.md' || name.startsWith('.')) continue;
        const abs = path.join(dir, name);
        const r = rel ? `${rel}/${name}` : name;
        if (fs.statSync(abs).isDirectory()) walk(abs, r);
        else if (name.endsWith('.md')) files.push({ relKey: `${lang}/${r}`, abs, lang, rel: r });
      }
    }
    walk(langDir, '');
  }
  return files;
}

function parentKey(file) {
  const parts = file.rel.split('/');
  parts.pop();
  const folder = parts.length ? `${file.lang}/${parts.join('/')}` : file.lang;
  return folder;
}

const files = collectFiles();
const manifest = {
  version: 1,
  rootPageId: '386a689f002581b69441c5ce00d1b9ff',
  folders: FOLDERS,
  pages: {},
};

fs.mkdirSync(BATCH_DIR, { recursive: true });
for (const f of fs.readdirSync(BATCH_DIR)) {
  fs.unlinkSync(path.join(BATCH_DIR, f));
}

const BATCH_SIZE = 8;
let batchIndex = 0;
let currentBatch = null;

function flushBatch() {
  if (!currentBatch || !currentBatch.pages.length) return;
  const file = path.join(BATCH_DIR, `batch-${String(batchIndex).padStart(3, '0')}.json`);
  fs.writeFileSync(file, JSON.stringify(currentBatch, null, 2));
  batchIndex += 1;
  currentBatch = null;
}

for (const file of files) {
  const parent = parentKey(file);
  const parentId = FOLDERS[parent];
  if (!parentId) throw new Error(`Missing folder for ${file.relKey} (${parent})`);

  const raw = fs.readFileSync(file.abs, 'utf8');
  const stripped = stripFrontmatter(raw);
  const title = extractTitle(stripped, path.basename(file.abs));
  let body = bodyWithoutTitle(stripped) || stripped;
  if (body.length > 12000) body = `${body.slice(0, 12000)}\n\n...(truncated for initial sync; see repo for full content)`;

  if (!currentBatch || currentBatch.parent.page_id !== parentId || currentBatch.pages.length >= BATCH_SIZE) {
    flushBatch();
    currentBatch = { parent: { page_id: parentId, type: 'page_id' }, pages: [], relKeys: [] };
  }

  currentBatch.pages.push({
    properties: { title },
    content: body,
  });
  currentBatch.relKeys.push(file.relKey);
}

flushBatch();

fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${batchIndex} batches for ${files.length} files`);
console.log(`Manifest folders: ${Object.keys(FOLDERS).length}`);
