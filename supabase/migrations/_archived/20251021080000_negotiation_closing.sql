-- Negotiation Closing System

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  final_price DECIMAL(15,2) NOT NULL,
  closing_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  conditions TEXT,
  contract_url TEXT, -- URL to generated contract PDF
  status TEXT DEFAULT 'pending_signature' CHECK (status IN ('pending_signature', 'signed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contracts_offer_id ON contracts(offer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_property_id ON contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_contracts_buyer_id ON contracts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_seller_id ON contracts(seller_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- RLS Policies
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Users can view contracts they're involved in
CREATE POLICY contracts_read ON contracts
  FOR SELECT USING (
    buyer_id = auth.uid() OR
    seller_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Only admins can insert contracts (should be done via function)
CREATE POLICY contracts_insert ON contracts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Update contract status (allowed for involved parties and admins)
CREATE POLICY contracts_update ON contracts
  FOR UPDATE USING (
    buyer_id = auth.uid() OR
    seller_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Transaction function to close negotiation atomically
CREATE OR REPLACE FUNCTION close_negotiation_transaction(
  p_offer_id UUID,
  p_property_id UUID,
  p_buyer_id UUID,
  p_seller_id UUID
) RETURNS JSON AS $$
DECLARE
  v_accepted_offer RECORD;
  v_other_offers_count INTEGER;
BEGIN
  -- Start transaction
  BEGIN
    -- Get the accepted offer details
    SELECT * INTO v_accepted_offer
    FROM offers
    WHERE id = p_offer_id AND property_id = p_property_id AND buyer_id = p_buyer_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Offer not found or does not match criteria';
    END IF;

    -- Accept the selected offer
    UPDATE offers
    SET status = 'accepted', updated_at = NOW()
    WHERE id = p_offer_id;

    -- Reject all other offers for this property
    UPDATE offers
    SET status = 'not_selected', updated_at = NOW()
    WHERE property_id = p_property_id AND id != p_offer_id AND status NOT IN ('accepted', 'cancelled');

    GET DIAGNOSTICS v_other_offers_count = ROW_COUNT;

    -- Update property status to sold
    UPDATE properties
    SET status = 'sold', updated_at = NOW()
    WHERE id = p_property_id;

    -- Return success data
    RETURN json_build_object(
      'success', true,
      'accepted_offer_id', p_offer_id,
      'rejected_offers_count', v_other_offers_count,
      'property_id', p_property_id
    );

  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback happens automatically
      RETURN json_build_object(
        'success', false,
        'error', SQLERRM
      );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contract details with related data
CREATE OR REPLACE FUNCTION get_contract_details(contract_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'contract', json_build_object(
      'id', c.id,
      'final_price', c.final_price,
      'closing_date', c.closing_date,
      'payment_method', c.payment_method,
      'conditions', c.conditions,
      'contract_url', c.contract_url,
      'status', c.status,
      'created_at', c.created_at,
      'signed_at', c.signed_at
    ),
    'offer', json_build_object(
      'id', o.id,
      'offer_price', o.offer_price,
      'conditions', o.conditions,
      'created_at', o.created_at
    ),
    'property', json_build_object(
      'id', p.id,
      'title', p.title,
      'address', p.address,
      'city', p.city,
      'area', p.area,
      'bedrooms', p.bedrooms,
      'bathrooms', p.bathrooms
    ),
    'buyer', json_build_object(
      'id', ub.id,
      'name', ub.raw_user_meta_data->>'name',
      'email', ub.email
    ),
    'seller', json_build_object(
      'id', us.id,
      'name', us.raw_user_meta_data->>'name',
      'email', us.email
    )
  ) INTO result
  FROM contracts c
  JOIN offers o ON c.offer_id = o.id
  JOIN properties p ON c.property_id = p.id
  LEFT JOIN auth.users ub ON c.buyer_id = ub.id
  LEFT JOIN auth.users us ON c.seller_id = us.id
  WHERE c.id = contract_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_contract_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contract_updated_at ON contracts;
CREATE TRIGGER contract_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_contract_updated_at();

-- Function to check if property has active negotiations
CREATE OR REPLACE FUNCTION has_active_negotiations(property_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM offers
    WHERE offers.property_id = $1
    AND status IN ('pending', 'countered')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE contracts IS 'Legal contracts generated when negotiations close';
COMMENT ON COLUMN contracts.status IS 'Contract status: pending_signature, signed, completed, cancelled';
COMMENT ON FUNCTION close_negotiation_transaction(UUID, UUID, UUID, UUID) IS 'Atomically closes a negotiation by accepting one offer and rejecting others';
COMMENT ON FUNCTION get_contract_details(UUID) IS 'Returns complete contract information with related offer, property, and user data';
COMMENT ON FUNCTION has_active_negotiations(UUID) IS 'Checks if a property has any active negotiations';
