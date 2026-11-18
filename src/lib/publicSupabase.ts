/**
 * Public (anon + RLS) Supabase config for server runtimes: listing HTML and
 * Sunny's EVE tools.
 *
 * Vercel only injects env vars that appear as `process.env.NAME` in the
 * function graph. Pin those identifiers here even when callers pass a custom
 * `env` object. Prefer VITE_* (what the preview project actually sets). Do
 * not read NEXT_PUBLIC_* — leftover keys 401 on Preview.
 */

const PINNED_VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const PINNED_VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const PINNED_SUPABASE_URL = process.env.SUPABASE_URL;
const PINNED_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export const PUBLIC_SUPABASE_URL = 'https://prtyuwdkrrqhtwolcrav.supabase.co';

/** Same public anon key the browser already ships. RLS still applies. */
export const PUBLIC_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHl1d2RrcnJxaHR3b2xjcmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTA1MDUsImV4cCI6MjA3NjQ2NjUwNX0.0n7zBh6TvTdHtEDn_lNE0IaPkIVK3Ujhf6hZ2yNFOGo';

const URL_KEYS = ['VITE_SUPABASE_URL', 'SUPABASE_URL'] as const;
const ANON_KEYS = ['VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'] as const;

export type PublicSupabaseSource = 'vite' | 'supabase' | 'fallback';

export type PublicSupabaseConfig = {
  url: string;
  anonKey: string;
  urlSource: PublicSupabaseSource;
  anonKeySource: PublicSupabaseSource;
};

function readTrimmed(
  sources: Array<Readonly<Record<string, string | undefined>> | undefined>,
  key: string,
): string {
  for (const source of sources) {
    if (!source) continue;
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pinnedEnv(): Record<string, string | undefined> {
  return {
    VITE_SUPABASE_URL: PINNED_VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: PINNED_VITE_SUPABASE_ANON_KEY,
    SUPABASE_URL: PINNED_SUPABASE_URL,
    SUPABASE_ANON_KEY: PINNED_SUPABASE_ANON_KEY,
  };
}

export function resolvePublicSupabaseConfig(
  env: Readonly<Record<string, string | undefined>> = process.env,
  options: { includeProcess?: boolean } = {},
): PublicSupabaseConfig {
  const includeProcess = options.includeProcess !== false;
  const sources = includeProcess
    ? [env, pinnedEnv(), typeof process !== 'undefined' ? process.env : undefined]
    : [env];
  const viteUrl = readTrimmed(sources, URL_KEYS[0]);
  const supabaseUrl = readTrimmed(sources, URL_KEYS[1]);
  const viteKey = readTrimmed(sources, ANON_KEYS[0]);
  const supabaseKey = readTrimmed(sources, ANON_KEYS[1]);

  const url = (viteUrl || supabaseUrl || PUBLIC_SUPABASE_URL).replace(/\/+$/, '');
  const anonKey = viteKey || supabaseKey || PUBLIC_SUPABASE_ANON_KEY;

  return {
    url,
    anonKey,
    urlSource: viteUrl ? 'vite' : supabaseUrl ? 'supabase' : 'fallback',
    anonKeySource: viteKey ? 'vite' : supabaseKey ? 'supabase' : 'fallback',
  };
}

export function getSupabasePublicConfig(
  env?: Readonly<Record<string, string | undefined>>,
): { url: string; anonKey: string } {
  const resolved = resolvePublicSupabaseConfig(env);
  return { url: resolved.url, anonKey: resolved.anonKey };
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function looksLikeSecret(value: string): boolean {
  return /eyJ[A-Za-z0-9_-]{20,}|bearer\s|apikey/i.test(value);
}

function clip(value: unknown, max = 240): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  if (looksLikeSecret(value)) return '[redacted]';
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export function publicSupabaseErrorFields(error: unknown): Record<string, unknown> {
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const cause = record.cause;
    const causeRecord = cause && typeof cause === 'object' ? (cause as Record<string, unknown>) : null;
    return {
      name: typeof record.name === 'string' ? record.name : undefined,
      code: typeof record.code === 'string' ? record.code : causeRecord && typeof causeRecord.code === 'string' ? causeRecord.code : undefined,
      message: clip(record.message),
      details: clip(record.details),
      hint: clip(record.hint),
      status: typeof record.status === 'number' ? record.status : undefined,
      hostname:
        typeof causeRecord?.hostname === 'string'
          ? causeRecord.hostname
          : undefined,
    };
  }
  return { message: clip(error) };
}

export function logPublicSupabaseError(
  scope: string,
  error: unknown,
  extra: Record<string, unknown> = {},
): void {
  const safeExtra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(extra)) {
    if (typeof value === 'string' && looksLikeSecret(value)) {
      safeExtra[key] = '[redacted]';
    } else if (key.toLowerCase().includes('key') || key.toLowerCase().includes('secret')) {
      safeExtra[key] = typeof value === 'string' && value ? '[set]' : '[missing]';
    } else if (key === 'url' && typeof value === 'string') {
      safeExtra.hostname = hostnameOf(value);
    } else {
      safeExtra[key] = value;
    }
  }
  console.error(`[${scope}]`, { ...publicSupabaseErrorFields(error), ...safeExtra });
}
