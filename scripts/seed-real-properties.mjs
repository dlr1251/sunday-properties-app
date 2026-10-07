#!/usr/bin/env node
/**
 * Seed REAL properties for Sunday Properties.
 *
 * Accounts:
 *   - Propietario Brisas del Estadio (owner) — Brisas del Estadio sale
 *   - Propietaria El Escorial 701 (owner) — El Escorial rental
 *   - Propietaria Campo Nuevo (owner) — Campo Nuevo rental
 *   - Propietario Casa Lauret (owner) — Lauret rental
 *   - Assigned agent — assigned to all listings
 *
 * Usage:
 *   npm run seed:real-properties
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
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@sunday.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Test123456!';

if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL in .env.local / .env');
  process.exit(1);
}

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let adminClient = null;

async function getWritableClient() {
  if (supabase) return supabase;

  if (serviceKey) {
    const svc = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { error } = await svc.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (!error) {
      console.log('   🔑 Using service role key');
      supabase = svc;
      return supabase;
    }
    console.warn(`   ⚠️  Service role key invalid (${error.message}). Falling back to admin session.`);
    serviceKey = null;
  }

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { error } = await adminClient.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    if (error) {
      console.error(`❌ Admin login failed (${ADMIN_EMAIL}): ${error.message}`);
      console.error('   Set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD or fix SUPABASE_SERVICE_ROLE_KEY (legacy JWT).');
      process.exit(1);
    }
    console.log(`   🔑 Using admin session (${ADMIN_EMAIL})`);
  }
  supabase = adminClient;
  return supabase;
}

let supabase;

const DEFAULT_PASSWORD = 'RealProp2026!';

/** @type {Record<string, { email: string; fullName: string; role: 'user' | 'agent' }>} */
const ACCOUNTS = {
  brisas: { email: 'brisas-estadio@sunday.com', fullName: 'Propietario Brisas del Estadio', role: 'user' },
  escorial: { email: 'escorial-701@sunday.com', fullName: 'Propietaria El Escorial 701', role: 'user' },
  campoNuevo: { email: 'campo-nuevo@sunday.com', fullName: 'Propietaria Campo Nuevo', role: 'user' },
  lauret: { email: 'casa-lauret@sunday.com', fullName: 'Propietario Casa Lauret', role: 'user' },
  daniel: { email: 'daniel@luquelaw.co', fullName: 'Daniel Luque', role: 'agent' }
};

// Stable placeholder images until Drive photos are uploaded to Storage
const IMG = {
  brisas: [
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-01.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-02.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-03.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-04.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-05.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-06.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-07.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-08.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-09.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-10.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-11.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-12.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-13.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-14.webp'
  ],
  campoNuevo: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop'
  ],
  lauret: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop'
  ],
  escorial: [
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/escorial-701/entrada.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/escorial-701/biblioteca.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/escorial-701/cocina.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/escorial-701/habitacion-1.webp',
    'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/escorial-701/habitacion-2.webp'
  ]
};

