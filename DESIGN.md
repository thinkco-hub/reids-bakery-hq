---
name: Reid's Bakery HQ
description: Warm espresso-and-cream operations console for a bakery chain, with a separate navy stock-ledger surface.
colors:
  espresso: "#562D07"
  espresso-deep: "#3a1d04"
  espresso-well: "#4a2605"
  caramel: "#F3B978"
  amber-disc: "#FFB74D"
  brand-orange: "#F17D0C"
  burnt-orange: "#b45309"
  burnt-orange-deep: "#9a3412"
  cream: "#FDF9F3"
  ink: "#121212"
  white: "#ffffff"
  gray-50: "oklch(98.5% 0.002 247.839)"
  gray-100: "oklch(96.7% 0.003 264.542)"
  gray-200: "oklch(92.8% 0.006 264.531)"
  gray-300: "oklch(87.2% 0.01 258.338)"
  gray-400: "oklch(70.7% 0.022 261.325)"
  gray-500: "oklch(55.1% 0.027 264.364)"
  gray-600: "oklch(44.6% 0.03 256.802)"
  gray-700: "oklch(37.3% 0.034 259.733)"
  gray-800: "oklch(27.8% 0.033 256.848)"
  gray-900: "oklch(21% 0.034 264.665)"
  chams-navy: "#1B2A4A"
  chams-navy-deep: "#12203a"
  chams-blue: "#3B5BA5"
  chams-blue-soft: "#5B84D6"
  chams-blue-wash: "#EAF0FB"
  status-red: "oklch(50.5% 0.213 27.518)"
  status-red-fill: "oklch(57.7% 0.245 27.325)"
  status-red-wash: "oklch(97.1% 0.013 17.38)"
  status-green: "oklch(52.7% 0.154 150.069)"
  status-green-wash: "oklch(98.2% 0.018 155.826)"
  status-blue: "oklch(48.8% 0.243 264.376)"
  status-blue-wash: "oklch(97% 0.014 254.604)"
  status-amber: "oklch(55.5% 0.163 48.998)"
  status-amber-wash: "oklch(98.7% 0.022 95.277)"
  status-orange-wash: "oklch(98% 0.016 73.684)"
typography:
  headline:
    fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif'
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: "2.25rem"
  title:
    fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif'
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: "1.75rem"
  body:
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif'
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  label:
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif'
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: "1rem"
    letterSpacing: "0.05em"
  caption:
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif'
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
  mono:
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  sm: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  2xl: "1rem"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.espresso-deep}"
  button-cta:
    backgroundColor: "{colors.burnt-orange}"
    textColor: "{colors.white}"
    rounded: "{rounded.xl}"
    padding: "8px 16px"
  button-cta-hover:
    backgroundColor: "{colors.burnt-orange-deep}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.gray-700}"
    rounded: "{rounded.xl}"
    padding: "10px 20px"
  button-destructive:
    backgroundColor: "{colors.status-red-fill}"
    textColor: "{colors.white}"
    rounded: "{rounded.xl}"
    padding: "10px 20px"
  button-disabled:
    backgroundColor: "{colors.gray-200}"
    textColor: "{colors.gray-400}"
  input-text:
    backgroundColor: "{colors.white}"
    textColor: "{colors.gray-800}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  input-search:
    backgroundColor: "transparent"
    textColor: "{colors.gray-900}"
    rounded: "{rounded.lg}"
    padding: "8px 12px 8px 40px"
  badge-status:
    rounded: "{rounded.full}"
    padding: "4px 12px"
  badge-stock:
    rounded: "{rounded.full}"
    padding: "4px 8px"
  badge-micro:
    rounded: "{rounded.full}"
    padding: "2px 8px"
  card-stat:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.2xl}"
    padding: "16px 20px"
  nav-item-active:
    backgroundColor: "rgb(243 185 120 / 0.2)"
    textColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "12px"
---

# Design System: Reid's Bakery HQ

## Overview

This document is a reverse-engineered record of the design system as implemented
in `src/` (verified 2026-11-26 against source, computed styles, and rendered
screenshots at 1440×900, 390×844, 1024×768 touch, and 1280/375 parity captures;
icon and font systems re-verified 2026-11-28). It describes what exists; it does
not propose a new system. Values in the frontmatter are normative.

