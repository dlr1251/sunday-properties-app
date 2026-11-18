import { afterEach, describe, expect, it, vi } from 'vitest';

import { mapSunnyListing } from '../../src/lib/sunny/listing-hit';

const searchPublishedListings = vi.hoisted(() =>
  vi.fn(async () => ({
    ok: true as const,
    hits: [
      mapSunnyListing({
        id: '1',
        slug: 'brisas-del-estadio',
        title: 'Brisas del Estadio',
        listing_type: 'sale',
        city: 'Medellín',
        neighborhood: 'Estadio',
        price: 390_000_000,
        area: 45,
        images: ['https://cdn.example/brisas.webp'],
      }),
    ],
  })),
);

vi.mock('../../src/lib/sunny/listings', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/lib/sunny/listings')>();
  return { ...actual, searchPublishedListings };
});

import app from '../index';

async function mcpRpc(method: string, params: unknown = {}, id = 1) {
  const response = await app.request('http://localhost/mcp', {
    method: 'POST',
    headers: {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
  const body = (await response.json()) as {
    result?: Record<string, unknown>;
    error?: { message?: string };
  };
  return { status: response.status, headers: response.headers, body };
}

describe('Sunday MCP HTTP endpoint', () => {
  afterEach(() => {
    searchPublishedListings.mockClear();
  });

  it('answers OPTIONS with CORS for ChatGPT', async () => {
    const response = await app.request('http://localhost/mcp', { method: 'OPTIONS' });
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(response.headers.get('access-control-allow-methods')).toMatch(/POST/);
  });

  it('initializes over streamable HTTP JSON', async () => {
    const { status, body, headers } = await mcpRpc('initialize', {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: { name: 'vitest', version: '1.0.0' },
    });
    expect(status).toBe(200);
    expect(headers.get('access-control-allow-origin')).toBe('*');
    expect(body.result).toMatchObject({
      serverInfo: { name: 'sunday-properties' },
    });
    expect(String((body.result as { instructions?: string })?.instructions)).toMatch(/listados|listings/i);
  });

  it('lists tools and calls show_listings', async () => {
    const listed = await mcpRpc('tools/list', {});
    const tools = (listed.body.result as { tools?: { name: string }[] })?.tools ?? [];
    expect(tools.map((tool) => tool.name)).toEqual([
      'search_listings',
      'show_listings',
      'listing_stats',
      'compare_listings',
    ]);

    const called = await mcpRpc('tools/call', {
      name: 'search_listings',
      arguments: { city: 'Medellín' },
    });
    const structured = (called.body.result as { structuredContent?: { hits?: unknown[] } })?.structuredContent;
    expect(structured?.hits).toHaveLength(1);
    expect(searchPublishedListings).toHaveBeenCalled();
  });
});
