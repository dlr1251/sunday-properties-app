-- Comprehensive Negotiations System Migration
-- Adds all required features: actions, documents, signatures, chats, reports, comparisons

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. NEGOTIATION ACTIONS (ACTUACIONES)
-- ============================================
-- Tracks all activities: meetings, checklist, calendar, chronology
CREATE TABLE IF NOT EXISTS public.negotiation_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    negotiation_id UUID NOT NULL REFERENCES public.negotiations(id) ON DELETE CASCADE,
    
    -- Action details
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'meeting', 'call', 'email', 'document_review', 'signature', 
        'payment', 'inspection', 'delivery', 'checklist_item', 'milestone',
        'counter_offer', 'offer_accepted', 'offer_rejected', 'contract_signed',
        'lawyer_assigned', 'agent_assigned', 'custom'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Participants
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    participants UUID[] DEFAULT '{}', -- Array of profile IDs
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_milestone BOOLEAN DEFAULT FALSE,
    
    -- Checklist support
    checklist_items JSONB DEFAULT '[]', -- Array of {id, text, completed, completed_by, completed_at}
    
    -- Related entities
    related_offer_id UUID REFERENCES public.offers(id),
    related_document_id UUID REFERENCES public.legal_documents(id),
    
    -- Location (for meetings)
    location_type VARCHAR(20) CHECK (location_type IN ('physical', 'virtual', 'phone')),
    location_address TEXT,
    location_url TEXT, -- For virtual meetings
    
    -- Attachments and notes
    attachments JSONB DEFAULT '[]', -- Array of {url, name, type}
    notes TEXT,
    outcome TEXT, -- Results/decisions from the action
    
    -- Chronology tracking
    parent_action_id UUID REFERENCES public.negotiation_actions(id), -- For action chains
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for actions
CREATE INDEX IF NOT EXISTS idx_negotiation_actions_negotiation_id ON public.negotiation_actions(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_actions_created_by ON public.negotiation_actions(created_by);
CREATE INDEX IF NOT EXISTS idx_negotiation_actions_scheduled_at ON public.negotiation_actions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_negotiation_actions_status ON public.negotiation_actions(status);
CREATE INDEX IF NOT EXISTS idx_negotiation_actions_type ON public.negotiation_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_negotiation_actions_parent ON public.negotiation_actions(parent_action_id);

-- ============================================
-- 2. ENHANCED DOCUMENTS WITH VERSIONING
-- ============================================
-- Extend legal_documents table if it exists, or create enhanced version
DO $$
BEGIN
    -- Add versioning columns if they don't exist
    IF to_regclass('public.legal_documents') IS NOT NULL THEN
        -- Add columns for enhanced versioning
        ALTER TABLE public.legal_documents 
            ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES public.legal_documents(id),
            ADD COLUMN IF NOT EXISTS change_log JSONB DEFAULT '[]',
            ADD COLUMN IF NOT EXISTS requires_signatures BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS signature_order JSONB DEFAULT '[]', -- Order of required signatures
            ADD COLUMN IF NOT EXISTS signatures JSONB DEFAULT '[]', -- Array of signature records
            ADD COLUMN IF NOT EXISTS is_current_version BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS version_notes TEXT,
            ADD COLUMN IF NOT EXISTS reviewed_by UUID[] DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS approval_required BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS approved_by UUID[] DEFAULT '{}';
            
        -- Create index for versioning
        CREATE INDEX IF NOT EXISTS idx_legal_documents_parent ON public.legal_documents(parent_document_id);
        CREATE INDEX IF NOT EXISTS idx_legal_documents_version ON public.legal_documents(version, is_current_version);
    END IF;
END $$;

-- ============================================
-- 3. SIGNATURES SYSTEM
-- ============================================
-- Secure signature tracking
CREATE TABLE IF NOT EXISTS public.document_signatures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,
    negotiation_id UUID REFERENCES public.negotiations(id) ON DELETE CASCADE,
    
    -- Signer information
    signer_id UUID NOT NULL REFERENCES public.profiles(id),
    signer_role VARCHAR(20) NOT NULL CHECK (signer_role IN ('buyer', 'seller', 'lawyer', 'agent', 'witness')),
    signer_name VARCHAR(255) NOT NULL,
    signer_email VARCHAR(255),
    signer_id_number VARCHAR(50), -- Colombian ID (Cédula)
    
    -- Signature data
    signature_method VARCHAR(20) DEFAULT 'electronic' CHECK (signature_method IN ('electronic', 'digital', 'biometric', 'handwritten')),
    signature_data JSONB NOT NULL, -- Encrypted signature data
    signature_hash TEXT NOT NULL, -- Hash for verification
    ip_address INET,
    user_agent TEXT,
    
    -- Security
    verification_code VARCHAR(50), -- 2FA code for extra security
    verification_method VARCHAR(20) CHECK (verification_method IN ('email', 'sms', 'app', 'none')),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'signed', 'rejected', 'expired')),
    signed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    signing_location JSONB, -- GPS coordinates if available
    device_info JSONB,
    consent_obtained BOOLEAN DEFAULT FALSE,
    consent_text TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for signatures