Since Phase 5 of the 2026-11 frontend audit the system is enforced, not just
documented: every palette colour is a Tailwind v4 `@theme` token in
`src/styles.css` (the only file allowed to hold raw hex), and the component
grammars are shared primitives in `src/components/common/` — `Button`, `Badge`,
`StatCard`, `Table`, `EmptyState` — over a centralised icon set in
`src/components/icons.tsx` (a Hugeicons Stroke Rounded facade, stroke 2,
`aria-hidden` by default) and status classes in `src/utils/status.ts`.

Reid's Bakery HQ is an Operate-mode console: staff complete tasks (sell, schedule,
count, close the day) on dense, scanable screens. The visual world is a warm
bakery materiality — cream paper floor, white cards, espresso-brown chrome —
punctuated by a single saturated orange used as a signal, never as a surface for
text. A second, cooler surface (the Chams branch stock ledger at `/chams`) runs
the same layout grammar in navy and blue. The app is a frontend-only prototype:
all domain data is seeded in memory, so every screen is reachable with demo
credentials and nothing persists across reloads except device-local keys.

Density is compact: 14px body text, 12px metadata, 4px spacing grid, 8px-radius
controls, 16px-radius cards. Weight carries hierarchy more than size does
(700/600/500 are the working weights; 400 is reserved for body and meta).

**Key Characteristics:**
- Cream canvas (`#FDF9F3`) under white cards; espresso (`#562D07`) chrome and primary actions.
- Orange is a signal color: nav active bar, chart accents, focus-adjacent highlights — fills only, never light-surface text.
- Burnt orange (`#b45309`) is the accessible voice of the brand: CTA fills, focus rings, "low stock" text.
- Inter for the interface and Poppins for headings (Google Fonts); money is tabular, record ids are monospace.
- One shadow workhorse (`shadow-sm`); heavy shadows reserved for overlays and chrome.
- Two color worlds: warm HQ, navy Chams. They never mix on one surface.
- Responsive by shell breakpoints (768 / 1024 + touch detection) and, in two places, container queries.

## Colors

The palette is a warm neutral base with one saturated accent family, a semantic
status set, and a separate navy world for the Chams ledger. The five baseline
brand colors (user-confirmed, all present in code) are `#562D07`, `#F17D0C`,
`#F3B978`, `#FDF9F3`, `#121212`.

### Primary

- **Espresso** (`#562D07`): the structural brown. Sidebar and mobile top bar background, primary buttons (Add Client, New Recipe, Schedule Run, Add Expense, modal confirms), login CTA, "In Production" badge, Bank Transfer chart series, and the heading color on Inventory/Calendar. Hover/active step: **Espresso Deep** (`#3a1d04`); submenu hover wells use it too.
- **Espresso Well** (`#4a2605`): recessed submenu panel inside the sidebar (with `shadow-inner`).
- **Burnt Orange** (`#b45309`, token `--color-brand-strong`, hover `--color-brand-strong-hover` `#9a3412`): the accessible brand voice. CTA fills in POS checkout, inventory tab toggles and Close Day, the standard 2px focus ring, "Low Stock" badge text, and orange text links ("View All"). The former `--color-brand-text` alias was collapsed into this single token.

### Secondary

- **Brand Orange** (`#F17D0C`, token `--color-brand`): the signal. Sidebar active-item left bar (4px) and sub-item bar (2px), sub-item active text, Cash chart series, POS cart-count badge accents. 2.73:1 against white — see the Fill-Only Orange Rule.
- **Caramel** (`#F3B978`): the warm tint on dark chrome. Sidebar hover/active washes (`/10`, `/20`), brand-area and logout borders (`/20`), mobile top bar button fills (`/20`, `/40`). On light surfaces its one sanctioned use is solid chart-bar fill (Revenue by Day idle bars, espresso-family, with brand orange on hover); it never carries light-surface text.
- **Amber Disc** (`#FFB74D`, token `--color-amber-disc`): the avatar/initials disc behind espresso text — client detail initials and order-detail panel discs. A fill only, never text.

### Tertiary (separate surface: Chams ledger)

