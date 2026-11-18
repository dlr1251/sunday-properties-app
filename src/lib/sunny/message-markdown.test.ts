import { describe, expect, it } from 'vitest';

import {
  linkifySunnyMarkdown,
  listingPathFromMatch,
  prepareSunnyMarkdown,
  withMarkdownBreaks,
} from './message-markdown';

describe('message-markdown', () => {
  it('extracts listing paths from bare and absolute URLs', () => {
    expect(listingPathFromMatch('/properties/el-escorial-701')).toBe('/properties/el-escorial-701');
    expect(listingPathFromMatch('https://sundayproperties.co/properties/el-escorial-701')).toBe(
      '/properties/el-escorial-701',
    );
  });

  it('turns a bare listing path into a markdown link', () => {
    expect(linkifySunnyMarkdown('→ /properties/el-escorial-701')).toBe(
      '→ [/properties/el-escorial-701](/properties/el-escorial-701)',
    );
  });

  it('does not rewrite existing markdown links', () => {
    const source = 'See [El Escorial](/properties/el-escorial-701) today';
    expect(linkifySunnyMarkdown(source)).toBe(source);
  });

  it('keeps single newlines as markdown hard breaks and bold markers intact', () => {
    const source = '**El Escorial 701**\n3 habitaciones\n\n→ /properties/el-escorial-701';
    expect(withMarkdownBreaks(source)).toBe(
      '**El Escorial 701**  \n3 habitaciones\n\n→ /properties/el-escorial-701',
    );
    expect(prepareSunnyMarkdown(source)).toContain('[/properties/el-escorial-701](/properties/el-escorial-701)');
    expect(prepareSunnyMarkdown(source)).toContain('**El Escorial 701**  \n');
  });
});
