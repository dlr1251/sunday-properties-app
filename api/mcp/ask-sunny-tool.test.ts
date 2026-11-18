import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { describe, expect, it } from 'vitest';

import { mcpResultFromAskSunny } from './ask-sunny-tool';
import { createSundayMcpServer } from './server';

describe('ask_sunny MCP tool', () => {
  it('wraps a Sunny reply and keeps session_id for follow-ups', () => {
    const result = mcpResultFromAskSunny({
      ok: true,
      reply: 'Hay arriendos publicados en Laureles.',
      session_id: 'wrun_A',
      turn_id: 'turn_0',
    });
    expect(result.isError).toBeUndefined();
    expect(result.structuredContent).toMatchObject({
      ok: true,
      reply: 'Hay arriendos publicados en Laureles.',
      session_id: 'wrun_A',
      turn_id: 'turn_0',
    });
    expect(result.content[0]?.text).toBe('Hay arriendos publicados en Laureles.');
  });

  it('marks configuration failures as tool errors without leaking secrets', () => {
    const result = mcpResultFromAskSunny({
      ok: false,
      error: 'Sunny is not configured on this deployment.',
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result)).not.toMatch(/Bearer |api[_-]?key/i);
  });

  it('registers ask_sunny next to the listing tools', async () => {
    const server = createSundayMcpServer(async () => ({ ok: true, hits: [] }), {
      askSunny: async (input) =>
        mcpResultFromAskSunny({
          ok: true,
          reply: `Sunny heard: ${input.message}`,
          session_id: 'wrun_mock',
        }),
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: 'ask-sunny-test', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    try {
      const listed = await client.listTools();
      expect(listed.tools.map((tool) => tool.name)).toContain('ask_sunny');
      const ask = listed.tools.find((tool) => tool.name === 'ask_sunny');
      expect(ask?.annotations?.readOnlyHint).toBe(false);
      const called = await client.callTool({
        name: 'ask_sunny',
        arguments: { message: '¿qué arriendos hay en Laureles?' },
      });
      expect(called.isError).toBeFalsy();
      expect((called.structuredContent as { session_id?: string }).session_id).toBe('wrun_mock');
    } finally {
      await client.close();
      await server.close();
    }
  });
});