- **Chams Navy** (`#1B2A4A`): ledger rail background, headings, primary text on that surface.
- **Chams Navy Deep** (`#12203a`): rail hover/active wells.
- **Chams Blue** (`#3B5BA5`): ledger active accent, focus rings, borders; also the GCash chart series in HQ reports (the one sanctioned crossover).
- **Chams Blue Soft** (`#5B84D6`) and **Chams Blue Wash** (`#EAF0FB`): ledger accent border and tinted fills.

### Neutral

- **Cream** (`#FDF9F3`): app canvas and login background; `theme-color` meta; sidebar text at full and `/60`, `/70` alpha.
- **Ink** (`#121212`): base text and most view titles.
- **White** (`#ffffff`): every card, table, modal, and input surface.
- **Gray ramp** (Tailwind v4 oklch, values in frontmatter): `gray-50/100` table stripe and filled-select backgrounds; `gray-200` card/table borders and POS canvas; `gray-300` input borders and disabled fills; `gray-500` meta text, placeholders, icons; `gray-600/700` secondary text and table headers; `gray-800/900` strong body text.

### Status & data colors

Semantic, always wash-background + dark-text (never solid fills except destructive buttons):

| Meaning | Text | Wash | Where |
| --- | --- | --- | --- |
| Danger / out of stock | red-700 | red-50 | stock badges, shortfall pills, delete icon circle |
| Success / ready / paid | green-700 | green-50 | order & payment badges, run "Completed", revenue figures in Chams |
| Informational / pending | blue-700 | blue-50 | order "Pending", run "Scheduled", orders filter chip active |
| Warning / partial | amber-700 | amber-50 | payment "Partial", Chams missing-count banner |
| Attention / low stock | burnt-orange | orange-50 | stock "Low", count "Pending", audit action tags |
| Neutral / unpaid | gray-700 | gray-50 | fallback badges, "Not Submitted" |

POS product tiles are **data-driven**: each catalogue item carries a Tailwind
background class (`bg-amber-400`, `bg-orange-400`, `bg-stone-300`, `bg-purple-400`,
`bg-gray-800`, `bg-[#562D07]`, …12 values in `src/data/initialCatalogue.ts`).
These are content colors, not system tokens.

### Named Rules

**The Fill-Only Orange Rule.** `#F17D0C` is 2.73:1 against white. It may fill a
bar, badge, or chart slice; it may never carry text or a focus ring on a light
surface. Burnt orange (`#b45309`) is the text/ring voice of the same hue.

**The Two-World Rule.** Navy/blue belongs to `/chams` (plus the GCash chart
series). Warm browns belong to HQ. A surface picks one world; chrome, headings,
focus rings, and accents all follow it.

**The Cream Floor Rule.** The canvas is cream, surfaces are white. Gray-100 is
reserved for the POS workspace and filled controls; it is not a page background
elsewhere.

## Typography

**Display/Body Font:** Inter (Google Fonts) over the system fallback stack —
`"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica
Neue", "Noto Sans", Arial, sans-serif` (token `--font-sans` in `src/styles.css`;
loaded 400/500/600/700 with `display=swap`).
**Heading Font:** Poppins (Google Fonts) over the same fallback stack, applied
by the base `h1…h6` rule via `--font-heading`; loaded 600/700.
**Weight deviation (client-approved 2026-11-28):** the source spec listed only
Inter 400/500/600 and Poppins 600, but the system renders 700 throughout
(184 `font-bold` uses, every visible heading), so Inter 700 and Poppins 700 are
loaded rather than synthesized. Families changed; no weight utility changed.
**Mono Font:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, …` for
record ids (`#1042`), the mobile ticket count, crash details, and unknown paths.

**Character:** utilitarian and weight-driven. Hierarchy comes from bold weight
and color, not from size jumps; sizes stay within a narrow 12–30px band.
Headings set Poppins through the base element rule; everything else, including
title-like `<p>`/`<span>` (Order Details' "Client"/"Delivery"/"Total Amount",
sidebar wordmark, stat values), stays Inter.

### Hierarchy (verified computed values)

