import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createSunnyAnonSession,
  issueSunnyTicket,
} from './anon-crypto';
import { SUNNY_TICKET_HEADER } from './config';
import {
  persistSunnyLeadPreferringHostApi,
  recordSunnyLeadViaHostApi,
  authorizeSunnyLeadsRequest,
  sunnyHostApiHeaders,
} from './leads-host';
import {
  insertSunnyLeadRow,
  sunnyHandoffRowFromInput,
  sunnyLeadExecuteResult,
  sunnyLeadRowFromInput,
  sunnyLeadRowSchema,
} from './leads';

const maybeSingle = vi.hoisted(() => vi.fn());
const createClient = vi.hoisted(() =>
  vi.fn(() => ({
    from: () => ({
      insert: () => ({
        select: () => ({
          maybeSingle,
        }),
      }),
    }),
  })),
);

vi.mock('@supabase/supabase-js', () => ({
  createClient,
}));

const LEAD_ROW = sunnyLeadRowFromInput({
  name: 'Ana Pérez',
  contact: 'ana@example.com',
  listing_of_interest: 'brisas',
  message: 'Quiero visitar Brisas',
  locale: 'es',
  sessionId: 'session-1',
});

describe('sunnyLeadRowSchema', () => {
  it('requires name and contact unless this is a handoff', () => {
    expect(
      sunnyLeadRowSchema.safeParse({
        message: 'Need a person to follow up on unpublished details.',
        locale: 'en',
        handoff_requested: true,
      }).success,
    ).toBe(true);
    expect(
      sunnyLeadRowSchema.safeParse({
        message: 'Quiero visitar',
        locale: 'es',
        handoff_requested: false,
      }).success,
    ).toBe(false);
    expect(sunnyLeadRowSchema.parse(LEAD_ROW).source).toBe('sunny');
  });
});

describe('sunny lead host API', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    maybeSingle.mockReset();
    createClient.mockClear();
  });

  it('POSTs the row to /api/sunny/leads with the bypass header and no extra fields', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe('https://sunday-preview.vercel.app/api/sunny/leads');
      expect(init?.method).toBe('POST');
      expect((init?.headers as Record<string, string>)['x-vercel-protection-bypass']).toBe(
        'bypass-secret',
      );
      const body = JSON.parse(String(init?.body));
      expect(body).toEqual({
        name: 'Ana Pérez',
        contact: 'ana@example.com',
        listing_of_interest: 'brisas',
        message: 'Quiero visitar Brisas',
        locale: 'es',
        handoff_requested: false,
        session_id: 'session-1',
        source: 'sunny',
      });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await recordSunnyLeadViaHostApi(LEAD_ROW, {
      VERCEL_URL: 'sunday-preview.vercel.app',
      VERCEL_AUTOMATION_BYPASS_SECRET: 'bypass-secret',
    });
    expect(result).toEqual({ ok: true });
    expect(sunnyHostApiHeaders({ VERCEL_AUTOMATION_BYPASS_SECRET: 'bypass-secret' })[
      'x-vercel-protection-bypass'
    ]).toBe('bypass-secret');
  });

  it('prefers the Hono hop and does not insert directly when the origin is set', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await persistSunnyLeadPreferringHostApi(LEAD_ROW, {
      SUNNY_LISTINGS_API_ORIGIN: 'https://api.example',
      VERCEL_AUTOMATION_BYPASS_SECRET: 'bypass-secret',
    });
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(createClient).not.toHaveBeenCalled();
  });

  it('does not fall back to a second insert when the host hop fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ ok: false }), { status: 503 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const result = await persistSunnyLeadPreferringHostApi(LEAD_ROW, {
      VERCEL_URL: 'sunday-preview.vercel.app',
      VERCEL_AUTOMATION_BYPASS_SECRET: 'bypass-secret',
      VITE_SUPABASE_URL: 'https://vite.example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-key',
    });
    expect(result).toEqual({ ok: false, error: 'lead_insert_failed' });
    expect(createClient).not.toHaveBeenCalled();
  });

  it('skips the host hop when there is no bypass secret even if an origin exists', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    maybeSingle.mockResolvedValue({ data: { id: 'lead-direct' }, error: null });
    const result = await persistSunnyLeadPreferringHostApi(LEAD_ROW, {
      VERCEL_URL: 'sunday-preview.vercel.app',
      VITE_SUPABASE_URL: 'https://vite.example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-key',
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true, id: 'lead-direct' });
  });

  it('falls back to direct insert when no host origin is configured', async () => {
    maybeSingle.mockResolvedValue({ data: { id: 'lead-direct' }, error: null });
    const result = await persistSunnyLeadPreferringHostApi(LEAD_ROW, {
      VITE_SUPABASE_URL: 'https://vite.example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-key',
    });
    expect(result).toEqual({ ok: true, id: 'lead-direct' });
    expect(createClient).toHaveBeenCalledWith(
      'https://vite.example.supabase.co',
      'service-role-test-key',
      expect.any(Object),
    );
  });

  it('authorizes the bypass secret or a Sunny anon ticket', () => {
    const env = {
      VERCEL_AUTOMATION_BYPASS_SECRET: 'bypass-secret',
      SUNNY_ANON_SESSION_SECRET: 'test-secret-not-for-production',
    };
    const unauthorized = new Request('https://example.test/api/sunny/leads', { method: 'POST' });
    expect(authorizeSunnyLeadsRequest(unauthorized, null, env)).toBe(false);

    const withBypass = new Request('https://example.test/api/sunny/leads', {
      method: 'POST',
      headers: { 'x-vercel-protection-bypass': 'bypass-secret' },
    });
    expect(authorizeSunnyLeadsRequest(withBypass, null, env)).toBe(true);

    const created = createSunnyAnonSession(env)!;
    const ticket = issueSunnyTicket(created.payload.id, 1, env)!;
    const withTicket = new Request('https://example.test/api/sunny/leads', {
      method: 'POST',
      headers: { [SUNNY_TICKET_HEADER]: ticket },
    });
    expect(authorizeSunnyLeadsRequest(withTicket, created.payload.id, env)).toBe(true);
  });
});

