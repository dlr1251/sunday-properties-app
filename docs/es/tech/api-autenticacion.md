# API — Autenticación

Acceso a sesión, identidad y perfil de usuario mediante Supabase Auth y la tabla `profiles`.

## Resumen

| Campo | Valor |
|-------|--------|
| Tipo | Supabase Auth + `profiles` |
| Cliente | `createClient` en `src/lib/supabase.ts` |

La autenticación usa **Supabase Auth**. El perfil extendido se obtiene de `profiles` y se expone vía `AuthContext` y el hook `useAuth`.

## Cliente Supabase

```typescript
import { supabase } from '@/lib/supabase';
```

El cliente se crea con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. En desarrollo local se usan valores por defecto si no están definidos.

## Auth: sesión e identidad

Supabase Auth gestiona registro, login y sesión:

- **Email + contraseña**: `signUp`, `signInWithPassword`, `signOut`
- **Sesión**: `getSession`, `onAuthStateChange`
- **Recuperación**: `resetPasswordForEmail`

En la aplicación, el `AuthProvider` encapsula este flujo y expone:

| Método | Descripción |
|--------|-------------|
| `signIn(email, password)` | Inicio de sesión |
| `signUp(email, password, options?)` | Registro; `options` puede incluir `name`, `phone`, `role` |
| `signOut()` | Cierre de sesión |
| `refreshProfile()` | Vuelve a cargar el perfil desde `profiles` |

## Perfil (`profiles`)

Tras el login, el perfil se lee de `profiles` con `id = auth.uid()`. Campos relevantes:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Coincide con `auth.users.id` |
| `full_name` | string | Nombre completo |
| `email` | string | Email (puede sincronizarse desde Auth) |
| `phone` | string | Teléfono |
| `role` | enum | `user`, `agent`, `lawyer`, `admin`, `super_admin` |
| `status` | enum | `active`, `inactive`, `suspended`, `pending` |
| `verification_status` | string | Estado de verificación de identidad |
| `avatar_url` | string | URL del avatar |

El acceso a `profiles` está sujeto a RLS. Si las políticas impiden leer la fila, el contexto puede usar `user_metadata` de Auth como respaldo limitado.

## Uso del hook `useAuth`

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, profile, loading, signIn, signOut, refreshProfile } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <LoginForm onSubmit={signIn} />;

  return (
    <div>
      <span>{profile?.full_name ?? user.email}</span>
      <button onClick={signOut}>Cerrar sesión</button>
    </div>
  );
}
```

## Verificación de identidad

El flujo de verificación (documentos, selfie, etc.) es independiente de Auth. El resultado se refleja en `profiles.verification_status` y en tablas específicas de verificación. Las operaciones que exigen usuario verificado deben comprobar ese estado además de la sesión.

## Temas relacionados

- [Esquema de base de datos](db-schema) — Tabla `profiles`
- [Conceptos](concepts) — Usuarios y roles
