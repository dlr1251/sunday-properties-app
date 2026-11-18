import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const vercelSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../../vercel.ts'),
  'utf8',
);

describe('properties hosting routes', () => {
  it('sends only /properties/:slug to the api service so the index stays on the SPA', () => {
    expect(vercelSource).toContain("src: '^/properties/(.+)$'");
    expect(vercelSource).not.toContain("src: '^/properties(?:/.*)?$'");
    expect(vercelSource).toContain("/properties/:slug");
    expect(vercelSource).not.toContain("/properties/:path*");

    const src = '^/properties/(.+)$';
    expect(new RegExp(src).test('/properties')).toBe(false);
    expect(new RegExp(src).test('/properties/')).toBe(false);
    expect(new RegExp(src).test('/properties/brisas-del-estadio')).toBe(true);
  });
});
