import { describe, expect, it } from 'vitest';

import { askSunny, eveRequestHeaders, replyFromSettledEvents, resolveSunnyUrl } from './sunny-client';

const settledLine = JSON.stringify({
  at: '2026-07-27T18:04:11.912Z',
  facts: [
    {
      type: 'content.completed',
      data: {
        partId: 'part_0',
        kind: 'text',
        phase: 'reply',
        value: 'Hay arriendos publicados en Laureles.',
      },
    },
    {
      type: 'turn.settled',
      data: { turnId: 'turn_0', outcome: 'completed', reply: ['part_0'] },
    },
    {
      type: 'delivery.settled',
      data: { deliveryId: 'delivery_1', outcome: 'handled', turnId: 'turn_0' },
    },
  ],
});

function jsonResponse(body: unknown, status = 202) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function streamResponse(body = `${settledLine}\n`) {
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'application/x-ndjson' },
  });
}

describe('ask_sunny eve client', () => {
  it('resolves SUNNY_URL then a reachable deployment origin then the public site', () => {
    expect(resolveSunnyUrl({ SUNNY_URL: 'https://preview.example' })).toBe('https://preview.example');
    expect(
      resolveSunnyUrl({
        VERCEL_URL: 'sunday-properties-abc.vercel.app',
        VERCEL_AUTOMATION_BYPASS_SECRET: 'bypass',
      }),
    ).toBe('https://sunday-properties-abc.vercel.app');
    expect(resolveSunnyUrl({ VERCEL_URL: 'sunday-properties-abc.vercel.app' })).toBe(
      'https://www.sundayproperties.co',
    );
    expect(resolveSunnyUrl({})).toBe('https://www.sundayproperties.co');
  });

  it('adds the Vercel protection bypass without exposing a key in the header map when unset', () => {
    expect(eveRequestHeaders({})).toEqual({
      accept: 'application/json, application/x-ndjson, text/plain',
      'content-type': 'application/json',
    });
    expect(eveRequestHeaders({ VERCEL_AUTOMATION_BYPASS_SECRET: 'bypass' })['x-vercel-protection-bypass']).toBe(
      'bypass',
    );
  });

  it('builds reply text from turn.settled part ids and content.completed', () => {
    const folded = replyFromSettledEvents([
      {
        type: 'content.completed',
        data: { partId: 'part_0', kind: 'text', phase: 'reply', value: 'Hay arriendos publicados en Laureles.' },
      },
      { type: 'turn.settled', data: { turnId: 'turn_0', outcome: 'completed', reply: ['part_0'] } },
    ]);
    expect(folded).toEqual({
      turnId: 'turn_0',
      reply: 'Hay arriendos publicados en Laureles.',
    });
  });

  it('falls back to content.delta when completed parts are missing', () => {
    const folded = replyFromSettledEvents([
      { type: 'content.delta', data: { partId: 'part_0', delta: 'Hola ' } },
      { type: 'content.delta', data: { partId: 'part_0', delta: 'Laureles' } },
      { type: 'turn.settled', data: { turnId: 'turn_1', outcome: 'completed', reply: ['part_0'] } },
    ]);
    expect(folded.reply).toBe('Hola Laureles');
    expect(folded.turnId).toBe('turn_1');
  });

  it('creates a session, waits for the turn, and returns session_id', async () => {
    const calls: string[] = [];
    const result = await askSunny(
      { message: '¿qué arriendos hay en Laureles?' },
      {
        env: { SUNNY_MCP_API_KEY: 'test-key', SUNNY_URL: 'https://sunny.test' },
        fetch: async (input, init) => {
          const url = String(input);
          calls.push(`${init?.method ?? 'GET'} ${url}`);
          if (url.endsWith('/eve/v1/session') && init?.method === 'POST') {
            return jsonResponse({ ok: true, sessionId: 'wrun_test', deliveryId: 'delivery_1' });
          }
          if (url.includes('/stream')) return streamResponse();
          throw new Error(`unexpected ${url}`);
        },
      },
    );
    expect(result).toMatchObject({
      ok: true,
      reply: 'Hay arriendos publicados en Laureles.',
      session_id: 'wrun_test',
      turn_id: 'turn_0',
    });
    expect(calls[0]).toBe('POST https://sunny.test/eve/v1/session');
    expect(calls.some((call) => call.includes('/eve/v1/session/wrun_test/stream'))).toBe(true);
  });

  it('reuses session_id on follow-up questions', async () => {
    const calls: string[] = [];
    const result = await askSunny(
      { message: '¿cuál es el más grande?', session_id: 'wrun_existing' },
      {
        env: { SUNNY_MCP_API_KEY: 'test-key', SUNNY_URL: 'https://sunny.test' },
        fetch: async (input, init) => {
          const url = String(input);
          calls.push(`${init?.method ?? 'GET'} ${url}`);
          if (url.endsWith('/eve/v1/session/wrun_existing') && init?.method === 'POST') {
            return jsonResponse({ ok: true, sessionId: 'wrun_existing', deliveryId: 'delivery_2' });
          }
          if (url.includes('/stream')) return streamResponse();
          throw new Error(`unexpected ${url}`);
        },
      },
    );
    expect(result.ok).toBe(true);
    expect(calls[0]).toBe('POST https://sunny.test/eve/v1/session/wrun_existing');
    expect(calls.some((call) => call.includes('/eve/v1/session'))).toBe(true);
    expect(calls.some((call) => call === 'POST https://sunny.test/eve/v1/session')).toBe(false);
  });

  it('fills an empty live stream from follow=false snapshot events', async () => {
    let streamCalls = 0;
    const result = await askSunny(
      { message: 'hola' },
      {
        env: { SUNNY_MCP_API_KEY: 'test-key', SUNNY_URL: 'https://sunny.test' },
        fetch: async (input, init) => {
          const url = String(input);
          if (url.endsWith('/eve/v1/session') && init?.method === 'POST') {
            return jsonResponse({ ok: true, sessionId: 'wrun_test', deliveryId: 'delivery_1' });
          }
          if (url.includes('/stream')) {
            streamCalls += 1;
            if (url.includes('follow=false')) return streamResponse();
            return streamResponse('{}\n');
          }
          throw new Error(`unexpected ${url}`);
        },
      },
    );
    expect(streamCalls).toBe(2);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.reply).toMatch(/Laureles/);
  });

  it('tells operators to check the MCP key when eve returns JSON 401', async () => {
    const result = await askSunny(
      { message: 'hola' },
      {
        env: { SUNNY_MCP_API_KEY: 'test-key', SUNNY_URL: 'https://sunny.test' },
        fetch: async () => jsonResponse({ ok: false, code: 'unauthorized', error: 'Authorization is required for this route.' }, 401),
      },
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected error');
    expect(result.error).toMatch(/SUNNY_MCP_API_KEY/);
  });

  it('explains Vercel Authentication when the hop gets an HTML 401', async () => {
    const result = await askSunny(
      { message: 'hola' },
      {
        env: { SUNNY_MCP_API_KEY: 'test-key', SUNNY_URL: 'https://preview.vercel.app' },
        fetch: async () =>
          new Response('<!doctype html><title>Authentication Required</title>', {
            status: 401,
            headers: { 'content-type': 'text/html' },
          }),
      },
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected error');
    expect(result.error).toMatch(/Deployment protection/i);
    expect(result.error).not.toMatch(/SUNNY_MCP_API_KEY/);
  });

  it('does not mention the API key when it is missing', async () => {
    const result = await askSunny({ message: 'hola' }, { env: {} });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected error');
    expect(result.error).not.toMatch(/test-key|SUNNY_MCP_API_KEY=/i);
    expect(JSON.stringify(result)).not.toMatch(/throwaway|secret/i);
  });

  it('sends the API key as Bearer and never logs it in the result', async () => {
    const sent: string[] = [];
    const result = await askSunny(
      { message: 'hola' },
      {
        env: { SUNNY_MCP_API_KEY: 'super-secret-preview-key', SUNNY_URL: 'https://sunny.test' },
        fetch: async (input, init) => {
          const headers = new Headers(init?.headers);
          sent.push(headers.get('authorization') ?? '');
          const url = String(input);
          if (init?.method === 'POST') {
            return jsonResponse({ ok: true, sessionId: 'wrun_test', deliveryId: 'delivery_1' });
          }
          if (url.includes('/stream')) return streamResponse();
          throw new Error(`unexpected ${url}`);
        },
      },
    );
    expect(sent[0]).toBe('Bearer super-secret-preview-key');
    expect(result.ok).toBe(true);
    expect(JSON.stringify(result)).not.toContain('super-secret-preview-key');
  });
});
