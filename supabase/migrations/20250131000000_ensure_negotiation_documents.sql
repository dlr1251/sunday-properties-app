-- Ensure negotiation_documents table exists (fix: "Could not find the table 'public.negotiation_documents' in the schema cache")
-- Safe to run multiple times (IF NOT EXISTS / DROP IF EXISTS).

CREATE TABLE IF NOT EXISTS public.negotiation_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    negotiation_id UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('promise_of_sale', 'promesa', 'otrosi', 'oferta', 'escritura', 'legal', 'other')),
    content JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    document_url TEXT,
    document_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'signed', 'finalized', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_negotiation_documents_negotiation_id ON public.negotiation_documents(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_documents_kind ON public.negotiation_documents(kind);
CREATE INDEX IF NOT EXISTS idx_negotiation_documents_status ON public.negotiation_documents(status);

ALTER TABLE public.negotiation_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view documents" ON public.negotiation_documents;
DROP POLICY IF EXISTS "Participants can manage documents" ON public.negotiation_documents;
DROP POLICY IF EXISTS "participants read documents" ON public.negotiation_documents;
DROP POLICY IF EXISTS "participants upsert documents" ON public.negotiation_documents;

CREATE POLICY "Participants can view documents" ON public.negotiation_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.negotiations n
            WHERE n.id = negotiation_documents.negotiation_id
            AND (auth.uid() = ANY(n.participants) OR auth.uid()::text = n.buyer_id::text OR auth.uid()::text = n.seller_id::text OR auth.uid()::text = n.lawyer_id::text)
        )
    );

CREATE POLICY "Participants can manage documents" ON public.negotiation_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.negotiations n
            WHERE n.id = negotiation_documents.negotiation_id
            AND (auth.uid() = ANY(n.participants) OR auth.uid()::text = updated_by::text OR auth.uid()::text = n.lawyer_id::text OR auth.uid()::text = n.buyer_id::text OR auth.uid()::text = n.seller_id::text)
        )
    );

DROP TRIGGER IF EXISTS trg_negotiation_documents_updated_at ON public.negotiation_documents;
CREATE TRIGGER trg_negotiation_documents_updated_at
    BEFORE UPDATE ON public.negotiation_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.negotiation_documents IS 'Documents (e.g. promesa) linked to a negotiation.';
