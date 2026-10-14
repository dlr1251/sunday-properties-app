import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseListingSlug } from '../src/utils/listingMeta';
import { respondToListingHtmlRequest } from '../src/utils/listingHtmlRequest';

type NodeReq = {
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
};

type NodeRes = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

function header(req: NodeReq, name: string): string {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function queryValue(req: NodeReq, key: string): string {
  const raw = req.query?.[key];
  if (Array.isArray(raw)) return raw[0] || '';
  return raw || '';
}

function requestOrigin(req: NodeReq): string {
  const host = header(req, 'x-forwarded-host') || header(req, 'host');
  if (!host) return '';
  const forwarded = header(req, 'x-forwarded-proto');
  const proto =
    forwarded ||
    (host.startsWith('127.') || host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function slugFromRequest(req: NodeReq): string {
  const parsed = parseListingSlug(req.url || '', queryValue(req, 'slugOrId'));
  if (parsed) return parsed;
  const forwarded = header(req, 'x-forwarded-uri') || header(req, 'x-invoke-path');
  return forwarded ? parseListingSlug(forwarded) : '';
}

function nodeToFetchRequest(req: NodeReq): Request {
  const origin = requestOrigin(req) || 'http://127.0.0.1';
  let url: URL;
  try {
    url = new URL(req.url || '/', origin);
  } catch {
    url = new URL('/', origin);
  }
  const slug = queryValue(req, 'slugOrId');
  if (slug && !url.searchParams.get('slugOrId')) {
    url.searchParams.set('slugOrId', slug);
  }
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(name, value);
    else if (Array.isArray(value) && value[0]) headers.set(name, value[0]);
  }
  if (!headers.has('host') && origin) {
    headers.set('host', new URL(origin).host);
  }
  return new Request(url, { headers });
}

async function loadIndexHtmlFromFs(request: Request): Promise<string> {
  const candidates = [
    join(process.cwd(), 'build', 'index.html'),
    join(process.cwd(), 'index.html'),
  ];
  for (const file of candidates) {
    try {
      return await readFile(file, 'utf8');
    } catch {
      // try the next location or fetch the static file
    }
  }

  try {
    const origin = new URL(request.url).origin;
    const response = await fetch(`${origin}/index.html`);
    if (response.ok) return response.text();
  } catch {
    // fall through
  }

  throw new Error('Unable to load index.html');
}

async function writeFetchResponse(res: NodeRes, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, name) => {
    res.setHeader(name, value);
  });
  const body = await response.text();
  res.end(body || undefined);
}

export default async function handler(req: NodeReq, res: NodeRes): Promise<void> {
  const request = nodeToFetchRequest(req);
  const response = await respondToListingHtmlRequest(
    request,
    slugFromRequest(req),
    loadIndexHtmlFromFs
  );
  await writeFetchResponse(res, response);
}

export async function GET(request: Request): Promise<Response> {
  return respondToListingHtmlRequest(request, parseListingSlug(request.url), loadIndexHtmlFromFs);
}
