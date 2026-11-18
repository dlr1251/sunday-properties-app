import {
  SUNNY_TICKET_HEADER,
  isSunnyChatEnabled,
  sunnyAnonFreeMessages,
} from '../../src/lib/sunny/config';
import {
  readSunnyAnonCookie,
  verifySunnyAnonCookie,
  verifySunnyTicket,
} from '../../src/lib/sunny/anon-crypto';
import { isDeclaredBotUa } from '../../src/lib/sunny/turnstile';
import type { AuthFn } from 'eve/channels/auth';

export function sunnyAnonCapsOpen(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  return isSunnyChatEnabled(env) && sunnyAnonFreeMessages(env) > 0;
}

/**
 * Public-site visitors: signed httpOnly cookie + a one-turn ticket from
 * /api/sunny/anon. Does not create auth.users.
 */
export function sunnyAnonSessionAuth(): AuthFn<Request> {
  return async (request) => {
    if (!sunnyAnonCapsOpen()) return null;
    if (isDeclaredBotUa(request.headers.get('user-agent'))) return null;

    const session = verifySunnyAnonCookie(readSunnyAnonCookie(request.headers.get('cookie')));
    if (!session) return null;

    const method = request.method.toUpperCase();
    const readOnly = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
    if (!readOnly) {
      const ticket = verifySunnyTicket(request.headers.get(SUNNY_TICKET_HEADER), session.id);
      if (!ticket) return null;
    }

    const localeHeader = request.headers.get('x-sunny-locale');
    const ticketHeader = request.headers.get(SUNNY_TICKET_HEADER)?.trim() || '';

    return {
      authenticator: 'sunny-anon',
      principalId: `anon:${session.id}`,
      principalType: 'user' as const,
      subject: `anon:${session.id}`,
      attributes: {
        anonymous: '1',
        visitorId: session.id,
        ...(ticketHeader ? { ticket: ticketHeader } : {}),
        ...(localeHeader === 'es' || localeHeader === 'en' ? { locale: localeHeader } : {}),
      },
    };
  };
}
