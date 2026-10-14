import { describe, expect, it, vi } from 'vitest';
import {
  loadIndexHtmlFromAssets,
  listingRedirectLocation,
  respondToListingHtmlRequest,
  slugNeedsCanonicalRedirect,
} from './listingHtmlRequest';

const SHELL = `<!DOCTYPE html>
<html lang="es">
  <head>
    <title>Sunday Properties — Rent and buy in Medellín</title>
    <meta property="og:title" content="Sunday Properties" />
    <meta property="og:description" content="Rent and buy in Medellín, Colombia — with title, contract, and visit before you commit." />
  </head>
  <body><div id="root"></div></body>
</html>`;

describe('slugNeedsCanonicalRedirect', () => {
  it('redirects mixed-case slugs and keeps lowercase or uuids', () => {
    expect(slugNeedsCanonicalRedirect('El-Escorial-701')).toBe(true);
    expect(slugNeedsCanonicalRedirect('el-escorial-701')).toBe(false);
    expect(slugNeedsCanonicalRedirect('11111111-1111-1111-1111-111111111111')).toBe(false);
  });
});

describe('respondToListingHtmlRequest', () => {
  it('301s uppercase slugs to the canonical path', async () => {
    const request = new Request('http://127.0.0.1:8788/properties/El-Escorial-701');
    const load = vi.fn(async () => SHELL);
    const response = await respondToListingHtmlRequest(request, 'El-Escorial-701', load);
    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe(
      'http://127.0.0.1:8788/properties/el-escorial-701'
    );
    expect(load).not.toHaveBeenCalled();
  });

  it('injects generic OG tags when the slug is empty', async () => {
    const request = new Request('http://127.0.0.1:8788/properties/');
    const response = await respondToListingHtmlRequest(request, '', async () => SHELL);
    expect(response.status).toBe(200);
    expect(response.headers.get('x-sunday-listing')).toBe('generic');
    const html = await response.text();
    expect(html).toContain('Sunday Properties');
    expect(html).toContain('<div id="root"></div>');
  });

  it('uses the request host for the 301 Location', () => {
    const request = new Request('https://preview.example/properties/El-Escorial-701', {
      headers: { host: 'preview.example' },
    });
    expect(listingRedirectLocation(request, 'El-Escorial-701')).toBe(
      'https://preview.example/properties/el-escorial-701'
    );
  });
});

describe('loadIndexHtmlFromAssets', () => {
  it('follows a redirect from /index.html to the HTML shell', async () => {
    const request = new Request('https://www.sundayproperties.co/properties/el-escorial-701');
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/index.html')) {
        return new Response(null, {
          status: 302,
          headers: { Location: '/' },
        });
      }
      return new Response(SHELL, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    });

    const html = await loadIndexHtmlFromAssets(request, { fetch });
    expect(html).toContain('<div id="root"></div>');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
