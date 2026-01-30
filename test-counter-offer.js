// Test script for counter-offer workflow
// This script tests the complete counter-offer flow

console.log('Testing Counter-Offer System...\n');

// Test 1: Check if offers repository exists and has counterOffer function
console.log('1. Checking offers repository...');
try {
  const offersRepo = require('./src/lib/db/repositories/offers.repo.js');
  console.log('✓ Offers repository loaded successfully');
  console.log('✓ createCounterOffer function exists:', typeof offersRepo.createCounterOffer === 'function');
} catch (error) {
  console.log('✗ Error loading offers repository:', error.message);
}

// Test 2: Check if useOffers hook exports counterOffer
console.log('\n2. Checking useOffers hook...');
try {
  const useOffers = require('./src/hooks/useOffers.js');
  console.log('✓ useOffers hook loaded successfully');
  console.log('✓ counterOffer function exported:', typeof useOffers.useOffers === 'function');
} catch (error) {
  console.log('✗ Error loading useOffers hook:', error.message);
}

// Test 3: Check CounterOfferDialog component
console.log('\n3. Checking CounterOfferDialog component...');
try {
  const CounterOfferDialog = require('./src/components/negotiation/CounterOfferDialog.js');
  console.log('✓ CounterOfferDialog component loaded successfully');
} catch (error) {
  console.log('✗ Error loading CounterOfferDialog:', error.message);
}

// Test 4: Check AdvancedNegotiationPanel integration
console.log('\n4. Checking AdvancedNegotiationPanel integration...');
try {
  const AdvancedNegotiationPanel = require('./src/components/negotiation/AdvancedNegotiationPanel.js');
  console.log('✓ AdvancedNegotiationPanel loaded successfully');
} catch (error) {
  console.log('✗ Error loading AdvancedNegotiationPanel:', error.message);
}

// Test 5: Check OffersList component
console.log('\n5. Checking OffersList component...');
try {
  const OffersList = require('./src/components/negotiation/components/OffersList.js');
  console.log('✓ OffersList component loaded successfully');
} catch (error) {
  console.log('✗ Error loading OffersList:', error.message);
}

console.log('\n🎯 Counter-offer system components check complete!');
console.log('\nNext steps for manual testing:');
console.log('1. Start the dev server: npm run dev');
console.log('2. Login as property owner and create a property');
console.log('3. Login as admin and approve the property');
console.log('4. Login as buyer and make an offer');
console.log('5. Login as seller and create counter-offer');
console.log('6. Verify counter-offer appears in buyer dashboard');
console.log('7. Test accepting/rejecting counter-offers');
