# Componentes — Sistema de diseño

Sistema visual de Sunday Properties — **navy / sky / gold**. Guía de marca: [BRAND.md](../../../../BRAND.md).

## Stack

| Herramienta | Uso |
|-------------|-----|
| Vite + React | Shell de la app |
| Tailwind CSS 4 | Utilidades y layout |
| Variables CSS | Tokens semánticos en `src/styles/globals.css` |
| UI estilo shadcn | Componentes base en `src/components/ui/` |
| Lucide React | Iconos |
| Framer Motion | Animaciones de marketing |

## Paleta de marca

| Token | Rol |
|-------|-----|
| `brand-navy` | Estructura, botones primarios, hero oscuro |
| `brand-sky` | Links, badges verificados, estados pendiente/info |
| `brand-gold` | CTAs, destacados premium |
| `success` | Solo transacción aceptada / pagada |
| `destructive` | Errores, rechazos |

No usar forest/parchment de Luque Law. No usar `gray-*` o `blue-100` sueltos en superficies públicas — usar tokens semánticos.

## Tipografía

- **Display (`font-display`)**: Milker — solo H1/H2 de marketing
- **UI (`font-sans`)**: Satoshi — nav, formularios, dashboard

## Componentes UI (`src/components/ui/`)

- **Acciones**: `button` — variante `accent` (CTA gold)
- **Feedback**: `badge` — `premium` (gold), `verified` (sky), `success` (transacciones)

## Logo

`<BrandLogo variant="default" | "onDark" | "gold" />` — ver `src/components/brand/BrandLogo.tsx`.

## Utilidades

- `.bg-brand-hero` — gradiente navy → sky
- `.bg-brand-sun` — acento sol gold
- `.glass` — nav esmerilado

## Patrones

- **Chrome público**: `ModernNavbar`, `Footer`, `HeroSection`
- **Auth**: `AuthModal` con franja navy
- **Dashboard**: `DashboardShell` — ítem activo = tinte navy + hairline gold
- **Negociación**: pendiente = sky; aceptada = verde success; acción primaria = navy o gold

## Tema

Dark mode con clase vía `ThemeProvider`.

## Relacionado

- [Formularios](formularios)
- [Navegación](navegacion)
- [BRAND.md](../../../../BRAND.md)
