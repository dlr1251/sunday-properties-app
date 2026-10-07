#!/usr/bin/env node
/**
 * Run AFTER applying:
 *   supabase/migrations/20261006000000_lock_down_profile_pii.sql
 *   supabase/migrations/20261007000000_lock_down_property_secrets.sql
 * to the live project. Uses only the public anon key.
 *
 *   node scripts/verify-anon-cannot-read-owner-pii.mjs
 *
 * Exit 0: anon cannot read owner email/phone/full_name, listing addresses,
 *         minimum_offer_price, or deposit.
 * Exit 1: leak still present.
 */
const url = (
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://prtyuwdkrrqhtwolcrav.supabase.co'
).replace(/\/$/, '');

const anon =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHl1d2RrcnJxaHR3b2xjcmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTA1MDUsImV4cCI6MjA3NjQ2NjUwNX0.0n7zBh6TvTdHtEDn_lNE0IaPkIVK3Ujhf6hZ2yNFOGo';

const headers = {
  apikey: anon,
  Authorization: `Bearer ${anon}`,
};

function hasPii(value) {
  if (!value || typeof value !== 'object') return false;
  return Boolean(value.email || value.phone || value.full_name || value.name);
}

function hasListingSecret(row) {
  if (!row || typeof row !== 'object') return false;
  if (row.address) return true;
  if (row.minimum_offer_price != null) return true;
  if (row.deposit != null) return true;
  if (row.owner_id) return true;
  if (row.legal_documents && Array.isArray(row.legal_documents) && row.legal_documents.length > 0) {
    return true;
  }
  return false;
}

async function get(path) {
  const res = await fetch(`${url}${path}`, { headers });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

function deniedSensitiveColumn(result) {
  if (result.status === 200 && Array.isArray(result.body)) {
    return result.body.every((row) => !hasListingSecret(row));
  }
  if (result.status === 401 || result.status === 403) return true;
  if (typeof result.body === 'object' && result.body && result.body.code === '42501') return true;
  if (typeof result.body === 'object' && result.body && /permission denied/i.test(result.body.message || '')) {
    return true;
  }
  return false;
}

const leaks = [];

const profiles = await get('/rest/v1/profiles?select=id,email,full_name,phone');
if (profiles.status === 200 && Array.isArray(profiles.body)) {
  const withPii = profiles.body.filter(hasPii);
  if (withPii.length > 0) {
    leaks.push(`GET /profiles returned ${withPii.length} row(s) with email/phone/full_name`);
  }
} else if (profiles.status === 200 && profiles.body && !Array.isArray(profiles.body)) {
  leaks.push(`GET /profiles unexpected body (status 200)`);
}

const embedded = await get(
  '/rest/v1/properties?select=slug,status,owner:owner_id(email,full_name,phone)&status=eq.published'
);
if (embedded.status === 200 && Array.isArray(embedded.body)) {
  const withOwnerPii = embedded.body.filter((row) => hasPii(row.owner));
  if (withOwnerPii.length > 0) {
    leaks.push(
      `GET /properties embed returned owner PII on ${withOwnerPii.length} published listing(s)`
    );
  }
}

const address = await get('/rest/v1/properties?select=id,slug,address&status=eq.published');
if (!deniedSensitiveColumn(address)) {
  leaks.push('GET /properties?select=address still returns street addresses to anon');
}

const minOffer = await get(
  '/rest/v1/properties?select=id,slug,minimum_offer_price&status=eq.published'
);
if (!deniedSensitiveColumn(minOffer)) {
  leaks.push('GET /properties?select=minimum_offer_price still returns offer floors to anon');
}

const deposit = await get('/rest/v1/properties?select=id,slug,deposit&status=eq.published');
if (!deniedSensitiveColumn(deposit)) {
  leaks.push('GET /properties?select=deposit still returns rental deposits to anon');
}

const star = await get('/rest/v1/properties?select=*&status=eq.published&limit=4');
if (star.status === 200 && Array.isArray(star.body)) {
  const leaked = star.body.filter(hasListingSecret);
  if (leaked.length > 0) {
    leaks.push(`GET /properties?select=* returned secrets on ${leaked.length} published listing(s)`);
  }
} else if (star.status === 200) {
  leaks.push('GET /properties?select=* unexpected body (status 200)');
}

const coords = await get('/rest/v1/properties?select=id,coordinates&status=eq.published');
if (coords.status === 200 && Array.isArray(coords.body) && coords.body.some((row) => row.coordinates)) {
  leaks.push('GET /properties?select=coordinates still returns precise pins to anon');
}

const safe = await get(
  '/rest/v1/properties?select=id,slug,title,neighborhood,city,public_coordinates,price,status&status=eq.published'
);
if (safe.status !== 200 || !Array.isArray(safe.body) || safe.body.length === 0) {
  leaks.push(
    `GET safe public columns failed (status=${safe.status}); listings should still be readable`
  );
}

if (leaks.length > 0) {
  console.error('FAIL: anon key can still read owner personal data or listing secrets:');
  for (const line of leaks) console.error(` - ${line}`);
  process.exit(1);
}

console.log('PASS: anon key cannot read owner PII, address, minimum_offer_price, or deposit.');
console.log(
  `profiles status=${profiles.status}; embed status=${embedded.status}; address status=${address.status}; min_offer status=${minOffer.status}; deposit status=${deposit.status}; star status=${star.status}; safe status=${safe.status} rows=${Array.isArray(safe.body) ? safe.body.length : 0}`
);
