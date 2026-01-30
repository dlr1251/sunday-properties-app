-- Offer Attachments System

CREATE TABLE IF NOT EXISTS offer_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_offer_attachments_offer_id ON offer_attachments(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_attachments_uploaded_by ON offer_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_offer_attachments_uploaded_at ON offer_attachments(uploaded_at);

-- RLS Policies
ALTER TABLE offer_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments for offers they're involved in
CREATE POLICY offer_attachments_read ON offer_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM offers o
      WHERE o.id = offer_attachments.offer_id
      AND (o.buyer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM properties p WHERE p.id = o.property_id AND p.owner_id = auth.uid()
      ))
    )
  );

-- Users can upload attachments for their offers
CREATE POLICY offer_attachments_insert ON offer_attachments
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM offers o
      WHERE o.id = offer_attachments.offer_id
      AND (o.buyer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM properties p WHERE p.id = o.property_id AND p.owner_id = auth.uid()
      ))
    )
  );

-- Users can delete their own uploads
CREATE POLICY offer_attachments_delete ON offer_attachments
  FOR DELETE USING (uploaded_by = auth.uid());

-- Function to get attachment count for an offer
CREATE OR REPLACE FUNCTION get_offer_attachment_count(offer_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM offer_attachments
    WHERE offer_attachments.offer_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old attachments (for cleanup jobs)
CREATE OR REPLACE FUNCTION cleanup_unused_attachments(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM offer_attachments
  WHERE uploaded_at < NOW() - INTERVAL '1 day' * days_old
  AND offer_id IN (
    SELECT o.id FROM offers o WHERE o.status IN ('cancelled', 'rejected')
  );

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE offer_attachments IS 'File attachments uploaded during offer negotiations';
COMMENT ON COLUMN offer_attachments.file_url IS 'Supabase Storage URL for the file';
COMMENT ON COLUMN offer_attachments.file_type IS 'MIME type of the file (pdf, doc, jpg, etc)';
COMMENT ON FUNCTION get_offer_attachment_count(UUID) IS 'Returns the number of attachments for a given offer';
COMMENT ON FUNCTION cleanup_unused_attachments(INTEGER) IS 'Removes attachments from old cancelled/rejected offers';
