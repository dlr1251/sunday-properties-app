/*
  Seed local auth users using service role key from local Supabase.
  Usage (with local stack running):
  SUPABASE_URL=http://localhost:54321 \
  SUPABASE_SERVICE_ROLE_KEY=<service_role_key> \
  npx ts-node scripts/seed-auth-users.ts
*/

import { createClient } from '@supabase/supabase-js';

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const;
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Missing env ${k}`);
    process.exit(1);
  }
}

const supabaseUrl = process.env.SUPABASE_URL as string;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const admin = createClient(supabaseUrl, serviceRole);

type SeedUser = { email: string; password: string; role: 'user'|'agent'|'lawyer'|'admin'|'super_admin' };

const users: SeedUser[] = [
  { email: 'admin1@sunday.local', password: 'Password123!', role: 'super_admin' },
  { email: 'admin2@sunday.local', password: 'Password123!', role: 'admin' },
  { email: 'lawyer1@sunday.local', password: 'Password123!', role: 'lawyer' },
  { email: 'lawyer2@sunday.local', password: 'Password123!', role: 'lawyer' },
  { email: 'agent1@sunday.local', password: 'Password123!', role: 'agent' },
  { email: 'agent2@sunday.local', password: 'Password123!', role: 'agent' },
  { email: 'user1@sunday.local', password: 'Password123!', role: 'user' },
  { email: 'user2@sunday.local', password: 'Password123!', role: 'user' },
  { email: 'user3@sunday.local', password: 'Password123!', role: 'user' },
  { email: 'user4@sunday.local', password: 'Password123!', role: 'user' },
  { email: 'user5@sunday.local', password: 'Password123!', role: 'user' },
];

async function upsertAuthUsers() {
  console.log('Seeding auth users...');
  for (const u of users) {
    // Use admin API: create user
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.email.split('@')[0], role: u.role },
    });

    if (error && error.message.includes('already registered')) {
      console.log(`User exists: ${u.email}`);
      continue;
    }
    if (error) {
      console.error('Error creating', u.email, error.message);
      continue;
    }
    console.log('Created:', data.user?.id, u.email);
  }
}

async function main() {
  await upsertAuthUsers();
  console.log('Done. Ensure profiles are created by migration trigger or run profile sync SQL.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


