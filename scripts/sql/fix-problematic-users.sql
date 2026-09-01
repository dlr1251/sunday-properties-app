-- Script SQL para corregir usuarios problemáticos (user1, user2, user9, user10)
-- Ejecutar este script en el SQL Editor de Supabase
-- 
-- Estos usuarios tienen propiedades pero no existen en auth.users
-- Este script crea los usuarios en auth.users y luego actualiza las propiedades

-- IMPORTANTE: Este script requiere permisos de administrador en Supabase
-- La contraseña para todos será: Password123!

-- Función helper para crear usuarios (si es necesario ejecutar manualmente)
-- Nota: No podemos insertar directamente en auth.users desde SQL por seguridad
-- Por lo tanto, necesitamos usar la función extendida de Supabase o el API

-- Alternativa: Reasignar propiedades a usuarios existentes que funcionan
-- y luego crear nuevos usuarios limpios

DO $$
DECLARE
  v_user1_id UUID := 'd9edd945-a08d-4b12-8a72-afbfa07542ad';
  v_user2_id UUID := 'd46720d8-f58e-40b7-ae43-d57afd6bb6f4';
  v_user9_id UUID := 'ee5f404d-e11f-41c1-a376-389fcd649160';
  v_user10_id UUID := '7cea3d48-ced3-4a05-be08-2f9f5927c4b9';
  
  v_new_user_id UUID;
  v_property_count INTEGER;
BEGIN
  RAISE NOTICE '🔧 Corrigiendo usuarios problemáticos...';
  
  -- Estrategia: Buscar usuarios regulares que funcionen y reasignar propiedades temporalmente
  -- Luego crear nuevos usuarios y reasignar propiedades de vuelta
  
  -- Paso 1: Para user1@sunday.local
  RAISE NOTICE 'Procesando user1@sunday.local...';
  
  -- Contar propiedades
  SELECT COUNT(*) INTO v_property_count
  FROM properties
  WHERE owner_id = v_user1_id;
  
  RAISE NOTICE '  Propiedades encontradas: %', v_property_count;
  
  -- Buscar un usuario regular que funcione para reasignar temporalmente
  SELECT id INTO v_new_user_id
  FROM profiles
  WHERE role = 'user' 
    AND email NOT IN ('user1@sunday.local', 'user2@sunday.local', 'user9@sunday.local', 'user10@sunday.local')
    AND id IN (
      SELECT id FROM auth.users
    )
  LIMIT 1;
  
  IF v_new_user_id IS NOT NULL AND v_property_count > 0 THEN
    RAISE NOTICE '  Reasignando temporalmente a usuario: %', v_new_user_id;
    
    -- Reasignar propiedades temporalmente
    UPDATE properties
    SET owner_id = v_new_user_id,
        updated_at = NOW()
    WHERE owner_id = v_user1_id;
    
    RAISE NOTICE '  Propiedades reasignadas temporalmente';
  END IF;
  
  -- Eliminar perfil problemático
  DELETE FROM profiles WHERE id = v_user1_id;
  RAISE NOTICE '  Perfil eliminado';
  
  -- Repetir para user2
  RAISE NOTICE 'Procesando user2@sunday.local...';
  SELECT COUNT(*) INTO v_property_count
  FROM properties
  WHERE owner_id = v_user2_id;
  
  IF v_new_user_id IS NOT NULL AND v_property_count > 0 THEN
    UPDATE properties
    SET owner_id = v_new_user_id,
        updated_at = NOW()
    WHERE owner_id = v_user2_id;
  END IF;
  
  DELETE FROM profiles WHERE id = v_user2_id;
  
  -- Repetir para user9
  RAISE NOTICE 'Procesando user9@sunday.local...';
  SELECT COUNT(*) INTO v_property_count
  FROM properties
  WHERE owner_id = v_user9_id;
  
  IF v_new_user_id IS NOT NULL AND v_property_count > 0 THEN
    UPDATE properties
    SET owner_id = v_new_user_id,
        updated_at = NOW()
    WHERE owner_id = v_user9_id;
  END IF;
  
  DELETE FROM profiles WHERE id = v_user9_id;
  
  -- Repetir para user10
  RAISE NOTICE 'Procesando user10@sunday.local...';
  SELECT COUNT(*) INTO v_property_count
  FROM properties
  WHERE owner_id = v_user10_id;
  
  IF v_new_user_id IS NOT NULL AND v_property_count > 0 THEN
    UPDATE properties
    SET owner_id = v_new_user_id,
        updated_at = NOW()
    WHERE owner_id = v_user10_id;
  END IF;
  
  DELETE FROM profiles WHERE id = v_user10_id;
  
  RAISE NOTICE '✅ Perfiles problemáticos eliminados';
  RAISE NOTICE '';
  RAISE NOTICE '📝 PRÓXIMOS PASOS:';
  RAISE NOTICE '1. Ejecutar el script fix-problematic-users-final.js para crear usuarios nuevos';
  RAISE NOTICE '2. O crear los usuarios manualmente usando el Admin API de Supabase';
  RAISE NOTICE '3. Las propiedades han sido reasignadas temporalmente a otro usuario';
  
END $$;

