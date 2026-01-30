// Script para probar la conexión a Supabase y consultar propiedades
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prtyuwdkrrqhtwolcrav.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHl1d2RrcnJxaHR3b2xjcmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTA1MDUsImV4cCI6MjA3NjQ2NjUwNX0.0n7zBh6TvTdHtEDn_lNE0IaPkIVK3Ujhf6hZ2yNFOGo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProperties() {
  try {
    console.log('Testing properties query...');
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'published')
      .limit(5);

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Found', data?.length || 0, 'properties');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testProperties();
