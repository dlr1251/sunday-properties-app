-- ============================================
-- 01 BASE SCHEMA - Consolidated Migration
-- ============================================
-- This migration consolidates all base tables: profiles, properties, visits, offers, cases, etc.
-- Sources consolidated:
--   - 20251020090000_create_profiles_table.sql
--   - 20251021140000_initial_schema.sql
--   - 20251021150000_properties_and_business_logic.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Extends auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'agent', 'lawyer', 'admin', 'super_admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON profiles(status);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at);

-- Enable RLS for profiles (policies will be added in 02_rls_policies.sql)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    address VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    coordinates JSONB NOT NULL,
    bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
    bathrooms INTEGER NOT NULL CHECK (bathrooms >= 0),
    area INTEGER NOT NULL CHECK (area > 0),
    parking INTEGER DEFAULT 0 CHECK (parking >= 0),
    floor INTEGER,
    total_floors INTEGER,
    year_built INTEGER,
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('apartment', 'house', 'townhouse', 'office', 'commercial')),
    strata INTEGER CHECK (strata >= 1 AND strata <= 6),
    price BIGINT NOT NULL CHECK (price > 0),
    minimum_offer_price BIGINT,
    monthly_costs INTEGER,
    accepts_crypto BOOLEAN DEFAULT FALSE,
    financing BOOLEAN DEFAULT FALSE,
    visit_price INTEGER DEFAULT 49000 CHECK (visit_price > 0),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'sold', 'rented', 'archived')),
    verified BOOLEAN DEFAULT FALSE,
    premium BOOLEAN DEFAULT FALSE,
    images TEXT[] DEFAULT '{}',
    virtual_tour TEXT,
    freedom_tradition TEXT,
    legal_documents TEXT[] DEFAULT '{}',
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);

-- Enable RLS for properties (policies will be added in 02_rls_policies.sql)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VISITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    visitor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
    visit_price INTEGER NOT NULL CHECK (visit_price > 0),
    paid BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'crypto')),
    nda_accepted BOOLEAN DEFAULT FALSE,
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    documents_unlocked BOOLEAN DEFAULT FALSE,
    reschedule_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Visits indexes
CREATE INDEX IF NOT EXISTS idx_visits_property ON visits(property_id);
CREATE INDEX IF NOT EXISTS idx_visits_visitor ON visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_scheduled_date ON visits(scheduled_date);

-- Enable RLS for visits (policies will be added in 02_rls_policies.sql)
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- ============================================
-- OFFERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    offer_price BIGINT NOT NULL CHECK (offer_price > 0),
    original_price BIGINT NOT NULL CHECK (original_price > 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'financing', 'crypto', 'mixed', 'bank_transfer', 'installments')),
    financing_details JSONB,
    crypto_details JSONB,
    closing_date DATE NOT NULL,
    conditions TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'expired')),
    counter_offer JSONB,
    metrics JSONB,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers indexes
CREATE INDEX IF NOT EXISTS idx_offers_property ON offers(property_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_expires_at ON offers(expires_at);

-- Enable RLS for offers (policies will be added in 02_rls_policies.sql)
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lawyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    case_number VARCHAR(50) UNIQUE,
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending', 'on_hold')),
    start_date DATE DEFAULT CURRENT_DATE,
    expected_close_date DATE,
    actual_close_date DATE,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases indexes
CREATE INDEX IF NOT EXISTS idx_cases_lawyer ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_buyer ON cases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_seller ON cases(seller_id);
CREATE INDEX IF NOT EXISTS idx_cases_property ON cases(property_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);

-- Enable RLS for cases (policies will be added in 02_rls_policies.sql)
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CASE DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.case_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('promesa', 'otrosi', 'oferta', 'escritura', 'legal', 'other')),
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT,
    document_content TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'signed', 'finalized', 'archived')),
    signed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    signed_at TIMESTAMP WITH TIME ZONE,
    signature_data JSONB,
    version INTEGER DEFAULT 1,
    file_size BIGINT,
    file_type VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    modified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case documents indexes
CREATE INDEX IF NOT EXISTS idx_case_documents_case ON case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_type ON case_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_case_documents_status ON case_documents(status);

-- Enable RLS for case_documents (policies will be added in 02_rls_policies.sql)
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'document', 'image', 'system')),
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB DEFAULT '[]',
    is_system_message BOOLEAN DEFAULT FALSE,
    document_url TEXT,
    document_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_case ON chat_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON chat_messages(read);

-- Enable RLS for chat_messages (policies will be added in 02_rls_policies.sql)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BLOG POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    featured_image TEXT,
    view_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

-- Enable RLS for blog_posts (policies will be added in 02_rls_policies.sql)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON favorites(property_id);

-- Enable RLS for favorites (policies will be added in 02_rls_policies.sql)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'visit_scheduled', 'offer_received', 'offer_accepted', 'offer_rejected',
        'counter_offer', 'contract_ready', 'payment_received', 'negotiation_update',
        'system'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    related_id UUID,
    related_type VARCHAR(50) CHECK (related_type IN ('property', 'offer', 'visit', 'contract', 'negotiation')),
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Enable RLS for notifications (policies will be added in 02_rls_policies.sql)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

