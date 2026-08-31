# Sunday Properties — Brand guide

Canonical reference for visual identity, copy tone, and logo usage. Sunday and Luque Law are **sibling brands** — do not co-brand in Sunday UI.

## Name

- **Sunday Properties** (space, title case in headings)
- Sunday = rest / *dominium* / belonging. Not "SundayProperties" in UI.

## Palette

| Token | Hex | Use |
|-------|-----|-----|
| Navy | `#1a2441` | Structure, headings, primary buttons, dark hero |
| Blue | `#164a7b` | Gradient mid-tone |
| Sky | `#2f8ac0` | Links, verified badges, informational states |
| Gold | `#f0a80d` | CTAs, premium, accent highlights |
| Gold light | `#f5d15a` | Sun arc, hover on gold |
| Gold dark | `#d9940b` | Pressed gold states |

CSS variables: `src/styles/globals.css`. Tailwind: `brand-navy`, `brand-sky`, `brand-gold`, etc.

**Do not** use Luque Law forest/parchment tokens on Sunday surfaces.

## Typography

| Role | Font | Usage |
|------|------|--------|
| Display | Milker | Marketing H1/H2 only |
| UI / body | Satoshi | Nav, forms, cards, dashboard |

## Logo variants

| Variant | File | Background |
|---------|------|------------|
| Color | `/brand/sunday-logo.png` | Light / `--background` |
| Gold | `/brand/sunday-logo-gold.png` | Dark mode |
| White | `/brand/sunday-logo-white.png` | `.bg-brand-hero`, navy panels |

Use `<BrandLogo variant="default" | "onDark" | "gold" />`. Never stretch. Minimum height ~32px in nav.

## Color hierarchy

1. **Navy** — chrome, text, primary actions
2. **Sky** — verification, links, pending/info
3. **Gold** — primary CTA, premium listing badge
4. **Green** — transaction success only (payment confirmed, offer accepted)

## Photography

- Format: **WebP**, long edge ≤ 1600px
- Storage: Supabase `property-photos` bucket, ASCII keys
- No HEIC on web; convert before upload
- Real listing photos over stock placeholders

## Voice (Sunday)

- Clear, serious, oriented to international buyers and renters in Colombia
- Concrete claims only — no inflated stats or invented team bios
- Firm operational contact may use `daniel@luquelaw.co` until `hello@sundayproperties.co` exists
- Do **not** say "A Luque Law company" or mirror Luque Law legal voice ("we" as law firm)

## Relation to Luque Law

Independent brand, same founder ecosystem. Cross-sell is organic, not forced in UI.

## Assets source

Brandbook: [Google Drive — LOGO_SUNDAY_PROPERTIES_BRANDBOOK](https://drive.google.com/drive/folders/1rCr1WryjCFmz5hc5AgeAqStpF5rDmN51)
