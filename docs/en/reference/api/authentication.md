# API — Authentication

Access to session, identity, and user profile via Supabase Auth and the `profiles` table.

## Overview

| Field | Value |
|-------|--------|
| Type | Supabase Auth + `profiles` |
| Client | `createClient` in `src/lib/supabase.ts` |

Authentication uses **Supabase Auth**. The extended profile comes from `profiles` and is exposed via `AuthContext` and the `useAuth` hook.

## Supabase client

```typescript
import { supabase } from '@/lib/supabase';
```

The client is created with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Defaults are used in local development if not set.

## Auth: session and identity

Supabase Auth handles sign-up, sign-in, and session:

- **Email + password**: `signUp`, `signInWithPassword`, `signOut`
- **Session**: `getSession`, `onAuthStateChange`
- **Recovery**: `resetPasswordForEmail`

In the app, `AuthProvider` wraps this flow and exposes:

| Method | Description |
|--------|-------------|
| `signIn(email, password)` | Sign in |
| `signUp(email, password, options?)` | Sign up; `options` may include `name`, `phone`, `role` |
| `signOut()` | Sign out |
| `refreshProfile()` | Reload profile from `profiles` |

## Profile (`profiles`)

After sign-in, the profile is read from `profiles` with `id = auth.uid()`. Relevant fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Matches `auth.users.id` |
| `full_name` | string | Full name |
| `email` | string | Email (may sync from Auth) |
| `phone` | string | Phone |
| `role` | enum | `user`, `agent`, `lawyer`, `admin`, `super_admin` |
| `status` | enum | `active`, `inactive`, `suspended`, `pending` |
| `verification_status` | string | Identity verification state |
| `avatar_url` | string | Avatar URL |

Access to `profiles` is subject to RLS. If policies block the row, the context may fall back to Auth `user_metadata` with limited data.

## Using `useAuth`

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, profile, loading, signIn, signOut, refreshProfile } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <LoginForm onSubmit={signIn} />;

  return (
    <div>
      <span>{profile?.full_name ?? user.email}</span>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}
```

## Identity verification

The verification flow (documents, selfie, etc.) is separate from Auth. The outcome is stored in `profiles.verification_status` and verification-specific tables. Features that require a verified user must check that state in addition to the session.

## Related

- [Database — Schema](../database/schema) — `profiles` table
- [Database — RLS Policies](../database/rls-policies) — `profiles` access
- [Concepts](../../guide/concepts) — Users and roles
