# Design System — FitCheck AI

> Brand name: **FitCheck AI** (the "AI" suffix is set in gold). Tagline: *"Your Personal AI Fashion Stylist."*
> **Memorable thing:** an elegant luxury-fashion house — soft ivory canvas, gold accents, editorial serif headlines — that feels like Zara / COS / Massimo Dutti. The interface is calm and premium; the clothing and the gold accent are the heroes.
> **Themes:** ships in **light** (ivory + gold, default) and **dark** (espresso + gold), toggled app-wide. Both use the same semantic tokens (see Color).

## Product Context
- **What this is:** An AI personal-styling and wardrobe assistant — digital closet, context-aware outfit generation, travel packing, shopping, and selfie-based color-season analysis.
- **Who it's for:** Style-conscious **women** who want a premium, considered styling experience, not a utility. Copy, demo wardrobes, and imagery are written for a female audience.
- **Space/industry:** Luxury fashion × consumer AI. Peers in *feel*: The Row, Aesop, COS, SSENSE, Jacquemus, Net-a-Porter.
- **Project type:** Hybrid — marketing surface (landing, color-season reveal) + web app (wardrobe, generator, shopping, profile). React + Tailwind CSS.

## Aesthetic Direction
- **Direction:** Luxury Fashion — minimal, elegant, lots of white space, large high-quality photography, soft shadows, rounded cards, smooth animation.
- **Decoration level:** Light. Soft shadows + rounded cards (not hard hairline-only). Gold is the single accent; no neon, no loud gradients.
- **Mood:** Premium, refined, feminine, "old money." Calm ivory canvas, gold details, editorial serif headlines.
- **Imagery:** Female luxury fashion — models in old-money / classic styling (tailored coats, white shirts, trench, gold jewelry). No menswear on the marketing surface.
- **Reference brands:** Zara, COS, Massimo Dutti (feel); The Row / Net-a-Porter (polish).

## Typography
Two families only. Load from Google Fonts.

- **Display / Hero + wordmark (`font-serif`):** **Playfair Display** (high-contrast editorial serif). Light/regular weights for big headlines; italic for accent lines (often in gold).
- **Body / UI / Labels (`font-display` / `font-sans`):** **Poppins** (geometric humanist sans).
- **Data (prices, sizes, metrics):** Poppins with `font-variant-numeric: tabular-nums`.
- **Loading:**
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..800;1,400..600&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  ```
- **Scale (px):** hero clamp(44, 11vw, 112) · h1 46 · h2 34 · h3 26 · lead 16 · body 15.5 · ui 13 · label 11 (tracking .2–.3em uppercase, often gold).

## Color
- **Approach:** Soft ivory canvas, charcoal text, a single **luxury gold** accent. Color is defined as **CSS-variable semantic tokens** (`src/index.css` `:root` = light, `.dark` = dark) wired to Tailwind in `tailwind.config.js`. Use the token classes (`bg-canvas`, `text-fg`, `bg-primary`, …) — not raw hex — so both themes adapt automatically.

| Token (class) | Light | Dark | Usage |
|---|---|---|---|
| `canvas` | `#F8F6F2` | `#17120E` | app background (ivory / espresso) |
| `card` | `#FFFFFF` | `#1E1813` | raised surfaces / cards |
| `field` | `#F4F1EB` | `#251D16` | inputs / sunken panels |
| `line` | `#E5E7EB` | `#33291F` | hairline borders |
| `line-strong` | `#D8D2C7` | `#43372A` | stronger borders |
| `fg` | `#1F2937` | `#F6F3EC` | primary text |
| `muted` | `#6B7280` | warm gray | secondary text |
| `subtle` | `#9CA3AF` | faint warm gray | tertiary / faint text |
| `gold` / `primary` | `#D4AF37` | `#D4AF37` | **luxury gold** — button fills, active state, borders, tints |
| `primary-dark` | `#C39A28` | `#C39A28` | gold hover / pressed |
| `gold-soft` | `#8A6A1C` | `#E3C766` | readable gold for **text** labels (deep on light, light on dark) |

