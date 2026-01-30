-- Simplified Schema for Supabase - Sunday Properties
-- Execute this in the Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar TEXT,
    user_type VARCHAR(20) DEFAULT 'registered' CHECK (user_type IN ('visitor', 'registered', 'verified', 'premium', 'admin', 'lawyer', 'superadmin')),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{}'
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
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
    owner_id UUID NOT NULL REFERENCES users(id),
    agent_id UUID REFERENCES users(id),
    tags TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Visits table
CREATE TABLE IF NOT EXISTS visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id),
    visitor_id UUID NOT NULL REFERENCES users(id),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    lawyer_id UUID REFERENCES users(id),
    offer_price BIGINT NOT NULL CHECK (offer_price > 0),
    original_price BIGINT NOT NULL CHECK (original_price > 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'financing', 'crypto', 'mixed')),
    financing_details JSONB,
    crypto_details JSONB,
    closing_date DATE NOT NULL,
    conditions TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'expired')),
    counter_offer JSONB,
    metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lawyer_id UUID NOT NULL REFERENCES users(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case documents table
CREATE TABLE IF NOT EXISTS case_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES cases(id),
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('promesa', 'otrosi', 'oferta', 'escritura', 'legal')),
    document_url TEXT NOT NULL,
    signed_by UUID REFERENCES users(id),
    signed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'signed', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    modified_by UUID REFERENCES users(id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES cases(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'document', 'image', 'system')),
    document_url TEXT,
    document_name VARCHAR(255)
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured_image TEXT,
    tags TEXT[] DEFAULT '{}',
    category VARCHAR(50) DEFAULT 'general',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('visit_scheduled', 'offer_received', 'offer_accepted', 'contract_ready', 'payment_received')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    related_id UUID,
    related_type VARCHAR(50) CHECK (related_type IN ('property', 'offer', 'visit', 'contract')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_visits_property ON visits(property_id);
CREATE INDEX IF NOT EXISTS idx_visits_visitor ON visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_offers_property ON offers(property_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_case ON case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_case ON chat_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
