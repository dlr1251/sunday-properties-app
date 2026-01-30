import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';

// Test mode flag - set VITE_PAYMENT_TEST_MODE=true to enable test payments
export const PAYMENT_TEST_MODE = import.meta.env.VITE_PAYMENT_TEST_MODE === 'true';

// Initialize Stripe with public key
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

if (PAYMENT_TEST_MODE) {
  console.log('🧪 Payment Test Mode enabled - payments will be simulated without Stripe');
} else if (!stripePublicKey || stripePublicKey === 'your-stripe-public-key') {
  console.warn('⚠️ Stripe public key not configured. Payment functionality will not work.');
  console.warn('Please set VITE_STRIPE_PUBLIC_KEY in your .env file');
  console.warn('Or enable test mode by setting VITE_PAYMENT_TEST_MODE=true');
}

const stripePromise = !PAYMENT_TEST_MODE && stripePublicKey && stripePublicKey !== 'your-stripe-public-key' 
  ? loadStripe(stripePublicKey)
  : null;

export const getStripe = () => {
  if (PAYMENT_TEST_MODE) {
    return null; // Return null in test mode - we'll handle payments differently
  }
  if (!stripePromise) {
    console.error('Stripe is not initialized. Please configure VITE_STRIPE_PUBLIC_KEY');
  }
  return stripePromise;
};

// Visit payment configuration
export const VISIT_PAYMENT_AMOUNT = 49000; // $49,000 COP (approximately $13 USD)
export const VISIT_PAYMENT_CURRENCY = 'cop';

// Create payment intent for visit
export const createVisitPaymentIntent = async (visitId: string, amount: number = VISIT_PAYMENT_AMOUNT) => {
  // Test mode: simulate payment intent creation
  if (PAYMENT_TEST_MODE) {
    console.log('🧪 Test Mode: Simulating payment intent creation');
    // Simulate a delay to mimic real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      clientSecret: `test_client_secret_${visitId}_${Date.now()}` 
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('create-visit-payment-intent', {
      body: { visitId, amount, currency: VISIT_PAYMENT_CURRENCY },
    });

    if (error) {
      console.error('Error invoking payment intent function:', error);
      
      // Provide helpful error messages
      if (error.message?.includes('503') || error.message?.includes('Service Temporarily Unavailable')) {
        throw new Error('El servicio de pagos no está disponible. Por favor verifica que las Edge Functions estén habilitadas y que STRIPE_SECRET_KEY esté configurado en Supabase.');
      }
      
      throw error;
    }

    if (!data?.clientSecret) {
      throw new Error('No se recibió el clientSecret del servidor');
    }

    return { clientSecret: data.clientSecret as string };
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    
    // Re-throw with improved error message if it's not already a user-friendly error
    if (error.message && !error.message.includes('STRIPE_SECRET_KEY')) {
      throw error;
    }
    
    throw new Error(error.message || 'Error al crear la intención de pago. Por favor intenta de nuevo.');
  }
};

// Simulate payment confirmation in test mode
export const simulateTestPayment = async (visitId: string, amount: number = VISIT_PAYMENT_AMOUNT) => {
  if (!PAYMENT_TEST_MODE) {
    throw new Error('Test payment can only be used when PAYMENT_TEST_MODE is enabled');
  }

  console.log('🧪 Test Mode: Simulating successful payment');
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Update visit directly in database
  // Note: payment_id and payment_amount columns don't exist in visits table
  // We store payment info in notes field for test mode
  const paymentNote = `[TEST PAYMENT] Payment ID: test_payment_${visitId}_${Date.now()}, Amount: ${amount} COP`;
  
  const { error } = await supabase
    .from('visits')
    .update({
      status: 'confirmed',
      paid: true,
      payment_method: 'card',
      notes: paymentNote,
      updated_at: new Date().toISOString(),
    })
    .eq('id', visitId);

  if (error) {
    console.error('Error updating visit in test mode:', error);
    throw error;
  }

  return {
    success: true,
    paymentIntentId: `test_payment_${visitId}_${Date.now()}`,
    amount: amount,
  };
};

// For now, we'll use a simple approach - in production you'd have a backend API
// This is a placeholder that would need to be implemented with a proper backend
// Deprecated: processVisitPayment (mock) removed in favor of Stripe confirmCardPayment
