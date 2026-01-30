import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '../.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54327';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const password = 'Password123!';

const users = [
  // 1 superadmin
  { email: 'superadmin@sunday.local', role: 'super_admin', full_name: 'Superadmin Root' },
  // 2 admins
  { email: 'admin1@sunday.local', role: 'admin', full_name: 'Admin Uno' },
  { email: 'admin2@sunday.local', role: 'admin', full_name: 'Admin Dos' },
  // 2 lawyers
  { email: 'lawyer1@sunday.local', role: 'lawyer', full_name: 'Dra. Ana Martínez' },
  { email: 'lawyer2@sunday.local', role: 'lawyer', full_name: 'Dr. Roberto Silva' },
  // 2 agents
  { email: 'agent1@sunday.local', role: 'agent', full_name: 'Agente Ana López' },
  { email: 'agent2@sunday.local', role: 'agent', full_name: 'Agente Jorge Ruiz' },
  // 3 registered users
  { email: 'user1@sunday.local', role: 'registered', full_name: 'Juan Pérez' },
  { email: 'user2@sunday.local', role: 'registered', full_name: 'María Gómez' },
  { email: 'user3@sunday.local', role: 'registered', full_name: 'Pedro Sánchez' }
];

const profileExtras = {
  'superadmin@sunday.local': {
    bio: 'Ruler of platform operations, oversees all roles and data integrity.',
    phone: '+57 310 000 0000', location: 'Bogotá, Colombia', nationality: 'Colombian',
    website: 'https://sundayproperties.com', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
  },
  'admin1@sunday.local': {
    bio: 'Admin focused on user operations and marketplace health.',
    phone: '+57 311 111 1111', location: 'Medellín, Colombia', nationality: 'Colombian',
    website: null, avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
  },
  'admin2@sunday.local': {
    bio: 'Admin focused on verification and compliance workflows.',
    phone: '+57 312 222 2222', location: 'Cali, Colombia', nationality: 'Colombian',
    website: null, avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
  },
  'lawyer1@sunday.local': {
    bio: 'Real estate attorney specialized in contracts and due diligence.',
    phone: '+57 313 333 3333', location: 'Bogotá, Colombia', nationality: 'Colombian',
    website: 'https://martinezlaw.co', avatar_url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=400&fit=crop&crop=face'
  },
  'lawyer2@sunday.local': {
    bio: 'Property law specialist with litigation background.',
    phone: '+57 314 444 4444', location: 'Cali, Colombia', nationality: 'Colombian',
    website: 'https://silvalegal.com', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
  },
  'agent1@sunday.local': {
    bio: 'Agent with 5+ years in residential sales and rentals.',
    phone: '+57 315 555 5555', location: 'Medellín, Colombia', nationality: 'Colombian',
    website: null, avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
  },
  'agent2@sunday.local': {
    bio: 'Agent specializing in investment properties and relocations.',
    phone: '+57 316 666 6666', location: 'Bogotá, Colombia', nationality: 'Colombian',
    website: null, avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop&crop=face'
  },
  'user1@sunday.local': {
    bio: 'Registered user exploring first-time purchase options.',
    phone: '+57 317 777 7777', location: 'Bogotá, Colombia', nationality: 'Colombian',
    website: null, avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'
  },
  'user2@sunday.local': {
    bio: 'Registered user interested in north-side apartments.',
    phone: '+57 318 888 8888', location: 'Barranquilla, Colombia', nationality: 'Colombian',
    website: null, avatar_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face'
  },
  'user3@sunday.local': {
    bio: 'Registered user researching neighborhoods and pricing.',
    phone: '+57 319 999 9999', location: 'Pereira, Colombia', nationality: 'Colombian',
    website: null, avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop&crop=face'
  }
};

async function upsertUser(u) {
  // Create or ensure auth user
  const { data: existing, error: listErr } = await supabase.auth.admin.listUsers({ filter: `email.eq.${u.email}` });
  let userId = existing?.users?.[0]?.id;

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role }
    });
    if (error) {
      console.error('Create user failed:', u.email, error.message);
      return null;
    }
    userId = data.user.id;
  }

  // Upsert profile (unverified)
  const extras = profileExtras[u.email] || {};
  const { error: upErr } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      verification_status: 'unverified',
      phone: extras.phone || null,
      bio: extras.bio || null,
      location: extras.location || null,
      website: extras.website || null,
      nationality: extras.nationality || null,
      avatar_url: extras.avatar_url || null,
      status: 'active'
    }, { onConflict: 'id' });

  if (upErr) {
    console.error('Upsert profile failed:', u.email, upErr.message);
    return null;
  }

  return userId;
}

async function main() {
  console.log('🌱 Seeding realistic users...');
  for (const u of users) {
    await upsertUser(u);
  }
  console.log('✅ Seeding completed.');
}

main().catch(err => { console.error(err); process.exit(1); });


