import { logPublicSupabaseError } from '../publicSupabase';
import {
  listingSearchParams,
  publicSunnyListingHits,
  type SunnyListingHit,
  type SunnyListingSearchInput,
} from './listings';

const PINNED_SUNNY_LISTINGS_API_ORIGIN = process.env.SUNNY_LISTINGS_API_ORIGIN;
const PINNED_VERCEL_URL = process.env.VERCEL_URL;
const PINNED_VERCEL_BRANCH_URL = process.env.VERCEL_BRANCH_URL;
const PINNED_VERCEL_AUTOMATION_BYPASS_SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

function firstNonEmpty(values: Array<string | undefined>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function originFromHost(value: string): string {
  const trimmed = value.replace(/\/+$/, '');
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function pinnedOriginEnv(): Record<string, string | undefined> {
  return {
    SUNNY_LISTINGS_API_ORIGIN: PINNED_SUNNY_LISTINGS_API_ORIGIN,
    VERCEL_URL: PINNED_VERCEL_URL,
    VERCEL_BRANCH_URL: PINNED_VERCEL_BRANCH_URL,
    VERCEL_AUTOMATION_BYPASS_SECRET: PINNED_VERCEL_AUTOMATION_BYPASS_SECRET,
  };
}

function readPinned(
  env: Readonly<Record<string, string | undefined>>,
  includePinned: boolean,
): Readonly<Record<string, string | undefined>> {
  return includePinned ? pinnedOriginEnv() : {};
}

/** Same-deployment Hono origin. Workflow steps can fetch *.vercel.app even when Supabase DNS fails. */
export function resolveListingsApiOrigin(
  env: Readonly<Record<string, string | undefined>> = process.env,
  options: { includePinned?: boolean } = {},
): string | null {
  const includePinned = options.includePinned ?? env === process.env;
  const pinned = readPinned(env, includePinned);
  const raw = firstNonEmpty([
    env.SUNNY_LISTINGS_API_ORIGIN,
    pinned.SUNNY_LISTINGS_API_ORIGIN,
    env.VERCEL_URL,
    pinned.VERCEL_URL,
    env.VERCEL_BRANCH_URL,
    pinned.VERCEL_BRANCH_URL,
  ]);
  return raw ? originFromHost(raw) : null;
}

export async function searchPublishedListingsViaHostApi(
  input: SunnyListingSearchInput,
  env: Readonly<Record<string, string | undefined>> = process.env,
  options: { includePinned?: boolean } = {},
): Promise<{ ok: true; hits: SunnyListingHit[] } | { ok: false; error: string } | null> {
  const includePinned = options.includePinned ?? env === process.env;
  const origin = resolveListingsApiOrigin(env, { includePinned });
  if (!origin) return null;

  const url = `${origin}/api/sunny/listings?${listingSearchParams(input).toString()}`;
  const headers: Record<string, string> = { accept: 'application/json' };
  const pinned = readPinned(env, includePinned);
  const bypass = firstNonEmpty([
    env.VERCEL_AUTOMATION_BYPASS_SECRET,
    pinned.VERCEL_AUTOMATION_BYPASS_SECRET,
  ]);
  if (bypass) headers['x-vercel-protection-bypass'] = bypass;

  try {
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
      logPublicSupabaseError('sunny-listings-api', new Error(`host api ${response.status}`), {
        status: response.status,
        url: origin,
        city: input.city,
      });
      return { ok: false, error: 'listings_query_failed' };
    }
    const body = (await response.json()) as { ok?: boolean; hits?: unknown };
    if (!body?.ok) return { ok: false, error: 'listings_query_failed' };
    return { ok: true, hits: publicSunnyListingHits(body.hits) };
  } catch (error) {
    logPublicSupabaseError('sunny-listings-api', error, { url: origin, city: input.city });
    return { ok: false, error: 'listings_query_failed' };
  }
}
