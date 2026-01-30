# Components — Navigation

Routes, layout, and app structure.

## Overview

Routing uses **React Router** (v7). Routes and layout are defined in `src/Router.tsx` and layout components. Auth and role determine which routes and menus are shown.

## Route structure

- **Public**: Home, property listing, login, signup, etc.
- **Protected**: Dashboard, property detail, negotiation, visits, settings, etc. Require session and, for some, verified profile or specific role.
- **Role-specific**: Agent, lawyer, and admin panels with dedicated routes.

Exact route tree is in `Router.tsx`.

## Layout

- **Public layout**: Header, footer, and content for unauthenticated pages.
- **Private layout**: Sidebar or main nav, content area, and possibly submenus (properties, visits, offers, etc.).

Layout components in `src/components/layout/`, `PublicLayout`, etc.

## Route protection

`ProtectedRoute` (or equivalent) checks session and, optionally, verification or role. If not met, it redirects to login or an “unauthorized” view.

## Navigation and menus

- Links via React Router `Link` or `NavLink`.
- Dropdowns or sidebar reflecting allowed routes from `profile?.role` and verification flags.
- Documentation or support routes linked from the layout when applicable.

## Related

- [Design system](design-system)
- [API — Authentication](../api/authentication)
- [Architecture](../../guide/architecture)
