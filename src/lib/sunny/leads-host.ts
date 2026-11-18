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
export const SUNNY_AUTH_TICKET_ATTRIBUTE = 'ticket';
export const SUNNY_AUTH_VISITOR_ATTRIBUTE = 'visitorId';

export type SunnyLeadHopAuth = {
  ticket?: string | null;
  sessionId?: string | null;
};

export type SunnyLeadHostOptions = {
  includePinned?: boolean;
  hopAuth?: SunnyLeadHopAuth;
};

function firstNonEmpty(values: Array<string | undefined>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function firstAttr(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
    return value[0].trim();
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

/** *.vercel.app deployments sit behind Deployment Protection; a public custom domain does not. */
export function hostOriginRequiresProtectionBypass(origin: string): boolean {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === 'vercel.app' || host.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

export function sunnyHopAuthFromAttributes(
  attributes: Readonly<Record<string, unknown>> | null | undefined,
  fallbackSessionId?: string | null,
): SunnyLeadHopAuth {
  const ticket = firstAttr(attributes?.[SUNNY_AUTH_TICKET_ATTRIBUTE]);
  const visitorId = firstAttr(attributes?.[SUNNY_AUTH_VISITOR_ATTRIBUTE]);
  const sessionId = visitorId || firstNonEmpty([fallbackSessionId ?? undefined]);
  return {
    ticket: ticket || undefined,
    sessionId: sessionId || undefined,
  };
}

export function sunnyHostApiHeaders(
  env: Readonly<Record<string, string | undefined>> = process.env,
  options: { includePinned?: boolean; ticket?: string | null } = {},
): Record<string, string> {
  const includePinned = options.includePinned ?? env === process.env;
  const headers: Record<string, string> = {
    accept: 'application/json',
    'content-type': 'application/json',
  };
  const bypass = bypassSecret(env, includePinned);
  if (bypass) headers[SUNNY_HOST_BYPASS_HEADER] = bypass;
  const ticket = options.ticket?.trim();
  if (ticket) headers[SUNNY_TICKET_HEADER] = ticket;
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
  const ticketSessionId = cookieSession?.id || sessionId?.trim() || '';
  if (!ticketSessionId) return false;
  return Boolean(verifySunnyTicket(request.headers.get(SUNNY_TICKET_HEADER), ticketSessionId, env));
}

function hopHttpReason(status: number): `hop_http_${number}` {
  const code = Number.isFinite(status) ? Math.trunc(status) : 0;
  return `hop_http_${code}`;
}

function directInsertReason(code: string): `direct_insert_${string}` {
  const token = code.replace(/[^A-Za-z0-9_]/g, '').slice(0, 32);
  return `direct_insert_${token || 'lead_insert_failed'}`;
}

function hopRow(row: SunnyLeadRow, hopAuth?: SunnyLeadHopAuth): SunnyLeadRow {
  const sessionId = hopAuth?.sessionId?.trim();
  if (!sessionId) return row;
  return { ...row, session_id: sessionId };
}

export async function recordSunnyLeadViaHostApi(
  row: SunnyLeadRow,
  env: Readonly<Record<string, string | undefined>> = process.env,
  options: SunnyLeadHostOptions = {},
): Promise<{ ok: true; id?: string } | { ok: false; error: string } | null> {
  const includePinned = options.includePinned ?? env === process.env;
  const origin = resolveListingsApiOrigin(env, { includePinned });
  if (!origin) return null;

  const payload = hopRow(row, options.hopAuth);
  const headers = sunnyHostApiHeaders(env, {
    includePinned,
    ticket: options.hopAuth?.ticket,
  });
  const hasBypass = Boolean(headers[SUNNY_HOST_BYPASS_HEADER]);
  const hasTicket = Boolean(headers[SUNNY_TICKET_HEADER]);
  if (hostOriginRequiresProtectionBypass(origin) && !hasBypass) return null;
  if (!hasBypass && !hasTicket) return null;

  const url = `${origin}/api/sunny/leads`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: payload.name ?? null,
        contact: payload.contact ?? null,
        listing_of_interest: payload.listing_of_interest ?? null,
        message: payload.message,
        locale: payload.locale,
        handoff_requested: payload.handoff_requested,
        session_id: payload.session_id ?? null,
        source: 'sunny',
      }),
    });
    if (!response.ok) {
      const error = hopHttpReason(response.status);
      logPublicSupabaseError('sunny-leads-api', new Error(error), {
        error,
        status: response.status,
        url: origin,
        handoff: payload.handoff_requested,
      });
      return { ok: false, error };
    }
    const body = (await response.json()) as { ok?: boolean };
    if (!body?.ok) {
      const error = hopHttpReason(response.status);
      logPublicSupabaseError('sunny-leads-api', new Error(error), {
        error,
        status: response.status,
        url: origin,
        handoff: payload.handoff_requested,
      });
      return { ok: false, error };
    }
    return { ok: true };
  } catch (error) {
    logPublicSupabaseError('sunny-leads-api', error, {
      error: 'lead_insert_failed',
      url: origin,
      handoff: payload.handoff_requested,
    });
    return { ok: false, error: 'lead_insert_failed' };
  }
}

/** Prefer the Hono api service (normal Node egress). Fall back to direct PostgREST. */
export async function persistSunnyLeadPreferringHostApi(
  row: SunnyLeadRow,
  env: Readonly<Record<string, string | undefined>> = process.env,
  options: SunnyLeadHostOptions = {},
): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const payload = hopRow(row, options.hopAuth);
  const viaHost = await recordSunnyLeadViaHostApi(payload, env, options);
  if (viaHost) return viaHost;

  logPublicSupabaseError('sunny-leads-api', new Error('hop_skipped'), {
    error: 'hop_skipped',
    handoff: payload.handoff_requested,
  });
  const inserted = await insertSunnyLeadRow(payload, env);
  if (inserted.ok === false) {
    const error = directInsertReason(inserted.error);
    logPublicSupabaseError('sunny-leads-api', new Error(error), {
      error,
      handoff: payload.handoff_requested,
    });
    return { ok: false, error };
  }
  return inserted;
}
