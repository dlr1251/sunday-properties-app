#!/usr/bin/env node
/**
 * Prune test / demo properties, keeping only the real ones + a very small number of minimal demo properties.
 *
 * This helps move the platform toward real data while still having enough for internal testing of flows
 * (negotiation, visits, legal cases).
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/prune-test-properties.mjs
 *
 * It is SAFE to run multiple times (idempotent on titles).
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Titles we ALWAYS keep (the real ones you care about)
const KEEP_TITLES = [
  'Casa Lauret — Arriendo en Laureles',
  'Casa Lauret - Arriendo en Laureles',
  'Apartamento Campo Nuevo — Arriendo',
  'Apartamento Campo Nuevo - Arriendo',
  'Brisas del Estadio — Apartamento dúplex en venta'
];

// Optional: keep 1-2 very minimal demo properties for testing flows (negotiation, offers, etc.)
// Set to [] if you want ONLY the three real ones.
const KEEP_MINIMAL_DEMO_TITLES = [
  'Apartamento Moderno en El Poblado' // example from old seeds - change or remove
];

const WHITELIST = [...KEEP_TITLES, ...KEEP_MINIMAL_DEMO_TITLES];

async function main() {
  console.log('\n🧹 Sunday Properties — Prune to Minimal + Real Data\n');

  // 1. Find properties to delete
  const { data: allProps, error: listErr } = await supabase
    .from('properties')
    .select('id, title, listing_type, status, created_at');

  if (listErr) {
    console.error('Failed to list properties:', listErr.message);
    process.exit(1);
  }

  const toDelete = allProps.filter(p => !WHITELIST.includes(p.title));

  console.log(`Found ${allProps.length} total properties.`);
  console.log(`Will KEEP (whitelist):`);
  WHITELIST.forEach(t => console.log(`  ✓ ${t}`));
  console.log(`Will DELETE: ${toDelete.length} test/demo properties.\n`);

  if (toDelete.length === 0) {
    console.log('✅ Nothing to prune. Database already minimal.');
    return;
  }

  const idsToDelete = toDelete.map(p => p.id);

  // 2. Clean related data first (offers, visits, cases, notifications, etc.)
  console.log('🗑️  Cleaning related records (offers, visits, negotiations, cases, chat, notifications)...');

  // Offers (and their counter_offers via cascade or explicit)
  const { error: offersErr } = await supabase.from('offers').delete().in('property_id', idsToDelete);
  if (offersErr) console.warn('  offers delete warning:', offersErr.message);

  // Visits
  const { error: visitsErr } = await supabase.from('visits').delete().in('property_id', idsToDelete);
  if (visitsErr) console.warn('  visits delete warning:', visitsErr.message);

  // Legal cases + documents (best effort)
  const { data: cases } = await supabase.from('cases').select('id').in('property_id', idsToDelete);
  if (cases?.length) {
    const caseIds = cases.map(c => c.id);
    await supabase.from('case_documents').delete().in('case_id', caseIds);
    await supabase.from('cases').delete().in('id', caseIds);
  }

  // Property availability
  await supabase.from('property_availability').delete().in('property_id', idsToDelete).catch(() => {});

  // Negotiation rules (if table exists)
  await supabase.from('negotiation_rules').delete().in('property_id', idsToDelete).catch(() => {});

  // 3. Finally delete the properties themselves
  console.log(`🗑️  Deleting ${idsToDelete.length} properties...`);
  const { error: propErr } = await supabase.from('properties').delete().in('id', idsToDelete);
  if (propErr) {
    console.error('❌ Property delete failed:', propErr.message);
    process.exit(1);
  }

  console.log(`✅ Deleted ${idsToDelete.length} properties.`);

  // Optional: also clean up completely orphaned test users / notifications later if wanted.
  console.log('\n🎉 Prune complete.');
  console.log('   Remaining properties should be the real ones + your minimal demos.');
  console.log('   You can now run the real-properties seeder again safely if needed.\n');
}

main().catch(err => {
  console.error('Fatal prune error:', err);
  process.exit(1);
});
