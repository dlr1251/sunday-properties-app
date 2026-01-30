import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54327';
// Use service role key to bypass RLS
const supabaseServiceKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Generate proper UUIDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function comprehensiveSeed() {
  console.log('🌱 Comprehensive production data seeding...\n');

  try {
    // Get all user profiles first
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .order('email');

    if (profilesError || !profiles) {
      console.error('❌ Error getting profiles:', profilesError);
      return;
    }

    console.log(`📋 Found ${profiles.length} total users:`);
    profiles.forEach(p => console.log(`   ${p.email}: ${p.id} (${p.role})`));

    // Categorize users
    const users = profiles.filter(p => p.role === 'user');
    const agents = profiles.filter(p => p.role === 'agent');
    const lawyers = profiles.filter(p => p.role === 'lawyer');
    const admins = profiles.filter(p => p.role === 'super_admin');

    console.log(`\n🎯 User breakdown: ${users.length} users, ${agents.length} agents, ${lawyers.length} lawyers, ${admins.length} admins`);

    if (users.length < 2) {
      console.log('❌ Need at least 2 regular users for meaningful seeding');
      return;
    }

    // ===== PROPERTIES =====
    console.log('\n🏠 Seeding properties...');
    const properties = [];

    // Each user gets 1-2 properties
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const numProperties = i % 2 + 1; // 1 or 2 properties per user

      for (let j = 0; j < numProperties; j++) {
        const propertyId = generateUUID();
        const propertyData = {
          id: propertyId,
          owner_id: user.id,
          agent_id: agents.length > 0 ? agents[i % agents.length].id : null,
          title: j === 0 ? `${user.full_name?.split(' ')[0]}'s Modern Apartment` : `${user.full_name?.split(' ')[0]}'s Family House`,
          description: j === 0
            ? `Beautiful modern apartment in the heart of Medellín. Perfect for young professionals.`
            : `Spacious family home with garden and excellent location for families.`,
          address: j === 0
            ? `Carrera ${40 + i} #${10 + j}-${20 + j}, Apto ${100 + i}`
            : `Calle ${25 + i} Sur #${45 + j}-${60 + j}`,
          neighborhood: j === 0 ? 'El Poblado' : 'Envigado',
          city: 'Medellín',
          coordinates: {
            lat: 6.2091 + (Math.random() - 0.5) * 0.1,
            lng: -75.5678 + (Math.random() - 0.5) * 0.1
          },
          bedrooms: j === 0 ? 2 + (i % 2) : 3 + (i % 3),
          bathrooms: j === 0 ? 1 + (i % 2) : 2 + (i % 2),
          area: j === 0 ? 60 + (i * 10) : 150 + (i * 20),
          property_type: j === 0 ? 'apartment' : 'house',
          price: j === 0 ? 300000000 + (i * 50000000) : 500000000 + (i * 100000000),
          status: Math.random() > 0.8 ? 'draft' : 'published',
          features: j === 0
            ? ['Gimnasio', 'Piscina', 'Portería 24/7']
            : ['Jardín', 'Piscina', 'Zona BBQ', 'Garaje doble'],
          images: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
          ],
          created_at: new Date(Date.now() - (30 - i * 2) * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        };

        properties.push(propertyData);
      }
    }

    // Insert properties
    for (const property of properties) {
      const { error } = await supabase
        .from('properties')
        .insert(property);

      if (error) {
        console.log(`❌ Property insert error for ${property.title}:`, error);
      } else {
        console.log(`✅ Created property: ${property.title} (${property.status})`);
      }
    }

    // ===== OFFERS =====
    console.log('\n💰 Seeding offers...');
    const offers = [];
    const publishedProperties = properties.filter(p => p.status === 'published');

    // Create offers on published properties
    for (let i = 0; i < Math.min(8, publishedProperties.length); i++) {
      const property = publishedProperties[i];
      const buyer = users.find(u => u.id !== property.owner_id) || users[0];

      const offerId = generateUUID();
      const offerData = {
        id: offerId,
        property_id: property.id,
        buyer_id: buyer.id,
        offer_price: Math.round(property.price * (0.85 + Math.random() * 0.15)), // 85-100% of asking price
        payment_method: ['efectivo', 'credito', 'leasing'][i % 3],
        closing_date: new Date(Date.now() + (30 + i * 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: ['pending', 'accepted', 'rejected'][i % 3],
        conditions: i % 2 === 0 ? 'Subject to financing approval' : null,
        created_at: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };

      offers.push(offerData);
    }

    // Insert offers
    for (const offer of offers) {
      const { error } = await supabase
        .from('offers')
        .insert(offer);

      if (error) {
        console.log(`❌ Offer insert error:`, error);
      } else {
        console.log(`✅ Created offer: $${offer.offer_price.toLocaleString()} (${offer.status})`);
      }
    }

    // ===== VISITS =====
    console.log('\n📅 Seeding visits...');
    const visits = [];

    // Create visits for some properties
    for (let i = 0; i < Math.min(6, publishedProperties.length); i++) {
      const property = publishedProperties[i];
      const visitor = users.find(u => u.id !== property.owner_id) || users[0];

      const visitId = generateUUID();
      const visitData = {
        id: visitId,
        property_id: property.id,
        visitor_id: visitor.id,
        visitor_name: visitor.full_name || visitor.email.split('@')[0],
        visitor_email: visitor.email,
        visitor_phone: `+57 30${10000000 + i}567`,
        scheduled_date: new Date(Date.now() + (1 + i) * 24 * 60 * 60 * 1000).toISOString(),
        status: ['pending', 'confirmed', 'completed'][i % 3],
        notes: i % 2 === 0 ? 'Interested in financing options' : 'Family with children',
        seller_notes: i % 3 === 0 ? 'Property needs some repairs' : null,
        created_at: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };

      visits.push(visitData);
    }

    // Insert visits
    for (const visit of visits) {
      const { error } = await supabase
        .from('visits')
        .insert(visit);

      if (error) {
        console.log(`❌ Visit insert error:`, error);
      } else {
        console.log(`✅ Created visit: ${visit.visitor_name} - ${visit.status}`);
      }
    }

    // ===== NOTIFICATIONS =====
    console.log('\n🔔 Seeding notifications...');
    const notifications = [];

    // Property-related notifications
    properties.slice(0, 5).forEach((property, i) => {
      const notificationId = generateUUID();
      const notifData = {
        id: notificationId,
        user_id: property.owner_id,
        type: 'property_status_update',
        title: `Property ${property.status === 'published' ? 'Published' : 'Draft Saved'}`,
        message: `Your property "${property.title}" has been ${property.status === 'published' ? 'published and is now visible to buyers' : 'saved as draft'}`,
        data: { property_id: property.id },
        read: Math.random() > 0.5,
        created_at: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString()
      };
      notifications.push(notifData);
    });

    // Offer-related notifications
    offers.forEach((offer, i) => {
      // Notification to seller
      const sellerNotifId = generateUUID();
      const sellerNotif = {
        id: sellerNotifId,
        user_id: properties.find(p => p.id === offer.property_id)?.owner_id,
        type: 'offer_received',
        title: 'New Offer Received!',
        message: `You received an offer of $${offer.offer_price.toLocaleString()} for your property`,
        data: { property_id: offer.property_id, offer_id: offer.id, amount: offer.offer_price },
        read: i % 2 === 0,
        created_at: new Date(Date.now() - (2 + i) * 60 * 60 * 1000).toISOString()
      };
      notifications.push(sellerNotif);

      // Notification to buyer
      const buyerNotifId = generateUUID();
      const buyerNotif = {
        id: buyerNotifId,
        user_id: offer.buyer_id,
        type: 'offer_submitted',
        title: 'Offer Submitted Successfully',
        message: `Your offer of $${offer.offer_price.toLocaleString()} has been submitted`,
        data: { property_id: offer.property_id, offer_id: offer.id, amount: offer.offer_price },
        read: true,
        created_at: new Date(Date.now() - (2 + i) * 60 * 60 * 1000).toISOString()
      };
      notifications.push(buyerNotif);
    });

    // Visit notifications
    visits.forEach((visit, i) => {
      const visitNotifId = generateUUID();
      const visitNotif = {
        id: visitNotifId,
        user_id: properties.find(p => p.id === visit.property_id)?.owner_id,
        type: 'visit_scheduled',
        title: 'Visit Scheduled',
        message: `${visit.visitor_name} has scheduled a visit for ${new Date(visit.scheduled_date).toLocaleDateString()}`,
        data: { property_id: visit.property_id, visit_id: visit.id, scheduled_at: visit.scheduled_date },
        read: false,
        created_at: new Date(Date.now() - (1 + i) * 60 * 60 * 1000).toISOString()
      };
      notifications.push(visitNotif);
    });

    // Insert notifications
    for (const notification of notifications) {
      const { error } = await supabase
        .from('notifications')
        .insert(notification);

      if (error) {
        console.log(`❌ Notification insert error:`, error);
      } else {
        console.log(`✅ Created notification: ${notification.title}`);
      }
    }

    // ===== CONTRACTS =====
    console.log('\n📄 Seeding contracts...');
    const contracts = [];

    // Create contracts for accepted offers
    const acceptedOffers = offers.filter(o => o.status === 'accepted');
    acceptedOffers.slice(0, 2).forEach((offer, i) => {
      const property = properties.find(p => p.id === offer.property_id);
      if (!property) return;

      const contractId = generateUUID();
      const contractData = {
        id: contractId,
        offer_id: offer.id,
        property_id: offer.property_id,
        buyer_id: offer.buyer_id,
        seller_id: property.owner_id,
        final_price: offer.offer_price,
        closing_date: offer.closing_date,
        payment_method: offer.payment_method,
        status: i === 0 ? 'pending_signature' : 'signed',
        created_at: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };

      contracts.push(contractData);
    });

    // Insert contracts
    for (const contract of contracts) {
      const { error } = await supabase
        .from('contracts')
        .insert(contract);

      if (error) {
        console.log(`❌ Contract insert error:`, error);
      } else {
        console.log(`✅ Created contract: $${contract.final_price.toLocaleString()} (${contract.status})`);
      }
    }

    // ===== VERIFICATION REQUESTS =====
    console.log('\n✅ Seeding verification requests...');
    const verificationRequests = [];

    // Create verification requests for some users
    users.slice(0, 3).forEach((user, i) => {
      const verificationId = generateUUID();
      const verificationData = {
        id: verificationId,
        user_id: user.id,
        document_type: ['cedula', 'passport', 'license'][i % 3],
        document_url: `https://example.com/docs/${verificationId}.pdf`,
        selfie_url: `https://example.com/selfies/${verificationId}.jpg`,
        full_name: user.full_name || user.email.split('@')[0],
        dob: `199${i}-0${i + 1}-1${i}`,
        nationality: 'Colombian',
        phone: `+57 30${1000000 + i}567`,
        address: `Calle ${10 + i} #${20 + i}-${30 + i}, Medellín`,
        status: ['pending', 'approved', 'rejected'][i % 3],
        submitted_at: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };

      verificationRequests.push(verificationData);
    });

    // Insert verification requests
    for (const verification of verificationRequests) {
      const { error } = await supabase
        .from('verification_requests')
        .insert(verification);

      if (error) {
        console.log(`❌ Verification request insert error:`, error);
      } else {
        console.log(`✅ Created verification request: ${verification.full_name} (${verification.status})`);
      }
    }

    console.log('\n🎉 Comprehensive seeding complete!');
    console.log('\n📊 Final Summary:');
    console.log(`   • ${properties.length} Properties (${properties.filter(p => p.status === 'published').length} published)`);
    console.log(`   • ${offers.length} Offers (${offers.filter(o => o.status === 'accepted').length} accepted)`);
    console.log(`   • ${visits.length} Visits (${visits.filter(v => v.status === 'confirmed').length} confirmed)`);
    console.log(`   • ${notifications.length} Notifications`);
    console.log(`   • ${contracts.length} Contracts`);
    console.log(`   • ${verificationRequests.length} Verification Requests`);
    console.log('\n🚀 Now refresh your ProfilePage and see all the data!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

comprehensiveSeed();
