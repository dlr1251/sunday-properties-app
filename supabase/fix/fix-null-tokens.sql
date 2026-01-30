-- ============================================
-- FIX ALL NULL STRING COLUMNS IN AUTH.USERS
-- ============================================
-- The error: "converting NULL to string is unsupported"
-- Solution: Replace NULL with empty string for ALL string columns
-- ============================================

-- Fix ALL string columns that might be NULL
UPDATE auth.users SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    email_change = COALESCE(email_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    phone_change = COALESCE(phone_change, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
WHERE 
    confirmation_token IS NULL OR
    recovery_token IS NULL OR
    email_change_token_new IS NULL OR
    email_change_token_current IS NULL OR
    email_change IS NULL OR
    phone_change_token IS NULL OR
    phone_change IS NULL OR
    reauthentication_token IS NULL;

-- Verify the fix
SELECT 'Fixed users:' as status;
SELECT 
    id, 
    email,
    confirmation_token,
    recovery_token
FROM auth.users 
WHERE email LIKE '%@sunday.com'
LIMIT 5;

SELECT '
╔══════════════════════════════════════════════════════════════════╗
║              ✅ NULL TOKENS FIXED                                ║
╠══════════════════════════════════════════════════════════════════╣
║  All NULL token columns have been replaced with empty strings.   ║
║                                                                  ║
║  TRY LOGGING IN NOW!                                             ║
╚══════════════════════════════════════════════════════════════════╝
' as result;
