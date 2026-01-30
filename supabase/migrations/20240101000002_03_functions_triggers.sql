-- ============================================
-- 03 FUNCTIONS AND TRIGGERS - Consolidated Migration
-- ============================================
-- This migration consolidates all functions and triggers
-- Sources consolidated:
--   - 20251020090000_create_profiles_table.sql (handle_new_user, update_updated_at)
--   - 20250120030000_negotiation_functions.sql
--   - 20251021170000_advanced_negotiation_functions.sql
--   - 20251028000000_auto_assign_lawyer.sql

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to handle new user signup (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS FOR AUTOMATIC PROFILE CREATION
-- ============================================

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
DROP TRIGGER IF EXISTS update_visits_updated_at ON visits;
DROP TRIGGER IF EXISTS update_offers_updated_at ON offers;
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
DROP TRIGGER IF EXISTS update_case_documents_updated_at ON case_documents;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_documents_updated_at
  BEFORE UPDATE ON case_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- NEGOTIATION FUNCTIONS
-- ============================================

-- Function to validate offer against rules
CREATE OR REPLACE FUNCTION validate_offer_against_rules(
    p_property_id UUID,
    p_offer_price BIGINT,
    p_payment_method VARCHAR,
    p_closing_date DATE
) RETURNS JSONB AS $$
DECLARE
    rules RECORD;
    validation_result JSONB;
BEGIN
    -- Check if negotiation_rules table exists
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'negotiation_rules') THEN
        RETURN jsonb_build_object('valid', true);
    END IF;
    
    SELECT * INTO rules FROM negotiation_rules WHERE property_id = p_property_id;
    
    IF rules IS NULL THEN
        RETURN jsonb_build_object('valid', true);
    END IF;
    
    -- Validate price
    IF rules.min_price IS NOT NULL AND p_offer_price < rules.min_price THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Precio mínimo no alcanzado',
            'min_required', rules.min_price
        );
    END IF;
    
    -- Validate closing date
    IF rules.max_closing_days IS NOT NULL AND 
       (p_closing_date - CURRENT_DATE) > rules.max_closing_days THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Plazo de cierre excede el máximo permitido',
            'max_days', rules.max_closing_days
        );
    END IF;
    
    -- Validate payment method
    IF rules.required_payment_methods IS NOT NULL AND 
       NOT (p_payment_method = ANY(rules.required_payment_methods)) THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Método de pago no aceptado',
            'accepted_methods', rules.required_payment_methods
        );
    END IF;
    
    RETURN jsonb_build_object('valid', true);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate negotiation progress
CREATE OR REPLACE FUNCTION calculate_negotiation_progress(p_offer_id UUID)
RETURNS INTEGER AS $$
DECLARE
    offer RECORD;
    progress INTEGER := 0;
    milestones JSONB;
BEGIN
    SELECT * INTO offer FROM offers WHERE id = p_offer_id;
    
    IF offer IS NULL THEN
        RETURN 0;
    END IF;
    
    milestones := COALESCE(offer.metrics->'milestones_completed', '{}'::jsonb);
    
    -- Milestone weights (total 100%)
    IF (milestones->>'offer_sent')::boolean THEN progress := progress + 20; END IF;
    IF (milestones->>'visit_completed')::boolean THEN progress := progress + 15; END IF;
    IF (milestones->>'price_agreed')::boolean THEN progress := progress + 25; END IF;
    IF (milestones->>'payment_agreed')::boolean THEN progress := progress + 15; END IF;
    IF (milestones->>'closing_date_agreed')::boolean THEN progress := progress + 10; END IF;
    IF (milestones->>'conditions_agreed')::boolean THEN progress := progress + 10; END IF;
    IF offer.status = 'accepted' THEN progress := progress + 5; END IF;
    
    RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate competitiveness score
CREATE OR REPLACE FUNCTION calculate_competitiveness_score(p_offer_id UUID)
RETURNS INTEGER AS $$
DECLARE
    offer RECORD;
    property RECORD;
    score INTEGER := 0;
    price_ratio DECIMAL;
    days_to_close INTEGER;
BEGIN
    SELECT * INTO offer FROM offers WHERE id = p_offer_id;
    
    IF offer IS NULL THEN
        RETURN 0;
    END IF;
    
    SELECT * INTO property FROM properties WHERE id = offer.property_id;
    
    IF property IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Price competitiveness (40% weight)
    IF property.price > 0 THEN
        price_ratio := (offer.offer_price::DECIMAL / property.price::DECIMAL) * 100;
        IF price_ratio >= 95 THEN score := score + 40;
        ELSIF price_ratio >= 90 THEN score := score + 30;
        ELSIF price_ratio >= 85 THEN score := score + 20;
        ELSIF price_ratio >= 80 THEN score := score + 10;
        END IF;
    END IF;
    
    -- Payment method competitiveness (20% weight)
    CASE offer.payment_method
        WHEN 'cash' THEN score := score + 20;
        WHEN 'bank_transfer' THEN score := score + 15;
        WHEN 'financing' THEN score := score + 10;
        WHEN 'installments' THEN score := score + 5;
        ELSE score := score + 5;
    END CASE;
    
    -- Closing date competitiveness (20% weight)
    days_to_close := offer.closing_date - CURRENT_DATE;
    IF days_to_close <= 30 THEN score := score + 20;
    ELSIF days_to_close <= 60 THEN score := score + 15;
    ELSIF days_to_close <= 90 THEN score := score + 10;
    ELSIF days_to_close <= 120 THEN score := score + 5;
    END IF;
    
    -- Conditions competitiveness (20% weight)
    IF offer.conditions IS NULL OR array_length(offer.conditions, 1) IS NULL THEN
        score := score + 20; -- No conditions = most competitive
    ELSIF array_length(offer.conditions, 1) <= 2 THEN
        score := score + 15;
    ELSIF array_length(offer.conditions, 1) <= 4 THEN
        score := score + 10;
    ELSE
        score := score + 5;
    END IF;
    
    RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AUTO-ASSIGN LAWYER FUNCTION
