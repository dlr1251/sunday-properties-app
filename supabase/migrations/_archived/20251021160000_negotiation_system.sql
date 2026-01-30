-- Extended Schema for Advanced Negotiation System
-- Execute this in the Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Offer history for tracking negotiation timeline
-- Only create if offers table exists
DO $$
BEGIN
  IF to_regclass('public.offers') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.offer_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
        version INTEGER NOT NULL,
        action VARCHAR(20) CHECK (action IN ('created', 'countered', 'accepted', 'rejected', 'expired')),
        actor_id UUID REFERENCES public.profiles(id),
        actor_role VARCHAR(20) CHECK (actor_role IN ('buyer', 'seller', 'agent', 'lawyer')),
        offer_price BIGINT NOT NULL,
        payment_method VARCHAR(20),
        closing_date DATE,
        conditions TEXT[],
        changes JSONB,
        reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Negotiation rules for auto-reject
CREATE TABLE IF NOT EXISTS public.negotiation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    min_price BIGINT,
    max_closing_days INTEGER,
    required_payment_methods VARCHAR(20)[],
    auto_reject_enabled BOOLEAN DEFAULT TRUE,
    manual_review_threshold BOOLEAN DEFAULT FALSE,
    special_conditions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intent letters (promesas de compraventa)
DO $$
BEGIN
  IF to_regclass('public.offers') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.intent_letters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
        property_id UUID REFERENCES public.properties(id),
        buyer_id UUID REFERENCES public.profiles(id),
        seller_id UUID REFERENCES public.profiles(id),
        content TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signatures', 'signed', 'cancelled')),
        buyer_signed_at TIMESTAMP WITH TIME ZONE,
        seller_signed_at TIMESTAMP WITH TIME ZONE,
        buyer_signature TEXT,
        seller_signature TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Offer comparisons for multi-offer analysis
DO $$
BEGIN
  IF to_regclass('public.offers') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.offer_comparisons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
        seller_id UUID REFERENCES public.profiles(id),
        offer_ids UUID[] NOT NULL,
        comparison_data JSONB,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Knowledge Base for AI Legal/Financial Advisory
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'legal', 'financial', 'tax', 'process'
    level VARCHAR(20) NOT NULL CHECK (level IN ('fundamental', 'best_practices', 'advanced')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    context JSONB, -- Additional context about when this advice was given
    source VARCHAR(50) DEFAULT 'ai_generated', -- 'ai_generated', 'manual', 'template'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advisory Sessions (tracks user interactions for AI learning)
CREATE TABLE IF NOT EXISTS advisory_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- 'property_upload', 'offer_creation', 'negotiation', 'contract_review'
    context JSONB NOT NULL, -- What the user was doing when advice was given
    advice_given JSONB NOT NULL, -- What advice was provided
    user_feedback JSONB, -- How user responded to advice
    effectiveness_score INTEGER CHECK (effectiveness_score >= 1 AND effectiveness_score <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public Offers with Auction Support
CREATE TABLE IF NOT EXISTS public_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.profiles(id),
    offer_type VARCHAR(20) NOT NULL CHECK (offer_type IN ('fixed_price', 'auction', 'dutch_auction')),
    starting_price BIGINT,
    current_price BIGINT,
    reserve_price BIGINT,
    auction_end_date TIMESTAMP WITH TIME ZONE,
    dutch_auction_decrement BIGINT DEFAULT 0,
    dutch_auction_interval INTEGER DEFAULT 3600, -- seconds
    is_active BOOLEAN DEFAULT TRUE,
    total_offers_received INTEGER DEFAULT 0,
    price_range_visible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multi-currency and payment plans
DO $$
BEGIN
  IF to_regclass('public.offers') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.payment_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
        payment_number INTEGER NOT NULL,
        amount BIGINT NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'COP',
        exchange_rate DECIMAL(10,4),
        payment_method VARCHAR(50) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
        payment_reference TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Fiscal simulation and tax calculations
DO $$
BEGIN
  IF to_regclass('public.offers') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.fiscal_simulations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
        simulation_type VARCHAR(50) NOT NULL, -- 'buyer_taxes', 'seller_taxes', 'optimization'
        base_amount BIGINT NOT NULL,
        currency VARCHAR(10) DEFAULT 'COP',
        notary_fees BIGINT DEFAULT 0,
        registration_tax BIGINT DEFAULT 0,
        income_tax BIGINT DEFAULT 0,
        vat BIGINT DEFAULT 0,
        other_taxes BIGINT DEFAULT 0,
        total_taxes BIGINT NOT NULL,
        net_amount BIGINT NOT NULL,
        optimization_suggestions JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Document management for contracts and legal docs
DO $$
BEGIN
  IF to_regclass('public.offers') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.legal_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
        offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL, -- 'promesa', 'escritura', 'otrosi', 'acta_entrega'
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'signed', 'cancelled')),
        requires_signatures BOOLEAN DEFAULT FALSE,
        buyer_signed_at TIMESTAMP WITH TIME ZONE,
        seller_signed_at TIMESTAMP WITH TIME ZONE,
        lawyer_approved_at TIMESTAMP WITH TIME ZONE,
        file_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Property delivery and transition management