- **Headline** (700, 30px/36px, `text-3xl`): view titles (`Dashboard`, `Orders`, `Sales Reports`). Ink on most views; espresso on Inventory/Calendar; navy on Chams. Order detail deviates: 1.625rem→2rem at `md:`, `leading-none`.
- **Title** (700, 18px/28px, `text-lg`): card and section headings (`Order Items`, `Revenue by Day`). Also 16px/24px bold for smaller card heads (`Pricing Rule`, `Expenses for …`).
- **Body** (400, 14px/20px, `text-sm`): the working size — table cells, forms, descriptions, buttons. 16px/24px (`text-base`) appears in POS tiles and ticket lines.
- **Label** (700, 12px/16px, uppercase, `letter-spacing: 0.05em`): table column heads (`ORDER #`, `CLIENT`), POS section eyebrows (`tracking-wide` variants in PosMobile/PosView).
- **Caption** (400/500, 12px/16px, `text-xs`): meta lines, ids under names, badge text, helper copy. 0.625rem (10px) exists for badge dots, shortfall pills, and chart axis labels.
- **Stat value** (700, 20px→24px at `md:`, `tabular-nums`): every stat card value, one shared `StatCard` grammar.

Money always sets `tabular-nums` (some with `[font-feature-settings:'tnum']`);
the peso sign renders from `MONEY_SYMBOL` in `utils/money`.

### Named Rules

**The Step-Not-Fluid Rule.** Type scales in breakpoint steps (`text-xl
md:text-2xl`, `px-2 md:px-3`), never viewport `clamp()`. The single exception is
the POS ticket panel, an `@container` whose inner tokens scale with panel width:
`--tk-title: clamp(1.05rem, 4.5cqw, 1.45rem)`, `--tk-body: clamp(0.95rem, 3.6cqw,
1.15rem)`, `--tk-pad: clamp(0.85rem, 4cqw, 1.4rem)` (measured 16.8px title at
desktop panel width, 17.55px on phone).

**The Weight-Over-Size Rule.** Prefer 500→600→700 and ink→gray-500 contrast over
adding a new size. The scale has six working steps; arbitrary px sizes are drift
(see Inconsistencies).

## Layout

Shell (verified in `src/utils/responsive.ts`, `LayoutRoute.tsx`, `Sidebar.tsx`):

- **Phone < 768px**: single column; brown top bar (p-4, 40px controls, ≈72px tall) with hamburger; sidebar becomes a fixed 256px off-canvas drawer over a `bg-black/50` scrim (z-40); drawer z-50. On POS the top bar swaps the app title for ticket controls (count, customer, clear).
- **Touch at any width**: same drawer as phone. `canUseSidebarRail` requires ≥1024px **and** `navigator.maxTouchPoints === 0` (verified: 1024×768 touch context renders hamburger, no rail gutter).
- **Desktop ≥ 1024px, mouse**: pinned rail, 80px collapsed gutter; rail expands to 256px as an overlay on hover or keyboard focus (content never reflows); scrim appears while expanded. Brand header 76px.
- **Main landmark**: `p-4 md:p-8` (16→32px), scrollable; POS route is full-bleed `p-0 overflow-hidden bg-gray-100`.
- **Page header**: title + gray-500 subtitle, `mb-6 md:mb-8`, actions right-aligned at `md:`.
- **Card grids**: dashboard stat cards 1-up below 640px, 2-up at `sm:`, 4-up at `lg:`; inventory/production stat bars are selectable button grids (2-up → 4-up); reports use 2-column card splits at `lg:`.
- **Container queries**: orders swap table ↔ accordion card list at **container** width 1024px (`@container` + `@max-[1024px]:hidden`), independent of viewport; POS ticket scales via `cqw` (above).
- **Breakpoint usage**: `md:` (768px) dominates (240 occurrences), then `sm:` 640 (45), `lg:` 1024 (30), `xl:` 1280 (4). Tailwind defaults; no custom breakpoints.
- **Spacing rhythm**: 4px grid. Working gaps 8/12/16px (`gap-2/3/4`); card padding 20px (`p-5`) or 24px (`p-6`); section separation `mb-6`/`mb-8` (24/32px); form stacks `space-y-4`; button rows `gap-3`.
- **Overlays**: modal z-100, stacked confirm z-110; skip link z-60.

## Elevation & Depth

Depth is mostly **tonal + one soft shadow**: white cards on cream, 1px gray
borders, and a single ambient workhorse. Heavy shadows mark chrome and overlays,
not content.

