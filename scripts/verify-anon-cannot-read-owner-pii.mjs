#!/usr/bin/env node
/**
 * Run AFTER applying supabase/migrations/20261006000000_lock_down_profile_pii.sql
 * to the live project. Uses only the public anon key.
 *
 *   node scripts/verify-anon-cannot-read-owner-pii.mjs
 *
 * Exit 0: anon cannot read owner email / phone / full_name.
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

if (leaks.length > 0) {
  console.error('FAIL: anon key can still read owner personal data:');
  for (const line of leaks) console.error(` - ${line}`);
  process.exit(1);
}

console.log('PASS: anon key cannot read owner email, phone, or full_name.');
console.log(`profiles status=${profiles.status}; properties embed status=${embedded.status}`);
