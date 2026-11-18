import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createSunnyAnonSession,
  issueSunnyTicket,
} from '../../src/lib/sunny/anon-crypto';
import { SUNNY_ANON_COOKIE, SUNNY_TICKET_HEADER } from '../../src/lib/sunny/config';
import { POST } from './leads';

const insertSunnyLeadRow = vi.hoisted(() => vi.fn());

vi.mock('../../src/lib/sunny/leads', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/lib/sunny/leads')>();
  return {
    ...actual,
    insertSunnyLeadRow,
  };
});

const AUTH_ENV = {
  VERCEL_AUTOMATION_BYPASS_SECRET: 'bypass-secret',
  SUNNY_ANON_SESSION_SECRET: 'test-secret-not-for-production',
};

const VALID_LEAD = {
  name: 'Ana Pérez',
  contact: 'ana@example.com',
  listing_of_interest: 'brisas-del-estadio',
  message: 'Quiero agendar una visita',
  locale: 'es',
  handoff_requested: false,
  session_id: '11111111-1111-1111-1111-111111111111',
  source: 'sunny',
};

function leadRequest(
  init: {
    body?: unknown;
    headers?: Record<string, string>;
    json?: boolean;
  } = {},
) {
  const headers = new Headers(init.headers);
  if (init.json !== false) headers.set('content-type', 'application/json');
  return new Request('https://www.sundayproperties.co/api/sunny/leads', {
    method: 'POST',
    headers,
    body: init.json === false ? undefined : JSON.stringify(init.body ?? VALID_LEAD),
  });
}

describe('POST /api/sunny/leads', () => {
  afterEach(() => {
    insertSunnyLeadRow.mockReset();
    vi.restoreAllMocks();
  });

  it('rejects missing host auth', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = await POST(leadRequest(), AUTH_ENV);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, error: 'unauthorized' });
    expect(insertSunnyLeadRow).not.toHaveBeenCalled();
    expect(JSON.stringify(spy.mock.calls)).not.toContain('Ana');
    expect(JSON.stringify(spy.mock.calls)).not.toContain('ana@example.com');
  });

  it('rejects a wrong bypass secret', async () => {
    const response = await POST(
      leadRequest({ headers: { 'x-vercel-protection-bypass': 'nope' } }),
      AUTH_ENV,
    );
    expect(response.status).toBe(401);
    expect(insertSunnyLeadRow).not.toHaveBeenCalled();
  });

  it('rejects an authorized request with an invalid body', async () => {
    const response = await POST(
      leadRequest({
        body: { message: 'hi', locale: 'es', handoff_requested: false },
        headers: { 'x-vercel-protection-bypass': 'bypass-secret' },
      }),
      AUTH_ENV,
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: 'invalid_body' });
    expect(insertSunnyLeadRow).not.toHaveBeenCalled();
  });

  it('inserts a lead when the host bypass secret matches', async () => {
    insertSunnyLeadRow.mockResolvedValue({ ok: true, id: 'lead-1' });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = await POST(
      leadRequest({ headers: { 'x-vercel-protection-bypass': 'bypass-secret' } }),
      AUTH_ENV,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(insertSunnyLeadRow).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Ana Pérez',
        contact: 'ana@example.com',
        listing_of_interest: 'brisas-del-estadio',
        message: 'Quiero agendar una visita',
        locale: 'es',
        handoff_requested: false,
        source: 'sunny',
      }),
      AUTH_ENV,
    );
    expect(JSON.stringify(spy.mock.calls)).not.toContain('Ana');
    expect(JSON.stringify(spy.mock.calls)).not.toContain('ana@example.com');
  });

  it('accepts a valid Sunny anon ticket with the session cookie', async () => {
    insertSunnyLeadRow.mockResolvedValue({ ok: true, id: 'lead-2' });
    const created = createSunnyAnonSession(AUTH_ENV);
    expect(created).not.toBeNull();
    const ticket = issueSunnyTicket(created!.payload.id, 1, AUTH_ENV);
    expect(ticket).toBeTruthy();

    const response = await POST(
      leadRequest({
        body: { ...VALID_LEAD, session_id: created!.payload.id },
        headers: {
          cookie: `${SUNNY_ANON_COOKIE}=${created!.raw}`,
          [SUNNY_TICKET_HEADER]: ticket!,
        },
      }),
      AUTH_ENV,
    );
    expect(response.status).toBe(200);
    expect(insertSunnyLeadRow).toHaveBeenCalledTimes(1);
  });

  it('accepts a matching ticket+session on a public origin with no bypass secret', async () => {
    insertSunnyLeadRow.mockResolvedValue({ ok: true, id: 'lead-3' });
    const env = { SUNNY_ANON_SESSION_SECRET: 'test-secret-not-for-production' };
    const created = createSunnyAnonSession(env);
    expect(created).not.toBeNull();
    const ticket = issueSunnyTicket(created!.payload.id, 1, env);
    expect(ticket).toBeTruthy();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(
      leadRequest({
        body: { ...VALID_LEAD, session_id: created!.payload.id },
        headers: { [SUNNY_TICKET_HEADER]: ticket! },
      }),
      env,
    );
    expect(response.status).toBe(200);
    expect(insertSunnyLeadRow).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(spy.mock.calls)).not.toContain('Ana');
    expect(JSON.stringify(spy.mock.calls)).not.toContain('ana@example.com');
  });

  it('rejects a ticket bound to a different session_id', async () => {
    const env = { SUNNY_ANON_SESSION_SECRET: 'test-secret-not-for-production' };
    const created = createSunnyAnonSession(env)!;
    const ticket = issueSunnyTicket(created.payload.id, 1, env)!;
    const response = await POST(
      leadRequest({
        body: { ...VALID_LEAD, session_id: '00000000-0000-0000-0000-000000000000' },
        headers: { [SUNNY_TICKET_HEADER]: ticket },
      }),
      env,
    );
    expect(response.status).toBe(401);
    expect(insertSunnyLeadRow).not.toHaveBeenCalled();
  });
});