### Shadow Vocabulary (verified computed)

- **Card rest** (`shadow-sm`): `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` — cards, tables, chips, product tiles, primary buttons.
- **Chrome lift** (`shadow-md`): `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` — mobile top bar, active nav item, inventory CTAs.
- **Commit lift** (`shadow-lg`): four deliberate sites — Close Day CTA, POS desktop ticket CTA, POS mobile checkout bar, and the Revenue-by-Day hover tooltip.
- **Overlay** (`shadow-2xl`): `0 25px 50px -12px rgb(0 0 0 / 0.25)` — modals, login card, sidebar rail/drawer.
- **Chrome edge** (`shadow-xl`): one site — the POS ticket panel, lifted off the tile grid.
- **Recess** (`shadow-inner`): submenu wells and the white logo disc.
- **Upward lip**: `0 -4px 6px -1px rgb(0 0 0 / 0.05)` on POS ticket footer / mobile checkout bar.
- **Modal veil**: `bg-black/50` + `backdrop-blur-sm` (8px), verified.

### Named Rules

**The One-Shadow Workhorse Rule.** Content rests on `shadow-sm`. If a surface
needs `shadow-md` or heavier, it should be chrome, an overlay, or a deliberate
commit action — not another card.

## Shapes

- **Radius ladder** (verified): 4px (`rounded`, orders filter chips), 6px (`rounded-md`, the small-control rung: search shells, ghost buttons, date inputs, SelectField), 8px (`rounded-lg` — buttons, inputs, tables, order cards, nav items), 12px (`rounded-xl` — CTA buttons, modal footer buttons, POS tiles/swatches), 16px (`rounded-2xl` — cards, modals, login), full (`rounded-full` — badges, pills, logo disc, reports range chips).
- **Borders**: 1px. `gray-200` for cards/tables/dividers, `gray-300` for inputs and secondary buttons, `gray-100` for quiet card edges. Status badges add a 300-step border of their own hue; stock badges are borderless.
- **Accent bars**: sidebar active item carries a 4px left bar in brand orange; sub-items 2px; inactive items keep a transparent bar so text never shifts.
- **Swatches**: POS products are color blocks — desktop tile = aspect-square top block over a white label foot; phone row = 40px rounded square at left.
- **No other clipping or geometry**: no circles beyond badges/logo/discs, no skew, no decorative shapes. Icons come from `src/components/icons.tsx` (Hugeicons Stroke Rounded facade, stroke 2, `aria-hidden` by default, sized 16/20/24px via `className`); the only remaining inline `<svg>` is the payment-method donut (data-viz exception).

## Components

### Buttons

All standard actions use the shared `Button` in `src/components/common/Button.tsx`: one variant ladder × four sizes, `forwardRef`, `type="button"` by default, and **one** disabled recipe (`gray-200` fill, `gray-400` text, no shadow, `cursor-not-allowed`) for every variant.

- **Variants:** `primary` (espresso fill, white label, hover espresso-deep), `cta` (burnt-orange fill, white label, hover burnt-orange-deep), `secondary` (white fill, `gray-300` border, `gray-700` label, hover `gray-100`), `danger` (red-600 fill, white label), `dangerOutline` (white fill, red border and label), `ghost` (gray-500 label, hover `gray-100`), `ghostBrand` (burnt-orange label, hover `orange-50`), `ghostDanger` (gray-500 label, hover red text on red-50), `ghostSuccess` (green-700 label, hover green-50), `chams` (navy fill for the Chams forms).
- **Sizes:** `sm` (`px-3 py-1.5`, 8px radius), `md` (`px-4 py-2.5`, 8px radius, `shadow-sm` — the workhorse), `lg` (`px-4 py-3`, 12px radius — CTAs and modal footers), `pill` (`px-4 py-1.5 min-h-[2.75rem] rounded-full` — header actions). Phone-facing row buttons add `min-h-[2.75rem]`.
- **Focus:** 2px burnt-orange ring, or the `onChrome` white-ring/espresso-offset pair on dark surfaces.
- **Press feedback:** POS tiles `active:scale-95`; transitions are `transition-colors`; rail/drawer move at 300ms ease-in-out.
- **Kept bespoke on purpose:** filter chips and `aria-pressed` segments, POS product tiles, icon-only hit-area buttons (nav rail, row actions, drawer controls), POS ticket controls (container-query scaled), and text links ("View All").