describe('insertSunnyLeadRow', () => {
  afterEach(() => {
    maybeSingle.mockReset();
    createClient.mockClear();
  });

  it('inserts public columns only and returns the id', async () => {
    maybeSingle.mockResolvedValue({ data: { id: 'lead-1' }, error: null });
    const result = await insertSunnyLeadRow(LEAD_ROW, {
      SUPABASE_URL: 'https://unprefixed.example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-key',
    });
    expect(result).toEqual({ ok: true, id: 'lead-1' });
  });
});

describe('Sunny lead tools', () => {
  it('persist from a "use step" host function, not from execute()', () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
    for (const file of ['record_sunny_lead.ts', 'request_human_handoff.ts']) {
      const source = readFileSync(join(root, 'agent/tools', file), 'utf8');
      expect(source).toContain('"use step"');
      expect(source).toContain('persistSunnyLeadPreferringHostApi');
      expect(source).not.toMatch(/async execute[\s\S]*recordSunnyLead\(/);
      expect(source).not.toMatch(/async execute[\s\S]*recordSunnyHandoff\(/);
    }
  });
});

describe('sunnyLeadExecuteResult', () => {
  it('logs a redacted reason when persist fails, without PII', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failed = sunnyLeadExecuteResult('sunny-leads', { ok: false, error: 'lead_insert_failed' });
    expect(failed).toEqual({ ok: false, recorded: false });
    const logged = JSON.stringify(spy.mock.calls);
    expect(logged).toContain('lead_insert_failed');
    expect(logged).toContain('sunny-leads');
    expect(logged).not.toContain('Ana');
    expect(logged).not.toContain('ana@example.com');
    spy.mockRestore();
  });

  it('marks a handoff success without logging', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const row = sunnyHandoffRowFromInput({
      summary: 'Visitor asked for unpublished owner contact.',
      locale: 'en',
    });
    expect(row.handoff_requested).toBe(true);
    expect(
      sunnyLeadExecuteResult('sunny-handoff', { ok: true, id: 'lead-9' }, { handoff: true }),
    ).toEqual({ ok: true, recorded: true, handoff: true });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