const REAL_PROPERTIES = [
  {
    key: 'brisas-estadio',
    slug: 'brisas-del-estadio',
    title: 'Brisas del Estadio — Apartamento dúplex en venta',
    description: `For sale: dúplex de 75 m² (40 m² principal + 35 m² altillo), completamente remodelado en Conjunto Residencial Brisas del Estadio P.H.

Apartamento + parqueadero privado. Piso 5 (sin ascensor). Smart home, ventanas europeas de doble vidrio, puerta con cerradura digital, cocina integral con lavavajillas, 2 baños completos, amoblado.

Ubicación estratégica junto al Estadio, alta valorización. Gestión de venta con respaldo legal Luque Law (poder del propietario). Visitas con cita previa.

Publicado en FincaRaiz: https://www.fincaraiz.com.co/apartamento-en-venta-en-laureles-medellin/194112531 (código 194112531).`,
    address: 'Brisas del Estadio, Estadio',
    neighborhood: 'Estadio',
    city: 'Medellín',
    coordinates: { lat: 6.2568, lng: -75.5901 },
    bedrooms: 2,
    bathrooms: 2,
    area: 75,
    parking: 1,
    floor: 5,
    property_type: 'apartment',
    strata: 4,
    listing_type: 'sale',
    price: 390000000,
    minimum_offer_price: 370000000,
    status: 'published',
    verified: true,
    premium: true,
    images: IMG.brisas,
    legal_documents: [],
    features: [
      'Remodelado',
      'Smart home',
      'Amoblado',
      'Parqueadero privado',
      'Ventanas doble vidrio',
      'Cerradura digital'
    ],
    visit_price: 49000,
    accepts_crypto: false,
    financing: true,
    ownerKey: 'brisas',
    tags: ['venta', 'brisas-del-estadio', 'duplex']
  },
  {
    key: 'escorial-701',
    slug: 'el-escorial-701',
    title: 'El Escorial 701 — Arriendo en Conquistadores',
    description: `Se arrienda apartamento en El Escorial, Conquistadores (Medellín).

140 m², 4 habitaciones, 3 baños, biblioteca y balcón. Sin amoblar. Canon mensual COP $6.000.000.

Visitas con cita previa. Gestión de arriendo con Sunday Properties.`,
    address: 'El Escorial 701, Conquistadores',
    neighborhood: 'Conquistadores',
    city: 'Medellín',
    coordinates: { lat: 6.244, lng: -75.58 },
    bedrooms: 4,
    bathrooms: 3,
    area: 140,
    parking: 0,
    property_type: 'apartment',
    listing_type: 'rental',
    rent_monthly: 6000000,
    lease_term_months: 12,
    deposit: null,
    admin_fee: null,
    utilities_included: [],
    pets_policy: 'Consultar con el propietario',
    status: 'published',
    verified: true,
    premium: true,
    images: IMG.escorial,
    legal_documents: [],
    features: ['Biblioteca', 'Balcón', '4 habitaciones', '3 baños', '140 m²'],
    visit_price: 49000,
    ownerKey: 'escorial',
    tags: ['arriendo', 'conquistadores', 'el-escorial']
  },
  {
    key: 'campo-nuevo',
    slug: 'apartamento-campo-nuevo',
    title: 'Apartamento Campo Nuevo — Arriendo',
    description: `SE ARRIENDA apartamento de 52 m² en conjunto cerrado en Campo Nuevo.

Gimnasio, zonas verdes, BBQ, excelente iluminación y acabados. Cocina integral, 2 habitaciones, 2 baños, parqueadero y acceso controlado.

Contrato de arrendamiento claro con respaldo legal. Ideal para parejas o profesionales.`,
    address: 'Campo Nuevo',
    neighborhood: 'Campo Nuevo',
    city: 'Medellín',
    coordinates: { lat: 6.175, lng: -75.58 },
    bedrooms: 2,
    bathrooms: 2,
    area: 52,
    parking: 1,
    property_type: 'apartment',
    strata: 3,
    listing_type: 'rental',
    rent_monthly: 2450000,
    lease_term_months: 12,
    deposit: 4900000,
    admin_fee: 245000,
    utilities_included: [],
    pets_policy: 'Consultar con el propietario',
    status: 'published',
    verified: true,
    premium: false,
    images: IMG.campoNuevo,
    legal_documents: [],
    features: ['Gimnasio', 'Zonas verdes', 'BBQ', 'Parqueadero', 'Portería'],
    visit_price: 49000,
    ownerKey: 'campoNuevo',
    tags: ['arriendo', 'campo-nuevo']
  },
  {
    key: 'lauret',
    slug: 'casa-lauret',
    title: 'Casa Lauret — Arriendo en Laureles',
    description: `Hermosa casa en el corazón de Laureles, ideal para familias o ejecutivos.

Jardín privado, zona de parrilla y fácil acceso a parques, restaurantes y transporte. Contrato de arrendamiento estándar con opción de renovación.`,
    address: 'Laureles',
    neighborhood: 'Laureles',
    city: 'Medellín',
    coordinates: { lat: 6.2458, lng: -75.5942 },
    bedrooms: 4,
    bathrooms: 3,
    area: 220,
    parking: 2,
    property_type: 'house',
    strata: 4,
    listing_type: 'rental',
    rent_monthly: 5200000,
    lease_term_months: 12,
    deposit: 10400000,
    admin_fee: 520000,
    utilities_included: ['Administración'],
    pets_policy: 'Se permiten mascotas pequeñas con depósito adicional',
    status: 'published',
    verified: true,
    premium: true,
    images: IMG.lauret,
    legal_documents: [],
    features: ['Jardín', 'Zona BBQ', 'Parqueadero', 'Seguridad'],
    visit_price: 49000,
    ownerKey: 'lauret',
    tags: ['arriendo', 'laureles']
  }
];