### Inputs & Selects

- **Bordered field** (login, modals, forms): white, 1px `gray-300`, 8px radius, `px-4 py-2.5`, 14px `gray-800` text; focus = 2px burnt-orange ring **and** border shift; disabled = `gray-100` fill + `gray-400` text. Labels: 14px semibold `gray-700`, `mb-1`.
- **Search field** (`SearchField`): borderless, transparent over white card, icon in 40px left gutter, 8px radius, 2px burnt-orange focus ring enclosing icon+input.
- **Filled select** (POS category, unit pickers): `gray-100` fill, 8px radius, bold 14px, `pr-10` gutter; `SelectField` replaces the native arrow with a sibling chevron that rotates 180° while open (`peer-open:`, Baseline 2026; degrades to static chevron).
- **Date input** (reports): 6px radius, `px-3 py-1.5` — off-ladder (see Inconsistencies).
- Errors: `role="alert"` paragraph, 14px semibold red-700 (login).

### Badges & Chips

Three badge families, all rendered by `src/components/common/Badge.tsx` with tone classes from `src/utils/status.ts`:

- **Status** (order, payment, production run): full pill, 1px hue-300 border, hue-50 wash, hue-700 text, 12px medium, `px-3 py-1`; a 10px dot prefix is an `aria-hidden` span, not text.
- **Stock** (finished goods, raw materials, Chams ledger, discrepancy): full pill, borderless, 12px **bold**, `px-2 md:px-3 py-1`; low = orange-50/burnt-orange, out = red-50/red-700, ok = `#562D07/10` + `#562D07`, neutral = gray-50/gray-700.
- **Micro** (audit action, "You", "Action Req", shortfall, edited marker): `px-2 py-0.5`, 10–12px bold, `orange-50`/`red-50` washes.
- **Filter chips** stay bespoke: orders = 4px radius, `px-4 py-1.5`, 14px medium, active = blue-50/blue-200 border/blue-700 + `shadow-sm`, row scrolls with `hide-scrollbar`; reports range = full pill, active = espresso fill/white text, idle = `gray-100`/`gray-700`.

### Cards

- **Stat card**: one `StatCard` grammar everywhere — white, 16px radius, `p-4 md:p-5`, `shadow-sm`, quiet `gray-100` border; label 12px→14px medium gray-500, value 20px→24px bold tabular with a tone accent. Selectable stat bars make the whole card a `button` with `aria-pressed` (burnt-orange border + `ring-2` when active, `gray-300` hover when idle) and a 36/40px tinted icon disc; display cards may carry a 48px icon disc and a right-hand flag (dashboard).
- **Table card**: white, 8px radius, `gray-200` border, `shadow-sm`, `overflow-hidden`, produced by the shared `Table` (see below).
- **Order card (phone/tablet)**: white, 8px radius, accordion header button (`aria-expanded`), chevron rotates; expanded reveals dl rows + full-width espresso "Manage order".

### Tables

One `Table` primitive in `src/components/common/Table.tsx`: card shell above, then a signed horizontal scroller (`role="region"`, `tabIndex={0}`, `aria-label`) around a `<table aria-labelledby>`. `TableHead` renders the canonical header band: `border-b border-gray-200 bg-gray-50/50`, 12px **semibold**, uppercase, `tracking-wider`, `gray-700`. Body 14px, row dividers `gray-200`, numeric columns right-aligned `tabular-nums` (money always). Section headers (icon + title + description) render as an optional band inside the same card. The old cream-and-caramel inventory chrome is retired in favour of this one grammar.

### Empty states

One `EmptyState` grammar for every "nothing here": 48px `gray-100` disc holding an icon (default `Archive04Icon`; context icons like `CheckIcon` where meaningful), a bold 16px title, optional hint, and — where one exists — a next action as a `Button`. Copy distinguishes "no data yet" ("No users.", "No activity logged today.") from "no match" with an explicit clear/recovery action ("No ledger rows match your search." + Clear filters).

### Modals & Dialogs

