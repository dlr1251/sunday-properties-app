import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import handler from '../api/listing-html';

const PORT = Number(process.env.LISTING_OG_PORT || 4174);
const ROOT = join(process.cwd(), 'build');

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

async function serveStatic(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  const relative = url.pathname === '/' ? '/index.html' : url.pathname;
  if (relative.startsWith('/properties/')) return false;
  const file = join(ROOT, relative);
  if (!file.startsWith(ROOT)) return false;
  try {
    const body = await readFile(file);
    res.statusCode = 200;
    res.setHeader('Content-Type', TYPES[extname(file)] || 'application/octet-stream');
    res.end(body);
    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  if (url.pathname.startsWith('/properties/') && url.pathname.split('/').filter(Boolean).length === 2) {
    await handler(req, res);
    return;
  }
  if (await serveStatic(req, res)) return;
  res.statusCode = 404;
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`listing OG server http://127.0.0.1:${PORT}`);
});
