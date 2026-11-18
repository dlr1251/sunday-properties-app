import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

import { SUNNY_ANON_COOKIE, sunnyAnonFreeMessages } from './config';

type CookiePayload = { v: 1; id: string; iat: number; used: number; turnstile: number };
type TicketPayload = { v: 1; id: string; used: number; exp: number };

function signingSecret(env: Readonly<Record<string, string | undefined>> = process.env): string | null {
  return (
    env.SUNNY_ANON_SESSION_SECRET?.trim() ||
    env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    null
  );
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function encode<T>(payload: T, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${body}.${sign(body, secret)}`;
}

function decode<T>(raw: string, secret: string): T | null {
  const idx = raw.lastIndexOf('.');
  if (idx <= 0) return null;
  const body = raw.slice(0, idx);
  const mac = raw.slice(idx + 1);
  if (!body || !mac || !safeEqual(sign(body, secret), mac)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export function readSunnyAnonCookie(header: string | null | undefined): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() !== SUNNY_ANON_COOKIE) continue;
    return part.slice(idx + 1).trim();
  }
  return null;
}

export function createSunnyAnonSession(
  env: Readonly<Record<string, string | undefined>> = process.env,
): { raw: string; payload: CookiePayload } | null {
  const secret = signingSecret(env);
  if (!secret) return null;
  const payload: CookiePayload = {
    v: 1,
    id: randomUUID(),
    iat: Date.now(),
    used: 0,
    turnstile: 0,
  };
  return { raw: encode(payload, secret), payload };
}

export function verifySunnyAnonCookie(
  raw: string | null,
  env: Readonly<Record<string, string | undefined>> = process.env,
): CookiePayload | null {
  const secret = signingSecret(env);
  if (!secret || !raw) return null;
  const payload = decode<CookiePayload>(raw, secret);
  if (!payload || payload.v !== 1 || typeof payload.id !== 'string') return null;
  if (!/^[0-9a-f-]{36}$/i.test(payload.id)) return null;
  if (typeof payload.used !== 'number' || typeof payload.turnstile !== 'number') return null;
  return payload;
}

export function stampSunnyAnonCookie(
  payload: CookiePayload,
  env: Readonly<Record<string, string | undefined>> = process.env,
): string | null {
  const secret = signingSecret(env);
  if (!secret) return null;
  return encode(payload, secret);
}

export function issueSunnyTicket(
  sessionId: string,
  used: number,
  env: Readonly<Record<string, string | undefined>> = process.env,
  now = Date.now(),
): string | null {
  const secret = signingSecret(env);
  if (!secret) return null;
  const payload: TicketPayload = { v: 1, id: sessionId, used, exp: now + 2 * 60_000 };
  return encode(payload, secret);
}

export function verifySunnyTicket(
  raw: string | null,
  sessionId: string,
  env: Readonly<Record<string, string | undefined>> = process.env,
  now = Date.now(),
): TicketPayload | null {
  const secret = signingSecret(env);
  if (!secret || !raw) return null;
  const payload = decode<TicketPayload>(raw, secret);
  if (!payload || payload.v !== 1 || payload.id !== sessionId) return null;
  if (typeof payload.used !== 'number' || payload.exp < now) return null;
  return payload;
}

export function consumeSunnyMessage(
  payload: CookiePayload,
  env: Readonly<Record<string, string | undefined>> = process.env,
): { ok: true; payload: CookiePayload } | { ok: false; error: 'quota' } {
  const cap = sunnyAnonFreeMessages(env);
  if (payload.used >= cap) return { ok: false, error: 'quota' };
  return { ok: true, payload: { ...payload, used: payload.used + 1 } };
}

export function sunnyAnonCookieHeader(raw: string, secure: boolean): string {
  const parts = [
    `${SUNNY_ANON_COOKIE}=${raw}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=604800',
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}