`Modal` portals to body: fixed inset-0, `bg-black/50` + `backdrop-blur-sm`, overlay padding `p-4` (two full-screen cream sheets are the mobile exceptions), z-100 (confirm z-110). Card: white, 16px radius, `shadow-2xl`, widths `max-w-sm`/`md`/`lg` by content, `animate-fadeIn`, some `max-h-[85dvh]` with internal scroll. Behavior: focus trap, Escape closes, backdrop click dismisses (opt-out), background `inert` while open (stack-safe), focus restored on close, `aria-modal` + `aria-labelledby`. Footer: divided bar, secondary + primary `Button size="lg"`, `flex-col-reverse` → `sm:flex-row` right-aligned. `DeleteConfirmDialog` adds a 44px red-100 icon circle with `Alert02Icon` and focuses Cancel first.

### Navigation

Espresso rail/drawer (see Layout). Items: `p-3`, 8px radius, bold, 24px icon in 32px slot; idle `cream/60`, hover `caramel/10` + white; active `caramel/20` + white + 4px orange left bar + `shadow-md`; every nav and sub-nav link authors the chrome focus ring (`focus-visible:ring-2 ring-white` + 2px espresso offset). Submenus: recessed `#4a2605` well, `shadow-inner`, sub-items `pl-14 py-2.5` 14px medium, active orange text + `#3a1d04` fill + 2px bar. Group toggles: `aria-expanded`/`aria-controls`, chevron 200ms rotate; 40px hit area via negative margins. Brand disc: 40px white circle, espresso "RBC / BAKERY" (0.375rem subline), doubles as the Chams switch (disabled without permission). Logout pinned bottom over `caramel/20` top border with user name/email.

### POS Product Tile & Ticket

Tile: aspect-square color block (data color) + white foot with bold name and burnt-orange price; 12px radius, `shadow-sm` → `hover:shadow-md`, `active:scale-95`. Ticket panel: white, left border, `@container` scaling tokens; header espresso icon + brown title; empty state gray cart glyph + gray-500 copy; footer `gray-50` with upward lip shadow, subtotal/tax/total rows and full-width CTA (disabled = gray-200/gray-400).

## Do's and Don'ts

### Do:

- **Do** keep the canvas cream (`#FDF9F3`) and surfaces white; use `gray-100` only for the POS workspace and filled controls.
- **Do** use espresso (`#562D07`, hover `#3a1d04`) or burnt orange (`#b45309`, hover `#9a3412`) for filled actions, and match the hover step to the family.
- **Do** render brand orange (`#F17D0C`) only as bars, badges, and chart fills; use burnt orange for any orange text or focus ring on light surfaces.
- **Do** set the standard focus treatment: `focus:ring-2` burnt orange (white ring + offset on espresso chrome).
- **Do** keep touch controls ≥44px (`min-h-[2.75rem]`) and stack modal button rows `flex-col-reverse` on phone.
- **Do** scale type and padding in breakpoint steps (`md:`), and money in `tabular-nums`.
- **Do** rest content on `shadow-sm`; reserve `shadow-2xl` + blurred veil for overlays.
- **Do** keep status semantics in wash+dark-text pills (red/green/blue/amber/orange per the table above).

### Don't:

- **Don't** put `#F17D0C` text or focus rings on white/cream (2.73:1).
- **Don't** mix the Chams navy world into HQ surfaces (or vice versa); the GCash chart series is the only crossover.
- **Don't** add viewport `clamp()` type scaling; the POS ticket's container-query tokens are the sole exception.
- **Don't** make POS panels user-resizable; tune flex ratios instead.
- **Don't** introduce new radii, shadows, or arbitrary px font sizes — the ladders above are the system (existing off-ladder values are logged as drift, not precedent).
- **Don't** ship inert controls: disable with a visible disabled treatment or hide what a role cannot reach.
- **Don't** animate transforms on containers that host `position:fixed` modals; `fadeIn` is opacity-only for this reason, and `prefers-reduced-motion` collapses all motion.

## Accessibility

Verified requirements as implemented:

