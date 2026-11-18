/**
 * Client-only gate for the floating widget. Off unless VITE_SUNNY_CHAT_ENABLED
 * is the string "true" or "1" at build time.
 */
export const SUNNY_CHAT_WIDGET_ENABLED =
  import.meta.env.VITE_SUNNY_CHAT_ENABLED === 'true' ||
  import.meta.env.VITE_SUNNY_CHAT_ENABLED === '1';

export const SUNNY_TURNSTILE_SITE_KEY = String(
  import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '',
).trim();

export const SUNNY_WIDGET_AGENT_NAME = String(
  import.meta.env.VITE_SUNNY_AGENT_NAME ?? 'Sunny',
).trim() || 'Sunny';
