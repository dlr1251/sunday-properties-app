type TurnstileResponse = {
  success?: boolean;
  'error-codes'?: string[];
};

type Env = Readonly<Record<string, string | undefined>>;

export function isTurnstileConfigured(env: Env = process.env): boolean {
  return Boolean(
    env.TURNSTILE_SECRET_KEY?.trim() &&
      (env.VITE_TURNSTILE_SITE_KEY?.trim() || env.TURNSTILE_SITE_KEY?.trim()),
  );
}

/** Production requires keys. Preview/dev can skip so the rest of the flow is testable. */
export function isTurnstileRequired(env: Env = process.env): boolean {
  if (isTurnstileConfigured(env)) return true;
  return env.VERCEL_ENV === 'production';
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  ip: string,
  env: Env = process.env,
): Promise<boolean> {
  const secret = env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return !isTurnstileRequired(env);
  const trimmed = token?.trim() ?? '';
  if (!trimmed) return false;

  try {
    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', trimmed);
    if (ip && ip !== '0.0.0.0') body.set('remoteip', ip);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = (await res.json()) as TurnstileResponse;
    return data.success === true;
  } catch {
    return false;
  }
}

export function clientIpFromHeaders(headers: Headers | Record<string, string | string[] | undefined>): string {
  const get = (name: string): string => {
    if (headers instanceof Headers) return headers.get(name) || '';
    const value = headers[name] ?? headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] || '' : value || '';
  };
  const forwarded = get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return get('x-real-ip') || '0.0.0.0';
}

export function isDeclaredBotUa(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return /(?:googlebot|bingbot|bytespider|gptbot|claudebot|anthropic-ai|ccbot|perplexitybot|meta-externalagent)/i.test(
    ua,
  );
}
