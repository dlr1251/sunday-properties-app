import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@16.6.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    })

    const { visitId, amount, currency } = await req.json()

    if (!visitId) throw new Error('visitId is required')

    const paymentIntent = await stripe.paymentIntents.create({
      amount: typeof amount === 'number' ? amount : 49000,
      currency: currency || 'cop',
      metadata: { visitId },
      automatic_payment_methods: { enabled: true },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error('Error creating PaymentIntent:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create PaymentIntent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})


