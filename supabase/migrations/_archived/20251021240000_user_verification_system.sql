-- User Verification System Migration
-- Adds email verification, identity verification, and enhanced user management

-- 1. Add verification fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified' 
  CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verification_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);

-- 2. Create verification_documents table
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('passport', 'cedula', 'cedula_extranjeria', 'other')),
  document_url TEXT NOT NULL,
  selfie_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create login_attempts table for future security features
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);

-- 5. Enable RLS on new tables
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for verification_documents
CREATE POLICY "Users can view their own verification documents" ON verification_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification documents" ON verification_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification documents" ON verification_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update verification documents" ON verification_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 7. Create RLS policies for login_attempts
CREATE POLICY "Users can view their own login attempts" ON login_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert login attempts" ON login_attempts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all login attempts" ON login_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 8. Create function to update verification status
CREATE OR REPLACE FUNCTION update_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's verification status when document status changes
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE profiles 
    SET 
      verification_status = 'verified',
      verification_reviewed_at = NOW(),
      verification_reviewed_by = NEW.reviewed_by
    WHERE id = NEW.user_id;
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    UPDATE profiles 
    SET 
      verification_status = 'rejected',
      verification_reviewed_at = NOW(),
      verification_reviewed_by = NEW.reviewed_by,
      verification_rejection_reason = NEW.rejection_reason
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for verification status updates
DROP TRIGGER IF EXISTS update_verification_status_trigger ON verification_documents;
CREATE TRIGGER update_verification_status_trigger
  AFTER UPDATE ON verification_documents
  FOR EACH ROW EXECUTE FUNCTION update_verification_status();

-- 10. Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Add triggers for updated_at
DROP TRIGGER IF EXISTS update_verification_documents_updated_at ON verification_documents;
CREATE TRIGGER update_verification_documents_updated_at
  BEFORE UPDATE ON verification_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Update existing profiles to have email_verified based on auth.users
UPDATE profiles 
SET email_verified = COALESCE(
  (SELECT email_confirmed_at IS NOT NULL FROM auth.users WHERE auth.users.id = profiles.id),
  false
);

-- 13. Add comments for documentation
COMMENT ON COLUMN profiles.email_verified IS 'Whether the user has verified their email address';
COMMENT ON COLUMN profiles.verification_status IS 'Identity verification status: unverified, pending, verified, rejected';
COMMENT ON COLUMN profiles.verification_submitted_at IS 'When the user submitted verification documents';
COMMENT ON COLUMN profiles.verification_reviewed_at IS 'When an admin reviewed the verification';
COMMENT ON COLUMN profiles.verification_reviewed_by IS 'Admin who reviewed the verification';
COMMENT ON COLUMN profiles.verification_rejection_reason IS 'Reason for verification rejection';

COMMENT ON TABLE verification_documents IS 'User identity verification documents and selfies';
COMMENT ON TABLE login_attempts IS 'Login attempt tracking for security monitoring';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'User verification system migration completed successfully!';
    RAISE NOTICE 'Added verification fields to profiles table';
    RAISE NOTICE 'Created verification_documents and login_attempts tables';
    RAISE NOTICE 'Set up RLS policies and triggers';
END $$;
