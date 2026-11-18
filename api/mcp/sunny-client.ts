import { Client, SessionNotActiveError } from 'eve/client';
import type { SessionStreamEvent } from 'eve/client';

import { SITE_ORIGIN } from '../../src/lib/siteOrigin';
import { SUNNY_HOST_BYPASS_HEADER } from '../../src/lib/sunny/leads-host';
import { sunnyMcpApiKey } from '../../agent/lib/mcp-auth';

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

export type SunnyDelivery = {
  result: (options?: { signal?: AbortSignal }) => Promise<{
    reply?: string;
    status: string;
  }>;
};

export type SunnyEveHandle = {
  id: string;
  send: (message: string, options?: { signal?: AbortSignal }) => Promise<SunnyDelivery>;
  snapshot: (options?: { signal?: AbortSignal }) => Promise<{ events: readonly SessionStreamEvent[] }>;
};

export type SunnyEveClient = {
  sessions: {
    create: (
      input: { message: string; signal?: AbortSignal },
    ) => Promise<{ session: SunnyEveHandle; delivery: SunnyDelivery }>;
    attach: (sessionId: string) => SunnyEveHandle;
  };
};

export type AskSunnyDeps = {
  env?: Env;
  timeoutMs?: number;
  createClient?: (input: { baseUrl: string; apiKey: string; headers: Record<string, string> }) => SunnyEveClient;
};

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

/** SUNNY_URL, else this deployment, else the public site. */
export function resolveSunnyUrl(env: Env = process.env): string {
  const raw = firstNonEmpty([env.SUNNY_URL, env.VERCEL_URL, env.VERCEL_BRANCH_URL, SITE_ORIGIN]);
  return originFromHost(raw || SITE_ORIGIN);
}

export function eveRequestHeaders(env: Env = process.env): Record<string, string> {
  const headers: Record<string, string> = {};
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

/**
 * Assemble the assistant reply from a stream snapshot.
 * `turn.settled.data.reply` is part ids; text lives on `content.completed`.
 */
function eventData(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

export function replyFromSettledEvents(
  events: readonly { type: string; data?: unknown }[],
): { turnId?: string; reply: string } {
  const completed = new Map<string, string>();
  const deltas = new Map<string, string>();
  let turnId: string | undefined;
  let replyIds: string[] = [];

  for (const event of events) {
    const data = eventData(event.data);
    if (event.type === 'content.completed') {
      const partId = typeof data?.partId === 'string' ? data.partId : '';
      if (partId) completed.set(partId, partText(data ?? undefined));
    }
    if (event.type === 'content.delta') {
      const partId = typeof data?.partId === 'string' ? data.partId : '';
      const delta = typeof data?.delta === 'string' ? data.delta : '';
      if (partId && delta) deltas.set(partId, `${deltas.get(partId) ?? ''}${delta}`);
    }
    if (event.type === 'turn.settled') {
      if (typeof data?.turnId === 'string') turnId = data.turnId;
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

function defaultCreateClient(input: {
  baseUrl: string;
  apiKey: string;
  headers: Record<string, string>;
}): SunnyEveClient {
  const client = new Client({
    baseUrl: input.baseUrl,
    auth: { bearer: input.apiKey },
    headers: input.headers,
  });
  return {
    sessions: {
      create: async ({ message, signal }) => {
        const created = await client.sessions.create({ message, signal, turnPolicy: 'queue' });
        return { session: wrapSession(created.session), delivery: created.delivery };
      },
      attach: (sessionId) => wrapSession(client.sessions.attach(sessionId)),
    },
  };
}

function wrapSession(session: {
  id: string;
  send: (
    message: string,
    options?: { signal?: AbortSignal; turnPolicy?: 'queue' | 'steer' },
  ) => Promise<SunnyDelivery>;
  snapshot: (options?: { signal?: AbortSignal }) => Promise<{ events: readonly SessionStreamEvent[] }>;
}): SunnyEveHandle {
  return {
    id: session.id,
    send: (message, options) => session.send(message, { ...options, turnPolicy: 'queue' }),
    snapshot: (options) => session.snapshot(options),
  };
}

function publicErrorMessage(error: unknown): string {
  if (SessionNotActiveError.is(error)) return 'That Sunny session is no longer active. Ask again without session_id.';
  if (error instanceof Error && error.name === 'AbortError') {
    return 'Sunny took too long to answer. Try again in a moment.';
  }
  const code =
    error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
      ? error.code
      : '';
  if (code === 'http_error' || code === 'unauthorized' || code === 'authentication_required') {
    return 'Sunny rejected the request. Check SUNNY_MCP_API_KEY on this deployment.';
  }
  return 'Sunny is unavailable right now.';
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
  const createClient = deps.createClient ?? defaultCreateClient;
  const client = createClient({
    baseUrl: resolveSunnyUrl(env),
    apiKey,
    headers: eveRequestHeaders(env),
  });

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);
  const signal = abort.signal;

  try {
    let session: SunnyEveHandle;
    let delivery: SunnyDelivery;
    const existingId = input.session_id?.trim();

    if (existingId) {
      session = client.sessions.attach(existingId);
      try {
        delivery = await session.send(message, { signal });
      } catch (error) {
        if (!SessionNotActiveError.is(error)) throw error;
        const created = await client.sessions.create({ message, signal });
        session = created.session;
        delivery = created.delivery;
      }
    } else {
      const created = await client.sessions.create({ message, signal });
      session = created.session;
      delivery = created.delivery;
    }

    const settled = await delivery.result({ signal });
    const snapshot = await session.snapshot({ signal });
    const folded = replyFromSettledEvents(snapshot.events);
    const reply = (settled.reply?.trim() || folded.reply).trim();
    const turnId = folded.turnId;

    if (settled.status === 'failed') {
      return {
        ok: false,
        error: 'Sunny could not finish that turn.',
        session_id: session.id,
      };
    }

    if (!reply) {
      return {
        ok: false,
        error: 'Sunny returned an empty reply. Retry, or inspect /eve/v1/session/<id>/stream?follow=false.',
        session_id: session.id,
      };
    }

    return {
      ok: true,
      reply,
      session_id: session.id,
      ...(turnId ? { turn_id: turnId } : {}),
    };
  } catch (error) {
    return { ok: false, error: publicErrorMessage(error), session_id: input.session_id?.trim() };
  } finally {
    clearTimeout(timer);
  }
}