/** Legacy placeholder title (owner name in historical row) — delete if still present */
const LEGACY_TITLES = ['Propiedad Peter Pitchler - Venta'];

function ensureAiFoodPublic() {
  const aiFoodSrc = path.join(root, 'ai_food');
  if (!fs.existsSync(aiFoodSrc)) return;
  const publicDest = path.join(root, 'public', 'ai_food');
  if (!fs.existsSync(publicDest)) fs.mkdirSync(publicDest, { recursive: true });
  for (const f of fs.readdirSync(aiFoodSrc)) {
    if (!/\.(pdf|jpe?g|png)$/i.test(f)) continue;
    const dest = path.join(publicDest, f);
    if (!fs.existsSync(dest)) fs.copyFileSync(path.join(aiFoodSrc, f), dest);
  }
}

async function findOrCreateAccount({ email, fullName, role }) {
  supabase = await getWritableClient();

  const { data: existing } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('profiles')
      .update({ role, full_name: fullName, verification_status: 'verified', status: 'active' })
      .eq('id', existing.id);
    console.log(`   ♻️  ${role} ${email} (${existing.id})`);
    return existing.id;
  }

  console.log(`   🆕 Creating ${role}: ${email}`);

  try {
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName, role }
    });
    if (!authErr && authUser?.user?.id) {
      const userId = authUser.user.id;
      await supabase.from('profiles').upsert({
        id: userId,
        email,
        full_name: fullName,
        role,
        status: 'active',
        verification_status: 'verified'
      }, { onConflict: 'id' });
      return userId;
    }
  } catch {
    // continue to signUp fallback
  }

  const anon = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: signedUp, error: signUpErr } = await anon.auth.signUp({
    email,
    password: DEFAULT_PASSWORD,
    options: { data: { full_name: fullName, role } }
  });

  if (signUpErr || !signedUp.user?.id) {
    console.warn(`   ⚠️  Could not create ${email}: ${signUpErr?.message || 'unknown'}`);
    const { data: fallback } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', role)
      .limit(1)
      .maybeSingle();
    return fallback?.id ?? null;
  }

  const userId = signedUp.user.id;
  await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: fullName,
    role,
    status: 'active',
    verification_status: 'verified'
  }, { onConflict: 'id' });

  return userId;
}

async function deleteLegacyPlaceholders() {
  supabase = await getWritableClient();
  for (const title of LEGACY_TITLES) {
    const { data: rows } = await supabase.from('properties').select('id').eq('title', title);
    if (!rows?.length) continue;
    const ids = rows.map(r => r.id);
    console.log(`   🗑️  Removing legacy placeholder: "${title}"`);
    await supabase.from('visits').delete().in('property_id', ids);
    await supabase.from('offers').delete().in('property_id', ids);
    await supabase.from('properties').delete().in('id', ids);
  }
}

function buildPayload(prop, ownerId, agentId) {
  const now = new Date().toISOString();
  return {
    title: prop.title,
    slug: prop.slug,
    description: prop.description,
    address: prop.address,
    neighborhood: prop.neighborhood,
    city: prop.city,
    coordinates: prop.coordinates,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    area: prop.area,
    parking: prop.parking,
    floor: prop.floor ?? null,
    property_type: prop.property_type,
    strata: prop.strata,
    status: prop.status,
    verified: prop.verified,
    premium: prop.premium,
    images: prop.images,
    legal_documents: prop.legal_documents || [],
    features: prop.features || [],
    tags: prop.tags || [],
    owner_id: ownerId,
    agent_id: agentId,
    visit_price: prop.visit_price || 49000,
    listing_type: prop.listing_type,
    price: prop.listing_type === 'sale' ? prop.price : null,
    minimum_offer_price: prop.minimum_offer_price ?? null,
    accepts_crypto: prop.accepts_crypto || false,
    financing: prop.financing || false,
    rent_monthly: prop.listing_type === 'rental' ? prop.rent_monthly : null,
    lease_term_months: prop.lease_term_months || null,
    deposit: prop.deposit || null,
    admin_fee: prop.admin_fee || null,
    utilities_included: prop.utilities_included || [],
    pets_policy: prop.pets_policy || null,
    updated_at: now,
    published_at: now
  };
}

