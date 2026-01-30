// Script para verificar todos los usuarios que tienen propiedades
// Ejecutar con: node scripts/verify-users-with-properties.js

import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for admin operations
// Same configuration as test-profiles-access.js
const supabaseUrl = 'https://prtyuwdkrrqhtwolcrav.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHl1d2RrcnJxaHR3b2xjcmF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg5MDUwNSwiZXhwIjoyMDc2NDY2NTA1fQ.Yj2q9w3K4R8sN7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyUsersWithProperties() {
  console.log('🔍 Verificando usuarios con propiedades...\n');

  try {
    // Step 1: Find all unique user IDs that own properties
    console.log('1. Buscando usuarios que tienen propiedades...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('owner_id')
      .not('owner_id', 'is', null);

    if (propertiesError) {
      throw new Error(`Error al buscar propiedades: ${propertiesError.message}`);
    }

    // Get unique owner IDs
    const ownerIds = [...new Set(properties.map(p => p.owner_id).filter(Boolean))];
    console.log(`   ✅ Encontrados ${ownerIds.length} usuarios únicos con propiedades\n`);

    if (ownerIds.length === 0) {
      console.log('   ℹ️  No hay usuarios con propiedades para verificar.');
      return;
    }

    // Step 2: Check current verification status
    console.log('2. Revisando estado actual de verificación...');
    const { data: currentProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, verification_status')
      .in('id', ownerIds);

    if (profilesError) {
      throw new Error(`Error al buscar perfiles: ${profilesError.message}`);
    }

    const alreadyVerified = currentProfiles.filter(p => p.verification_status === 'verified').length;
    const needVerification = currentProfiles.filter(p => p.verification_status !== 'verified').length;

    console.log(`   ✅ Usuarios ya verificados: ${alreadyVerified}`);
    console.log(`   ⚠️  Usuarios que necesitan verificación: ${needVerification}\n`);

    if (needVerification === 0) {
      console.log('   ✅ Todos los usuarios con propiedades ya están verificados.');
      return;
    }

    // Step 3: Update verification status for all users with properties
    console.log('3. Actualizando estado de verificación...');
    const { data: updatedProfiles, error: updateError } = await supabase
      .from('profiles')
      .update({
        verification_status: 'verified',
        updated_at: new Date().toISOString()
      })
      .in('id', ownerIds)
      .select('id, email, full_name, verification_status');

    if (updateError) {
      throw new Error(`Error al actualizar perfiles: ${updateError.message}`);
    }

    console.log(`   ✅ ${updatedProfiles.length} usuarios actualizados a 'verified'\n`);

    // Step 4: Verify the update
    console.log('4. Verificando resultados...');
    const { data: verifiedProfiles, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email, full_name, verification_status')
      .in('id', ownerIds)
      .eq('verification_status', 'verified');

    if (verifyError) {
      throw new Error(`Error al verificar resultados: ${verifyError.message}`);
    }

    console.log(`   ✅ ${verifiedProfiles.length} usuarios ahora están verificados\n`);

    // Step 5: Show summary
    console.log('5. Resumen:');
    console.log('   ┌─────────────────────────────────────────────────────────┐');
    console.log('   │ Usuarios con propiedades verificados exitosamente      │');
    console.log('   └─────────────────────────────────────────────────────────┘');
    
    verifiedProfiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.full_name || profile.email || profile.id}`);
      console.log(`      Email: ${profile.email || 'N/A'}`);
      console.log(`      Estado: ${profile.verification_status}`);
      console.log('');
    });

    console.log('✅ Proceso completado exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
verifyUsersWithProperties();

