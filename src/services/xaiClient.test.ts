import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));

describe('xAI stays off the client bundle', () => {
  it('does not read VITE_XAI_API_KEY from the SPA services', () => {
    const files = [
      'xaiClient.ts',
      'documentAnalysis.ts',
      'legalDocumentGeneration.ts',
      'negotiationSuggestion.service.ts',
    ];
    for (const file of files) {
      const source = readFileSync(join(here, file), 'utf8');
      expect(source, file).not.toContain('VITE_XAI_API_KEY');
      expect(source, file).not.toContain('api.x.ai');
    }
    expect(readFileSync(join(here, 'xaiClient.ts'), 'utf8')).toContain('/api/xai');
  });
});
