# Componentes — Sistema de diseño

Fundamentos visuales y componentes base de la interfaz.

## Resumen

La UI se apoya en **Tailwind CSS** y **shadcn/ui**. Los componentes están en `src/components/ui/`. Se usan tokens de Tailwind (colores, tipografía, espaciado) y variables CSS cuando aplica.

## Stack

| Herramienta | Uso |
|-------------|-----|
| Tailwind CSS | Utilidades, diseño responsive, tokens |
| shadcn/ui | Componentes base (Button, Card, Dialog, Input, etc.) |
| Lucide React | Iconos |
| Framer Motion | Animaciones y transiciones |

## Componentes UI (`src/components/ui/`)

Componentes base reutilizables:

- **Layout y estructura**: `card`, `separator`, `scroll-area`, `tabs`, `sheet`
- **Formularios**: `input`, `textarea`, `label`, `checkbox`, `select`, `switch`, `slider`, `calendar`, `FormFieldHelper`
- **Acciones**: `button`, `dropdown-menu`, `popover`
- **Feedback**: `alert`, `badge`, `progress`, `skeleton`, `dialog`, `success-modal`
- **Contenido**: `avatar`, `table`, `search-bar`

Cada componente se puede personalizar por props y variantes. Los estilos se extienden con clases de Tailwind.

## Tokens y temas

- **Colores**: Paleta de Tailwind (primarios, neutros, estados). Uso de `next-themes` para modo claro/oscuro cuando esté configurado.
- **Tipografía**: Fuentes definidas en Tailwind o CSS global; tamaños y pesos estándar.
- **Espaciado**: Escala de Tailwind (`p-4`, `gap-6`, etc.) para consistencia.

Los tokens se definen en `tailwind.config.mjs` y en `src/styles/` o `src/index.css`.

## Patrones habituales

- **Formularios**: `Label` + `Input`/`Select` + `FormFieldHelper` para errores o hints.
- **Listas y tablas**: `Card` o `Table` con `Skeleton` durante carga.
- **Modales**: `Dialog` o `Sheet` para flujos secuenciales (p. ej. wizard de subida).
- **Navegación**: Componentes de layout y navegación en `src/components/navigation/` y `layout/`.

## Accesibilidad

Los componentes de shadcn/ui siguen patrones accesibles (ARIA, foco, teclado). Mantener etiquetas, contraste y orden de foco al extender o componer.

## Temas relacionados

- [Formularios](formularios)
- [Navegación](navegacion)
- [Arquitectura](../../guia/arquitectura)