CREATE INDEX IF NOT EXISTS idx_document_signatures_document_id ON public.document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_negotiation_id ON public.document_signatures(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_signer_id ON public.document_signatures(signer_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_status ON public.document_signatures(status);
CREATE INDEX IF NOT EXISTS idx_document_signatures_hash ON public.document_signatures(signature_hash);

-- ============================================
-- 4. NEGOTIATION CHATS
-- ============================================
-- Enhanced chat system restricted to negotiation participants
CREATE TABLE IF NOT EXISTS public.negotiation_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    negotiation_id UUID NOT NULL REFERENCES public.negotiations(id) ON DELETE CASCADE,
    
    -- Message details
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'document', 'image', 'file', 'system', 'offer_update', 'action_update')),
    
    -- Attachments
    attachments JSONB DEFAULT '[]', -- Array of {url, name, type, size}
    
    -- Related entities
    related_offer_id UUID REFERENCES public.offers(id),
    related_action_id UUID REFERENCES public.negotiation_actions(id),
    related_document_id UUID REFERENCES public.legal_documents(id),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_by UUID[] DEFAULT '{}', -- Array of profile IDs who read the message
    read_at JSONB DEFAULT '{}', -- {profile_id: timestamp}
    
    -- Moderation
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES public.profiles(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for chats
CREATE INDEX IF NOT EXISTS idx_negotiation_chats_negotiation_id ON public.negotiation_chats(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_chats_sender_id ON public.negotiation_chats(sender_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_chats_created_at ON public.negotiation_chats(created_at);
CREATE INDEX IF NOT EXISTS idx_negotiation_chats_is_read ON public.negotiation_chats(is_read);

-- ============================================
-- 5. FINANCIAL REPORTS (INFORMES)
-- ============================================
-- Advanced economic and financial analysis
CREATE TABLE IF NOT EXISTS public.negotiation_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    negotiation_id UUID NOT NULL REFERENCES public.negotiations(id) ON DELETE CASCADE,
    
    -- Report details
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
        'financial_analysis', 'tax_analysis', 'roi_analysis', 'payment_plan',
        'market_comparison', 'risk_assessment', 'cash_flow', 'comprehensive'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Generated by
    generated_by UUID REFERENCES public.profiles(id),
    generation_method VARCHAR(20) DEFAULT 'auto' CHECK (generation_method IN ('auto', 'manual', 'ai')),
    
    -- Financial data
    property_value BIGINT,
    offer_price BIGINT,
    final_price BIGINT,
    down_payment BIGINT,
    loan_amount BIGINT,
    interest_rate DECIMAL(5,2),
    loan_term_months INTEGER,
    
    -- Tax calculations
    notary_fees BIGINT DEFAULT 0,
    registration_tax BIGINT DEFAULT 0,
    income_tax BIGINT DEFAULT 0,
    vat BIGINT DEFAULT 0,
    other_taxes BIGINT DEFAULT 0,
    total_taxes BIGINT DEFAULT 0,
    
    -- Payment analysis
    monthly_payment BIGINT,
    total_payment BIGINT,
    total_interest BIGINT,
    
    -- ROI and metrics
    roi_percentage DECIMAL(5,2),
    net_present_value BIGINT,
    internal_rate_return DECIMAL(5,2),
    payback_period_months INTEGER,
    
    -- Market analysis
    market_value_range JSONB, -- {min, max, average}
    comparable_properties JSONB DEFAULT '[]',
    price_per_sqm DECIMAL(10,2),
    market_trend VARCHAR(20) CHECK (market_trend IN ('rising', 'stable', 'declining')),
    
    -- Risk assessment
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_factors JSONB DEFAULT '[]',
    risk_mitigation JSONB DEFAULT '[]',
    
    -- Cash flow projection
    cash_flow_projection JSONB DEFAULT '[]', -- Array of monthly projections
    break_even_month INTEGER,
    
    -- Recommendations
    recommendations JSONB DEFAULT '[]',
    warnings JSONB DEFAULT '[]',
    
    -- Report data (full JSON structure)
    report_data JSONB NOT NULL DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'archived')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reports
CREATE INDEX IF NOT EXISTS idx_negotiation_reports_negotiation_id ON public.negotiation_reports(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_reports_type ON public.negotiation_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_negotiation_reports_generated_by ON public.negotiation_reports(generated_by);

-- ============================================
-- 6. SCENARIO COMPARISONS (COMPARACIONES)
-- ============================================
-- Enhanced comparison system for scenario simulation
CREATE TABLE IF NOT EXISTS public.negotiation_scenarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    negotiation_id UUID NOT NULL REFERENCES public.negotiations(id) ON DELETE CASCADE,
    
    -- Scenario details
    scenario_name VARCHAR(255) NOT NULL,
    description TEXT,
    scenario_type VARCHAR(50) DEFAULT 'custom' CHECK (scenario_type IN (
        'base_case', 'optimistic', 'pessimistic', 'best_offer', 'alternative_payment',
        'early_closing', 'extended_closing', 'price_adjustment', 'custom'
    )),
    
    -- Scenario parameters
    offer_price BIGINT,
    payment_method VARCHAR(50),
    down_payment_percentage DECIMAL(5,2),
    interest_rate DECIMAL(5,2),
    loan_term_months INTEGER,
    closing_date DATE,
    conditions TEXT[],
    
    -- Financial outcomes
    total_cost BIGINT,
    monthly_payment BIGINT,
    total_interest BIGINT,
    total_taxes BIGINT,
    net_amount BIGINT,
    
    -- Metrics
    roi_percentage DECIMAL(5,2),
    affordability_score INTEGER CHECK (affordability_score >= 0 AND affordability_score <= 100),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    
    -- Comparison data
    comparison_data JSONB DEFAULT '{}',
    advantages JSONB DEFAULT '[]',
    disadvantages JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_favorite BOOLEAN DEFAULT FALSE,
    
    -- Created by
    created_by UUID REFERENCES public.profiles(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for scenarios
CREATE INDEX IF NOT EXISTS idx_negotiation_scenarios_negotiation_id ON public.negotiation_scenarios(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_scenarios_type ON public.negotiation_scenarios(scenario_type);
CREATE INDEX IF NOT EXISTS idx_negotiation_scenarios_active ON public.negotiation_scenarios(is_active);

-- ============================================
-- 7. NEGOTIATION PARTICIPANTS
-- ============================================
-- Track all users involved in a negotiation with their roles and permissions
CREATE TABLE IF NOT EXISTS public.negotiation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    negotiation_id UUID NOT NULL REFERENCES public.negotiations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    
    -- Role and representation
    role VARCHAR(20) NOT NULL CHECK (role IN ('buyer', 'seller', 'lawyer', 'agent', 'witness', 'observer', 'admin')),
    representation_type VARCHAR(50), -- 'self', 'power_of_attorney', 'legal_representative', etc.
    representation_document_id UUID REFERENCES public.legal_documents(id),
    
    -- Permissions
    can_view_documents BOOLEAN DEFAULT TRUE,
    can_edit_documents BOOLEAN DEFAULT FALSE,
    can_sign_documents BOOLEAN DEFAULT FALSE,
    can_create_offers BOOLEAN DEFAULT FALSE,
    can_view_financials BOOLEAN DEFAULT FALSE,
    can_send_messages BOOLEAN DEFAULT TRUE,
    can_view_chat BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    -- Notification preferences
    notify_on_offers BOOLEAN DEFAULT TRUE,
    notify_on_documents BOOLEAN DEFAULT TRUE,
    notify_on_messages BOOLEAN DEFAULT TRUE,
    notify_on_actions BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(negotiation_id, user_id)
);

-- Indexes for participants
CREATE INDEX IF NOT EXISTS idx_negotiation_participants_negotiation_id ON public.negotiation_participants(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_participants_user_id ON public.negotiation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_participants_role ON public.negotiation_participants(role);
CREATE INDEX IF NOT EXISTS idx_negotiation_participants_active ON public.negotiation_participants(is_active);

-- ============================================
-- 8. RLS POLICIES
-- ============================================

-- Negotiation Actions RLS
ALTER TABLE public.negotiation_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view actions in their negotiations" ON public.negotiation_actions;
CREATE POLICY "Users can view actions in their negotiations" ON public.negotiation_actions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.negotiation_participants np
            WHERE np.negotiation_id = negotiation_actions.negotiation_id
            AND np.user_id = auth.uid()
            AND np.is_active = TRUE
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Users can create actions in their negotiations" ON public.negotiation_actions;
CREATE POLICY "Users can create actions in their negotiations" ON public.negotiation_actions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.negotiation_participants np
            WHERE np.negotiation_id = negotiation_actions.negotiation_id
            AND np.user_id = auth.uid()
            AND np.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Users can update actions in their negotiations" ON public.negotiation_actions;
CREATE POLICY "Users can update actions in their negotiations" ON public.negotiation_actions
    FOR UPDATE
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.negotiation_participants np
            WHERE np.negotiation_id = negotiation_actions.negotiation_id
            AND np.user_id = auth.uid()
            AND np.role IN ('lawyer', 'agent', 'admin')
            AND np.is_active = TRUE
        )
    );

-- Document Signatures RLS
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view signatures in their negotiations" ON public.document_signatures;
CREATE POLICY "Users can view signatures in their negotiations" ON public.document_signatures
    FOR SELECT
    USING (
        signer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.negotiation_participants np
            WHERE np.negotiation_id = document_signatures.negotiation_id
            AND np.user_id = auth.uid()
            AND np.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Users can create signatures for themselves" ON public.document_signatures;
CREATE POLICY "Users can create signatures for themselves" ON public.document_signatures
    FOR INSERT
    WITH CHECK (signer_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own signatures" ON public.document_signatures;
CREATE POLICY "Users can update their own signatures" ON public.document_signatures
    FOR UPDATE
    USING (signer_id = auth.uid());

-- Negotiation Chats RLS
ALTER TABLE public.negotiation_chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view chats in their negotiations" ON public.negotiation_chats;
CREATE POLICY "Users can view chats in their negotiations" ON public.negotiation_chats
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.negotiation_participants np
            WHERE np.negotiation_id = negotiation_chats.negotiation_id
            AND np.user_id = auth.uid()
            AND np.is_active = TRUE
            AND np.can_view_chat = TRUE
        )
    );

DROP POLICY IF EXISTS "Users can send messages in their negotiations" ON public.negotiation_chats;
CREATE POLICY "Users can send messages in their negotiations" ON public.negotiation_chats
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.negotiation_participants np
            WHERE np.negotiation_id = negotiation_chats.negotiation_id
            AND np.user_id = auth.uid()
            AND np.is_active = TRUE
            AND np.can_send_messages = TRUE
        )
    );

DROP POLICY IF EXISTS "Users can update their own messages" ON public.negotiation_chats;
CREATE POLICY "Users can update their own messages" ON public.negotiation_chats
    FOR UPDATE
    USING (sender_id = auth.uid());

-- Negotiation Reports RLS
ALTER TABLE public.negotiation_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view reports in their negotiations" ON public.negotiation_reports;
CREATE POLICY "Users can view reports in their negotiations" ON public.negotiation_reports
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.negotiation_participants np
            WHERE np.negotiation_id = negotiation_reports.negotiation_id
            AND np.user_id = auth.uid()
            AND np.is_active = TRUE
            AND np.can_view_financials = TRUE
        )
    );

