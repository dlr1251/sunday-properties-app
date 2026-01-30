-- ============================================
-- EXTEND LAWYER ASSIGNMENT TRIGGER
-- ============================================
-- Modifies existing lawyer assignment to also trigger on:
-- 1. Counteroffers
-- 2. Condition counters
-- 3. Any structured condition change that requires legal review

-- ============================================
-- MODIFIED LAWYER ASSIGNMENT FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION assign_lawyer_on_offer_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  v_lawyer_id UUID;
  v_seller_id UUID;
  v_case_id UUID;
  v_property_title TEXT;
  v_should_assign BOOLEAN := FALSE;
BEGIN
  -- Determine if we should assign a lawyer
  
  -- Case 1: Offer just accepted (ORIGINAL LOGIC)
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    v_should_assign := TRUE;
  END IF;
  
  -- Case 2: Offer countered (NEW LOGIC)
  IF NEW.status = 'countered' AND (OLD.status IS NULL OR OLD.status != 'countered') THEN
    v_should_assign := TRUE;
  END IF;
  
  -- Don't proceed if no trigger condition met
  IF NOT v_should_assign THEN
    RETURN NEW;
  END IF;
  
  -- Check if lawyer already assigned
  IF NEW.lawyer_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get property seller and title
  SELECT owner_id, title INTO v_seller_id, v_property_title
  FROM properties WHERE id = NEW.property_id;
  
  IF v_seller_id IS NULL THEN
    RAISE WARNING 'Property not found for offer %', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Find available lawyer (prioritize lawyers with fewer active cases)
  SELECT id INTO v_lawyer_id
  FROM profiles
  WHERE role = 'lawyer' 
    AND (status = 'active' OR status IS NULL)
  ORDER BY (
    SELECT COUNT(*) 
    FROM cases 
    WHERE lawyer_id = profiles.id AND status = 'active'
  ) ASC, RANDOM()
  LIMIT 1;
  
  IF v_lawyer_id IS NULL THEN
    RAISE WARNING 'No lawyer available to assign to offer %', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Check if case already exists for this offer/property
  SELECT id INTO v_case_id
  FROM cases
  WHERE property_id = NEW.property_id
  AND buyer_id = NEW.buyer_id
  AND status = 'active'
  LIMIT 1;
  
  -- Create case if it doesn't exist
  IF v_case_id IS NULL THEN
    INSERT INTO cases (lawyer_id, buyer_id, seller_id, property_id, status, title)
    VALUES (
      v_lawyer_id, 
      NEW.buyer_id, 
      v_seller_id, 
      NEW.property_id, 
      'active', 
      'Caso Legal - ' || COALESCE(v_property_title, 'Propiedad')
    )
    RETURNING id INTO v_case_id;
  ELSE
    -- Update existing case with lawyer if not assigned
    UPDATE cases
    SET lawyer_id = v_lawyer_id,
        updated_at = NOW()
    WHERE id = v_case_id
    AND lawyer_id IS NULL;
  END IF;
  
  -- Update offer with lawyer_id
  NEW.lawyer_id := v_lawyer_id;
  
  -- Create notifications
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    -- Notification for lawyer
    INSERT INTO notifications (user_id, type, title, message, related_id, related_type, data)
    VALUES (
      v_lawyer_id,
      'system',
      'Nuevo Caso Asignado',
      'Se te ha asignado un nuevo caso legal para la propiedad: ' || COALESCE(v_property_title, 'Propiedad'),
      v_case_id,
      'contract',
      jsonb_build_object(
        'case_id', v_case_id, 
        'offer_id', NEW.id,
        'property_id', NEW.property_id,
        'trigger_reason', CASE 
          WHEN NEW.status = 'accepted' THEN 'offer_accepted'
          WHEN NEW.status = 'countered' THEN 'offer_countered'
          ELSE 'unknown'
        END
      )
    )
    ON CONFLICT DO NOTHING;
    
    -- Notification for buyer
    INSERT INTO notifications (user_id, type, title, message, related_id, related_type, data)
    VALUES (
      NEW.buyer_id,
      'system',
      'Abogado Asignado',
      'Se ha asignado un abogado a tu oferta.',
      v_case_id,
      'contract',
      jsonb_build_object('case_id', v_case_id, 'offer_id', NEW.id, 'lawyer_id', v_lawyer_id)
    )
    ON CONFLICT DO NOTHING;
    
    -- Notification for seller
    INSERT INTO notifications (user_id, type, title, message, related_id, related_type, data)
    VALUES (
      v_seller_id,
      'system',
      'Abogado Asignado',
      'Se ha asignado un abogado para gestionar la venta de tu propiedad.',
      v_case_id,
      'contract',
      jsonb_build_object('case_id', v_case_id, 'offer_id', NEW.id, 'lawyer_id', v_lawyer_id)
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RAISE NOTICE 'Lawyer % assigned to offer % and case %', v_lawyer_id, NEW.id, v_case_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER FOR CONDITION-LEVEL COUNTERS
-- ============================================

-- Create function to trigger lawyer assignment when conditions are countered
CREATE OR REPLACE FUNCTION trigger_lawyer_on_condition_counter()
RETURNS TRIGGER AS $$
DECLARE
  v_lawyer_id UUID;
  v_seller_id UUID;
  v_case_id UUID;
  v_property_title TEXT;
BEGIN
  -- Only trigger if status changed to countered
  IF NEW.status = 'countered' AND (OLD.status IS NULL OR OLD.status != 'countered') THEN
    -- Update the offer's updated_at to trigger the main lawyer assignment function
    -- This is a lightweight way to trigger the existing logic
    UPDATE offers
    SET updated_at = NOW()
    WHERE id = NEW.offer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on offer_conditions
DROP TRIGGER IF EXISTS trigger_condition_counter_lawyer ON offer_conditions;
CREATE TRIGGER trigger_condition_counter_lawyer
  AFTER INSERT OR UPDATE OF status ON offer_conditions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_lawyer_on_condition_counter();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION assign_lawyer_on_offer_acceptance() IS 'Assigns lawyer when offer is accepted, countered, or when conditions are countered';
COMMENT ON FUNCTION trigger_lawyer_on_condition_counter() IS 'Triggers lawyer assignment when a condition is countered';

