# Componentes — Navegación

Rutas, layout y estructura de la aplicación.

## Resumen

Enrutamiento con **React Router** (v7). Rutas y layout se definen en `src/Router.tsx` y en componentes de layout. La autenticación y el rol condicionan qué rutas y menús se muestran.

## Estructura de rutas

- **Públicas**: Home, listado de propiedades, login, registro, etc.
- **Protegidas**: Dashboard, detalle de propiedad, negociación, visitas, configuración, etc. Requieren sesión y, en algunos casos, perfil verificado o rol específico.
- **Por rol**: Paneles de agente, abogado, administrador con rutas dedicadas.

El árbol exacto de rutas figura en `Router.tsx`.

## Layout

- **Layout público**: Cabecera, footer y contenido para páginas no autenticadas.
- **Layout privado**: Sidebar o navegación principal, área de contenido y posiblemente submenús por sección (propiedades, visitas, ofertas, etc.).

Componentes de layout en `src/components/layout/` y `PublicLayout`, etc.

## Protección de rutas

`ProtectedRoute` (o equivalente) comprueba sesión y, opcionalmente, verificación o rol. Si no se cumple, redirige a login o a una vista de “acceso no autorizado”.

## Navegación y menús

- Enlaces con `Link` o `NavLink` de React Router.
- Menús desplegables o sidebar que reflejan rutas permitidas según `profile?.role` y flags de verificación.
- Rutas de documentación o soporte enlazadas desde el layout cuando aplique.

## Temas relacionados

- [Sistema de diseño](sistema-de-diseno)
- [API — Autenticación](../api/autenticacion) — Sesión y perfil
- [Arquitectura](../../guia/arquitectura)
