import { describe, expect, it } from 'vitest';

import {
  consumeSunnyMessage,
  createSunnyAnonSession,
  issueSunnyTicket,
  verifySunnyAnonCookie,
  verifySunnyTicket,
} from './anon-crypto';

const env = { SUNNY_ANON_SESSION_SECRET: 'test-secret-not-for-production', SUNNY_ANON_FREE_MESSAGES: '2' };

describe('anon cookie and ticket', () => {
  it('round-trips a signed session and rejects a tampered cookie', () => {
    const created = createSunnyAnonSession(env);
    expect(created).not.toBeNull();
    const verified = verifySunnyAnonCookie(created!.raw, env);
    expect(verified?.id).toBe(created!.payload.id);
    expect(verifySunnyAnonCookie(`${created!.raw}x`, env)).toBeNull();
  });

  it('issues a ticket bound to the session and enforces quota', () => {
    const created = createSunnyAnonSession(env)!;
    const first = consumeSunnyMessage(created.payload, env);
    expect(first.ok).toBe(true);
    if (!first.ok) throw new Error('expected consume');
    const ticket = issueSunnyTicket(first.payload.id, first.payload.used, env);
    expect(ticket).toBeTruthy();
    expect(verifySunnyTicket(ticket, first.payload.id, env)?.used).toBe(1);
    expect(verifySunnyTicket(ticket, '00000000-0000-0000-0000-000000000000', env)).toBeNull();
    const second = consumeSunnyMessage(first.payload, env);
    expect(second.ok).toBe(true);
    if (!second.ok) throw new Error('expected consume');
    expect(consumeSunnyMessage(second.payload, env)).toEqual({ ok: false, error: 'quota' });
  });
});
