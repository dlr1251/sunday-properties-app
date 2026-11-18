import { describe, expect, it, vi } from 'vitest';

import {
  askSunny,
  eveRequestHeaders,
  replyFromSettledEvents,
  resolveSunnyUrl,
  type SunnyEveClient,
} from './sunny-client';

const settledEvents = [
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
];

function clientWith(result: {
  reply?: string;
  status?: 'completed' | 'failed';
  sessionId?: string;
  events?: typeof settledEvents;
}): SunnyEveClient {
  const sessionId = result.sessionId ?? 'wrun_test';
  const delivery = {
    sessionId,
    deliveryId: 'delivery_1',
    stream: async function* () {
      /* unused */
    },
    result: async () => ({
      deliveryId: 'delivery_1',
      sessionId,
      outcome: 'handled' as const,
      sessionEnded: false,
      reply: result.reply,
      data: undefined,
      interactions: [],
      status: result.status ?? ('completed' as const),
    }),
  };
  const handle = {
    id: sessionId,
    send: vi.fn(async () => delivery),
    snapshot: vi.fn(async () => ({ events: result.events ?? settledEvents })),
  };
  return {
    sessions: {
      create: vi.fn(async () => ({ session: handle, delivery })),
      attach: vi.fn(() => handle),
    },
  };
}

describe('ask_sunny eve client', () => {
  it('resolves SUNNY_URL then the deployment origin then the public site', () => {
    expect(resolveSunnyUrl({ SUNNY_URL: 'https://preview.example' })).toBe('https://preview.example');
    expect(resolveSunnyUrl({ VERCEL_URL: 'sunday-properties-abc.vercel.app' })).toBe(
      'https://sunday-properties-abc.vercel.app',
    );
    expect(resolveSunnyUrl({})).toBe('https://www.sundayproperties.co');
  });

  it('adds the Vercel protection bypass without exposing a key in the header map when unset', () => {
    expect(eveRequestHeaders({})).toEqual({});
    expect(eveRequestHeaders({ VERCEL_AUTOMATION_BYPASS_SECRET: 'bypass' })['x-vercel-protection-bypass']).toBe(
      'bypass',
    );
  });

  it('builds reply text from turn.settled part ids and content.completed', () => {
    const folded = replyFromSettledEvents(settledEvents);
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
    const eve = clientWith({ reply: 'Hay arriendos publicados en Laureles.' });
    const result = await askSunny(
      { message: '¿qué arriendos hay en Laureles?' },
      { env: { SUNNY_MCP_API_KEY: 'test-key' }, createClient: () => eve },
    );
    expect(result).toMatchObject({
      ok: true,
      reply: 'Hay arriendos publicados en Laureles.',
      session_id: 'wrun_test',
      turn_id: 'turn_0',
    });
    expect(eve.sessions.create).toHaveBeenCalled();
  });

  it('reuses session_id on follow-up questions', async () => {
    const eve = clientWith({ reply: 'El de 70 m².' });
    const result = await askSunny(
      { message: '¿cuál es el más grande?', session_id: 'wrun_existing' },
      { env: { SUNNY_MCP_API_KEY: 'test-key' }, createClient: () => eve },
    );
    expect(result.ok).toBe(true);
    expect(eve.sessions.attach).toHaveBeenCalledWith('wrun_existing');
    expect(eve.sessions.create).not.toHaveBeenCalled();
  });

  it('fills an empty delivery.reply from follow=false snapshot events', async () => {
    const eve = clientWith({ reply: '' });
    const result = await askSunny(
      { message: 'hola' },
      { env: { SUNNY_MCP_API_KEY: 'test-key' }, createClient: () => eve },
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.reply).toMatch(/Laureles/);
  });

  it('does not mention the API key when it is missing', async () => {
    const result = await askSunny({ message: 'hola' }, { env: {} });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected error');
    expect(result.error).not.toMatch(/test-key|SUNNY_MCP_API_KEY=/i);
    expect(JSON.stringify(result)).not.toMatch(/throwaway|secret/i);
  });
});
