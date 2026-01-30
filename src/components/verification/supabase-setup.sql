-- Script de configuración para Supabase Storage y Tablas de Verificación
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear el bucket para documentos de perfil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-docs',
  'profile-docs',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
);

-- 2. Crear tabla de solicitudes de verificación si no existe
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  data JSONB,
  selfie_path TEXT,
  id_doc_path TEXT,
  poa_doc_path TEXT,
  is_owner BOOLEAN DEFAULT true,
  has_poa BOOLEAN DEFAULT false,
  notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_created_at ON verification_requests(created_at);

-- 4. Política RLS para el bucket de storage
-- Permitir a usuarios autenticados subir sus propios archivos
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir a usuarios autenticados ver sus propios archivos
CREATE POLICY "Users can view their own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir a administradores ver todos los archivos
CREATE POLICY "Admins can view all verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-docs' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- 5. Política RLS para la tabla de verification_requests
-- Permitir a usuarios crear sus propias solicitudes
CREATE POLICY "Users can create their own verification requests"
ON verification_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Permitir a usuarios ver sus propias solicitudes
CREATE POLICY "Users can view their own verification requests"
ON verification_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Permitir a administradores ver todas las solicitudes
CREATE POLICY "Admins can view all verification requests"
ON verification_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Permitir a administradores actualizar solicitudes
CREATE POLICY "Admins can update verification requests"
ON verification_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- 6. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Trigger para actualizar updated_at en verification_requests
CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Verificar que todo esté configurado correctamente
SELECT 
  'Storage Bucket' as component,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'profile-docs') 
    THEN 'OK' 
    ELSE 'MISSING' 
  END as status
UNION ALL
SELECT 
  'Verification Table' as component,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'verification_requests') 
    THEN 'OK' 
    ELSE 'MISSING' 
  END as status
UNION ALL
SELECT 
  'Storage Policies' as component,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%verification%') 
    THEN 'OK' 
    ELSE 'MISSING' 
  END as status;
