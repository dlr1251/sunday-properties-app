-- Script SQL para confirmar todos los usuarios de prueba
-- Ejecutar este script en el SQL Editor de Supabase

-- Confirmar todos los usuarios de prueba en auth.users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email IN (
  'juan.perez.test@mailinator.com',
  'maria.garcia.test@mailinator.com',
  'carlos.rodriguez.test@mailinator.com',
  'ana.martinez.test@mailinator.com',
  'luis.hernandez.test@mailinator.com',
  'sofia.lopez.test@mailinator.com',
  'diego.gonzalez.test@mailinator.com',
  'valentina.ramirez.test@mailinator.com',
  'santiago.torres.test@mailinator.com',
  'isabella.jimenez.test@mailinator.com'
);

-- Verificar que los usuarios fueron confirmados
SELECT 
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email IN (
  'juan.perez.test@mailinator.com',
  'maria.garcia.test@mailinator.com',
  'carlos.rodriguez.test@mailinator.com',
  'ana.martinez.test@mailinator.com',
  'luis.hernandez.test@mailinator.com',
  'sofia.lopez.test@mailinator.com',
  'diego.gonzalez.test@mailinator.com',
  'valentina.ramirez.test@mailinator.com',
  'santiago.torres.test@mailinator.com',
  'isabella.jimenez.test@mailinator.com'
)
ORDER BY created_at DESC;
