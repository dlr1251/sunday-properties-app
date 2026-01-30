-- ============================================
-- NPV CALCULATION SYSTEM
-- ============================================
-- Comprehensive Net Present Value calculation for offers
-- Considers: payment method, time value, risk, conditions, inflation

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Helper function to calculate discount factor
CREATE OR REPLACE FUNCTION calculate_discount_factor(
  days INTEGER,
  annual_rate DECIMAL DEFAULT 0.10
) RETURNS DECIMAL AS $$
BEGIN
  RETURN POWER(1 + annual_rate, -1.0 * days / 365.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- MAIN NPV CALCULATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_offer_npv(
  p_offer_id UUID,
  p_base_discount_rate DECIMAL DEFAULT 0.10
) RETURNS TABLE (
  npv DECIMAL,
  adjusted_value DECIMAL,
  risk_adjusted_npv DECIMAL,
  breakdown JSONB
) AS $$
DECLARE
  v_offer RECORD;
  v_property RECORD;
  v_conditions RECORD;
  v_base_value DECIMAL;
  v_payment_method_adjustment DECIMAL := 0;
  v_time_adjustment DECIMAL := 0;
  v_risk_adjustment DECIMAL := 0;
  v_conditions_adjustment DECIMAL := 0;
  v_closing_days INTEGER;
  v_delivery_days INTEGER;
  v_deed_days INTEGER;
  v_discount_rate DECIMAL;
  v_breakdown JSONB := '{}'::jsonb;
BEGIN
  -- Get offer data
  SELECT * INTO v_offer
  FROM offers
  WHERE id = p_offer_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found: %', p_offer_id;
  END IF;
  
  -- Get property data
  SELECT * INTO v_property
  FROM properties
  WHERE id = v_offer.property_id;
  
  v_base_value := v_offer.offer_price;
  v_breakdown := jsonb_build_object('base_value', v_base_value);
  
  -- 1. PAYMENT METHOD ADJUSTMENT
  v_payment_method_adjustment := CASE v_offer.payment_method
    WHEN 'cash' THEN v_base_value * 0.02  -- +2% for cash (liquidity premium)
    WHEN 'financing' THEN v_base_value * -0.03  -- -3% for financing (risk)
    WHEN 'crypto' THEN v_base_value * -0.05  -- -5% for crypto (volatility risk)
    WHEN 'mixed' THEN v_base_value * -0.01  -- -1% for mixed
    ELSE 0
  END;
  
  v_breakdown := v_breakdown || jsonb_build_object(
    'payment_method_adjustment', v_payment_method_adjustment,
    'payment_method', v_offer.payment_method
  );
  
  -- 2. TIME VALUE ADJUSTMENT
  v_closing_days := EXTRACT(EPOCH FROM (v_offer.closing_date - CURRENT_DATE)) / 86400;
  
  -- Get delivery and deed dates from conditions if they exist
  SELECT 
    MAX(CASE WHEN condition_key = 'delivery_date' THEN (condition_value->>'date')::DATE ELSE NULL END),
    MAX(CASE WHEN condition_key = 'deed_signing_date' THEN (condition_value->>'date')::DATE ELSE NULL END)
  INTO v_delivery_days, v_deed_days
  FROM offer_conditions
  WHERE offer_id = p_offer_id AND status IN ('proposed', 'accepted');
  
  v_delivery_days := COALESCE(EXTRACT(EPOCH FROM (v_delivery_days - CURRENT_DATE)) / 86400, v_closing_days + 30);
  v_deed_days := COALESCE(EXTRACT(EPOCH FROM (v_deed_days - CURRENT_DATE)) / 86400, v_closing_days + 60);
  
  -- Discount future payments
  v_time_adjustment := v_base_value * (1 - calculate_discount_factor(v_closing_days::INTEGER, p_base_discount_rate));
  
  v_breakdown := v_breakdown || jsonb_build_object(
    'time_adjustment', v_time_adjustment,
    'closing_days', v_closing_days,
    'delivery_days', v_delivery_days,
    'deed_days', v_deed_days
  );
  
  -- 3. RISK ADJUSTMENT
  -- Base risk by payment method
  v_risk_adjustment := CASE v_offer.payment_method
    WHEN 'cash' THEN 0
    WHEN 'financing' THEN v_base_value * 0.02  -- 2% risk premium
    WHEN 'crypto' THEN v_base_value * 0.05  -- 5% risk premium
    WHEN 'mixed' THEN v_base_value * 0.03
    ELSE 0
  END;
  
  -- Add risk from financing details
  IF v_offer.financing_details IS NOT NULL THEN
    DECLARE
      v_down_payment_pct DECIMAL;
    BEGIN
      v_down_payment_pct := (v_offer.financing_details->>'downPayment')::DECIMAL / v_base_value;
      IF v_down_payment_pct < 0.20 THEN
        v_risk_adjustment := v_risk_adjustment + (v_base_value * 0.03); -- Low down payment risk
      END IF;
    END;
  END IF;
  
  v_breakdown := v_breakdown || jsonb_build_object(
    'risk_adjustment', v_risk_adjustment
  );
  
  -- 4. CONDITIONS ADJUSTMENT
  -- Analyze impact of each condition
  FOR v_conditions IN
    SELECT condition_type, condition_key, condition_value, npv_impact, risk_impact, status
    FROM offer_conditions
    WHERE offer_id = p_offer_id
    AND status IN ('proposed', 'accepted')
  LOOP
    -- Use pre-calculated npv_impact if available
    IF v_conditions.npv_impact IS NOT NULL THEN
      v_conditions_adjustment := v_conditions_adjustment + v_conditions.npv_impact;
    ELSE
      -- Calculate impact based on condition type
      CASE v_conditions.condition_type
        WHEN 'notary_costs_distribution' THEN
          -- If buyer pays less than 50% of notary costs, it's a benefit
          DECLARE
            v_buyer_percentage DECIMAL;
          BEGIN
            v_buyer_percentage := (v_conditions.condition_value->>'buyer_percentage')::DECIMAL;
            IF v_buyer_percentage < 50 THEN
              v_conditions_adjustment := v_conditions_adjustment + (v_base_value * 0.01); -- ~1% of value
            END IF;
          END;
        
        WHEN 'repairs_required' THEN
          -- Repairs reduce value
          DECLARE
            v_repair_cost DECIMAL;
          BEGIN
            v_repair_cost := (v_conditions.condition_value->>'estimated_cost')::DECIMAL;
            v_conditions_adjustment := v_conditions_adjustment - COALESCE(v_repair_cost, 0);
          END;
        
        WHEN 'inspection_contingency', 'financing_contingency', 'appraisal_contingency' THEN
          -- Contingencies add risk/delay
          v_risk_adjustment := v_risk_adjustment + (v_base_value * 0.005); -- 0.5% risk per contingency
        
        ELSE
          -- Default: use risk_impact if available
          IF v_conditions.risk_impact IS NOT NULL THEN
            v_risk_adjustment := v_risk_adjustment + (v_base_value * v_conditions.risk_impact / 10000.0);
          END IF;
      END CASE;
    END IF;
  END LOOP;
  
  v_breakdown := v_breakdown || jsonb_build_object(
    'conditions_adjustment', v_conditions_adjustment
  );
  
  -- 5. INFLATION ADJUSTMENT (for long closing periods)
  IF v_closing_days > 90 THEN
    DECLARE
      v_inflation_rate DECIMAL := 0.05; -- 5% annual inflation assumption
      v_inflation_adjustment DECIMAL;
    BEGIN
      v_inflation_adjustment := v_base_value * v_inflation_rate * (v_closing_days / 365.0);
      v_time_adjustment := v_time_adjustment + v_inflation_adjustment;
      
      v_breakdown := v_breakdown || jsonb_build_object(
        'inflation_adjustment', v_inflation_adjustment
      );
    END;
  END IF;
  
  -- FINAL CALCULATIONS
  npv := v_base_value 
         + v_payment_method_adjustment 
         - v_time_adjustment 
         + v_conditions_adjustment;
  
  adjusted_value := npv;
  
  risk_adjusted_npv := npv - v_risk_adjustment;
  
  breakdown := v_breakdown || jsonb_build_object(
    'final_npv', npv,
    'risk_adjusted_npv', risk_adjusted_npv,
    'total_adjustments', v_payment_method_adjustment - v_time_adjustment + v_conditions_adjustment - v_risk_adjustment
  );
  
  RETURN QUERY SELECT npv, adjusted_value, risk_adjusted_npv, breakdown;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION calculate_offer_npv TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_discount_factor TO authenticated;

-- ============================================
-- ADD NPV COLUMNS TO OFFERS TABLE
-- ============================================

ALTER TABLE offers ADD COLUMN IF NOT EXISTS calculated_npv DECIMAL(15,2);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS risk_adjusted_npv DECIMAL(15,2);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS npv_breakdown JSONB;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS npv_calculated_at TIMESTAMPTZ;

-- ============================================
-- AUTO-CALCULATE NPV TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION trigger_calculate_offer_npv()
RETURNS TRIGGER AS $$
DECLARE
  v_npv_result RECORD;
BEGIN
  -- Only calculate if NPV calculation feature is enabled
  IF EXISTS (
    SELECT 1 FROM feature_flags 
    WHERE flag_name = 'npv_calculation' 
    AND (enabled_globally = TRUE OR NEW.buyer_id = ANY(enabled_for_users))
  ) THEN
    SELECT * INTO v_npv_result
    FROM calculate_offer_npv(NEW.id);
    
    NEW.calculated_npv := v_npv_result.npv;
    NEW.risk_adjusted_npv := v_npv_result.risk_adjusted_npv;
    NEW.npv_breakdown := v_npv_result.breakdown;
    NEW.npv_calculated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_calculate_npv ON offers;
CREATE TRIGGER trigger_auto_calculate_npv
  AFTER INSERT OR UPDATE OF offer_price, payment_method, closing_date, financing_details
  ON offers
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_offer_npv();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION calculate_offer_npv IS 'Calculate comprehensive Net Present Value for an offer considering payment method, time, risk, conditions, and inflation';
COMMENT ON FUNCTION calculate_discount_factor IS 'Calculate discount factor for time value of money';
COMMENT ON COLUMN offers.calculated_npv IS 'Calculated Net Present Value';
COMMENT ON COLUMN offers.risk_adjusted_npv IS 'NPV adjusted for risk factors';
COMMENT ON COLUMN offers.npv_breakdown IS 'Detailed breakdown of NPV calculation';

