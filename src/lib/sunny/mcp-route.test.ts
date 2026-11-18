import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const vercelSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../../vercel.ts'),
  'utf8',
);

describe('ChatGPT MCP hosting routes', () => {
  it('sends /mcp to the Hono api service', () => {
    expect(vercelSource).toContain("src: '^/mcp(?:/.*)?$'");
    expect(vercelSource).toContain("{ source: '/mcp', destination: { service: 'api' } }");
    expect(new RegExp('^/mcp(?:/.*)?$').test('/mcp')).toBe(true);
    expect(new RegExp('^/mcp(?:/.*)?$').test('/mcp/')).toBe(true);
  });
});
