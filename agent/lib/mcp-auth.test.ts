import { describe, expect, it } from 'vitest';

import {
  CLAUDE_MCP_CHANNEL,
  SUNNY_MCP_API_KEY_HEADER,
  SUNNY_MCP_AUTHENTICATOR,
  isClaudeMcpCaller,
  mcpApiKeyAuth,
  mcpKeyFromRequest,
  safeEqualSecret,
} from './mcp-auth';

const KEY = 'throwaway-preview-key-not-for-production';

function requestWith(headers: Record<string, string>) {
  return new Request('https://www.sundayproperties.co/eve/v1/session', {
    method: 'POST',
    headers,
  });
}

describe('mcpApiKeyAuth', () => {
  it('accepts a matching Bearer token as claude-mcp', async () => {
    const auth = mcpApiKeyAuth({ SUNNY_MCP_API_KEY: KEY });
    const result = await auth(requestWith({ authorization: `Bearer ${KEY}` }));
    expect(result).toMatchObject({
      authenticator: SUNNY_MCP_AUTHENTICATOR,
      principalId: CLAUDE_MCP_CHANNEL,
      principalType: 'user',
      attributes: { channel: CLAUDE_MCP_CHANNEL, anonymous: '1' },
    });
  });

  it('accepts the dedicated header', async () => {
    const auth = mcpApiKeyAuth({ SUNNY_MCP_API_KEY: KEY });
    const result = await auth(requestWith({ [SUNNY_MCP_API_KEY_HEADER]: KEY }));
    expect(result?.authenticator).toBe(SUNNY_MCP_AUTHENTICATOR);
  });

  it('skips a missing or wrong key so web auth can run', async () => {
    const auth = mcpApiKeyAuth({ SUNNY_MCP_API_KEY: KEY });
    expect(await auth(requestWith({}))).toBeNull();
    expect(await auth(requestWith({ authorization: 'Bearer other-token' }))).toBeNull();
    expect(await mcpApiKeyAuth({})(requestWith({ authorization: `Bearer ${KEY}` }))).toBeNull();
  });

  it('compares secrets in constant time and does not throw on length mismatch', () => {
    expect(safeEqualSecret(KEY, KEY)).toBe(true);
    expect(safeEqualSecret(KEY, 'nope')).toBe(false);
    expect(safeEqualSecret(KEY, `${KEY}x`)).toBe(false);
  });

  it('reads Bearer via extractBearerToken and ignores other schemes', () => {
    expect(mcpKeyFromRequest(requestWith({ authorization: `Bearer ${KEY}` }))).toBe(KEY);
    expect(mcpKeyFromRequest(requestWith({ authorization: `Basic ${KEY}` }))).toBe('');
  });

  it('tags claude-mcp callers from authenticator or attributes.channel', () => {
    expect(isClaudeMcpCaller({ authenticator: SUNNY_MCP_AUTHENTICATOR, attributes: {} })).toBe(true);
    expect(isClaudeMcpCaller({ authenticator: 'sunny-anon', attributes: { channel: CLAUDE_MCP_CHANNEL } })).toBe(
      true,
    );
    expect(isClaudeMcpCaller({ authenticator: 'sunny-anon', attributes: { anonymous: '1' } })).toBe(false);
  });
});
