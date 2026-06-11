# Design System — ASANUR

> ASANUR is always stylized in all-caps.
> **Memorable thing:** an exclusive, understated fashion house where the interface disappears and the clothing is the hero. Every decision below serves that.

## Product Context
- **What this is:** An AI personal-styling and wardrobe assistant — digital closet, context-aware outfit generation, travel packing, shopping, and selfie-based color-season analysis.
- **Who it's for:** Style-conscious people who want a premium, considered styling experience, not a utility.
- **Space/industry:** Luxury fashion × consumer AI. Peers in *feel*: The Row, Aesop, COS, SSENSE, Jacquemus, Net-a-Porter.
- **Project type:** Hybrid — marketing surface (landing, color-season reveal) + web app (wardrobe, generator, shopping, profile). React + Tailwind CSS.

## Aesthetic Direction
- **Direction:** Quiet-luxury editorial minimalism.
- **Decoration level:** Minimal. Hairline 1px rules instead of bordered/shadowed cards; no gradients; no decorative blobs. Texture comes from a warm paper-like canvas and full-bleed garment photography.
- **Mood:** Calm, warm, restrained, expensive. The UI recedes so garment color is always the loudest thing on screen.
- **Reference sites:** therow.com (canonical), aesop.com, cos.com.

## Typography
Two families only. Load from Google Fonts.

- **Display/Hero + ASANUR wordmark:** **Fraunces** (variable, optical sizing, high-contrast old-style serif). Weight 330–360 for headlines. Wordmark = all-caps, `letter-spacing` ~0.34–0.5em, with a thin champagne hairline rule beneath.
- **Body / UI / Labels:** **Instrument Sans** (clean humanist grotesque).
- **Data / Tables (prices, sizes, metrics):** Instrument Sans with `font-variant-numeric: tabular-nums`.
- **Code:** n/a (no code surfaces). Use JetBrains Mono only if ever needed.
- **Do NOT use:** Inter, Roboto, Space Grotesk, Montserrat, Poppins, system-ui as display/body (convergence/slop signals).
- **Loading:**
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300&family=Instrument+Sans:ital,wght@0,400..600;1,400&display=swap" rel="stylesheet">
  ```
- **Scale (px):** hero clamp(44, 11vw, 128) · h1 46 · h2 34 · h3 26 · lead 16 · body 15.5 · ui 13 · label 11 (tracking .2–.3em uppercase). Headlines `letter-spacing: -.015em`.

## Color
- **Approach:** Restrained / near-monochrome. Color is rare and meaningful; the garments provide the saturation.

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#16140F` | warm near-black — primary text, dark sections, primary button fill |
| `bone` | `#F6F3EC` | warm off-white — primary canvas |
| `porcelain` | `#FCFBF7` | lighter surface / panels |
| `stone` | `#E4DDD1` | hairline borders, dividers |
| `clay` | `#8C8175` | muted secondary text |
| `champagne` | `#B7A98F` | the single accent — active nav tick, selected state, wordmark rule. Target ~1% of surface |

- **Semantic (desaturated to fit):** success `#5C6B52` · warning `#B08643` · error `#9B4A3D` · info `#5E6B73`.
- **Dark mode:** Espresso, not pure black. `bg #1B1814`, `surface #211D18`, text `bone`, line `#332D25`, accent lifted to `#C7B89C`. Reduce saturation ~15%.
- **Rule:** Primary CTA is `ink` on `bone` (or `bone` on `ink` in dark) — never a colored button. The brass accent never fills a large area.

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