-- Negotiation Scenarios RLS
ALTER TABLE public.negotiation_scenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view scenarios in their negotiations" ON public.negotiation_scenarios;
CREATE POLICY "Users can view scenarios in their negotiations" ON public.negotiation_scenarios
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.negotiation_participants np
            WHERE np.negotiation_id = negotiation_scenarios.negotiation_id
            AND np.user_id = auth.uid()
            AND np.is_active = TRUE
        )
    );

-- Negotiation Participants RLS
ALTER TABLE public.negotiation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view participants in their negotiations" ON public.negotiation_participants;
CREATE POLICY "Users can view participants in their negotiations" ON public.negotiation_participants
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.negotiation_participants np
            WHERE np.negotiation_id = negotiation_participants.negotiation_id
            AND np.user_id = auth.uid()
            AND np.is_active = TRUE
        )
    );

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Function to automatically add participants when negotiation is created
CREATE OR REPLACE FUNCTION add_negotiation_participants()
RETURNS TRIGGER AS $$
BEGIN
    -- Add buyer
    INSERT INTO public.negotiation_participants (negotiation_id, user_id, role, can_create_offers, can_sign_documents, can_view_financials)
    VALUES (NEW.id, NEW.buyer_id, 'buyer', TRUE, TRUE, TRUE)
    ON CONFLICT (negotiation_id, user_id) DO NOTHING;
    
    -- Add seller
    INSERT INTO public.negotiation_participants (negotiation_id, user_id, role, can_sign_documents, can_view_financials)
    VALUES (NEW.id, NEW.seller_id, 'seller', TRUE, TRUE)
    ON CONFLICT (negotiation_id, user_id) DO NOTHING;
    
    -- Add lawyer if assigned
    IF NEW.lawyer_id IS NOT NULL THEN
        INSERT INTO public.negotiation_participants (negotiation_id, user_id, role, can_edit_documents, can_sign_documents, can_view_financials)
        VALUES (NEW.id, NEW.lawyer_id, 'lawyer', TRUE, TRUE, TRUE)
        ON CONFLICT (negotiation_id, user_id) DO NOTHING;
    END IF;
    
    -- Add agent if assigned
    IF NEW.agent_id IS NOT NULL THEN
        INSERT INTO public.negotiation_participants (negotiation_id, user_id, role, can_view_financials)
        VALUES (NEW.id, NEW.agent_id, 'agent', TRUE)
        ON CONFLICT (negotiation_id, user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_add_negotiation_participants ON public.negotiations;
CREATE TRIGGER trigger_add_negotiation_participants
    AFTER INSERT ON public.negotiations
    FOR EACH ROW
    EXECUTE FUNCTION add_negotiation_participants();

-- Function to update negotiation progress based on actions
CREATE OR REPLACE FUNCTION update_negotiation_progress(p_negotiation_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_progress INTEGER := 0;
    v_total_actions INTEGER;
    v_completed_actions INTEGER;
    v_milestones_completed INTEGER;
BEGIN
    -- Count actions
    SELECT COUNT(*) INTO v_total_actions
    FROM public.negotiation_actions
    WHERE negotiation_id = p_negotiation_id;
    
    SELECT COUNT(*) INTO v_completed_actions
    FROM public.negotiation_actions
    WHERE negotiation_id = p_negotiation_id
    AND status = 'completed';
    
    SELECT COUNT(*) INTO v_milestones_completed
    FROM public.negotiation_actions
    WHERE negotiation_id = p_negotiation_id
    AND status = 'completed'
    AND is_milestone = TRUE;
    
    -- Calculate progress (40% from actions, 30% from milestones, 30% from offers/documents)
    IF v_total_actions > 0 THEN
        v_progress := v_progress + (v_completed_actions * 40 / v_total_actions);
    END IF;
    
    IF v_milestones_completed > 0 THEN
        v_progress := v_progress + (v_milestones_completed * 30 / GREATEST(v_total_actions, 1));
    END IF;
    
    -- Update negotiation
    UPDATE public.negotiations
    SET negotiation_progress = LEAST(v_progress, 100),
        updated_at = NOW()
    WHERE id = p_negotiation_id;
    
    RETURN v_progress;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update progress when action status changes
CREATE OR REPLACE FUNCTION trigger_update_negotiation_progress()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_negotiation_progress(COALESCE(NEW.negotiation_id, OLD.negotiation_id));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_progress_on_action ON public.negotiation_actions;
CREATE TRIGGER trigger_update_progress_on_action
    AFTER INSERT OR UPDATE ON public.negotiation_actions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_negotiation_progress();

-- Grant permissions
GRANT ALL ON public.negotiation_actions TO authenticated;
GRANT ALL ON public.document_signatures TO authenticated;
GRANT ALL ON public.negotiation_chats TO authenticated;
GRANT ALL ON public.negotiation_reports TO authenticated;
GRANT ALL ON public.negotiation_scenarios TO authenticated;
GRANT ALL ON public.negotiation_participants TO authenticated;

