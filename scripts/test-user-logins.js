// Script para probar login de todos los usuarios disponibles
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54327';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

const TEST_PASSWORD = 'Password123!';

async function testUserLogins() {
  console.log('🧪 Probando login de usuarios...\n');

  try {
    // Get all users from profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, verification_status')
      .order('role', { ascending: false })
      .order('email', { ascending: true });

    if (error) {
      throw new Error(`Error: ${error.message}`);
    }

    console.log(`Encontrados ${profiles.length} usuarios para probar\n`);

    let successCount = 0;
    let failCount = 0;
    const failures = [];

    for (const profile of profiles) {
      if (!profile.email) {
        continue;
      }

      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: TEST_PASSWORD
        });

        if (signInError) {
          console.log(`❌ ${profile.email} (${profile.role}): ${signInError.message}`);
          failCount++;
          failures.push({ email: profile.email, error: signInError.message });
        } else {
          console.log(`✅ ${profile.email} (${profile.role}) - Login exitoso`);
          successCount++;
          // Sign out immediately
          await supabase.auth.signOut();
        }
      } catch (err) {
        console.log(`❌ ${profile.email}: ${err.message}`);
        failCount++;
        failures.push({ email: profile.email, error: err.message });
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`   ✅ Login exitoso: ${successCount}`);
    console.log(`   ❌ Login fallido: ${failCount}`);

    if (failures.length > 0) {
      console.log('\n⚠️  Usuarios con problemas:');
      failures.forEach(f => {
        console.log(`   - ${f.email}: ${f.error}`);
      });
    }

    console.log(`\n🔑 Contraseña utilizada: ${TEST_PASSWORD}`);
    console.log('\n💡 Estos usuarios deberían funcionar en TestingUsersPage');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUserLogins();

