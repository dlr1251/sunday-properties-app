import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  LISTING_HTML_CACHE_CONTROL,
  applyListingMetaToHtml,
  canonicalListingPath,
  genericSiteMeta,
  parseListingSlug,
  renderListingIndexHtml,
} from '../src/utils/listingMeta';
import { isPropertyUuid } from '../src/utils/propertyPath';

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

const HTML_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': LISTING_HTML_CACHE_CONTROL,
} as const;

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

async function loadIndexHtml(req: NodeReq): Promise<string> {
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

  const origin = requestOrigin(req);
  if (origin) {
    const response = await fetch(`${origin}/index.html`);
    if (response.ok) return response.text();
  }

  throw new Error('Unable to load index.html');
}

function send(
  res: NodeRes,
  status: number,
  body: string,
  extra: Record<string, string> = {}
) {
  res.statusCode = status;
  for (const [name, value] of Object.entries({ ...HTML_HEADERS, ...extra })) {
    res.setHeader(name, value);
  }
  res.end(body);
}

export default async function handler(req: NodeReq, res: NodeRes): Promise<void> {
  const slugOrId = slugFromRequest(req).trim();

  try {
    if (slugOrId && !isPropertyUuid(slugOrId) && slugOrId !== slugOrId.toLowerCase()) {
      const origin = requestOrigin(req) || 'https://www.sundayproperties.co';
      const location = `${origin}${canonicalListingPath(slugOrId)}`;
      res.statusCode = 301;
      res.setHeader('Location', location);
      res.setHeader('Cache-Control', LISTING_HTML_CACHE_CONTROL);
      res.end();
      return;
    }

    const template = await loadIndexHtml(req);
    if (!slugOrId) {
      send(res, 200, applyListingMetaToHtml(template, genericSiteMeta()), {
        'x-sunday-listing': 'generic',
      });
      return;
    }

    const { html } = await renderListingIndexHtml(template, slugOrId);
    send(res, 200, html, { 'x-sunday-listing': slugOrId });
  } catch {
    try {
      const template = await loadIndexHtml(req);
      send(res, 200, applyListingMetaToHtml(template, genericSiteMeta()), {
        'x-sunday-listing': 'error',
      });
    } catch {
      send(res, 200, '<!DOCTYPE html><html><body><div id="root"></div></body></html>');
    }
  }
}

export async function GET(request: Request): Promise<Response> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const query: Record<string, string> = {};
  new URL(request.url).searchParams.forEach((value, key) => {
    query[key] = value;
  });

  let status = 200;
  const responseHeaders: Record<string, string> = {};
  let body = '';

  await handler(
    { url: request.url, headers, query },
    {
      set statusCode(value: number) {
        status = value;
      },
      get statusCode() {
        return status;
      },
      setHeader(name, value) {
        responseHeaders[name] = value;
      },
      end(chunk) {
        body = chunk || '';
      },
    }
  );

  return new Response(body || null, { status, headers: responseHeaders });
}