-- ============================================

-- Function to assign lawyer on offer acceptance
CREATE OR REPLACE FUNCTION assign_lawyer_on_offer_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  v_lawyer_id UUID;
  v_seller_id UUID;
  v_case_id UUID;
  v_property_title TEXT;
BEGIN
  -- Only proceed if offer was just accepted
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    
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
    
    -- If no lawyer found, log warning but don't fail the transaction
    IF v_lawyer_id IS NULL THEN
      RAISE WARNING 'No lawyer available to assign to offer %', NEW.id;
      RETURN NEW;
    END IF;
    
    -- Create case
    INSERT INTO cases (lawyer_id, buyer_id, seller_id, property_id, status, title)
    VALUES (v_lawyer_id, NEW.buyer_id, v_seller_id, NEW.property_id, 'active', 'Caso Legal - ' || COALESCE(v_property_title, 'Propiedad'))
    RETURNING id INTO v_case_id;
    
    -- Update offer with lawyer_id
    NEW.lawyer_id := v_lawyer_id;
    
    -- Create notifications (only if notifications table exists)
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
          'property_id', NEW.property_id
        )
      )
      ON CONFLICT DO NOTHING;
      
      -- Notification for buyer
      INSERT INTO notifications (user_id, type, title, message, related_id, related_type, data)
      VALUES (
        NEW.buyer_id,
        'system',
        'Abogado Asignado',
        'Se ha asignado un abogado a tu oferta aceptada.',
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
    
    RAISE NOTICE 'Lawyer % assigned to offer % and case % created', v_lawyer_id, NEW.id, v_case_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-assign lawyer
DROP TRIGGER IF EXISTS trigger_assign_lawyer ON offers;
CREATE TRIGGER trigger_assign_lawyer
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION assign_lawyer_on_offer_acceptance();

-- Add comment
COMMENT ON FUNCTION assign_lawyer_on_offer_acceptance() IS 
'Automatically assigns a lawyer and creates a case when an offer is accepted. Also creates notifications for all parties.';

-- ============================================
-- NOTIFICATION FUNCTION (if needed)
-- ============================================

-- Function to insert notification (for use by triggers and functions)
CREATE OR REPLACE FUNCTION insert_notification(
    p_user_id UUID,
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_related_id UUID DEFAULT NULL,
    p_related_type VARCHAR DEFAULT NULL,
    p_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id, type, title, message, related_id, related_type, data
    ) VALUES (
        p_user_id, p_type, p_title, p_message, p_related_id, p_related_type, p_data
    )
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION insert_notification TO authenticated;
GRANT EXECUTE ON FUNCTION insert_notification TO anon;
GRANT EXECUTE ON FUNCTION insert_notification TO service_role;
GRANT EXECUTE ON FUNCTION insert_notification TO postgres;

-- ============================================
-- JWT CLAIM SYNC FUNCTION
-- ============================================
-- Function to sync profile role to auth.users.app_metadata for JWT claims
-- This ensures RLS policies that check auth.jwt() ->> 'role' work correctly
CREATE OR REPLACE FUNCTION sync_profile_role_to_jwt()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if role changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Update auth.users.app_metadata with the new role
    -- This makes the role available in JWT claims via auth.jwt() ->> 'role'
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync role changes to JWT claims
DROP TRIGGER IF EXISTS sync_role_to_jwt ON profiles;
CREATE TRIGGER sync_role_to_jwt
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_role_to_jwt();

-- Also sync on INSERT (for new profiles)
CREATE OR REPLACE FUNCTION sync_profile_role_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Set initial role in app_metadata if role is set
  IF NEW.role IS NOT NULL THEN
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_role_on_insert ON profiles;
CREATE TRIGGER sync_role_on_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_role_on_insert();

COMMENT ON FUNCTION sync_profile_role_to_jwt() IS 
'Syncs profile.role to auth.users.app_metadata so RLS policies can check auth.jwt() ->> ''role'' without recursion';

COMMENT ON FUNCTION sync_profile_role_on_insert() IS 
'Syncs initial profile.role to auth.users.app_metadata on profile creation';

