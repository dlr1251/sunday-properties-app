# Components — Design system

Sunday Properties visual system — **navy / sky / gold**. Canonical brand rules: [BRAND.md](../../../../BRAND.md).

## Stack

| Tool | Use |
|------|-----|
| Vite + React | App shell |
| Tailwind CSS 4 | Utilities, responsive layout |
| CSS variables | Semantic tokens in `src/styles/globals.css` |
| shadcn-style UI | Base components in `src/components/ui/` |
| Lucide React | Icons |
| Framer Motion | Marketing animations |

## Brand palette

| Token | Role |
|-------|------|
| `brand-navy` | Structure, primary buttons, dark hero |
| `brand-sky` | Links, verified badges, pending/info |
| `brand-gold` | CTAs, premium highlights |
| `success` | Transaction accepted / paid only |
| `destructive` | Errors, rejections |

Do **not** use Luque Law forest/parchment here. Do **not** use raw `gray-*` or `blue-100` in marketing surfaces — use semantic tokens.

## Typography

- **Display (`font-display`)**: Milker — marketing H1/H2 only
- **UI (`font-sans`)**: Satoshi — nav, forms, dashboard, tables

## UI components (`src/components/ui/`)

- **Actions**: `button` — variants include `accent` (gold CTA)
- **Feedback**: `badge` — `premium` (gold), `verified` (sky), `success` (transactions)
- **Layout**: `card`, `dialog`, `tabs`, etc.

## Logo

`<BrandLogo variant="default" | "onDark" | "gold" />` — see `src/components/brand/BrandLogo.tsx`.

## Utilities

- `.bg-brand-hero` — navy → sky gradient for heroes
- `.bg-brand-sun` — gold sun accent
- `.glass` — frosted nav

## Patterns

- **Public chrome**: `ModernNavbar`, `Footer`, `HeroSection`
- **Auth**: `AuthModal` with navy header strip
- **Dashboard**: `DashboardShell` — sidebar active = navy tint + gold hairline
- **Negotiation**: pending = sky; accepted = success green; primary action = navy or gold

## Theming

`class` dark mode via `ThemeProvider`. Light: color logo; dark: gold logo on `--background`.

## Related

- [Forms](forms)
- [Navigation](navigation)
- [BRAND.md](../../../../BRAND.md)
