// Script para probar específicamente la consulta de perfil del usuario
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://prtyuwdkrrqhtwolcrav.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHl1d2RrcnJxaHR3b2xjcmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTA1MDUsImV4cCI6MjA3NjQ2NjUwNX0.0n7zBh6TvTdHtEDn_lNE0IaPkIVK3Ujhf6hZ2yNFOGo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const userId = 'b31f8aff-1f3a-4cc4-bc54-234d4fa62c89';

async function testProfileQuery() {
  console.log('🧪 Probando consulta específica de perfil...');
  console.log('👤 User ID:', userId);

  try {
    // Test 1: Verificar sesión actual
    console.log('1. Verificando sesión de autenticación...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Session data:', sessionData ? 'Exists' : 'None');
    if (sessionError) {
      console.error('Session error:', sessionError);
    }

    // Test 2: Consulta directa de perfil
    console.log('2. Consultando perfil directamente...');
    const startTime = Date.now();

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('Query duration:', duration, 'ms');
    console.log('Profile data:', profileData);
    console.log('Profile error:', profileError);

    if (profileError) {
      console.log('Error code:', profileError.code);
      console.log('Error message:', profileError.message);
      console.log('Error details:', profileError.details);

      // Si es error PGRST116, intentar crear el perfil
      if (profileError.code === 'PGRST116') {
        console.log('3. Perfil no encontrado, intentando crear...');

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: 'juan.perez.test@mailinator.com',
            full_name: 'juan.perez.test',
            role: 'user',
            status: 'active'
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creando perfil:', createError);
        } else {
          console.log('✅ Perfil creado:', newProfile);
        }
      }
    } else {
      console.log('✅ Perfil encontrado exitosamente');
    }

    // Test 3: Verificar permisos RLS
    console.log('4. Verificando permisos RLS...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (rlsError) {
      console.error('❌ Error de permisos RLS:', rlsError);
    } else {
      console.log('✅ Permisos RLS OK, se pueden consultar perfiles');
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

testProfileQuery();
