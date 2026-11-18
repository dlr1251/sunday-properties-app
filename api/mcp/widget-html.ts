import {
  COMPARE_WIDGET_URI,
  LISTINGS_WIDGET_URI,
  RESOURCE_MIME_TYPE,
  SITE_ORIGINS,
  STATS_WIDGET_URI,
  SUPABASE_ORIGIN,
  WIDGET_REDIRECT_DOMAINS,
  WIDGET_RESOURCE_DOMAINS,
} from './constants';
import { css as generatedCss, script as generatedScript } from './generated-widget-bundle';

export type WidgetKind = 'listings' | 'stats' | 'compare';

export const WIDGET_URIS: Record<WidgetKind, string> = {
  listings: LISTINGS_WIDGET_URI,
  stats: STATS_WIDGET_URI,
  compare: COMPARE_WIDGET_URI,
};

export function widgetCspMeta() {
  return {
    ui: {
      prefersBorder: true,
      csp: {
        connectDomains: [] as string[],
        resourceDomains: [...WIDGET_RESOURCE_DOMAINS],
      },
    },
    'openai/widgetPrefersBorder': true,
    'openai/widgetCSP': {
      connect_domains: [] as string[],
      resource_domains: [...WIDGET_RESOURCE_DOMAINS],
      redirect_domains: [...WIDGET_REDIRECT_DOMAINS],
    },
    'openai/ui': {
      availableDisplayModes: ['inline'],
    },
  };
}

function escapeScript(js: string): string {
  return js.replace(/<\/script/gi, '<\\/script');
}

export function wrapWidgetHtml(kind: WidgetKind, script: string, css: string): string {
  const title =
    kind === 'listings' ? 'Sunday listings' : kind === 'stats' ? 'Sunday listing stats' : 'Sunday compare';
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>${css}</style>
</head>
<body data-sunday-widget="${kind}">
  <div id="root"></div>
  <script>window.__SUNDAY_WIDGET__=${JSON.stringify(kind)};</script>
  <script type="module">${escapeScript(script)}</script>
</body>
</html>`;
}

export function widgetDescription(kind: WidgetKind): string {
  if (kind === 'listings') {
    return 'Carousel of published Sunday Properties listing cards with photos, zone, price, and a link to sundayproperties.co.';
  }
  if (kind === 'stats') {
    return 'Panel of published figures for one listing. Missing fields are omitted.';
  }
  return 'Side-by-side comparison of 2–4 published listings with a price-per-m² chart.';
}

export function loadWidgetBundles(): { script: string; css: string } {
  return { script: generatedScript, css: generatedCss };
}

export function widgetHtml(kind: WidgetKind): string {
  const bundles = loadWidgetBundles();
  return wrapWidgetHtml(kind, bundles.script, bundles.css);
}

export function widgetResourceContents(kind: WidgetKind) {
  const uri = WIDGET_URIS[kind];
  return {
    uri,
    mimeType: RESOURCE_MIME_TYPE,
    text: widgetHtml(kind),
    _meta: {
      ...widgetCspMeta(),
      'openai/widgetDescription': widgetDescription(kind),
    },
  };
}

export { SITE_ORIGINS, SUPABASE_ORIGIN };
