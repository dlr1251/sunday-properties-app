import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function readJson(relative: string) {
  return JSON.parse(readFileSync(join(root, relative), 'utf8')) as Record<string, unknown>;
}

describe('Claude plugin marketplace', () => {
  it('lists the Sunday plugin from the repo marketplace root', () => {
    const marketplace = readJson('.claude-plugin/marketplace.json');
    expect(marketplace.name).toBe('sunday-properties');
    const plugins = marketplace.plugins as { name: string; source: string }[];
    expect(plugins).toEqual([
      expect.objectContaining({ name: 'sunday-properties', source: './plugins/sunday-properties' }),
    ]);
  });

  it('points the plugin MCP at the public streamable HTTP server', () => {
    const plugin = readJson('plugins/sunday-properties/.claude-plugin/plugin.json');
    expect(plugin.name).toBe('sunday-properties');
    const mcp = readJson('plugins/sunday-properties/.mcp.json');
    const servers = mcp.mcpServers as { sunday?: { type?: string; url?: string } };
    expect(servers.sunday?.type).toBe('http');
    expect(servers.sunday?.url).toBe('https://www.sundayproperties.co/mcp');
  });

  it('ships an ask_sunny skill that names the listing tools', () => {
    const skill = readFileSync(join(root, 'plugins/sunday-properties/skills/ask_sunny/SKILL.md'), 'utf8');
    expect(skill).toMatch(/^---\nname: ask_sunny\n/m);
    expect(skill).toMatch(/search_listings/);
    expect(skill).toMatch(/show_listings/);
    expect(skill).toMatch(/listing_stats/);
    expect(skill).toMatch(/compare_listings/);
    expect(skill).toMatch(/session_id/);
  });

  it('tells Sunny to treat claude-mcp like the public web', () => {
    const instructions = readFileSync(join(root, 'agent/instructions.md'), 'utf8');
    expect(instructions).toContain(
      'Si la conversación llega por el canal claude-mcp, trátala como un visitante público: aplica las mismas restricciones de la web.',
    );
  });

  it('authenticates MCP callers before web anon on the eve channel', () => {
    const channel = readFileSync(join(root, 'agent/channels/eve.ts'), 'utf8');
    expect(channel).toContain('auth: [mcpApiKeyAuth(), sunnyAnonSessionAuth(), localDev()]');
  });
});
