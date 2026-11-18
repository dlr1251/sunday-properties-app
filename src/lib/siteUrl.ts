export {
  SITE_ORIGIN,
  passwordRecoveryRedirectTo,
  resolvePublicSiteOrigin,
  type PublicSiteOriginInput,
} from './siteOrigin';
import { passwordRecoveryRedirectTo, resolvePublicSiteOrigin } from './siteOrigin';

/** Client-only: reads Vite `import.meta.env`. Do not import this module from `api/`. */
export function getPasswordRecoveryRedirectTo(): string {
  return passwordRecoveryRedirectTo(
    resolvePublicSiteOrigin({
      envSiteUrl: import.meta.env.VITE_PUBLIC_SITE_URL,
      isDev: import.meta.env.DEV,
      windowOrigin: typeof window !== 'undefined' ? window.location.origin : null,
    })
  );
}
