import { PUBLIC_SUPABASE_URL } from '../../src/lib/publicSupabase';
import { SITE_ORIGIN } from '../../src/lib/siteOrigin';

export const MCP_SERVER_NAME = 'sunday-properties';
export const MCP_SERVER_VERSION = '1.1.0';
export const MCP_PATH = '/mcp';

export const RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';

export const LISTINGS_WIDGET_URI = 'ui://widget/sunday-listings.html';
export const STATS_WIDGET_URI = 'ui://widget/sunday-stats.html';
export const COMPARE_WIDGET_URI = 'ui://widget/sunday-compare.html';

export const SUPABASE_ORIGIN = PUBLIC_SUPABASE_URL.replace(/\/+$/, '');
export const SITE_ORIGINS = [SITE_ORIGIN, 'https://sundayproperties.co'] as const;
export const UNSPLASH_ORIGIN = 'https://images.unsplash.com';

/** Images and links in the ChatGPT iframe. Keep this allowlist narrow. */
export const WIDGET_RESOURCE_DOMAINS = [SUPABASE_ORIGIN, UNSPLASH_ORIGIN, ...SITE_ORIGINS];
export const WIDGET_REDIRECT_DOMAINS = [...SITE_ORIGINS];

export const MCP_INSTRUCTIONS = [
  'Sunday Properties public listings for Medellín.',
  'Call search_listings for inventory questions. Call show_listings for photo cards, listing_stats for one listing’s figures, compare_listings for 2–4 listings.',
  'Call ask_sunny to talk to Sunny (conversational help). Pass session_id from a previous ask_sunny to keep context.',
  'Only quote fields the tools return. Never invent prices, areas, or availability.',
  'Never mention address, owner, minimum offer, deposit, or internal notes.',
  'Listing tools do not capture leads. Direct visits to the property page CTA (Agendar visita).',
].join(' ');
