const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54327';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSJ9.vI9obAHOGYnWbEJq8wSWfsFa7Ud5iJpgwPUW7kOZhCP';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestNegotiation() {
  try {
    console.log('🚀 Creando negociación de prueba...');

    // Primero obtenemos algunos usuarios existentes
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(2);

    if (usersError) {
      console.error('Error obteniendo usuarios:', usersError);
      return;
    }

    if (!users || users.length < 2) {
      console.error('No hay suficientes usuarios para crear una negociación');
      return;
    }

    const [user1, user2] = users;

    // Crear negociación
    const { data: negotiation, error: negotiationError } = await supabase
      .from('negotiations')
      .insert({
        title: 'Negociación de prueba - Apartamento Poblado',
        status: 'open',
        participants: [user1.id, user2.id]
      })
      .select()
      .single();

    if (negotiationError) {
      console.error('Error creando negociación:', negotiationError);
      return;
    }

    console.log('✅ Negociación creada:', negotiation.id);

    // Crear algunas ofertas
    const { error: offersError } = await supabase
      .from('negotiation_offers')
      .insert([
        {
          negotiation_id: negotiation.id,
          author: user1.id,
          payload: { price: 350000000, downPayment: 70000000, annualRate: 0.12, termMonths: 180, fees: [{ name: 'Notaría', amount: 2000000 }] },
          status: 'offer'
        },
        {
          negotiation_id: negotiation.id,
          author: user2.id,
          payload: { price: 340000000, downPayment: 68000000, annualRate: 0.12, termMonths: 180, fees: [{ name: 'Notaría', amount: 2000000 }] },
          status: 'counter'
        }
      ]);

    if (offersError) {
      console.error('Error creando ofertas:', offersError);
      return;
    }

    console.log('✅ Ofertas de prueba creadas');

    // Crear documento inicial
    const { error: docError } = await supabase
      .from('negotiation_documents')
      .insert({
        negotiation_id: negotiation.id,
        kind: 'promise_of_sale',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Documento inicial de negociación' }] }] }
      });

    if (docError) {
      console.error('Error creando documento:', docError);
      return;
    }

    console.log('✅ Documento inicial creado');
    console.log('🎯 Negociación de prueba lista en:', `/negotiations/${negotiation.id}`);

  } catch (error) {
    console.error('Error general:', error);
  }
}

createTestNegotiation();
