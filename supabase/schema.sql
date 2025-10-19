-- Scripts SQL para Supabase - Sunday Properties
-- Ejecutar estos scripts en el SQL Editor de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Tabla de usuarios
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Tabla de propiedades
CREATE TABLE properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    address VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    coordinates JSONB NOT NULL, -- {lat: number, lng: number}
    
    -- Características físicas
    bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
    bathrooms INTEGER NOT NULL CHECK (bathrooms >= 0),
    area INTEGER NOT NULL CHECK (area > 0), -- m²
    parking INTEGER DEFAULT 0 CHECK (parking >= 0),
    floor INTEGER,
    total_floors INTEGER,
    year_built INTEGER,
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('apartment', 'house', 'townhouse', 'office', 'commercial')),
    strata INTEGER CHECK (strata >= 1 AND strata <= 6),
    
    -- Precio y condiciones
    price BIGINT NOT NULL CHECK (price > 0),
    minimum_offer_price BIGINT,
    monthly_costs INTEGER,
    accepts_crypto BOOLEAN DEFAULT FALSE,
    financing BOOLEAN DEFAULT FALSE,
    visit_price INTEGER DEFAULT 49000 CHECK (visit_price > 0),
    
    -- Estado y verificación
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'sold', 'rented', 'archived')),
    verified BOOLEAN DEFAULT FALSE,
    premium BOOLEAN DEFAULT FALSE,
    
    -- Multimedia
    images TEXT[] DEFAULT '{}',
    virtual_tour TEXT,
    
    -- Documentos legales
    freedom_tradition TEXT,
    legal_documents TEXT[] DEFAULT '{}',
    
    -- Relaciones
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Metadatos
    tags TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de visitas
CREATE TABLE visits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    visitor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
    
    -- Pago y documentos
    visit_price INTEGER NOT NULL CHECK (visit_price > 0),
    paid BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'crypto')),
    nda_accepted BOOLEAN DEFAULT FALSE,
    
    -- Feedback
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    
    -- Estado de documentos
    documents_unlocked BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de ofertas
CREATE TABLE offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    offer_price BIGINT NOT NULL CHECK (offer_price > 0),
    original_price BIGINT NOT NULL CHECK (original_price > 0),
    
    -- Método de pago
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'financing', 'crypto', 'mixed')),
    financing_details JSONB, -- {downPayment, monthlyPayment, termMonths, interestRate}
    crypto_details JSONB, -- {currency, amount, exchangeRate}
    
    -- Condiciones y fechas
    closing_date DATE NOT NULL,
    conditions TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'expired')),
    
    -- Contraoferta
    counter_offer JSONB, -- {price, conditions, message, createdAt}
    
    -- Métricas financieras
    metrics JSONB NOT NULL, -- {vpn, roi, irr, cashOnCash, riskScore}
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de contratos
CREATE TABLE contracts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    
    -- Detalles del contrato
    contract_type VARCHAR(10) NOT NULL CHECK (contract_type IN ('sale', 'rent')),
    price BIGINT NOT NULL CHECK (price > 0),
    terms TEXT[] DEFAULT '{}',
    
    -- Estado del contrato
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'signed', 'completed', 'cancelled')),
    
    -- Documentos
    contract_document TEXT,
    signatures JSONB DEFAULT '{}', -- {buyer, seller, witness, notary}
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    signed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de notificaciones
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('visit_scheduled', 'offer_received', 'offer_accepted', 'contract_ready', 'payment_received')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    
    -- Datos relacionados
    related_id UUID,
    related_type VARCHAR(20) CHECK (related_type IN ('property', 'offer', 'visit', 'contract')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de análisis financiero
CREATE TABLE financial_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Parámetros de entrada
    purchase_price BIGINT NOT NULL CHECK (purchase_price > 0),
    down_payment BIGINT NOT NULL CHECK (down_payment >= 0),
    monthly_payment INTEGER NOT NULL CHECK (monthly_payment >= 0),
    term_months INTEGER NOT NULL CHECK (term_months > 0),
    interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate >= 0),
    monthly_rent INTEGER,
    annual_appreciation DECIMAL(5,2) DEFAULT 0,
    inflation_rate DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    maintenance_rate DECIMAL(5,2) DEFAULT 0,
    vacancy_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Métricas calculadas
    vpn BIGINT NOT NULL,
    roi DECIMAL(5,2) NOT NULL,
    irr DECIMAL(5,2) NOT NULL,
    cash_on_cash DECIMAL(5,2) NOT NULL,
    cap_rate DECIMAL(5,2) NOT NULL,
    dscr DECIMAL(5,2) NOT NULL,
    risk_score DECIMAL(3,1) NOT NULL CHECK (risk_score >= 1 AND risk_score <= 5),
    break_even_months INTEGER NOT NULL,
    total_return BIGINT NOT NULL,
    monthly_cash_flow INTEGER NOT NULL,
    annual_cash_flow INTEGER NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_coordinates ON properties USING GIST ((coordinates::geometry));

CREATE INDEX idx_visits_property_id ON visits(property_id);
CREATE INDEX idx_visits_visitor_id ON visits(visitor_id);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_scheduled_date ON visits(scheduled_date);

CREATE INDEX idx_offers_property_id ON offers(property_id);
CREATE INDEX idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_expires_at ON offers(expires_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_financial_analysis_property_id ON financial_analysis(property_id);
CREATE INDEX idx_financial_analysis_user_id ON financial_analysis(user_id);

-- Funciones para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabla de roles de usuario con permisos granulares
CREATE TABLE user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_name VARCHAR(50) NOT NULL,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_name)
);