async function upsertRealProperty(prop, ownerId, agentId) {
  supabase = await getWritableClient();
  if (!ownerId || !agentId) {
    console.error(`   ❌ Missing owner/agent for ${prop.key}. Skipping.`);
    return null;
  }

  const { data: existingBySlug } = prop.slug
    ? await supabase.from('properties').select('id').eq('slug', prop.slug).maybeSingle()
    : { data: null };

  const { data: existingByTitle } = existingBySlug
    ? { data: null }
    : await supabase.from('properties').select('id').eq('title', prop.title).maybeSingle();

  const existing = existingBySlug || existingByTitle;

  const payload = buildPayload(prop, ownerId, agentId);

  if (existing) {
    const { data, error } = await supabase
      .from('properties')
      .update(payload)
      .eq('id', existing.id)
      .select('id')
      .single();
    if (error) {
      console.error(`   ❌ Failed to update "${prop.title}":`, error.message);
      return null;
    }
    console.log(`   🔄 Updated "${prop.title}" → id=${data.id}`);
    return data.id;
  }

  const { data, error } = await supabase
    .from('properties')
    .insert({ ...payload, created_at: new Date().toISOString() })
    .select('id')
    .single();

  if (error) {
    console.error(`   ❌ Failed to insert "${prop.title}":`, error.message);
    return null;
  }
  console.log(`   ✅ Inserted "${prop.title}" → id=${data.id}`);
  return data.id;
}

async function ensureVisitAvailability(propertyId, propKey) {
  supabase = await getWritableClient();
  const { count } = await supabase
    .from('property_visit_availability')
    .select('*', { count: 'exact', head: true })
    .eq('property_id', propertyId);

  if (count && count > 0) return;

  const days = [1, 2, 3, 4, 5, 6];
  const rows = days.map(day => ({
    property_id: propertyId,
    day_of_week: day,
    start_time: '09:00',
    end_time: '17:00',
    max_visits_per_day: 4,
    is_active: true
  }));

  const { error } = await supabase.from('property_visit_availability').insert(rows);
  if (error) {
    console.warn(`   ⚠️  Visit availability for ${propKey}: ${error.message}`);
  } else {
    console.log(`   📅 Visit availability configured for ${propKey}`);
  }
}

async function main() {
  console.log('\n🌱 Sunday Properties — Real Properties Seeder\n');
  ensureAiFoodPublic();
  supabase = await getWritableClient();

  console.log('👤 Accounts (owners + agent)...\n');
  const userIds = {};
  for (const [key, account] of Object.entries(ACCOUNTS)) {
    userIds[key] = await findOrCreateAccount(account);
  }

  console.log('\n🧹 Removing legacy placeholders...\n');
  await deleteLegacyPlaceholders();

  console.log('\n🏠 Upserting real properties...\n');
  const inserted = [];
  for (const prop of REAL_PROPERTIES) {
    const ownerId = userIds[prop.ownerKey];
    const agentId = userIds.daniel;
    const id = await upsertRealProperty(prop, ownerId, agentId);
    if (id) {
      await ensureVisitAvailability(id, prop.key);
      inserted.push({ key: prop.key, slug: prop.slug, title: prop.title, id, listing_type: prop.listing_type });
    }
  }

  console.log('\n📊 Summary:');
  inserted.forEach(p => console.log(`   • [${p.listing_type}] ${p.title}\n     /properties/${p.slug || p.id}`));

  if (inserted.length) {
    console.log('\n🔗 Property URLs (local dev):');
    inserted.forEach(p => console.log(`   http://localhost:3000/properties/${p.slug || p.id}`));
  }

  console.log('\n🔐 Test account passwords (if newly created):', DEFAULT_PASSWORD);
  console.log('   Brisas owner:', ACCOUNTS.brisas.email);
  console.log('   Escorial owner:', ACCOUNTS.escorial.email);
  console.log('   Agent:', ACCOUNTS.daniel.email);
  console.log('\n✅ Real properties seed complete.\n');
}

main().catch(err => {
  console.error('Fatal error in real properties seeder:', err);
  process.exit(1);
});
