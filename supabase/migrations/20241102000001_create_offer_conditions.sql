-- ============================================
-- OFFER CONDITIONS - STRUCTURED CONDITIONS MODEL
-- ============================================
-- Transforms unstructured conditions (TEXT[]) into structured, negotiable entities
-- with versioning, interdependencies, and impact tracking

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE condition_type AS ENUM (
  'price',
  'payment_method',
  'closing_date',
  'delivery_date',
  'deed_signing_date',
  'notary_costs_distribution',
  'promesa_compraventa_terms',
  'inspection_contingency',
  'financing_contingency',
  'appraisal_contingency',
  'title_contingency',
  'repairs_required',
  'appliances_included',
  'custom'
);

CREATE TYPE condition_status AS ENUM (
  'proposed',
  'accepted',
  'rejected',
  'countered',
  'withdrawn'
);

CREATE TYPE condition_proposer AS ENUM (
  'buyer',
  'seller',
  'agent',
  'lawyer'
);

-- ============================================
-- OFFER CONDITIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.offer_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  parent_condition_id UUID REFERENCES offer_conditions(id) ON DELETE SET NULL,
  
  -- Core fields
  condition_type condition_type NOT NULL,
  condition_key TEXT NOT NULL, -- e.g., 'closing_date', 'notary_buyer_percentage'
  condition_value JSONB NOT NULL, -- Flexible value storage
  condition_display_text TEXT NOT NULL,
  
  -- Negotiation tracking
  status condition_status NOT NULL DEFAULT 'proposed',
  proposed_by condition_proposer NOT NULL,
  proposer_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Impact analysis
  npv_impact DECIMAL(15,2), -- Impact on Net Present Value
  risk_impact INTEGER CHECK (risk_impact >= 0 AND risk_impact <= 100),
  priority INTEGER DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  superseded_by UUID REFERENCES offer_conditions(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(offer_id, condition_key, version)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_offer_conditions_offer ON offer_conditions(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_conditions_type ON offer_conditions(condition_type);
CREATE INDEX IF NOT EXISTS idx_offer_conditions_status ON offer_conditions(status);
CREATE INDEX IF NOT EXISTS idx_offer_conditions_parent ON offer_conditions(parent_condition_id);
CREATE INDEX IF NOT EXISTS idx_offer_conditions_proposer ON offer_conditions(proposer_user_id);
CREATE INDEX IF NOT EXISTS idx_offer_conditions_offer_status ON offer_conditions(offer_id, status);
CREATE INDEX IF NOT EXISTS idx_offer_conditions_version ON offer_conditions(offer_id, version);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE offer_conditions ENABLE ROW LEVEL SECURITY;

-- Users can view conditions of their offers
CREATE POLICY "Users can view conditions of their offers" ON offer_conditions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM offers o
      LEFT JOIN properties p ON o.property_id = p.id
      WHERE o.id = offer_conditions.offer_id
      AND (o.buyer_id = auth.uid() OR p.owner_id = auth.uid() OR o.lawyer_id = auth.uid())
    )
  );

-- Participants can create conditions
CREATE POLICY "Participants can create conditions" ON offer_conditions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM offers o
      LEFT JOIN properties p ON o.property_id = p.id
      WHERE o.id = offer_conditions.offer_id
      AND (o.buyer_id = auth.uid() OR p.owner_id = auth.uid() OR o.lawyer_id = auth.uid())
    )
  );

-- Participants can update conditions
CREATE POLICY "Participants can update conditions" ON offer_conditions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM offers o
      LEFT JOIN properties p ON o.property_id = p.id
      WHERE o.id = offer_conditions.offer_id
      AND (o.buyer_id = auth.uid() OR p.owner_id = auth.uid() OR o.lawyer_id = auth.uid())
    )
  );

-- Participants can delete conditions
CREATE POLICY "Participants can delete conditions" ON offer_conditions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM offers o
      LEFT JOIN properties p ON o.property_id = p.id
      WHERE o.id = offer_conditions.offer_id
      AND (o.buyer_id = auth.uid() OR p.owner_id = auth.uid() OR o.lawyer_id = auth.uid())
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for updated_at
CREATE TRIGGER update_offer_conditions_updated_at
  BEFORE UPDATE ON offer_conditions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update accepted_at when status changes to accepted
CREATE OR REPLACE FUNCTION update_condition_accepted_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    NEW.accepted_at := NOW();
  ELSIF NEW.status != 'accepted' THEN
    NEW.accepted_at := NULL;
  END IF;
  
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    NEW.rejected_at := NOW();
  ELSIF NEW.status != 'rejected' THEN
    NEW.rejected_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_condition_timestamps
  BEFORE UPDATE ON offer_conditions
  FOR EACH ROW
  EXECUTE FUNCTION update_condition_accepted_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get current version of a condition
CREATE OR REPLACE FUNCTION get_current_condition_version(
  p_offer_id UUID,
  p_condition_key TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_max_version INTEGER;
BEGIN
  SELECT MAX(version) INTO v_max_version
  FROM offer_conditions
  WHERE offer_id = p_offer_id
  AND condition_key = p_condition_key;
  
  RETURN COALESCE(v_max_version, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get condition history
CREATE OR REPLACE FUNCTION get_condition_history(
  p_offer_id UUID,
  p_condition_key TEXT
) RETURNS TABLE (
  id UUID,
  version INTEGER,
  status condition_status,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oc.id,
    oc.version,
    oc.status,
    oc.created_at,
    oc.updated_at
  FROM offer_conditions oc
  WHERE oc.offer_id = p_offer_id
  AND oc.condition_key = p_condition_key
  ORDER BY oc.version DESC;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION get_current_condition_version TO authenticated;
GRANT EXECUTE ON FUNCTION get_condition_history TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE offer_conditions IS 'Structured, negotiable conditions for offers with versioning and impact tracking';
COMMENT ON COLUMN offer_conditions.condition_key IS 'Unique identifier for the condition type within an offer';
COMMENT ON COLUMN offer_conditions.condition_value IS 'Flexible JSONB storage for condition-specific data';
COMMENT ON COLUMN offer_conditions.npv_impact IS 'Calculated impact on Net Present Value (positive or negative)';
COMMENT ON COLUMN offer_conditions.risk_impact IS 'Risk level 0-100 (100 = highest risk)';
COMMENT ON COLUMN offer_conditions.priority IS 'Priority level 0-100 for negotiation (100 = highest priority)';
COMMENT ON COLUMN offer_conditions.version IS 'Version number for tracking condition evolution';

