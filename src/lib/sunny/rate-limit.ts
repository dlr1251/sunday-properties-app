import { sunnyIpHourLimit, sunnyIpMinuteLimit } from './config';

type Bucket = { count: number; resetAt: number };

const minuteBuckets = new Map<string, Bucket>();
const hourBuckets = new Map<string, Bucket>();

function hit(store: Map<string, Bucket>, key: string, windowMs: number, limit: number): boolean {
  const now = Date.now();
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: 'ip_minute' | 'ip_hour' };

/** In-memory per-instance limit. Good enough for v1; not a global cluster cap. */
export function allowSunnyIp(ip: string, env: Readonly<Record<string, string | undefined>> = process.env): RateLimitResult {
  const key = ip || '0.0.0.0';
  if (!hit(minuteBuckets, `m:${key}`, 60_000, sunnyIpMinuteLimit(env))) {
    return { ok: false, reason: 'ip_minute' };
  }
  if (!hit(hourBuckets, `h:${key}`, 60 * 60_000, sunnyIpHourLimit(env))) {
    return { ok: false, reason: 'ip_hour' };
  }
  return { ok: true };
}

export function resetSunnyRateLimitForTests() {
  minuteBuckets.clear();
  hourBuckets.clear();
}
