import { timingSafeEqual } from 'node:crypto';

import { logPublicSupabaseError } from '../publicSupabase';
import {
  readSunnyAnonCookie,
  verifySunnyAnonCookie,
  verifySunnyTicket,
} from './anon-crypto';
import { SUNNY_TICKET_HEADER } from './config';
import { insertSunnyLeadRow, type SunnyLeadRow } from './leads';
import { resolveListingsApiOrigin } from './listings-host';

const PINNED_VERCEL_AUTOMATION_BYPASS_SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export const SUNNY_HOST_BYPASS_HEADER = 'x-vercel-protection-bypass';

function firstNonEmpty(values: Array<string | undefined>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pinnedHostEnv(): Record<string, string | undefined> {
  return {
    VERCEL_AUTOMATION_BYPASS_SECRET: PINNED_VERCEL_AUTOMATION_BYPASS_SECRET,
  };
}

function safeEqualString(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function bypassSecret(
  env: Readonly<Record<string, string | undefined>>,
  includePinned: boolean,
): string {
  const pinned = includePinned ? pinnedHostEnv() : {};
  return firstNonEmpty([
    env.VERCEL_AUTOMATION_BYPASS_SECRET,
    pinned.VERCEL_AUTOMATION_BYPASS_SECRET,
  ]);
}

export function sunnyHostApiHeaders(
  env: Readonly<Record<string, string | undefined>> = process.env,
  options: { includePinned?: boolean } = {},
): Record<string, string> {
  const includePinned = options.includePinned ?? env === process.env;
  const headers: Record<string, string> = {
    accept: 'application/json',
    'content-type': 'application/json',
  };
  const bypass = bypassSecret(env, includePinned);
  if (bypass) headers[SUNNY_HOST_BYPASS_HEADER] = bypass;
  return headers;
}

export function authorizeSunnyLeadsRequest(
  request: Request,
  sessionId?: string | null,
  env: Readonly<Record<string, string | undefined>> = process.env,
  options: { includePinned?: boolean } = {},
): boolean {
  const includePinned = options.includePinned ?? env === process.env;
  const expected = bypassSecret(env, includePinned);
  const provided = request.headers.get(SUNNY_HOST_BYPASS_HEADER)?.trim() ?? '';
  if (expected && provided && safeEqualString(provided, expected)) return true;

  const cookieSession = verifySunnyAnonCookie(
    readSunnyAnonCookie(request.headers.get('cookie')),
    env,
  );
  const ticketSessionId = cookieSession?.id || sessionId || '';
  if (!ticketSessionId) return false;
  return Boolean(verifySunnyTicket(request.headers.get(SUNNY_TICKET_HEADER), ticketSessionId, env));
}

export async function recordSunnyLeadViaHostApi(
  row: SunnyLeadRow,
  env: Readonly<Record<string, string | undefined>> = process.env,
  options: { includePinned?: boolean } = {},
): Promise<{ ok: true; id?: string } | { ok: false; error: string } | null> {
  const includePinned = options.includePinned ?? env === process.env;
  const origin = resolveListingsApiOrigin(env, { includePinned });
  if (!origin) return null;

  const headers = sunnyHostApiHeaders(env, { includePinned });
  if (!headers[SUNNY_HOST_BYPASS_HEADER]) return null;

  const url = `${origin}/api/sunny/leads`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: row.name ?? null,
        contact: row.contact ?? null,
        listing_of_interest: row.listing_of_interest ?? null,
        message: row.message,
        locale: row.locale,
        handoff_requested: row.handoff_requested,
        session_id: row.session_id ?? null,
        source: 'sunny',
      }),
    });
    if (!response.ok) {
      logPublicSupabaseError('sunny-leads-api', new Error(`host api ${response.status}`), {
        status: response.status,
        url: origin,
        handoff: row.handoff_requested,
      });
      return { ok: false, error: 'lead_insert_failed' };
    }
    const body = (await response.json()) as { ok?: boolean };
    if (!body?.ok) return { ok: false, error: 'lead_insert_failed' };
    return { ok: true };
  } catch (error) {
    logPublicSupabaseError('sunny-leads-api', error, {
      url: origin,
      handoff: row.handoff_requested,
    });
    return { ok: false, error: 'lead_insert_failed' };
  }
}

/** Prefer the Hono api service (normal Node egress). Fall back to direct PostgREST. */
export async function persistSunnyLeadPreferringHostApi(
  row: SunnyLeadRow,
  env: Readonly<Record<string, string | undefined>> = process.env,
  options: { includePinned?: boolean } = {},
): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const viaHost = await recordSunnyLeadViaHostApi(row, env, options);
  if (viaHost) return viaHost;
  return insertSunnyLeadRow(row, env);
}
