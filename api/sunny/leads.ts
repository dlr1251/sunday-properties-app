import { authorizeSunnyLeadsRequest } from '../../src/lib/sunny/leads-host';
import {
  insertSunnyLeadRow,
  sunnyLeadRowSchema,
  type SunnyLeadRow,
} from '../../src/lib/sunny/leads';
import { logPublicSupabaseError } from '../../src/lib/publicSupabase';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function emptyToNull(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeLeadBody(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const record = raw as Record<string, unknown>;
  return {
    name: emptyToNull(record.name),
    contact: emptyToNull(record.contact),
    listing_of_interest: emptyToNull(record.listing_of_interest),
    message: typeof record.message === 'string' ? record.message.trim() : record.message,
    locale: record.locale,
    handoff_requested: record.handoff_requested,
    session_id: emptyToNull(record.session_id),
    source: 'sunny',
  };
}

function sessionIdFromBody(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = (raw as Record<string, unknown>).session_id;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export async function POST(
  request: Request,
  env: Readonly<Record<string, string | undefined>> = process.env,
): Promise<Response> {
  let raw: unknown = null;
  try {
    raw = await request.json();
  } catch {
    raw = null;
  }

  if (!authorizeSunnyLeadsRequest(request, sessionIdFromBody(raw), env)) {
    return jsonResponse(401, { ok: false, error: 'unauthorized' });
  }

  const parsed = sunnyLeadRowSchema.safeParse(normalizeLeadBody(raw));
  if (!parsed.success) {
    return jsonResponse(400, { ok: false, error: 'invalid_body' });
  }

  const row: SunnyLeadRow = parsed.data;
  try {
    const result = await insertSunnyLeadRow(row, env);
    if (result.ok === false) {
      logPublicSupabaseError('sunny-leads-api', new Error(result.error), {
        error: result.error,
        handoff: row.handoff_requested,
      });
      return jsonResponse(503, { ok: false, error: result.error });
    }
    return jsonResponse(200, { ok: true });
  } catch (error) {
    logPublicSupabaseError('sunny-leads-api', error, { handoff: row.handoff_requested });
    return jsonResponse(503, { ok: false, error: 'lead_insert_failed' });
  }
}
