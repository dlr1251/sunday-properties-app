/**
 * Returns the avatar image URL for a user/profile.
 * If the profile has a custom avatar_url, that is used.
 * Otherwise returns a deterministic, professional generated avatar (DiceBear Lorelei)
 * so every user has a consistent, nice-looking avatar.
 *
 * Style: "lorelei" – diverse, professional illustrated avatars.
 * API: https://api.dicebear.com/
 */
const DICEBEAR_STYLE = 'lorelei';
const DICEBEAR_VERSION = '9';
const DICEBEAR_BASE = `https://api.dicebear.com/${DICEBEAR_VERSION}.x/${DICEBEAR_STYLE}/svg`;

export interface AvatarSource {
  avatar_url?: string | null;
  id?: string;
  email?: string;
}

/**
 * Get the avatar URL for display. Uses custom avatar_url when set,
 * otherwise a generated avatar from DiceBear (same seed = same avatar).
 */
export function getAvatarUrl(source: AvatarSource | null | undefined): string {
  if (!source) return '';
  if (source.avatar_url?.trim()) return source.avatar_url.trim();
  const seed = source.id || source.email || 'default';
  // URL-safe seed (no special chars)
  const safeSeed = encodeURIComponent(seed);
  return `${DICEBEAR_BASE}?seed=${safeSeed}`;
}
