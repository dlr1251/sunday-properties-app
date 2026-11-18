import { timingSafeEqual } from 'node:crypto';

import {
  extractBearerToken,
  withAuthChallenges,
  type AuthFn,
} from 'eve/channels/auth';

export const CLAUDE_MCP_CHANNEL = 'claude-mcp';
export const SUNNY_MCP_API_KEY_HEADER = 'x-sunny-mcp-api-key';
export const SUNNY_MCP_AUTHENTICATOR = 'claude-mcp';

type Env = Readonly<Record<string, string | undefined>>;

export function sunnyMcpApiKey(env: Env = process.env): string {
  return env.SUNNY_MCP_API_KEY?.trim() ?? '';
}

export function safeEqualSecret(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function mcpKeyFromRequest(request: Request): string {
  const header = request.headers.get(SUNNY_MCP_API_KEY_HEADER)?.trim() ?? '';
  if (header) return header;
  return extractBearerToken(request.headers.get('authorization'))?.trim() ?? '';
}

export function isClaudeMcpCaller(auth: {
  authenticator?: string;
  attributes?: Readonly<Record<string, string | readonly string[]>>;
} | null | undefined): boolean {
  if (!auth) return false;
  if (auth.authenticator === SUNNY_MCP_AUTHENTICATOR) return true;
  const channel = auth.attributes?.channel;
  if (typeof channel === 'string') return channel === CLAUDE_MCP_CHANNEL;
  return Array.isArray(channel) && channel[0] === CLAUDE_MCP_CHANNEL;
}

/**
 * Server-to-server callers (the public /mcp ask_sunny tool) that present
 * SUNNY_MCP_API_KEY as Bearer or x-sunny-mcp-api-key. Tagged as channel
 * claude-mcp so instructions treat them as public web visitors.
 *
 * Skips when the key is unset or the request does not carry a matching
 * secret, so web anon + Turnstile auth still runs. Never logs the key.
 */
export function mcpApiKeyAuth(env: Env = process.env): AuthFn<Request> {
  return withAuthChallenges((request) => {
    const expected = sunnyMcpApiKey(env);
    if (!expected) return null;

    const provided = mcpKeyFromRequest(request);
    if (!provided) return null;
    if (!safeEqualSecret(provided, expected)) return null;

    return {
      authenticator: SUNNY_MCP_AUTHENTICATOR,
      principalId: CLAUDE_MCP_CHANNEL,
      principalType: 'user',
      attributes: {
        channel: CLAUDE_MCP_CHANNEL,
        anonymous: '1',
      },
    };
  }, [{ scheme: 'Bearer' }]);
}
