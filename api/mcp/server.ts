import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import {
  COMPARE_WIDGET_URI,
  LISTINGS_WIDGET_URI,
  MCP_INSTRUCTIONS,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
  STATS_WIDGET_URI,
} from './constants';
import {
  compareListingsInputSchema,
  compareListingsOutputSchema,
  listingStatsInputSchema,
  listingStatsOutputSchema,
  searchListingsOutputSchema,
  showListingsOutputSchema,
  sunnyListingSearchSchema,
} from './schemas';
import {
  defaultListingsLoader,
  executeCompareListings,
  executeListingStats,
  executeSearchListings,
  executeShowListings,
  type ListingsLoader,
} from './tools';
import { widgetCspMeta, widgetDescription, widgetResourceContents, type WidgetKind } from './widget-html';

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
  idempotentHint: true,
} as const;

function widgetToolMeta(uri: string, invoking: string, invoked: string) {
  return {
    securitySchemes: [{ type: 'noauth' }],
    ui: { resourceUri: uri },
    'openai/outputTemplate': uri,
    'openai/widgetAccessible': true,
    'openai/toolInvocation/invoking': invoking,
    'openai/toolInvocation/invoked': invoked,
  };
}

function dataToolMeta(invoking: string, invoked: string) {
  return {
    securitySchemes: [{ type: 'noauth' }],
    'openai/toolInvocation/invoking': invoking,
    'openai/toolInvocation/invoked': invoked,
  };
}

function registerWidget(server: McpServer, kind: WidgetKind) {
  const resource = widgetResourceContents(kind);
  server.registerResource(
    `sunday-${kind}-widget`,
    resource.uri,
    {
      title: widgetDescription(kind),
      description: widgetDescription(kind),
      mimeType: resource.mimeType,
      _meta: {
        ...widgetCspMeta(),
        'openai/widgetDescription': widgetDescription(kind),
      },
    },
    async () => ({
      contents: [resource],
    }),
  );
}

export function createSundayMcpServer(loader: ListingsLoader = defaultListingsLoader): McpServer {
  const server = new McpServer(
    { name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION },
    {
      instructions: MCP_INSTRUCTIONS,
      capabilities: { tools: {}, resources: {} },
    },
  );

  registerWidget(server, 'listings');
  registerWidget(server, 'stats');
  registerWidget(server, 'compare');

  server.registerTool(
    'search_listings',
    {
      title: 'Search listings',
      description:
        'Search Sunday Properties listings that are publicly published. Returns only public-safe fields (no address, owner contact, minimum offer, deposit, or internal notes). Call this before answering any question about a specific property, price, area, neighborhood inventory, or availability unless you already have those rows from show_listings, listing_stats, or compare_listings. If it returns no rows, say you do not have a published match. This tool has no UI; use show_listings, listing_stats, or compare_listings to render cards.',
      inputSchema: sunnyListingSearchSchema,
      outputSchema: searchListingsOutputSchema,
      annotations: READ_ONLY,
      _meta: dataToolMeta('Buscando listados…', 'Listados listos'),
    },
    async (args) => executeSearchListings(args, loader),
  );

  server.registerTool(
    'show_listings',
    {
      title: 'Show listing cards',
      description:
        'Show published listings as photo carousel cards. Use when the visitor asks to see properties, photos, a gallery, or "muéstrame". Fetches the same public published rows as search_listings. After it runs, write a short caption; the cards appear automatically. CTA links go to sundayproperties.co (view listing / agendar visita). Do not paste image URLs. Do not invent missing fields.',
      inputSchema: sunnyListingSearchSchema,
      outputSchema: showListingsOutputSchema,
      annotations: READ_ONLY,
      _meta: widgetToolMeta(LISTINGS_WIDGET_URI, 'Mostrando listados…', 'Cards listas'),
    },
    async (args) => executeShowListings(args, loader),
  );

  server.registerTool(
    'listing_stats',
    {
      title: 'Listing figures',
      description:
        'Show a stats panel for one published listing: price, COP/m², area, rooms, estrato, and admin fee — only fields that exist in the data. Use when they ask for key numbers or "cuánto cuesta el m2". Pass slug_or_id from a published listing. After it runs, write a short caption; do not invent missing figures.',
      inputSchema: listingStatsInputSchema,
      outputSchema: listingStatsOutputSchema,
      annotations: READ_ONLY,
      _meta: widgetToolMeta(STATS_WIDGET_URI, 'Calculando cifras…', 'Cifras listas'),
    },
    async (args) => executeListingStats(args, loader),
  );

  server.registerTool(
    'compare_listings',
    {
      title: 'Compare listings',
      description:
        'Compare 2–4 published listings side by side, highlighting best public values (lowest price/m², largest area, etc.) plus a simple price/m² chart. Use when the visitor asks to compare ("compara estas dos"). Pass published slugs when you know them; otherwise search filters return up to four matches. After it runs, write a short caption. Do not invent values.',
      inputSchema: compareListingsInputSchema,
      outputSchema: compareListingsOutputSchema,
      annotations: READ_ONLY,
      _meta: widgetToolMeta(COMPARE_WIDGET_URI, 'Comparando listados…', 'Comparación lista'),
    },
    async (args) => executeCompareListings(args, loader),
  );

  return server;
}
