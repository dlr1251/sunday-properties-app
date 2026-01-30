/**
 * Test fixtures for offers and conditions
 */

export const mockOffer = {
  id: 'test-offer-1',
  property_id: 'test-property-1',
  buyer_id: 'test-buyer-1',
  offer_price: 500000000,
  original_price: 500000000,
  payment_method: 'cash',
  closing_date: '2024-12-31',
  conditions: [] as string[],
  status: 'pending',
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString()
};

export const mockStructuredConditions = [
  {
    id: 'condition-1',
    offer_id: 'test-offer-1',
    condition_type: 'inspection_contingency',
    condition_key: 'inspection_contingency',
    condition_value: { description: 'Inspección técnica en 15 días', required: true, days: 15 },
    condition_display_text: 'Inspección técnica en 15 días',
    status: 'proposed',
    proposed_by: 'buyer',
    proposer_user_id: 'test-buyer-1',
    npv_impact: -5000000,
    risk_impact: 15,
    priority: 80,
    version: 1
  },
  {
    id: 'condition-2',
    offer_id: 'test-offer-1',
    condition_type: 'notary_costs_distribution',
    condition_key: 'notary_costs_distribution',
    condition_value: { buyer_percentage: 40, seller_percentage: 60 },
    condition_display_text: 'Comprador paga 40% de gastos notariales',
    status: 'proposed',
    proposed_by: 'buyer',
    proposer_user_id: 'test-buyer-1',
    npv_impact: 8000000,
    risk_impact: 5,
    priority: 60,
    version: 1
  }
];

export const mockProperty = {
  id: 'test-property-1',
  title: 'Apartamento Test',
  address: 'Calle Test 123',
  city: 'Bogotá',
  price: 550000000,
  property_type: 'apartment',
  area: 120,
  bedrooms: 3,
  bathrooms: 2
};

export const mockNPVResult = {
  npv: 495000000,
  adjustedValue: 495000000,
  riskAdjustedNPV: 490000000,
  confidence: 85,
  breakdown: {
    baseValue: 500000000,
    paymentMethodAdjustment: 10000000,
    timeAdjustment: 15000000,
    riskAdjustment: 5000000,
    conditionsAdjustment: 5000000,
    totalAdjustments: -5000000
  }
};

