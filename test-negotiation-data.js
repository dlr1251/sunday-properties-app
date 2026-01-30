import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54327'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testNegotiationData() {
  console.log('🧪 Testing negotiation data queries...\n')

  try {
    // Test 1: Get a negotiation
    console.log('1. Testing negotiation query...')
    const { data: negotiations, error: negError } = await supabase
      .from('negotiations')
      .select('*')
      .limit(1)

    if (negError) {
      console.error('❌ Negotiation query failed:', negError.message)
      return
    }

    if (!negotiations || negotiations.length === 0) {
      console.log('⚠️  No negotiations found in database')
      console.log('This is expected if no test data has been seeded.')
      console.log('Skipping further tests.')
      return
    }

    const negotiation = negotiations[0]
    console.log('✅ Negotiation found:', negotiation.id)

    // Test 2: Get property data
    console.log('\n2. Testing property query...')
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', negotiation.property_id)
      .single()

    if (propError) {
      console.error('❌ Property query failed:', propError.message)
      return
    }

    console.log('✅ Property found:', property.title)

    // Test 3: Get property images
    console.log('\n3. Testing property images query...')
    const { data: images, error: imgError } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', negotiation.property_id)

    if (imgError) {
      console.error('❌ Property images query failed:', imgError.message)
    } else {
      console.log(`✅ Property images found: ${images?.length || 0} images`)
    }

    // Test 4: Get negotiation offers
    console.log('\n4. Testing negotiation offers query...')
    const { data: offers, error: offersError } = await supabase
      .from('negotiation_offers')
      .select('*')
      .eq('negotiation_id', negotiation.id)

    if (offersError) {
      console.error('❌ Negotiation offers query failed:', offersError.message)
    } else {
      console.log(`✅ Negotiation offers found: ${offers?.length || 0} offers`)
    }

    // Test 5: Get negotiation documents
    console.log('\n5. Testing negotiation documents query...')
    const { data: documents, error: docsError } = await supabase
      .from('negotiation_documents')
      .select('*')
      .eq('negotiation_id', negotiation.id)

    if (docsError) {
      console.error('❌ Negotiation documents query failed:', docsError.message)
    } else {
      console.log(`✅ Negotiation documents found: ${documents?.length || 0} documents`)
    }

    console.log('\n🎉 All tests completed!')

  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testNegotiationData()
