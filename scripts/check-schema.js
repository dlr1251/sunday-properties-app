import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54328';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking actual database schema...\n');

  try {
    // Check profiles table first
    console.log('👤 Profiles table:');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profileError) {
      console.log('❌ Profiles error:', profileError);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Profiles table exists! Sample data:', Object.keys(profiles[0]));
    } else {
      console.log('⚠️ Profiles table exists but is empty');
    }
    // Check properties table
    console.log('🏠 Properties table:');
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);

    if (propError) {
      console.log('❌ Properties error:', propError);
    } else if (properties && properties.length > 0) {
      console.log('Columns:', Object.keys(properties[0]));
    } else {
      // Try to insert a dummy record to see the schema
      const testProp = { id: 'test-prop', owner_id: '90aefbad-e6c3-4587-8331-6481daaba408', title: 'Test', description: 'Test', address: 'Test', city: 'Test', price: 100000 };
      const { error: insertError } = await supabase
        .from('properties')
        .insert(testProp);

      console.log('Insert error (shows missing columns):', insertError);
    }

    // Check offers table
    console.log('\n💰 Offers table:');
    const { data: offers, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .limit(1);

    if (offerError) {
      console.log('❌ Offers error:', offerError);
    } else if (offers && offers.length > 0) {
      console.log('Columns:', Object.keys(offers[0]));
    } else {
      const testOffer = { id: 'test-offer', property_id: 'test-prop', buyer_id: '90aefbad-e6c3-4587-8331-6481daaba408', offer_price: 100000, payment_method: 'efectivo', closing_date: '2025-12-01' };
      const { error: insertError } = await supabase
        .from('offers')
        .insert(testOffer);

      console.log('Insert error (shows missing columns):', insertError);
    }

    // Check visits table
    console.log('\n📅 Visits table:');
    const { data: visits, error: visitError } = await supabase
      .from('visits')
      .select('*')
      .limit(1);

    if (visitError) {
      console.log('❌ Visits error:', visitError);
    } else if (visits && visits.length > 0) {
      console.log('Columns:', Object.keys(visits[0]));
    } else {
      const testVisit = { id: 'test-visit', property_id: 'test-prop', visitor_id: '90aefbad-e6c3-4587-8331-6481daaba408', visitor_name: 'Test', visitor_email: 'test@test.com', visitor_phone: '123', scheduled_at: new Date().toISOString() };
      const { error: insertError } = await supabase
        .from('visits')
        .insert(testVisit);

      console.log('Insert error (shows missing columns):', insertError);
    }

    // Check notifications table
    console.log('\n🔔 Notifications table:');
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);

    if (notifError) {
      console.log('❌ Notifications error:', notifError);
    } else if (notifications && notifications.length > 0) {
      console.log('Columns:', Object.keys(notifications[0]));
    } else {
      const testNotif = { id: '550e8400-e29b-41d4-a716-446655440000', user_id: '90aefbad-e6c3-4587-8331-6481daaba408', type: 'test', title: 'Test', message: 'Test' };
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(testNotif);

      console.log('Insert error (shows missing columns):', insertError);
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema();
