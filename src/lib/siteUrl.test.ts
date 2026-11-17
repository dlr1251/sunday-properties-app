import { describe, expect, it } from 'vitest';
import { SITE_ORIGIN, passwordRecoveryRedirectTo, resolvePublicSiteOrigin } from './siteUrl';

describe('resolvePublicSiteOrigin', () => {
  it('prefers VITE_PUBLIC_SITE_URL when set, including in dev', () => {
    expect(
      resolvePublicSiteOrigin({
        envSiteUrl: 'https://www.sundayproperties.co/',
        isDev: true,
        windowOrigin: 'http://localhost:3000',
      })
    ).toBe('https://www.sundayproperties.co');
  });

  it('uses the window origin only in local dev', () => {
    expect(
      resolvePublicSiteOrigin({
        envSiteUrl: '  ',
        isDev: true,
        windowOrigin: 'http://localhost:3000/',
      })
    ).toBe('http://localhost:3000');
  });

  it('falls back to the canonical www host in production', () => {
    expect(
      resolvePublicSiteOrigin({
        envSiteUrl: null,
        isDev: false,
        windowOrigin: 'https://sunday-properties.vercel.app',
      })
    ).toBe(SITE_ORIGIN);
  });
});

describe('passwordRecoveryRedirectTo', () => {
  it('always targets /reset-password on the resolved origin', () => {
    expect(passwordRecoveryRedirectTo('https://www.sundayproperties.co/')).toBe(
      'https://www.sundayproperties.co/reset-password'
    );
  });
});
