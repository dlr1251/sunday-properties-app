/** Canonical public origin. Always the lowercase www host. */
export const SITE_ORIGIN = 'https://www.sundayproperties.co';

export type PublicSiteOriginInput = {
  envSiteUrl?: string | null;
  isDev: boolean;
  windowOrigin?: string | null;
  canonicalOrigin?: string;
};

/**
 * Canonical public origin for auth redirects and emails.
 * Production always prefers VITE_PUBLIC_SITE_URL, then the www host, so a
 * recovery email started on the apex, a Vercel alias, or localhost preview
 * still lands on sundayproperties.co.
 *
 * Server-safe: no `import.meta`. Pass env/dev flags from the caller.
 */
export function resolvePublicSiteOrigin(input: PublicSiteOriginInput): string {
  const fromEnv = input.envSiteUrl?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (input.isDev && input.windowOrigin) {
    return input.windowOrigin.replace(/\/$/, '');
  }
  return (input.canonicalOrigin ?? SITE_ORIGIN).replace(/\/$/, '');
}

export function passwordRecoveryRedirectTo(origin: string): string {
  return `${origin.replace(/\/$/, '')}/reset-password`;
}
