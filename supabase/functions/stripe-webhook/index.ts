import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@16.6.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      throw new Error('Stripe environment variables not configured')
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature!, STRIPE_WEBHOOK_SECRET)
    } catch (err: any) {
      console.error('Webhook signature verification failed', err)
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const visitId = (paymentIntent.metadata as any)?.visitId

      if (visitId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, serviceRoleKey)

        const { error } = await supabase
          .from('visits')
          .update({
            paid: true,
            status: 'confirmed',
            payment_id: paymentIntent.id,
            payment_amount: paymentIntent.amount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', visitId)

        if (error) {
          console.error('Error updating visit on webhook:', error)
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error: any) {
    console.error('Stripe webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})


