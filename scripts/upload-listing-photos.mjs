#!/usr/bin/env node
/**
 * Upload listing WebPs from .tmp/photos/webp to Supabase Storage
 * and patch properties.images by title.
 *
 *   npm run seed:real-properties
 *   node scripts/upload-listing-photos.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(root, '.env.local'));
loadEnvFile(path.join(root, '.env'));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@sunday.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Test123456!';

if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL');
  process.exit(1);
}

const BUCKET = 'property-photos';

const LISTINGS = [
  {
    folder: path.join(root, '.tmp/photos/webp/brisas'),
    prefix: 'brisas-estadio',
    title: 'Brisas del Estadio — Apartamento dúplex en venta'
  },
  {
    folder: path.join(root, '.tmp/photos/webp/escorial'),
    prefix: 'escorial-701',
    title: 'El Escorial 701 — Arriendo en Conquistadores'
  }
];

async function getClient() {
  if (serviceKey) {
    const svc = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { error } = await svc.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (!error) {
      console.log('Using service role');
      return svc;
    }
    console.warn('Service role unusable:', error.message);
  }
  const admin = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { error } = await admin.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  if (error) {
    console.error('Admin login failed:', error.message);
    process.exit(1);
  }
  console.log('Using admin session');
  return admin;
}

async function uploadFolder(supabase, listing) {
  if (!fs.existsSync(listing.folder)) {
    console.warn('Missing folder', listing.folder);
    return [];
  }
  const files = fs
    .readdirSync(listing.folder)
    .filter((f) => f.toLowerCase().endsWith('.webp'))
    .sort();
  const urls = [];
  for (const file of files) {
    const local = path.join(listing.folder, file);
    const dest = `${listing.prefix}/${file
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')}`;
    const buf = fs.readFileSync(local);
    const { error } = await supabase.storage.from(BUCKET).upload(dest, buf, {
      contentType: 'image/webp',
      upsert: true
    });
    if (error) {
      console.error('Upload failed', dest, error.message);
      continue;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(dest);
    urls.push(data.publicUrl);
    console.log('  ', dest);
  }
  return urls;
}

async function main() {
  const supabase = await getClient();
  const written = {};
  for (const listing of LISTINGS) {
    console.log('\nUploading', listing.prefix);
    const urls = await uploadFolder(supabase, listing);
    written[listing.prefix] = urls;
    if (!urls.length) continue;
    const { data, error } = await supabase
      .from('properties')
      .update({ images: urls, updated_at: new Date().toISOString() })
      .eq('title', listing.title)
      .select('id, title');
    if (error) {
      console.error('DB update failed for', listing.title, error.message);
    } else if (!data?.length) {
      console.warn('No property row yet for', listing.title, '— run seed first');
    } else {
      console.log('Patched', data[0].id, urls.length, 'images');
    }
  }
  const out = path.join(root, '.tmp/photos/public-urls.json');
  fs.writeFileSync(out, JSON.stringify(written, null, 2));
  console.log('\nWrote', out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