DO $$
BEGIN
  IF to_regclass('public.offers') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.property_deliveries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
        offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
        delivery_date DATE,
        delivery_time TIME,
        delivery_address TEXT,
        condition_photos TEXT[],
        inventory_items JSONB,
        buyer_notes TEXT,
        seller_notes TEXT,
        delivery_act_url TEXT,
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Administrative transitions (HOA, utilities, etc.)
DO $$
BEGIN
  IF to_regclass('public.offers') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.administrative_transitions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
        offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
        transition_type VARCHAR(50) NOT NULL, -- 'hoa_change', 'predial_update', 'utilities_transfer'
        old_owner_id UUID REFERENCES public.profiles(id),
        new_owner_id UUID REFERENCES public.profiles(id),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
        required_documents TEXT[],
        submitted_documents TEXT[],
        notes TEXT,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Update existing offers table
DO $$
BEGIN
  IF to_regclass('public.offers') IS NOT NULL THEN
    ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS negotiation_progress INTEGER DEFAULT 0 CHECK (negotiation_progress >= 0 AND negotiation_progress <= 100);
    ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS auto_rejected BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS milestones_completed JSONB DEFAULT '{}';
    ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'COP';
    ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4) DEFAULT 1.0;
    ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS competitiveness_score INTEGER DEFAULT 0 CHECK (competitiveness_score >= 0 AND competitiveness_score <= 100);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_offer_history_offer_id ON public.offer_history(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_history_actor_id ON public.offer_history(actor_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_rules_property_id ON public.negotiation_rules(property_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_user_id ON knowledge_base(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_property_id ON knowledge_base(property_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_level ON knowledge_base(level);
CREATE INDEX IF NOT EXISTS idx_advisory_sessions_user_id ON advisory_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_public_offers_property_id ON public_offers(property_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_offer_id ON payment_plans(offer_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_simulations_offer_id ON fiscal_simulations(offer_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_offer_id ON legal_documents(offer_id);
CREATE INDEX IF NOT EXISTS idx_property_deliveries_offer_id ON property_deliveries(offer_id);
CREATE INDEX IF NOT EXISTS idx_administrative_transitions_offer_id ON administrative_transitions(offer_id);

-- Create functions for offer validation and progress calculation
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
    SELECT * INTO rules FROM negotiation_rules WHERE property_id = p_property_id;
    
    IF rules IS NULL THEN
        RETURN jsonb_build_object('valid', true);
    END IF;
    
    -- Validate price
    IF rules.min_price IS NOT NULL AND p_offer_price < rules.min_price THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Precio mínimo no alcanzado',
            'min_required', rules.min_price,
            'suggestion', 'Aumenta tu oferta a al menos ' || rules.min_price || ' COP'
        );
    END IF;
    
    -- Validate closing date
    IF rules.max_closing_days IS NOT NULL AND 
       (p_closing_date - CURRENT_DATE) > rules.max_closing_days THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Plazo de cierre excede el máximo permitido',
            'max_days', rules.max_closing_days,
            'suggestion', 'Propone un cierre en máximo ' || rules.max_closing_days || ' días'
        );
    END IF;
    
    -- Validate payment method
    IF rules.required_payment_methods IS NOT NULL AND 
       NOT (p_payment_method = ANY(rules.required_payment_methods)) THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Método de pago no aceptado',
            'accepted_methods', rules.required_payment_methods,
            'suggestion', 'Usa uno de los métodos aceptados: ' || array_to_string(rules.required_payment_methods, ', ')
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
    milestones := COALESCE(offer.milestones_completed, '{}'::jsonb);
    
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

-- Function to generate AI advisory content
CREATE OR REPLACE FUNCTION generate_ai_advisory(
    p_user_id UUID,
    p_property_id UUID,
    p_context JSONB,
    p_level VARCHAR
) RETURNS JSONB AS $$
DECLARE
    advisory_content JSONB;
    context_type VARCHAR;
    property_data RECORD;
BEGIN
    context_type := p_context->>'type';
    
    -- Get property data for context
    SELECT * INTO property_data FROM properties WHERE id = p_property_id;
    
    -- Generate advisory based on context and level
    CASE context_type
        WHEN 'property_upload' THEN
            advisory_content := jsonb_build_object(
                'title', 'Recomendaciones para Publicar tu Propiedad',
                'content', 'Te ayudamos a configurar las mejores condiciones de venta...',
                'level', p_level,
                'suggestions', jsonb_build_array(
                    'Establece un precio competitivo basado en el mercado local',
                    'Configura condiciones de pago flexibles para atraer más compradores',
                    'Considera incluir gastos notariales en el precio para facilitar la venta'
                )
            );
        WHEN 'offer_creation' THEN
            advisory_content := jsonb_build_object(
                'title', 'Guía para Crear una Oferta Atractiva',
                'content', 'Aprende a estructurar tu oferta para maximizar las posibilidades de aceptación...',
                'level', p_level,
                'suggestions', jsonb_build_array(
                    'Incluye un precio competitivo pero realista',
                    'Propón condiciones de pago claras y factibles',
                    'Establece un plazo de cierre razonable'
                )
            );
        ELSE
            advisory_content := jsonb_build_object(
                'title', 'Asesoría Personalizada',
                'content', 'Te proporcionamos recomendaciones específicas para tu situación...',
                'level', p_level
            );
    END CASE;
    
    RETURN advisory_content;
END;
$$ LANGUAGE plpgsql;
