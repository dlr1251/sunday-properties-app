# Components — Design system

Visual foundations and base UI components.

## Overview

The UI is built on **Tailwind CSS** and **shadcn/ui**. Components live in `src/components/ui/`. Tailwind tokens (colors, typography, spacing) and CSS variables are used where applicable.

## Stack

| Tool | Use |
|------|-----|
| Tailwind CSS | Utilities, responsive layout, tokens |
| shadcn/ui | Base components (Button, Card, Dialog, Input, etc.) |
| Lucide React | Icons |
| Framer Motion | Animations and transitions |

## UI components (`src/components/ui/`)

Reusable base components:

- **Layout**: `card`, `separator`, `scroll-area`, `tabs`, `sheet`
- **Forms**: `input`, `textarea`, `label`, `checkbox`, `select`, `switch`, `slider`, `calendar`, `FormFieldHelper`
- **Actions**: `button`, `dropdown-menu`, `popover`
- **Feedback**: `alert`, `badge`, `progress`, `skeleton`, `dialog`, `success-modal`
- **Content**: `avatar`, `table`, `search-bar`

Each can be customized via props and variants. Styles are extended with Tailwind classes.

## Tokens and themes

- **Colors**: Tailwind palette (primary, neutral, states). `next-themes` for light/dark when configured.
- **Typography**: Fonts in Tailwind or global CSS; standard sizes and weights.
- **Spacing**: Tailwind scale (`p-4`, `gap-6`, etc.) for consistency.

Tokens are defined in `tailwind.config.mjs` and `src/styles/` or `src/index.css`.

## Common patterns

- **Forms**: `Label` + `Input`/`Select` + `FormFieldHelper` for errors or hints.
- **Lists and tables**: `Card` or `Table` with `Skeleton` while loading.
- **Modals**: `Dialog` or `Sheet` for sequential flows (e.g. upload wizard).
- **Navigation**: Layout and nav components in `src/components/navigation/` and `layout/`.

## Accessibility

shadcn/ui components follow accessible patterns (ARIA, focus, keyboard). Keep labels, contrast, and focus order when extending or composing.

## Related

- [Forms](forms)
- [Navigation](navigation)
- [Architecture](../../guide/architecture)