- Skip link to `#main` (visible on focus, espresso fill); single `sr-only` h1 per shell; view titles are h2.
- `main` landmark with `tabIndex={-1}`; POS and standard padding variants.
- Focus: 2px burnt-orange ring on light surfaces; white ring + 2px offset on espresso chrome; keyboard focus pins the desktop rail open (pointer focus does not).
- Modals: focus trap, initial focus (Cancel for destructive confirms), Escape, backdrop dismiss, `inert` background with stack counting, focus restoration, `role="dialog"|"alertdialog"` + `aria-labelledby`.
- Drawer: `useDrawerA11y` (focus containment, Escape, focus return to hamburger); submenus keep `aria-controls` resolved while `hidden` removes them from tab order.
- Live region: `AnnouncerProvider` / `useAnnounce` for state changes (e.g. "Ticket cleared.").
- Touch targets ≥44px on phone controls; chevron toggles padded to 40px.
- `prefers-reduced-motion: reduce` collapses animations/transitions to 0.01ms (events still fire).
- Contrast doctrine: orange fill-only; burnt orange for text/rings; status text at 700-step on 50-step washes. A canvas probe over every visible text element on all 21 routes (375/1280) finds no enabled pair below AA; the only sub-threshold pairs are disabled controls (exempt under SC 1.4.3), which all share the single disabled recipe.
- Role-gated UI: tabs/controls hidden or disabled per `utils/permissions.ts`; disabled states are visible, never silent.

## Inconsistencies & Drift

Observed deviations, logged as facts (not prescriptions). Established rules above
win over these when building new screens.

1. **Two primary voices (sanctioned).** Espresso (`primary`) for record actions and confirms; burnt orange (`cta`) for checkout, stock, and close-day actions. Both are official variants of one `Button`.
2. **Heading color split.** Ink titles on most views; espresso on Inventory and Calendar; navy on Chams; order detail uses 26px→32px `leading-none` instead of the 30px/36px headline. Per-world by design; the order-detail size is the outlier.
3. **Focus ring spelling.** One `Button`/`focus-visible` spelling (`brand-strong`); `SearchField` matches; Chams uses `#3B5BA5` rings (world-correct, but a third spelling).
4. **Bespoke control set.** Chips, segmented toggles, POS tiles/ticket controls, icon-only buttons and text links remain outside `Button` by design; their geometries are recorded above.
5. **Chip radius split.** Orders filters 4px; reports range full pill; POS category is a filled select, not chips.
6. **Arbitrary type one-offs.** All px one-offs are now rem steps so OS text scaling reaches them: 0.375rem logo sublines (Sidebar, Chams), 0.625rem dots/pills/axis, 0.6875rem chart axis, 0.9375rem breadcrumb rows, 1.625rem/2rem order title. The POS `cqw` tokens are the documented exception.
7. **Data-color palette outside the baseline.** 12 catalogue tile classes include purple-400, gray-800, stone-300/400, yellow-600 — content colors, untokenized.

## Verification Notes

- **Sources:** static census of class/hex/svg/emoji frequencies; full reads of shell, shared primitives, badges, permissions, responsive utils; computed-style samples from live renders (Playwright, Chromium); phase-5 before/after parity captures (21 routes × 375/1280), axe sweep, and canvas contrast probe.
- **Icon and font system (2026-11-28):** all UI icons render Hugeicons Stroke Rounded through the `src/components/icons.tsx` facade (39 approved names, stroke 2, `aria-hidden` by default, 16/20/24px via `className`); the payment-method donut stays a custom SVG and receipt PDFs stay jsPDF Courier. Inter 400/500/600/700 and Poppins 600/700 load from one Google Fonts stylesheet (`display=swap`, preconnect); Inter's latin-ext subset covers ₱ (U+20B1).
- **Tokens:** every palette value lives once, in the `@theme` block of `src/styles.css`; source files consume token utilities and raw hex appears only there (tests carry their own fixtures).
- **Artifacts:** screenshots, census JSON, pixel-diff masks and probe scripts in `C:/Users/Noel/Documents/REPORTS/frontend-audit-2026-11-26/` (outside the repo).
- **Verified vs provided:** the five baseline colors are user-provided and confirmed present in code; every other value above was read from source or computed style. Nothing here is invented; where a value is a one-off it is labeled as drift.
- **Scope:** this document is the design system record; it changes only when the system changes, in the same PR.