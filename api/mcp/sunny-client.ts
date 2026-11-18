import { SITE_ORIGIN } from '../../src/lib/siteOrigin';
import { sunnyMcpApiKey } from '../../src/lib/sunny/config';
import { SUNNY_HOST_BYPASS_HEADER } from '../../src/lib/sunny/leads-host';

export const ASK_SUNNY_TIMEOUT_MS = 50_000;

type Env = Readonly<Record<string, string | undefined>>;

export type AskSunnyInput = {
  message: string;
  session_id?: string;
};

export type AskSunnyOk = {
  ok: true;
  reply: string;
  session_id: string;
  turn_id?: string;
};

export type AskSunnyErr = {
  ok: false;
  error: string;
  session_id?: string;
};

export type AskSunnyResult = AskSunnyOk | AskSunnyErr;

export type AskSunnyDeps = {
  env?: Env;
  timeoutMs?: number;
  fetch?: typeof fetch;
};

type StreamEvent = { type: string; data?: unknown };

function firstNonEmpty(values: Array<string | undefined>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function originFromHost(value: string): string {
  const trimmed = value.replace(/\/+$/, '');
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** *.vercel.app sits behind Vercel Authentication; the public custom domain does not. */
function originRequiresProtectionBypass(origin: string): boolean {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === 'vercel.app' || host.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

/**
 * SUNNY_URL, else this deployment when we can reach it (bypass present, or not
 * a protected *.vercel.app host), else the public site.
 */
export function resolveSunnyUrl(env: Env = process.env): string {
  const explicit = env.SUNNY_URL?.trim();
  if (explicit) return originFromHost(explicit);

  const deployment = firstNonEmpty([env.VERCEL_URL, env.VERCEL_BRANCH_URL]);
  if (deployment) {
    const origin = originFromHost(deployment);
    const bypass = env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
    if (!originRequiresProtectionBypass(origin) || bypass) return origin;
  }

  return SITE_ORIGIN;
}

export function eveRequestHeaders(env: Env = process.env): Record<string, string> {
  const headers: Record<string, string> = {
    accept: 'application/json, application/x-ndjson, text/plain',
    'content-type': 'application/json',
  };
  const apiKey = sunnyMcpApiKey(env);
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  const bypass = env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
  if (bypass) headers[SUNNY_HOST_BYPASS_HEADER] = bypass;
  return headers;
}

function partText(data: { value?: unknown; fallbackText?: unknown } | undefined): string {
  if (!data) return '';
  if (typeof data.value === 'string') return data.value;
  if (typeof data.fallbackText === 'string') return data.fallbackText;
  if (data.value != null && typeof data.value !== 'object') return String(data.value);
  if (data.value && typeof data.value === 'object') {
    try {
      return JSON.stringify(data.value);
    } catch {
      return '';
    }
  }
  return '';
}

function eventData(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

/**
 * Assemble the assistant reply from a stream snapshot.
 * `turn.settled.data.reply` is part ids; text lives on `content.completed`.
 */
export function replyFromSettledEvents(
  events: readonly StreamEvent[],
  targetTurnId?: string,
): { turnId?: string; reply: string } {
  const completed = new Map<string, string>();
  const deltas = new Map<string, string>();
  let turnId: string | undefined;
  let replyIds: string[] = [];

  for (const event of events) {
    const data = eventData(event.data);
    if (event.type === 'content.completed') {
      const partId = typeof data?.partId === 'string' ? data.partId : '';
      if (partId) completed.set(partId, partText(data));
    }
    if (event.type === 'content.delta') {
      const partId = typeof data?.partId === 'string' ? data.partId : '';
      const delta = typeof data?.delta === 'string' ? data.delta : '';
      if (partId && delta) deltas.set(partId, `${deltas.get(partId) ?? ''}${delta}`);
    }
    if (event.type === 'turn.settled') {
      const settledTurn = typeof data?.turnId === 'string' ? data.turnId : undefined;
      if (targetTurnId && settledTurn !== targetTurnId) continue;
      if (settledTurn) turnId = settledTurn;
      if (Array.isArray(data?.reply)) {
        replyIds = data.reply.filter((id): id is string => typeof id === 'string');
      }
    }
  }

  const fromIds = replyIds.map((id) => completed.get(id) || deltas.get(id) || '').join('');
  if (fromIds.trim()) return { turnId, reply: fromIds };

  const replyPhase = events
    .filter((event) => event.type === 'content.completed' && eventData(event.data)?.phase === 'reply')
    .map((event) => partText(eventData(event.data)))
    .join('');
  if (replyPhase.trim()) return { turnId, reply: replyPhase };

  const lastCompleted = [...completed.values()].filter((text) => text.trim()).join('');
  return { turnId, reply: lastCompleted };
}

function looksLikeVercelProtection(status: number, body: Record<string, unknown> | null, text: string): string {
  if (status !== 401 && status !== 403) return '';
  const hay = `${text} ${typeof body?.error === 'string' ? body.error : ''}`.toLowerCase();
  const htmlGate =
    hay.includes('<!doctype') ||
    hay.includes('_vercel_sso') ||
    hay.includes('authentication required') ||
    hay.includes('vercel authentication');
  if (htmlGate || !body) {
    return 'Deployment protection blocked the hop to Sunny. Set VERCEL_AUTOMATION_BYPASS_SECRET on Preview, or SUNNY_URL to the public domain.';
  }
  return '';
}

function publicErrorMessage(
  status: number,
  body: { code?: string; error?: string } | null,
  text = '',
): string {
  const protection = looksLikeVercelProtection(status, body, text);
  if (protection) return protection;
  const code = body?.code ?? '';
  if (status === 401 || status === 403 || code === 'unauthorized' || code === 'authentication_required') {
    return 'Sunny rejected the request. Check SUNNY_MCP_API_KEY on this deployment.';
  }
  if (status === 409 || code === 'session_not_active') {
    return 'That Sunny session is no longer active. Ask again without session_id.';
  }
  return body?.error?.trim() || 'Sunny is unavailable right now.';
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(text) as unknown;
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function eventsFromStreamLine(raw: string): StreamEvent[] {
  const line = raw.startsWith('data:') ? raw.slice(5).trim() : raw.trim();
  if (!line || line === '[DONE]') return [];
  const parsed = parseJsonObject(line);
  if (!parsed) return [];
  if (typeof parsed.$eve === 'string') return [{ type: `$eve:${parsed.$eve}`, data: parsed }];
  if (parsed.progress && typeof parsed.progress === 'object') {
    const progress = parsed.progress as StreamEvent;
    return progress.type ? [progress] : [];
  }
  if (Array.isArray(parsed.facts)) {
    return parsed.facts.filter(
      (fact): fact is StreamEvent =>
        Boolean(fact) && typeof fact === 'object' && typeof (fact as StreamEvent).type === 'string',
    );
  }
  if (typeof parsed.type === 'string') return [parsed as StreamEvent];
  return [];
}

async function readJson(
  response: Response,
): Promise<{ status: number; body: Record<string, unknown> | null; text: string }> {
  const text = await response.text();
  return { status: response.status, body: parseJsonObject(text), text };
}

async function collectStreamEvents(
  response: Response,
  signal: AbortSignal,
  onEvent?: (event: StreamEvent) => boolean,
): Promise<StreamEvent[]> {
  const events: StreamEvent[] = [];
  if (!response.body) {
    const text = await response.text();
    for (const line of text.split('\n')) {
      for (const event of eventsFromStreamLine(line)) {
        events.push(event);
        if (onEvent?.(event)) return events;
      }
    }
    return events;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      let newline = buffer.indexOf('\n');
      while (newline >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        for (const event of eventsFromStreamLine(line)) {
          events.push(event);
          if (onEvent?.(event)) {
            await reader.cancel().catch(() => undefined);
            return events;
          }
        }
        newline = buffer.indexOf('\n');
      }
      if (done) break;
    }
    if (buffer.trim()) {
      for (const event of eventsFromStreamLine(buffer)) events.push(event);
    }
  } finally {
    reader.releaseLock();
  }
  return events;
}

type SessionReceipt = { sessionId: string; deliveryId?: string };

function receiptFrom(body: Record<string, unknown> | null, headers: Headers): SessionReceipt | null {
  const sessionId =
    (typeof body?.sessionId === 'string' && body.sessionId) ||
    headers.get('x-eve-session-id')?.trim() ||
    '';
  if (!sessionId) return null;
  const deliveryId = typeof body?.deliveryId === 'string' ? body.deliveryId : undefined;
  return { sessionId, deliveryId };
}

function isInactiveSession(status: number, body: Record<string, unknown> | null): boolean {
  const code = typeof body?.code === 'string' ? body.code : '';
  return status === 409 && (code === 'session_not_active' || code === 'session_stranded');
}

async function postSession(
  fetchImpl: typeof fetch,
  origin: string,
  headers: Record<string, string>,
  message: string,
  sessionId: string | undefined,
  signal: AbortSignal,
): Promise<
  | { ok: true; receipt: SessionReceipt }
  | { ok: false; status: number; body: Record<string, unknown> | null; text: string }
> {
  const path = sessionId ? `/eve/v1/session/${encodeURIComponent(sessionId)}` : '/eve/v1/session';
  const response = await fetchImpl(`${origin}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
    signal,
  });
  const { status, body, text } = await readJson(response);
  if (!response.ok) return { ok: false, status, body, text };
  const receipt = receiptFrom(body, response.headers);
  if (!receipt) return { ok: false, status, body, text };
  return { ok: true, receipt };
}

async function readTurn(
  fetchImpl: typeof fetch,
  origin: string,
  headers: Record<string, string>,
  sessionId: string,
  deliveryId: string | undefined,
  follow: boolean,
  signal: AbortSignal,
): Promise<{ turnId?: string; reply: string; events: StreamEvent[] }> {
  const query = follow ? '' : '?follow=false';
  const response = await fetchImpl(`${origin}/eve/v1/session/${encodeURIComponent(sessionId)}/stream${query}`, {
    method: 'GET',
    headers,
    signal,
  });
  if (!response.ok) {
    return { reply: '', events: [] };
  }

  let linkedTurnId: string | undefined;
  const events = await collectStreamEvents(response, signal, (event) => {
    const data = eventData(event.data);
    if (
      deliveryId &&
      (event.type === 'delivery.consumed' || event.type === 'delivery.settled') &&
      data?.deliveryId === deliveryId
    ) {
      if (typeof data.turnId === 'string') linkedTurnId = data.turnId;
      // Docs: wait for this delivery's delivery.settled, not the first turn.settled.
      if (event.type === 'delivery.settled') return true;
    }
    if (event.type === 'turn.settled') {
      const turnId = typeof data?.turnId === 'string' ? data.turnId : undefined;
      if (!deliveryId) return true;
      if (linkedTurnId && turnId === linkedTurnId) return true;
    }
    return event.type === '$eve:stream.ended';
  });

  const folded = replyFromSettledEvents(events, linkedTurnId);
  return { turnId: folded.turnId ?? linkedTurnId, reply: folded.reply, events };
}

export async function askSunny(input: AskSunnyInput, deps: AskSunnyDeps = {}): Promise<AskSunnyResult> {
  const env = deps.env ?? process.env;
  const message = input.message.trim();
  if (!message) return { ok: false, error: 'message is required' };

  const apiKey = sunnyMcpApiKey(env);
  if (!apiKey) {
    return { ok: false, error: 'Sunny is not configured on this deployment.' };
  }

  const timeoutMs = deps.timeoutMs ?? ASK_SUNNY_TIMEOUT_MS;
  const fetchImpl = deps.fetch ?? fetch;
  const origin = resolveSunnyUrl(env);
  const headers = eveRequestHeaders(env);
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);
  const signal = abort.signal;

  try {
    const existingId = input.session_id?.trim() || undefined;
    let posted = await postSession(fetchImpl, origin, headers, message, existingId, signal);
    if (posted.ok === false && existingId && isInactiveSession(posted.status, posted.body)) {
      posted = await postSession(fetchImpl, origin, headers, message, undefined, signal);
    }
    if (posted.ok === false) {
      return {
        ok: false,
        error: publicErrorMessage(
          posted.status,
          posted.body as { code?: string; error?: string } | null,
          posted.text,
        ),
        session_id: existingId,
      };
    }

    const { sessionId, deliveryId } = posted.receipt;
    let turn = await readTurn(fetchImpl, origin, headers, sessionId, deliveryId, true, signal);
    if (!turn.reply.trim()) {
      turn = await readTurn(fetchImpl, origin, headers, sessionId, deliveryId, false, signal);
    }

    if (!turn.reply.trim()) {
      return {
        ok: false,
        error: 'Sunny returned an empty reply. Retry, or inspect /eve/v1/session/<id>/stream?follow=false.',
        session_id: sessionId,
      };
    }

    return {
      ok: true,
      reply: turn.reply.trim(),
      session_id: sessionId,
      ...(turn.turnId ? { turn_id: turn.turnId } : {}),
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, error: 'Sunny took too long to answer. Try again in a moment.', session_id: input.session_id?.trim() };
    }
    return { ok: false, error: 'Sunny is unavailable right now.', session_id: input.session_id?.trim() };
  } finally {
    clearTimeout(timer);
  }
}
