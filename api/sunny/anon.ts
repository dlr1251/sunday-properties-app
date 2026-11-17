import {
  consumeSunnyMessage,
  createSunnyAnonSession,
  issueSunnyTicket,
  readSunnyAnonCookie,
  stampSunnyAnonCookie,
  sunnyAnonCookieHeader,
  verifySunnyAnonCookie,
} from '../../src/lib/sunny/anon-crypto';
import { isSunnyChatEnabled, sunnyAnonFreeMessages } from '../../src/lib/sunny/config';
import { allowSunnyIp } from '../../src/lib/sunny/rate-limit';
import {
  clientIpFromHeaders,
  isDeclaredBotUa,
  isTurnstileConfigured,
  isTurnstileRequired,
  verifyTurnstileToken,
} from '../../src/lib/sunny/turnstile';

type NodeReq = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
};

type NodeRes = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

function headersFromNode(req: NodeReq): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) headers.set(key, value.join(', '));
    else if (value) headers.set(key, value);
  }
  return headers;
}

function jsonResponse(
  status: number,
  body: unknown,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  });
}

function remainingOf(used: number): number {
  return Math.max(0, sunnyAnonFreeMessages() - used);
}

async function handleRequest(request: Request): Promise<Response> {
  if (isDeclaredBotUa(request.headers.get('user-agent'))) {
    return jsonResponse(403, { ok: false, error: 'bot' });
  }
  if (!isSunnyChatEnabled()) {
    return jsonResponse(404, { ok: false, error: 'disabled' });
  }

  const ip = clientIpFromHeaders(request.headers);
  const cookieHeader = request.headers.get('cookie');
  const existing = verifySunnyAnonCookie(readSunnyAnonCookie(cookieHeader));
  const secure = (request.headers.get('x-forwarded-proto') || 'https') !== 'http';
  const turnstileRequired = isTurnstileRequired();

  if (request.method === 'GET' || request.method === 'HEAD') {
    if (!existing) {
      return jsonResponse(200, {
        ok: true,
        session: false,
        remaining: sunnyAnonFreeMessages(),
        turnstileRequired,
        turnstileConfigured: isTurnstileConfigured(),
        turnstileSiteKey: process.env.VITE_TURNSTILE_SITE_KEY?.trim() || process.env.TURNSTILE_SITE_KEY?.trim() || null,
      });
    }
    return jsonResponse(200, {
      ok: true,
      session: true,
      remaining: remainingOf(existing.used),
      turnstileRequired: turnstileRequired && existing.turnstile === 0,
      turnstileConfigured: isTurnstileConfigured(),
      turnstileSiteKey: process.env.VITE_TURNSTILE_SITE_KEY?.trim() || process.env.TURNSTILE_SITE_KEY?.trim() || null,
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'method' });
  }

  const rate = allowSunnyIp(ip);
  if (!rate.ok) {
    return jsonResponse(429, { ok: false, error: rate.reason });
  }

  let turnstileToken: string | undefined;
  try {
    const body = (await request.json()) as { turnstileToken?: string; locale?: string };
    turnstileToken = body.turnstileToken;
  } catch {
    /* empty body is fine */
  }

  let session = existing;
  const headers: Record<string, string> = {};
  if (!session) {
    const created = createSunnyAnonSession();
    if (!created) return jsonResponse(503, { ok: false, error: 'not_configured' });
    session = created.payload;
    headers['set-cookie'] = sunnyAnonCookieHeader(created.raw, secure);
  }

  if (turnstileRequired && session.turnstile === 0) {
    const ok = await verifyTurnstileToken(turnstileToken, ip);
    if (!ok) return jsonResponse(403, { ok: false, error: 'turnstile_failed' });
    session = { ...session, turnstile: 1 };
  }

  const consumed = consumeSunnyMessage(session);
  if (!consumed.ok) {
    const stamped = stampSunnyAnonCookie(session);
    if (stamped) headers['set-cookie'] = sunnyAnonCookieHeader(stamped, secure);
    return jsonResponse(402, { ok: false, error: 'quota', remaining: 0 }, headers);
  }

  const stamped = stampSunnyAnonCookie(consumed.payload);
  if (stamped) headers['set-cookie'] = sunnyAnonCookieHeader(stamped, secure);
  const ticket = issueSunnyTicket(consumed.payload.id, consumed.payload.used);
  if (!ticket) return jsonResponse(503, { ok: false, error: 'not_configured' }, headers);

  return jsonResponse(
    200,
    {
      ok: true,
      ticket,
      remaining: remainingOf(consumed.payload.used),
      turnstileRequired: false,
    },
    headers,
  );
}

export default async function handler(req: NodeReq, res: NodeRes): Promise<void> {
  const origin = (() => {
    const host = req.headers.host;
    const value = Array.isArray(host) ? host[0] : host;
    return value ? `https://${value}` : 'http://localhost';
  })();
  const request = new Request(`${origin}${req.url || '/api/sunny/anon'}`, {
    method: req.method || 'GET',
    headers: headersFromNode(req),
  });
  const response = await handleRequest(request);
  res.statusCode = response.status;
  response.headers.forEach((value, name) => {
    res.setHeader(name, value);
  });
  res.end(await response.text());
}

export async function GET(request: Request): Promise<Response> {
  return handleRequest(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleRequest(request);
}