- **Fixed (never theme):** `charcoal #1F2937` is the dark text that always sits on gold fills (so gold buttons read in both modes). `clay #8C8175` muted warm neutral; `champagne #B7A98F` legacy accent / avatar dots.
- **Semantic:** success `#22C55E` · error `#EF4444`.
- **Gold rule:** gold is a **fill / border / tint** color and `gold-soft` is the only gold used as **text** (raw `#D4AF37` text fails contrast on ivory). Primary CTA = `bg-primary` (gold) with `charcoal` text. Keep gold purposeful and refined, never neon.
- **Light/dark text on images:** text over garment photos / `bg-black/*` scrims stays literal `text-white`; everywhere else uses `text-fg`.

## Spacing
- **Base unit:** 8px (4px half-step).
- **Density:** Spacious. Luxury = air.
- **Scale:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128.
- **Section padding:** marketing 88–128px vertical; in-app 24–32px. Max content width ~1180px.

## Layout
- **Approach:** Hybrid — editorial/asymmetric for marketing + the color-season reveal; grid-disciplined for the app.
- **Grid:** product grids 4-col desktop / 2-col mobile, 18px gutters. Marketing uses asymmetric, off-center composition.
- **Max content width:** 1180px (32px side padding).
- **Border radius:** near-flat. `sm:2px`, `md:3px`, pills only for small toggles (`999px`). No uniform bubble-radius.
- **Chrome:** hairline borders (`1px solid stone`), no drop shadows as decoration.

## Motion
- **Approach:** Minimal-intentional.
- **Easing:** enter `ease-out`, exit `ease-in`, move `ease-in-out`. No bounce/spring.
- **Duration:** micro 100ms · short 200ms · medium 400ms · long 600ms.
- **Patterns:** image reveals fade + slight scale (1.03→1); underlines grow from the left; hover image zoom ≤1.02. Remove the legacy green `pulse-ring`.

## Signature Screen — Color-Season Reveal
The headline feature is an **editorial spread, not a dashboard card**: season name in huge Fraunces, palette as large **flush rectangular color fields** (no rounded swatch chips), a short sans description, a restrained underlined "Shop your palette →" link. This is the ASANUR moment.

## Migration Notes (from "Digital Closet" green theme)
- Replace `primary #13ec80` / `bg #0d1a12` everywhere with the tokens above. Hardcoded literals (`bg-[#0d1a12]`, `text-primary`) live inline across `AppShell`, `LandingPage`, and all pages — centralize into `tailwind.config.js` theme tokens, then sweep every page.
- Update `public/index.html` `<title>` and the FastAPI `title="Style API"` to ASANUR.
- Material Symbols icons are fine but use thin/outlined weights; let type and space carry hierarchy.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-11 | Initial design system created | /design-consultation. Quiet-luxury chosen for "neutral UI that never clashes with clothing"; grounded in The Row + 2026 quiet-luxury research. Fonts: Fraunces + Instrument Sans. Near-monochrome warm-neutral palette, brass accent ~1%. |
| 2026-06-29 | Rebrand to **FitCheck** (frontend) + baby-yellow primary `#FCE7A0` + female audience focus | User direction. Primary accent moved from champagne to soft baby yellow; product positioning, demo wardrobes, and copy refocused for women. |
| 2026-06-29 | **Luxury Fashion** redesign → **FitCheck AI** | User design guide. New light theme (ivory `#F8F6F2` + luxury gold `#D4AF37`), Playfair Display + Poppins, soft shadows / rounded cards. Espresso kept as the **dark** theme via app-wide toggle (`ThemeToggle`, `.dark` class, `style-dark-mode` key). All dark hex literals swept to CSS-variable semantic tokens. Landing imagery set to female old-money luxury models. |
