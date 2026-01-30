-- Auto-assign lawyer when offer is accepted
-- This migration creates a trigger to automatically assign a lawyer and create a case
-- when an offer status changes to 'accepted'

-- Function to assign lawyer on offer acceptance
CREATE OR REPLACE FUNCTION assign_lawyer_on_offer_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  v_lawyer_id UUID;
  v_seller_id UUID;
  v_case_id UUID;
  v_property_title TEXT;
  v_conversation_id UUID;
BEGIN
  -- Only proceed if offer was just accepted
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    
    -- Get property seller and title
    SELECT owner_id, title INTO v_seller_id, v_property_title
    FROM properties WHERE id = NEW.property_id;
    
    -- Find available lawyer (simple round-robin or random)
    -- Prioritize lawyers with fewer active cases
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
    
    -- If no lawyer found, log error but don't fail the transaction
    IF v_lawyer_id IS NULL THEN
      RAISE WARNING 'No lawyer available to assign to offer %', NEW.id;
      RETURN NEW;
    END IF;
    
    -- Create case
    INSERT INTO cases (lawyer_id, buyer_id, seller_id, property_id, status)
    VALUES (v_lawyer_id, NEW.buyer_id, v_seller_id, NEW.property_id, 'active')
    RETURNING id INTO v_case_id;
    
    -- Update offer with lawyer_id
    NEW.lawyer_id := v_lawyer_id;
    
    -- Create notification for lawyer
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      v_lawyer_id,
      'case_assigned',
      'Nuevo Caso Asignado',
      'Se te ha asignado un nuevo caso legal para la propiedad: ' || v_property_title,
      jsonb_build_object(
        'case_id', v_case_id, 
        'offer_id', NEW.id,
        'property_id', NEW.property_id,
        'property_title', v_property_title
      )
    );
    
    -- Create notification for buyer
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.buyer_id,
      'lawyer_assigned',
      'Abogado Asignado',
      'Se ha asignado un abogado a tu oferta aceptada. Pronto te contactará para iniciar el proceso legal.',
      jsonb_build_object(
        'case_id', v_case_id,
        'offer_id', NEW.id,
        'lawyer_id', v_lawyer_id
      )
    );
    
    -- Create notification for seller
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      v_seller_id,
      'lawyer_assigned',
      'Abogado Asignado',
      'Se ha asignado un abogado para gestionar la venta de tu propiedad.',
      jsonb_build_object(
        'case_id', v_case_id,
        'offer_id', NEW.id,
        'lawyer_id', v_lawyer_id
      )
    );
    
    -- Create initial conversation for case
    INSERT INTO conversations (
      case_id,
      participants,
      type,
      subject,
      created_by
    )
    VALUES (
      v_case_id,
      ARRAY[v_lawyer_id, NEW.buyer_id, v_seller_id],
      'negotiation',
      'Caso Legal - ' || v_property_title,
      v_lawyer_id
    )
    RETURNING id INTO v_conversation_id;
    
    -- Add welcome message to conversation
    INSERT INTO chat_messages (
      conversation_id,
      sender_id,
      receiver_id,
      message,
      message_type
    )
    VALUES (
      v_conversation_id,
      v_lawyer_id,
      NEW.buyer_id,
      'Bienvenidos al chat del caso legal. Soy el abogado asignado para gestionar esta transacción. Aquí podremos coordinar la documentación y firma de contratos. Por favor, manténganse atentos a las actualizaciones.',
      'system'
    );
    
    RAISE NOTICE 'Lawyer % assigned to offer % and case % created', v_lawyer_id, NEW.id, v_case_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_assign_lawyer ON offers;

-- Create trigger
CREATE TRIGGER trigger_assign_lawyer
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION assign_lawyer_on_offer_acceptance();

-- Add comment
COMMENT ON FUNCTION assign_lawyer_on_offer_acceptance() IS 
'Automatically assigns a lawyer and creates a case when an offer is accepted. Also creates notifications and a conversation for all parties.';

-- Create index on cases for lawyer queries
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_status ON cases(lawyer_id, status);
CREATE INDEX IF NOT EXISTS idx_cases_property ON cases(property_id);
CREATE INDEX IF NOT EXISTS idx_cases_buyer ON cases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_seller ON cases(seller_id);