-- Tabla de casos para abogados
CREATE TABLE cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    -- Información del caso
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending', 'on_hold')),
    
    -- Fechas importantes
    start_date DATE DEFAULT CURRENT_DATE,
    expected_close_date DATE,
    actual_close_date DATE,
    
    -- Metadatos
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos de casos
CREATE TABLE case_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('promesa', 'otrosi', 'oferta', 'escritura', 'legal', 'other')),
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT,
    document_content TEXT,
    
    -- Estado del documento
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'signed', 'finalized', 'archived')),
    
    -- Firmas
    signed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    signed_at TIMESTAMP WITH TIME ZONE,
    signature_data JSONB,
    
    -- Metadatos
    version INTEGER DEFAULT 1,
    file_size BIGINT,
    file_type VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes de chat
CREATE TABLE chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Contenido del mensaje
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'document', 'image', 'system')),
    
    -- Estado del mensaje
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Adjuntos
    attachments JSONB DEFAULT '[]',
    
    -- Metadatos
    is_system_message BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de blog posts
CREATE TABLE blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Categorización
    category VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Estado de publicación
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    featured_image TEXT,
    
    -- Estadísticas
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de favoritos
CREATE TABLE favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Notas del usuario
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_analysis_updated_at BEFORE UPDATE ON financial_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_case_documents_updated_at BEFORE UPDATE ON case_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidades)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can view published properties" ON properties FOR SELECT USING (status = 'published');
CREATE POLICY "Owners can manage their properties" ON properties FOR ALL USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can view their own visits" ON visits FOR SELECT USING (auth.uid()::text = visitor_id::text OR auth.uid()::text = (SELECT owner_id FROM properties WHERE id = property_id)::text);
CREATE POLICY "Users can create visits" ON visits FOR INSERT WITH CHECK (auth.uid()::text = visitor_id::text);

CREATE POLICY "Users can view their own offers" ON offers FOR SELECT USING (auth.uid()::text = buyer_id::text OR auth.uid()::text = (SELECT owner_id FROM properties WHERE id = property_id)::text);
CREATE POLICY "Users can create offers" ON offers FOR INSERT WITH CHECK (auth.uid()::text = buyer_id::text);

CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own financial analysis" ON financial_analysis FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create financial analysis" ON financial_analysis FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Políticas para nuevas tablas
CREATE POLICY "Users can view their own roles" ON user_roles FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Superadmin can manage all roles" ON user_roles FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'superadmin')
);

CREATE POLICY "Lawyers can view their assigned cases" ON cases FOR SELECT USING (
    auth.uid()::text = lawyer_id::text OR 
    auth.uid()::text = buyer_id::text OR 
    auth.uid()::text = seller_id::text OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'superadmin')
);
CREATE POLICY "Lawyers can manage their cases" ON cases FOR ALL USING (
    auth.uid()::text = lawyer_id::text OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'superadmin')
);

CREATE POLICY "Case participants can view case documents" ON case_documents FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM cases c 
        WHERE c.id = case_documents.case_id 
        AND (c.lawyer_id = auth.uid() OR c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'superadmin')
);
CREATE POLICY "Lawyers can manage case documents" ON case_documents FOR ALL USING (
    EXISTS (
        SELECT 1 FROM cases c 
        WHERE c.id = case_documents.case_id 
        AND c.lawyer_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'superadmin')
);

CREATE POLICY "Case participants can view chat messages" ON chat_messages FOR SELECT USING (
    auth.uid()::text = sender_id::text OR 
    auth.uid()::text = receiver_id::text OR
    EXISTS (
        SELECT 1 FROM cases c 
        WHERE c.id = chat_messages.case_id 
        AND (c.lawyer_id = auth.uid() OR c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'superadmin')
);
CREATE POLICY "Case participants can send messages" ON chat_messages FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id::text AND (
        auth.uid()::text = receiver_id::text OR
        EXISTS (
            SELECT 1 FROM cases c 
            WHERE c.id = chat_messages.case_id 
            AND (c.lawyer_id = auth.uid() OR c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
    )
);

CREATE POLICY "Anyone can view published blog posts" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Authors can manage their blog posts" ON blog_posts FOR ALL USING (auth.uid()::text = author_id::text);
CREATE POLICY "Superadmin can manage all blog posts" ON blog_posts FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'superadmin')
);

CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage their own favorites" ON favorites FOR ALL USING (auth.uid()::text = user_id::text);

-- Índices para nuevas tablas
CREATE INDEX idx_user_roles_user ON user_roles (user_id);
CREATE INDEX idx_cases_lawyer ON cases (lawyer_id);
CREATE INDEX idx_cases_buyer ON cases (buyer_id);
CREATE INDEX idx_cases_seller ON cases (seller_id);
CREATE INDEX idx_cases_property ON cases (property_id);
CREATE INDEX idx_cases_status ON cases (status);

CREATE INDEX idx_case_documents_case ON case_documents (case_id);
CREATE INDEX idx_case_documents_type ON case_documents (document_type);
CREATE INDEX idx_case_documents_status ON case_documents (status);

CREATE INDEX idx_chat_messages_case ON chat_messages (case_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages (sender_id);
CREATE INDEX idx_chat_messages_receiver ON chat_messages (receiver_id);
CREATE INDEX idx_chat_messages_read ON chat_messages (read);

CREATE INDEX idx_blog_posts_author ON blog_posts (author_id);
CREATE INDEX idx_blog_posts_category ON blog_posts (category);
CREATE INDEX idx_blog_posts_published ON blog_posts (published);
CREATE INDEX idx_blog_posts_slug ON blog_posts (slug);

CREATE INDEX idx_favorites_user ON favorites (user_id);
CREATE INDEX idx_favorites_property ON favorites (property_id);
