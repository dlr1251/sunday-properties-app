-- Create verification_requests table
-- This table was missing but referenced in the optimize_user_queries migration

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Document fields
  document_type VARCHAR(20) CHECK (document_type IN ('passport', 'cedula', 'cedula_extranjeria', 'other')),
  id_doc_url TEXT,
  selfie_url TEXT,
  poa_doc_url TEXT,
  -- Personal information
  full_name VARCHAR(255),
  dob DATE,
  nationality VARCHAR(100),
  phone VARCHAR(20),
  location TEXT,
  -- User type information
  is_owner BOOLEAN DEFAULT true,
  has_poa BOOLEAN DEFAULT false,
  -- Discovery and purpose (JSON for flexible storage)
  how_did_you_find_us JSONB DEFAULT '[]'::jsonb,
  what_do_you_want_to_do JSONB DEFAULT '[]'::jsonb,
  -- Status and review
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id_status ON verification_requests(user_id, status);

-- Enable RLS
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification requests" ON verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification requests" ON verification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update verification requests" ON verification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE verification_requests IS 'User verification requests with personal information and documents';
COMMENT ON COLUMN verification_requests.document_type IS 'Type of identity document submitted';
COMMENT ON COLUMN verification_requests.id_doc_url IS 'URL to the uploaded identity document';
COMMENT ON COLUMN verification_requests.selfie_url IS 'URL to the uploaded selfie photo';
COMMENT ON COLUMN verification_requests.poa_doc_url IS 'URL to the uploaded power of attorney document';
COMMENT ON COLUMN verification_requests.full_name IS 'Full name as shown on the document';
COMMENT ON COLUMN verification_requests.dob IS 'Date of birth as shown on the document';
COMMENT ON COLUMN verification_requests.nationality IS 'Nationality as shown on the document';
COMMENT ON COLUMN verification_requests.phone IS 'Phone number provided by the user';
COMMENT ON COLUMN verification_requests.location IS 'Location/address provided by the user';
COMMENT ON COLUMN verification_requests.is_owner IS 'Whether the user is the property owner';
COMMENT ON COLUMN verification_requests.has_poa IS 'Whether the user has power of attorney';
COMMENT ON COLUMN verification_requests.how_did_you_find_us IS 'JSON array of how the user found the platform';
COMMENT ON COLUMN verification_requests.what_do_you_want_to_do IS 'JSON array of user intentions/purposes';
COMMENT ON COLUMN verification_requests.status IS 'Verification status: pending, approved, rejected';
COMMENT ON COLUMN verification_requests.reviewed_by IS 'Admin who reviewed the request';
COMMENT ON COLUMN verification_requests.reviewed_at IS 'When the request was reviewed';
COMMENT ON COLUMN verification_requests.rejection_reason IS 'Reason for rejection if status is rejected';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'verification_requests table created successfully!';
    RAISE NOTICE 'Added indexes and RLS policies';
END $$;
