import { previewBrisas, previewCampoNuevo, previewCasaLauret, previewEscorial } from '../../src/lib/sunny/preview-fixtures';
import { compareHighlights, listingStatsFromHit } from '../../src/lib/sunny/generative-ui';
import { loadWidgetBundles, wrapWidgetHtml, type WidgetKind } from './widget-html';

function listingsPayload() {
  const listings = [previewBrisas(), previewEscorial(), previewCasaLauret()];
  return { ok: true, listings, note: 'Preview fixtures from published listing photos.' };
}

function statsPayload() {
  const listing = previewBrisas();
  return {
    ok: true,
    listing,
    stats: listingStatsFromHit(listing),
    note: 'Preview stats. Missing fields omitted.',
  };
}

function comparePayload() {
  const listings = [previewEscorial(), previewCasaLauret(), previewCampoNuevo()];
  return {
    ok: true,
    listings,
    highlights: compareHighlights(listings),
    note: 'Preview comparison of published rentals.',
  };
}

export function previewStructuredContent(kind: WidgetKind) {
  if (kind === 'listings') return listingsPayload();
  if (kind === 'stats') return statsPayload();
  return comparePayload();
}

export function previewWidgetPage(kind: WidgetKind, theme: 'light' | 'dark'): string {
  const bundles = loadWidgetBundles();
  const payload = previewStructuredContent(kind);
  const bootstrap = `
window.__SUNDAY_WIDGET__ = ${JSON.stringify(kind)};
window.openai = {
  theme: ${JSON.stringify(theme)},
  displayMode: "inline",
  locale: "es-CO",
  toolOutput: ${JSON.stringify(payload)},
  toolInput: {},
};
document.documentElement.lang = "es";
document.documentElement.dataset.theme = ${JSON.stringify(theme)};
document.documentElement.style.colorScheme = ${JSON.stringify(theme)};
`;
  return wrapWidgetHtml(kind, `${bootstrap}\n${bundles.script}`, bundles.css);
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

export function previewHostPage(kind: WidgetKind, theme: 'light' | 'dark'): string {
  const titles: Record<WidgetKind, string> = {
    listings: 'Listados',
    stats: 'Cifras',
    compare: 'Comparar',
  };
  const bg = theme === 'dark' ? '#212121' : '#f7f7f8';
  const fg = theme === 'dark' ? '#ececec' : '#0d0d0d';
  const card = theme === 'dark' ? '#2f2f2f' : '#ffffff';
  const src = `/api/mcp/preview/widget?kind=${encodeURIComponent(kind)}&theme=${encodeURIComponent(theme)}`;
  return `<!doctype html>
<html lang="es" data-theme="${theme}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sunday · ${escapeHtml(titles[kind])} (${theme})</title>
  <style>
    :root { color-scheme: ${theme}; }
    body {
      margin: 0;
      min-height: 100vh;
      background: ${bg};
      color: ${fg};
      font-family: system-ui, -apple-system, sans-serif;
    }
    header {
      padding: 16px 20px 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    header a {
      color: ${fg};
      text-decoration: none;
      border: 1px solid ${theme === 'dark' ? '#555' : '#d0d0d0'};
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 12px;
    }
    header a[aria-current="page"] { background: #f0a80d; color: #1a2441; border-color: #f0a80d; }
    .shell {
      max-width: 720px;
      margin: 0 auto;
      padding: 8px 16px 32px;
    }
    .label { font-size: 13px; opacity: 0.7; margin: 0 0 8px; }
    .frame {
      background: ${card};
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    iframe {
      width: 100%;
      min-height: 520px;
      border: 0;
      display: block;
      background: transparent;
    }
  </style>
</head>
<body>
  <header>
    <strong>Sunday Properties · widget preview</strong>
    <a href="/api/mcp/preview?kind=listings&theme=${theme}" ${kind === 'listings' ? 'aria-current="page"' : ''}>Listados</a>
    <a href="/api/mcp/preview?kind=stats&theme=${theme}" ${kind === 'stats' ? 'aria-current="page"' : ''}>Cifras</a>
    <a href="/api/mcp/preview?kind=compare&theme=${theme}" ${kind === 'compare' ? 'aria-current="page"' : ''}>Comparar</a>
    <a href="/api/mcp/preview?kind=${kind}&theme=light" ${theme === 'light' ? 'aria-current="page"' : ''}>Light</a>
    <a href="/api/mcp/preview?kind=${kind}&theme=dark" ${theme === 'dark' ? 'aria-current="page"' : ''}>Dark</a>
  </header>
  <div class="shell">
    <p class="label">ChatGPT ${theme} · ${escapeHtml(titles[kind])}</p>
    <div class="frame">
      <iframe data-testid="sunday-mcp-widget" title="${escapeHtml(titles[kind])}" src="${src}"></iframe>
    </div>
  </div>
</body>
</html>`;
}

export function parsePreviewKind(value: string | null): WidgetKind {
  if (value === 'stats' || value === 'compare' || value === 'listings') return value;
  return 'listings';
}

export function parsePreviewTheme(value: string | null): 'light' | 'dark' {
  return value === 'dark' ? 'dark' : 'light';
}

export function handlePreviewRequest(request: Request): Response {
  const url = new URL(request.url);
  const kind = parsePreviewKind(url.searchParams.get('kind'));
  const theme = parsePreviewTheme(url.searchParams.get('theme'));
  const isWidget = url.pathname.endsWith('/widget') || url.searchParams.get('embed') === '1';
  const html = isWidget ? previewWidgetPage(kind, theme) : previewHostPage(kind, theme);
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
