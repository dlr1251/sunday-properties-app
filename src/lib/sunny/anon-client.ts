import { SUNNY_TURNSTILE_SITE_KEY } from './widget-flag';

export type SunnyAnonStatus = {
  ok: boolean;
  remaining: number;
  turnstileRequired: boolean;
  turnstileConfigured?: boolean;
  turnstileSiteKey?: string | null;
  error?: string;
  ticket?: string;
};

async function parse(res: Response): Promise<SunnyAnonStatus> {
  const data = (await res.json().catch(() => ({}))) as SunnyAnonStatus;
  if (!res.ok) {
    return {
      ok: false,
      remaining: typeof data.remaining === 'number' ? data.remaining : 0,
      turnstileRequired: Boolean(data.turnstileRequired),
      error: data.error || `http_${res.status}`,
    };
  }
  return {
    ok: data.ok !== false,
    remaining: typeof data.remaining === 'number' ? data.remaining : 0,
    turnstileRequired: Boolean(data.turnstileRequired),
    turnstileConfigured: data.turnstileConfigured,
    turnstileSiteKey: data.turnstileSiteKey ?? (SUNNY_TURNSTILE_SITE_KEY || null),
    ticket: data.ticket,
    error: data.error,
  };
}

export async function fetchSunnyAnonStatus(): Promise<SunnyAnonStatus> {
  const res = await fetch('/api/sunny/anon', { credentials: 'same-origin' });
  return parse(res);
}

export async function consumeSunnyAnonTurn(turnstileToken?: string): Promise<SunnyAnonStatus> {
  const res = await fetch('/api/sunny/anon', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ turnstileToken }),
  });
  return parse(res);
}
