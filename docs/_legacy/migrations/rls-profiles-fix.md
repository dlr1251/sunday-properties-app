# Profiles Table RLS Policies Fix

## Problem

The profiles table RLS policies were causing infinite recursion when checking admin roles. The issue occurred because:

1. Admin policies queried the `profiles` table to check if a user is an admin
2. When accessing the `profiles` table, RLS policies are evaluated
3. The admin check policy would query `profiles` again, causing infinite recursion

### Example of Problematic Policy (Before)

```sql
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
```

## Solution

We fixed this by:

1. **Replacing recursive queries with JWT claim checks**: Instead of querying the `profiles` table, admin policies now check JWT claims using `auth.jwt() ->> 'role'`
2. **Syncing profile roles to JWT claims**: Added triggers to automatically sync `profiles.role` to `auth.users.raw_app_meta_data` so JWT tokens include the role
3. **Fixing all affected tables**: Updated RLS policies on `cases`, `case_documents`, `chat_messages`, `blog_posts`, and `negotiations` to use JWT claims instead of recursive queries

### Fixed Policy (After)

```sql
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'super_admin'
  );
```

## Changes Made

### 1. Main Migration File (`20240101000001_02_rls_policies.sql`)

- Fixed profiles table policies to use JWT claims
- Fixed cases table policies (removed recursive `profiles` queries)
- Fixed case_documents table policies
- Fixed chat_messages table policies
- Fixed blog_posts table policies
- Fixed negotiations table policies

### 2. Functions & Triggers (`20240101000002_03_functions_triggers.sql`)

Added two new functions and triggers:

- **`sync_profile_role_to_jwt()`**: Syncs `profiles.role` to `auth.users.raw_app_meta_data` when role changes
- **`sync_profile_role_on_insert()`**: Syncs role on profile creation
- Triggers automatically update JWT claims when profiles are created or updated

### 3. Fix Script (`supabase/fix/fix_rls_policies.sql`)

- One-time script to fix existing databases
- Drops and recreates all profiles RLS policies
- Syncs existing profile roles to auth.users.app_metadata

## How It Works

1. **When a profile is created or updated**: The trigger automatically updates `auth.users.raw_app_meta_data` with the role
2. **When a user authenticates**: Supabase includes `raw_app_meta_data` in the JWT token
3. **RLS policies check JWT**: Policies use `auth.jwt() ->> 'role'` to check admin status without querying the database

## Important Notes

### JWT Claims Configuration

For this to work, ensure that `raw_app_meta_data` is included in JWT tokens. This is typically enabled by default in Supabase, but you can verify in your Supabase dashboard under Authentication > Settings > JWT Settings.

### Existing Users

After applying the migration, existing users will have their roles synced to JWT claims automatically. The fix script includes a one-time sync for existing profiles.

### Role Updates

When updating a user's role:
- Update the `profiles` table (as usual)
- The trigger will automatically sync to `auth.users.raw_app_meta_data`
- The user will need to refresh their token to get the new role in their JWT

### Fallback Behavior

If JWT claims are not set:
- Admin policies won't match (safe fallback)
- Users can still access their own profiles
- Service role still has full access

## Testing

To test the fix:

1. **Run the migration**:
   ```bash
   supabase migration up
   ```

2. **Or apply the fix script** (for existing databases):
   ```bash
   psql -f supabase/fix/fix_rls_policies.sql
   ```

3. **Test profiles access**:
   ```bash
   node scripts/test-profiles-access.js
   ```

## Files Modified

- `supabase/migrations/20240101000001_02_rls_policies.sql` - Fixed all recursive RLS policies
- `supabase/migrations/20240101000002_03_functions_triggers.sql` - Added JWT sync functions
- `supabase/fix/fix_rls_policies.sql` - One-time fix script

## Related Issues

- Infinite recursion errors when accessing profiles table
- Admin users unable to view/manage other profiles
- RLS policy evaluation failures

