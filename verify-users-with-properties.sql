-- Script SQL para verificar todos los usuarios que tienen propiedades
-- Ejecutar este script en el SQL Editor de Supabase

-- Paso 1: Verificar todos los usuarios que tienen al menos una propiedad
UPDATE profiles 
SET 
  verification_status = 'verified',
  updated_at = NOW()
WHERE id IN (
  SELECT DISTINCT owner_id 
  FROM properties 
  WHERE owner_id IS NOT NULL
);

-- Paso 2: Verificar que los usuarios fueron verificados
-- Mostrar todos los usuarios con propiedades y su estado de verificación
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.verification_status,
  COUNT(pr.id) as properties_count,
  p.updated_at
FROM profiles p
INNER JOIN properties pr ON pr.owner_id = p.id
GROUP BY p.id, p.email, p.full_name, p.verification_status, p.updated_at
ORDER BY p.updated_at DESC;

-- Paso 3: Mostrar resumen de usuarios verificados
SELECT 
  verification_status,
  COUNT(*) as user_count
FROM profiles
WHERE id IN (
  SELECT DISTINCT owner_id 
  FROM properties 
  WHERE owner_id IS NOT NULL
)
GROUP BY verification_status;

