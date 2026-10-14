import {
  LISTING_HTML_CACHE_CONTROL,
  applyListingMetaToHtml,
  canonicalListingPath,
  genericSiteMeta,
  parseListingSlug,
  renderListingIndexHtml,
} from './listingMeta';
import { isPropertyUuid } from './propertyPath';

export const LISTING_HTML_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': LISTING_HTML_CACHE_CONTROL,
} as const;

export type LoadIndexHtml = (request: Request) => Promise<string>;

export type AssetsFetcher = {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

function looksLikeHtml(text: string): boolean {
  const start = text.slice(0, 256).toLowerCase();
  return start.includes('<!doctype html') || start.includes('<html');
}

function htmlResponse(html: string, listingTag: string): Response {
  return new Response(html, {
    status: 200,
    headers: {
      ...LISTING_HTML_HEADERS,
      'x-sunday-listing': listingTag,
    },
  });
}

export function requestOrigin(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host');
  if (!host) {
    try {
      return new URL(request.url).origin;
    } catch {
      return '';
    }
  }
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const proto =
    forwardedProto ||
    (host.startsWith('127.') || host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export function slugNeedsCanonicalRedirect(slugOrId: string): boolean {
  const trimmed = slugOrId.trim();
  return Boolean(trimmed && !isPropertyUuid(trimmed) && trimmed !== trimmed.toLowerCase());
}

export function listingRedirectLocation(request: Request, slugOrId: string): string {
  const origin = requestOrigin(request) || 'https://www.sundayproperties.co';
  return `${origin}${canonicalListingPath(slugOrId)}`;
}

/**
 * Cloudflare ASSETS.fetch('/index.html') sometimes returns a 3xx to `/`
 * instead of the HTML shell. Follow one hop and fall back to `/`.
 */
export async function loadIndexHtmlFromAssets(
  request: Request,
  assets: AssetsFetcher
): Promise<string> {
  const candidates = ['/index.html', '/'];
  for (const path of candidates) {
    let response = await assets.fetch(new URL(path, request.url));
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('Location');
      if (location) {
        response = await assets.fetch(new URL(location, request.url));
      }
    }
    if (!response.ok) continue;
    const text = await response.text();
    if (looksLikeHtml(text)) return text;
  }
  throw new Error('Unable to load index.html from ASSETS');
}

export async function respondToListingHtmlRequest(
  request: Request,
  slugOrId: string,
  loadIndexHtml: LoadIndexHtml
): Promise<Response> {
  const trimmed = (slugOrId || parseListingSlug(request.url)).trim();

  if (slugNeedsCanonicalRedirect(trimmed)) {
    return new Response(null, {
      status: 301,
      headers: {
        Location: listingRedirectLocation(request, trimmed),
        'Cache-Control': LISTING_HTML_CACHE_CONTROL,
      },
    });
  }

  try {
    const template = await loadIndexHtml(request);
    if (!trimmed) {
      return htmlResponse(applyListingMetaToHtml(template, genericSiteMeta()), 'generic');
    }
    const { html } = await renderListingIndexHtml(template, trimmed);
    return htmlResponse(html, trimmed);
  } catch {
    try {
      const template = await loadIndexHtml(request);
      return htmlResponse(applyListingMetaToHtml(template, genericSiteMeta()), 'error');
    } catch {
      return new Response('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  }
}
