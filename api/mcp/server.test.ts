import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, describe, expect, it } from 'vitest';

import { mapSunnyListing } from '../../src/lib/sunny/listing-hit';
import {
  COMPARE_WIDGET_URI,
  LISTINGS_WIDGET_URI,
  RESOURCE_MIME_TYPE,
  STATS_WIDGET_URI,
} from './constants';
import { leakedPrivateKeys } from './privacy';
import { createSundayMcpServer } from './server';
import type { ListingsLoader } from './tools';

const hits = [
  mapSunnyListing({
    id: '1',
    slug: 'brisas-del-estadio',
    title: 'Brisas del Estadio',
    listing_type: 'sale',
    neighborhood: 'Estadio',
    city: 'Medellín',
    price: 390_000_000,
    area: 45.54,
    bedrooms: 1,
    images: ['https://cdn.example/brisas.webp'],
  }),
  mapSunnyListing({
    id: '2',
    slug: 'el-escorial-701',
    title: 'El Escorial 701',
    listing_type: 'rental',
    neighborhood: 'Conquistadores',
    city: 'Medellín',
    rent_monthly: 6_000_000,
    area: 140,
    bedrooms: 4,
    images: ['https://cdn.example/escorial.webp'],
  }),
];

const loader: ListingsLoader = async () => ({ ok: true, hits });

async function connect() {
  const server = createSundayMcpServer(loader);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'sunday-mcp-test', version: '1.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return { client, server };
}

describe('Sunday ChatGPT MCP server', () => {
  let client: Client | undefined;
  let server: ReturnType<typeof createSundayMcpServer> | undefined;

  afterEach(async () => {
    await client?.close();
    await server?.close();
    client = undefined;
    server = undefined;
  });

  it('advertises the four read-only tools with widget metadata', async () => {
    ({ client, server } = await connect());
    const listed = await client.listTools();
    expect(listed.tools.map((tool) => tool.name)).toEqual([
      'search_listings',
      'show_listings',
      'listing_stats',
      'compare_listings',
    ]);
    for (const tool of listed.tools) {
      expect(tool.annotations?.readOnlyHint).toBe(true);
      expect(tool.annotations?.destructiveHint).toBe(false);
      expect((tool._meta as { securitySchemes?: { type: string }[] })?.securitySchemes?.[0]?.type).toBe(
        'noauth',
      );
    }
    const show = listed.tools.find((tool) => tool.name === 'show_listings');
    expect((show?._meta as { ui?: { resourceUri?: string } })?.ui?.resourceUri).toBe(LISTINGS_WIDGET_URI);
    expect((show?._meta as { 'openai/outputTemplate'?: string })?.['openai/outputTemplate']).toBe(
      LISTINGS_WIDGET_URI,
    );
    expect(
      (listed.tools.find((tool) => tool.name === 'listing_stats')?._meta as { ui?: { resourceUri?: string } })?.ui
        ?.resourceUri,
    ).toBe(STATS_WIDGET_URI);
    expect(
      (listed.tools.find((tool) => tool.name === 'compare_listings')?._meta as { ui?: { resourceUri?: string } })
        ?.ui?.resourceUri,
    ).toBe(COMPARE_WIDGET_URI);
    expect(
      (listed.tools.find((tool) => tool.name === 'search_listings')?._meta as { ui?: { resourceUri?: string } })?.ui
        ?.resourceUri,
    ).toBeUndefined();
  });

  it('serves widget HTML with MCP Apps mime type and CSP allowlists', async () => {
    ({ client, server } = await connect());
    const resources = await client.listResources();
    expect(resources.resources.map((resource) => resource.uri).sort()).toEqual(
      [COMPARE_WIDGET_URI, LISTINGS_WIDGET_URI, STATS_WIDGET_URI].sort(),
    );
    const html = await client.readResource({ uri: LISTINGS_WIDGET_URI });
    const contents = html.contents[0] as {
      mimeType?: string;
      text?: string;
      _meta?: { ui?: { csp?: { resourceDomains?: string[] } } };
    };
    expect(contents.mimeType).toBe(RESOURCE_MIME_TYPE);
    expect(contents.text).toContain('data-sunday-widget="listings"');
    expect(contents._meta?.ui?.csp?.resourceDomains).toContain('https://prtyuwdkrrqhtwolcrav.supabase.co');
    expect(contents._meta?.ui?.csp?.resourceDomains).toContain('https://images.unsplash.com');
    expect(contents._meta?.ui?.csp?.resourceDomains).toContain('https://www.sundayproperties.co');
  });

  it('returns structuredContent without private fields', async () => {
    ({ client, server } = await connect());
    const result = await client.callTool({ name: 'show_listings', arguments: { city: 'Medellín' } });
    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as { listings?: unknown[] };
    expect(structured.listings).toHaveLength(2);
    expect(leakedPrivateKeys(result.structuredContent)).toEqual([]);
    for (const listing of structured.listings ?? []) {
      expect(listing).not.toHaveProperty('address');
      expect(listing).not.toHaveProperty('minimum_offer_price');
      expect(listing).not.toHaveProperty('owner_id');
      expect(listing).not.toHaveProperty('deposit');
    }
  });
});
