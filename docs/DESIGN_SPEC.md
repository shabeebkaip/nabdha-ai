# NABDA AI — Design Spec

> Owner: ui-ux-engineer. Status: ready for frontend-developer. Built for the M1 "Tomorrow Cutline" (see PROJECT_PLAN.md). Every token below is paste-ready for Tailwind + shadcn/ui. No frontend question about visual system should be unanswered after reading this file.
>
> **Update (this revision):** canonical marketing visual reference is now **bafarlabs.com** ("Precision Intelligence" system), replacing the old `docs/nabdha-presentation.html` as the primary reference (the deck remains a valid secondary continuity check — its color values already match the client's reference almost exactly, which is why the token table below barely changed). **Fonts changed — hard requirement:** Bricolage Grotesque (EN/Latin) + Almarai (AR) replace the previous Inter / IBM Plex Sans Arabic / Fraunces choices everywhere. See §1.3 and §1.5.

## 0. Users, jobs, aesthetic direction

**Primary user (product):** Saudi SME owner/manager, non-technical, time-poor. Job: "Tell me what's wrong, what's good, and what to do next — in minutes, in Arabic or English."
**Secondary user (product):** Nabda admin operator. Job: "Watch revenue/usage and change a price without a deploy."
**Real audience tomorrow:** an investor watching a 3–5 min demo. Job: "Convince me this is a Business Intelligence platform a serious company would trust with its data — not a chatbot toy."

**Aesthetic direction — name it: "Precision Intelligence."** Canonical reference: **bafarlabs.com** — match it exactly for Nabda AI's marketing pages. Dark void surfaces alternating with cream light sections, electric blue as the one primary action color, a restrained set of accent colors reserved for badges/icons/category dots only, mono uppercase eyebrow labels, radial glow blobs behind hero copy, rounded-2xl cards with hairline borders and a colored accent edge, a numbered process stepper, a logo/tech ticker, and a giant faded wordmark in the footer. The **app** (post-login product) stays the clean **light** BI workspace already spec'd below — dense tables and charts read best light; marketing is dark, app is light, same token family underneath so brand continuity holds across marketing → app → admin.

**Non-negotiable identity cues (client §53/§27):**
- Micro-label eyebrows in monospace, uppercase, letter-spaced ~0.1em, with a short leading rule before the text — reads "technical/precise," not "playful chatbot."
- No chat bubbles anywhere, including the AI Analyst — structured answer cards instead (see §7).
- KPI numbers always in tabular figures, SAR currency, never mirrored in RTL.
- One AI engine name surfaced to the user: **"Nabda AI Intelligence Engine."** Never show model/provider names in UI copy.

---

## 1. Design tokens

### 1.1 Color — source hexes (all contrast-checked below)

| Token | Hex | Role |
|---|---|---|
| `brand-blue` | `#1A56FF` | Primary actions, links, focus ring, primary chart series |
| `brand-ink` | `#05050A` | Marketing true-black background |
| `brand-void-2` | `#0B0B16` | App dark background / marketing panel bg |
| `brand-void-alt` | `#060610` | Alternate marketing dark-section tone (stripe dark sections between voids for depth, per bafarlabs reference) |
| `brand-void-3` | `#12121F` | Card surface on dark |
| `app-cream` | `#F7F6F2` | App light-mode background (warm off-white, not stark) |
| `marketing-cream` | `#F2F0EB` | Marketing alternating light section background (exact bafarlabs/deck cream — distinct token from app bg so the two surfaces can drift independently) |
| `ink-900` (text) | `#14141F` | App light-mode body text |
| `muted-600` | `#5B5B6B` | Secondary text (light mode) |
| `success` (text-safe) | `#0F766E` | Opportunity/positive text, icons |
| `success-bright` | `#00C9A7` | Opportunity badges, chart fill, dark-bg accents |
| `warning` (text-safe) | `#B45309` | Alert/attention text |
| `warning-bright` | `#F59E0B` | Alert badges, chart fill |
| `danger` (text-safe) | `#B91C1C` | Risk text on light bg |
| `danger-solid` | `#DC2626` | Risk buttons/badges with white text |
| `danger-bright` | `#EF4444` | Chart fill, dark-bg accents |
| `insight` (text-safe) | `#6D28D9` | "AI insight" tag text |
| `insight-bright` | `#8B5CF6` | AI/insight badges, chart fill (client also lists `#A855F7` as an acceptable purple accent — treat as an interchangeable dark-bg-only variant of `insight-bright`, do not use either as text on light backgrounds) |
| `pink-bright` | `#EC4899` | Chart series 5 (forecast/secondary) only |

### 1.2 Contrast verification (WCAG 2.1 AA — 4.5:1 normal text / 3:1 large text & UI)

| Pair | Ratio | AA normal text (≥4.5) | AA large/UI (≥3.0) |
|---|---|---|---|
| `#1A56FF` on `#FFFFFF` (links) | 5.50:1 | Pass | Pass |
| `#FFFFFF` on `#1A56FF` (primary button) | 5.50:1 | Pass | Pass |
| `#0F766E` on `#FFFFFF` (opportunity text) | 5.47:1 | Pass | Pass |
| `#00C9A7` on `#FFFFFF` | 2.12:1 | **Fail** — badge/icon/dark-bg only | Fail (still too low, chart fill only) |
| `#B91C1C` on `#FFFFFF` (risk text) | 6.47:1 | Pass | Pass |
| `#EF4444` on `#FFFFFF` | 3.76:1 | Fail | Pass (icons/large tags only) |
| `#FFFFFF` on `#DC2626` (danger button) | 4.83:1 | Pass | Pass |
| `#B45309` on `#FFFFFF` (warning text) | 5.02:1 | Pass | Pass |
| `#F59E0B` on `#FFFFFF` | 2.15:1 | **Fail** — badge/icon/dark-bg only | Fail |
| `#6D28D9` on `#FFFFFF` (insight text) | 7.10:1 | Pass | Pass |
| `#14141F` on `#F7F6F2` (body text) | >15:1 | Pass | Pass |
| `#5B5B6B` on `#FFFFFF` (secondary text) | 6.66:1 | Pass | Pass |
| `#F2F0EB` on `#05050A` (dark hero text) | >15:1 | Pass | Pass |

**Rule for frontend-developer:** the `-bright` colors (`success-bright`, `warning-bright`, `danger-bright`, `insight-bright`, and the alternate `#A855F7`) are for **badges with dark/tinted backgrounds, chart fills, icons ≥24px, and category dots — never small text on a light background.** The text-safe variants are for **all text and text-on-icon pairings on light backgrounds.** This single rule prevents every contrast bug in the palette.

### 1.3 Typography — HARD REQUIREMENT (replaces prior Inter/IBM Plex/Fraunces spec)

| Role | Font | Source | Notes |
|---|---|---|---|
| EN/Latin display + body | **Bricolage Grotesque** | `next/font/google`, `Bricolage_Grotesque` | Variable font, axes `opsz` 12–96 and `wght` 200–800. Import **without** a fixed `weight` array so the full variable range loads; use Tailwind weight utilities (`font-normal` 400 body, `font-semibold` 600 subheads, `font-extrabold` 800 display) — the browser interpolates the `wght` axis. Headlines may optionally add `font-variation-settings: "opsz" 60` (or similar, arbitrary Tailwind value `[font-variation-settings:'opsz'_60]`) to pick up the display optical size at hero sizes; not required for the demo. |
| AR display + body | **Almarai** | `next/font/google`, `Almarai`, weights `300 400 700 800` | Applied to `<html>`/`<body>` via a `font-arabic` class when `locale === 'ar'`. Almarai only ships these 4 static weights — map: 300→light UI text, 400→body, 700→subheads, 800→display headings. Do not request a weight Almarai doesn't have. |
| Micro-label / mono | **JetBrains Mono** | `next/font/google` | Eyebrows, data labels, credit counters, admin config keys. Kept as the one deliberate exception to the two-font system — it is what preserves the reference's "terminal/BI precision" feel; Bricolage Grotesque is not a mono face and would lose that cue. **Decision, not left open:** keep JetBrains Mono; do not switch it to Bricolage. |

**Emphasis-word device (headline):** the reference's "one serif-italic word" treatment is a visual device, not a font mandate — and no serif family is in the approved font list. Resolution: render the single emphasized headline word in **Bricolage Grotesque, synthetic italic (`font-style: italic`), weight 500 (lighter than the surrounding 800 display weight), color `muted-foreground`** (dark theme: `rgba(242,240,235,0.6)`-equivalent token, see §1.5). Synthetic italic is acceptable here because it is applied to 1–3 words only, never to full sentences/paragraphs — do not apply `italic` to body copy.

Numbers, SAR currency, and dates are always wrapped in a `dir="ltr"` inline span (`.nabda-numeral` utility, §1.5) even inside Arabic text, and always render in Bricolage Grotesque / JetBrains Mono tabular figures — never Almarai digits — so KPIs read identically in both locales.

**Type scale** — adopt Tailwind's default scale as-is (already a well-tuned modular scale; no reason to hand-roll one):
`text-xs`(12/16) `text-sm`(14/20) `text-base`(16/24) `text-lg`(18/28) `text-xl`(20/28) `text-2xl`(24/32) `text-3xl`(30/36) `text-4xl`(36/40) `text-5xl`(48/52, marketing hero) `text-6xl`(60/64, marketing hero only).
Headings: Bricolage Grotesque 700–800, `tracking-tight`. Body: Bricolage Grotesque 400–500. Eyebrows/labels: JetBrains Mono 600–700, `text-xs`, `tracking-[0.1em]`, uppercase, preceded by a `w-5 h-px bg-primary` leading rule (bafarlabs signature device).

**Google Fonts import (if not using `next/font/google` for some reason — `next/font` is still preferred, self-hosts + zero layout shift):**
`https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap`

### 1.4 Spacing, radius, shadow, motion

- **Spacing:** Tailwind's default 4px-base scale, unmodified. Standard rhythm: card padding `p-6`, page gutters `px-4 md:px-6 lg:px-8`, section stacking `py-16`/`py-24` (marketing only), grid gaps `gap-4`/`gap-6`.
- **Radius:** `--radius: 0.75rem` (12px) base for app components. **Marketing cards use `rounded-2xl` (16px)** per the bafarlabs reference — a deliberately larger radius than the app, marking marketing as the more editorial surface. shadcn derivation for app: `lg = var(--radius)`, `md = calc(var(--radius) - 2px)`, `sm = calc(var(--radius) - 4px)`. Pills (badges, toggle, avatars, plan-toggle switch): `rounded-full`.
- **Shadows** (soft, low-opacity — premium BI, not heavy skeuomorphic drop shadow):
  - `--shadow-sm: 0 1px 2px rgba(16,16,30,0.04)`
  - `--shadow-md: 0 4px 16px rgba(16,16,30,0.08)`
  - `--shadow-lg: 0 12px 32px rgba(16,16,30,0.12)`
  - `--shadow-glow-primary: 0 12px 30px rgba(26,86,255,0.35)` (marketing CTA hover)
- **Marketing card border (dark surfaces only):** `1px solid rgba(255,255,255,0.06)` — literal rgba, not a themed HSL var, because it is a translucent overlay meant to sit on whichever dark tone (`brand-ink`/`brand-void-2`/`brand-void-alt`) is behind it. Add a colored accent edge via `border-block-start` (top), 2–3px, colored per category (blue/teal/purple/amber) — **use top accent only, not left accent**, so no RTL-mirrored variant is needed (fewer variants, same visual read in both directions).
- **Motion:** one easing curve everywhere — `--ease: cubic-bezier(.16,1,.3,1)`. Durations: `fast=120ms` (hover/press), `base=200ms` (standard transitions, tab/accordion), `slow=400ms` (drawer/sheet/page), `gauge=900ms ease-out` (health-score sweep on mount, once), `ticker=32s linear infinite` (logo ticker, §7). **Reduced motion:** `@media (prefers-reduced-motion: reduce)` — gauge renders at final value with no sweep, pipeline stepper shows static highlighted step (no pulse), card hover-lift (`translateY`) becomes a border-color change only, ticker becomes a static wrapped row (no scroll), all other durations collapse to `1ms`.

### 1.5 Ready-to-paste `globals.css` (shadcn CSS-variable convention, HSL triples)

```css
@layer base {
  :root {
    /* App — light (default product theme) */
    --background: 48 24% 97%;
    --foreground: 240 22% 10%;
    --card: 0 0% 100%;
    --card-foreground: 240 22% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 22% 10%;
    --primary: 224 100% 55%;
    --primary-foreground: 0 0% 100%;
    --secondary: 240 10% 95%;
    --secondary-foreground: 240 22% 10%;
    --muted: 240 10% 95%;
    --muted-foreground: 240 8% 39%;
    --accent: 240 10% 95%;
    --accent-foreground: 240 22% 10%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 240 10% 88%;
    --input: 240 10% 88%;
    --ring: 224 100% 55%;
    --radius: 0.75rem;

    /* Nabda semantic extras (not shadcn defaults) */
    --nabda-success: 175 77% 26%;
    --nabda-success-bright: 170 100% 39%;
    --nabda-warning: 26 90% 37%;
    --nabda-warning-bright: 38 92% 50%;
    --nabda-danger: 0 74% 42%;
    --nabda-danger-bright: 0 84% 60%;
    --nabda-insight: 263 70% 50%;
    --nabda-insight-bright: 258 90% 66%;
    --nabda-brand-ink: 240 33% 3%;
    --nabda-brand-void: 240 33% 6%;
    --nabda-brand-void-alt: 240 45% 4%;
    --nabda-marketing-cream: 43 21% 94%;

    /* Chart palette (Recharts / shadcn chart) */
    --chart-1: 224 100% 55%;
    --chart-2: 170 100% 39%;
    --chart-3: 258 90% 66%;
    --chart-4: 38 92% 50%;
    --chart-5: 330 81% 60%;
    --chart-neutral: 240 8% 60%;

    --shadow-glow-primary: 0 12px 30px rgba(26,86,255,0.35);
    --nabda-marketing-card-border: rgba(255,255,255,0.06);
    --ease-nabda: cubic-bezier(.16,1,.3,1);
  }

  .dark {
    --background: 240 33% 6%;
    --foreground: 48 24% 94%;
    --card: 240 27% 10%;
    --card-foreground: 48 24% 94%;
    --popover: 240 27% 10%;
    --popover-foreground: 48 24% 94%;
    --primary: 224 100% 62%;
    --primary-foreground: 240 33% 6%;
    --secondary: 240 20% 16%;
    --secondary-foreground: 48 24% 94%;
    --muted: 240 20% 16%;
    --muted-foreground: 240 10% 65%;
    --accent: 240 20% 16%;
    --accent-foreground: 48 24% 94%;
    --destructive: 0 84% 65%;
    --destructive-foreground: 240 33% 6%;
    --border: 240 15% 20%;
    --input: 240 15% 20%;
    --ring: 224 100% 62%;

    --nabda-success: 170 80% 55%;
    --nabda-success-bright: 170 100% 45%;
    --nabda-warning: 38 92% 58%;
    --nabda-warning-bright: 38 92% 55%;
    --nabda-danger: 0 84% 65%;
    --nabda-danger-bright: 0 84% 65%;
    --nabda-insight: 258 90% 72%;
    --nabda-insight-bright: 258 90% 72%;
  }

  /* Marketing pages always force dark regardless of app theme */
  .theme-marketing {
    --background: 240 33% 3%;
    --foreground: 48 24% 94%;
  }
}

.nabda-numeral { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }
```

`tailwind.config.ts` additions:
```ts
fontFamily: {
  sans: ["var(--font-bricolage)", "system-ui", "sans-serif"],
  arabic: ["var(--font-almarai)", "var(--font-bricolage)", "system-ui"],
  mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
},
colors: {
  border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
  background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
  primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
  secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
  destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
  muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
  accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
  popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
  card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
  success: { DEFAULT: "hsl(var(--nabda-success))", bright: "hsl(var(--nabda-success-bright))" },
  warning: { DEFAULT: "hsl(var(--nabda-warning))", bright: "hsl(var(--nabda-warning-bright))" },
  danger:  { DEFAULT: "hsl(var(--nabda-danger))",  bright: "hsl(var(--nabda-danger-bright))" },
  insight: { DEFAULT: "hsl(var(--nabda-insight))", bright: "hsl(var(--nabda-insight-bright))" },
  chart: { 1:"hsl(var(--chart-1))",2:"hsl(var(--chart-2))",3:"hsl(var(--chart-3))",4:"hsl(var(--chart-4))",5:"hsl(var(--chart-5))",neutral:"hsl(var(--chart-neutral))" },
  marketing: { ink: "hsl(var(--nabda-brand-ink))", void: "hsl(var(--nabda-brand-void))", "void-alt": "hsl(var(--nabda-brand-void-alt))", cream: "hsl(var(--nabda-marketing-cream))" },
},
borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
boxShadow: { "glow-primary": "var(--shadow-glow-primary)" },
```

Font loading (`app/layout.tsx` / `app/[locale]/layout.tsx`):
```ts
import { Bricolage_Grotesque, Almarai } from "next/font/google";
import localFont from "next/font/local"; // only if JetBrains Mono is vendored locally; otherwise:
import { JetBrains_Mono } from "next/font/google";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const almarai = Almarai({ subsets: ["arabic"], weight: ["300","400","700","800"], variable: "--font-almarai" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });
```
Apply `bricolage.variable`, `almarai.variable`, `mono.variable` as classes on `<html>`; toggle a `font-arabic` class on `<html>`/`<body>` when `locale === 'ar'` so Arabic text falls back to Almarai first (Latin brand word "Nabda AI" and numerals still render fine inside Almarai-classed text because numerals are pinned to `.nabda-numeral`, not left to the surrounding font).

---

## 2. RTL / bilingual spec

- **Mechanism:** `next-intl` with `[locale]` routing (`/en`, `/ar`). `<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>` set in the root layout — this is the single source of truth for direction; no component ever reads locale to decide left/right itself.
- **CSS rule:** 100% logical properties. No component may use `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`. Use Tailwind's logical utilities: `ms-`/`me-` (margin-inline-start/end), `ps-`/`pe-`, `start-`/`end-`, `text-start`/`text-end`. This is a code-review gate item (flag to code-reviewer).
- **Mirroring:** only elements with inherent directionality mirror in RTL — chevrons, back/forward arrows, the sidebar-collapse icon, drag-handle icons. Apply via `[dir="rtl"] .icon-directional { transform: scaleX(-1); }` utility class, applied explicitly per icon, never globally.
- **What never mirrors:** numbers, SAR currency, dates, percentages, chart X/Y axes and data point order, the Health Score gauge sweep direction, credit meters. Time series always read left→right chronologically regardless of locale — this is a data-visualization convention, not a layout one. Wrap all numeric content in `.nabda-numeral` (defined in §1.5).
- **Charts (Recharts):** container gets `dir="ltr"` explicitly even on an RTL page; chart *labels/legend/tooltips* (text) render in the page's font and reading direction; only the plot area stays LTR-fixed.
- **Sidebar:** in RTL, the sidebar docks to the visual right (`inset-inline-start` handles this automatically if built with logical properties — no separate RTL variant needed).
- **Forms:** input `dir` inherits from `<html>`; email/URL/numeric inputs get `dir="ltr"` explicitly (standard practice, prevents cursor-jump bugs).
- **Fonts:** Arabic uses **Almarai** exclusively when `locale === 'ar'` (brand word "Nabda AI" and any inline English inside Arabic copy still render fine — Almarai has a Latin fallback cut, and numerals are always pinned via `.nabda-numeral`). Bricolage Grotesque is never mixed into Arabic body copy.
- **Content parity:** every string in the M1 screen list ships in both `en.json` and `ar.json` before a screen is called done — missing-translation fallback (raw key shown) is a QA-blocking bug, not cosmetic.
- **Locale switcher:** persistent control in the marketing topbar and the app topbar (flag/label toggle: "EN | AR"), swaps route locale and persists to a cookie; does not require login.

---

## 3. Information architecture

### 3.1 Site map

```
Marketing (dark theme, public)
├── / (Landing)
├── /pricing
├── /ai-solutions
├── /consultation
├── /training
├── /enterprise
├── /login
├── /signup  (→ Free Trial provisioning)

App (light theme, authenticated)  — layout: Sidebar + Topbar
├── /app/onboarding            (wizard, first login only)
├── /app/data                  (Upload / connected sources)
├── /app/processing/[datasetId] (transient AI processing state)
├── /app/dashboard              (Executive Dashboard — default landing after onboarding)
├── /app/insights                (Risk & Opportunity Center)
├── /app/recommendations
├── /app/analyst                (AI Analyst Chat)
├── /app/reports                (list) → /app/reports/[id] (viewer)
├── /app/presentations           (list) → /app/presentations/new → /app/presentations/[id]
├── /app/credits                (Credit Wallet)
├── /app/ai-solutions            (in-app mirror of marketing page, contextual)
├── /app/consultation /training /integrations/new /enterprise/new  (lead forms)
├── /app/billing
├── /app/settings

Admin (light theme, role=admin only) — separate shell
├── /admin (Overview)
├── /admin/users
├── /admin/revenue
├── /admin/usage
├── /admin/leads
├── /admin/config   (admin_config live editor — pricing/credits/features/ai-model/add-ons)
```

### 3.2 App navigation model (sidebar — client §28/§45 merged into one MVP nav)

Order (top→bottom): **Dashboard, My Data, AI Analyst, Insights** *(Risks & Opportunities)*, **Recommendations, Reports, Presentations, Credits, AI Solutions, Consultation, Training, Integrations, Billing, Settings.** Admin users additionally see an **"Admin"** entry pinned above Settings, visually separated by a `Separator`.

Sidebar states: expanded (260px, icon+label) at `lg+`; collapsed to a 72px icon-rail at `md`–`lg` (label on hover tooltip); fully hidden behind a hamburger-triggered `Sheet` drawer below `md`. Active route: filled icon + `bg-accent` pill + left/`start` 2px `bg-primary` indicator bar.

---

## 4. Core user flows (success, error, empty, loading)

### Flow A — Sign up → Free Trial → Onboarding → Upload → Processing → Dashboard

| # | Step | User sees | System does | Loading | Empty | Error |
|---|---|---|---|---|---|---|
| 1 | Landing → "Start Free Trial" | Hero, How-it-works, CTA | Routes to `/signup` | — | — | — |
| 2 | Sign up | Name, Email, Password, Company name, Industry, Company size (single form, client §20 Step 1) | On submit: creates user + company + trial subscription + seeds both wallets | Button shows spinner, disabled | — | Inline field errors (Zod messages); "email already registered" → link to `/login` |
| 3 | Onboarding Step 1 — Company Info | Stepper (1/3), fields per client §6 (industry, size, employees, branches, country default Saudi Arabia, business model, objective) | Autosaves to `companies` on "Next" | Next button spinner | — | Required-field inline errors; toast on network failure with Retry |
| 4 | Onboarding Step 2 — Data Sources | Checkbox grid of source types; Excel/CSV/Manual = enabled; API/ERP/CRM/POS/etc = disabled with "Coming soon" badge (still visible — shows scale per client §52) | Stores selection | — | — | — |
| 5 | Onboarding Step 3 — Review | Summary card of steps 1–2, "Continue to Data Upload" | — | — | — | — |
| 6 | Data Upload | Two equal-weight cards: **"Use Nabda Retail Demo Data"** (recommended badge, one click) and **"Upload your files"** (dropzone, .xlsx/.csv/.pdf, multi-file, remove button per file); tertiary link "Enter data manually" | On confirm: creates `dataset` row, uploads to Blob (real upload) or marks `source_type=demo` | Dropzone shows per-file progress bar | No files yet: dropzone shows illustration + "Drag files here or click to browse" | Wrong file type → inline red text under dropzone, file not added; upload network failure → retry button on that file row |
| 7 | AI Processing | Full-bleed centered pipeline stepper: Upload ✓ → Validating → Cleaning → Classifying → Analyzing → Generating Insights → Ready. Live status line changes text; progress bar 0–100%. `aria-live="polite"` region announces each stage change | Server runs the 4-layer analysis (real if `ANTHROPIC_API_KEY` set, pre-baked fallback otherwise — user never sees which) | The entire screen *is* the loading state, min 3s even if the fallback returns instantly (feels substantial, not fake-instant) | — | If analysis truly fails (both live and fallback error): "We hit a snag analyzing your data. [Retry] [Use Demo Data instead]" — never a raw stack trace |
| 8 | Dashboard | Health Score 78, KPI cards, charts, top risks/opportunities preview | Analysis complete → redirect | Skeleton cards while `/api/dashboard` resolves (should be instant, data already computed in step 7) | First-ever visit with literally zero data (shouldn't happen post-onboarding, but guard): empty-state card "Upload data to see your Business Health Score" with CTA back to `/app/data` | Fetch failure → `Alert` banner "Couldn't load your dashboard" + Retry, cards show skeleton-to-error swap, not blank |

### Flow B — Insights → Recommendations → Report → Presentation → Credits

| # | Step | Sees | System does | Empty | Error |
|---|---|---|---|---|---|
| 1 | Risk & Opportunity Center | Tabs (All/Risks/Opportunities), ≥3 of each as cards | Reads `insights` table | "No risks detected yet — run a new analysis" (only relevant pre-first-analysis) | Load failure → Alert + Retry |
| 2 | Expand an insight | Accordion opens: Why it happened / Business impact / Recommended action | — | — | — |
| 3 | Recommendations | Prioritized cards (High/Med/Low), "Take Action" / "Dismiss" | "Take Action" opens Dialog: demo action confirmation, or deep-links to Consultation/Integration form if the recommendation implies a service | Zero recommendations (edge case) → "Run an analysis to get recommendations" + CTA | — |
| 4 | Report Generator | "Generate Report" button on Dashboard/Insights/Recommendations, shows credit cost tooltip ("Uses 6 credits") | POST generates report, deducts credits transactionally, writes `credit_transactions` | Button disabled + tooltip "Not enough credits — Buy more" if balance < cost | If wallet already at 0 mid-click (race) → toast "Insufficient credits", no deduction, no report |
| 5 | Report Viewer | TOC sidebar (11 sections), main content, "Download PDF" / "Generate Presentation" | PDF pre-rendered server-side (React-PDF), link ready | Generating: button shows spinner "Preparing PDF…" | PDF generation failure → toast "PDF failed, view online instead," online view still works (graceful degradation) |
| 6 | Presentation Generator | Form: Topic (prefilled from report), Slide count, Style, Audience, Language → Generate | Deducts from Slides wallet at 1 credit/slide | Slide grid shows skeleton tiles while generating | Insufficient slide-credits → same pattern as step 4 |
| 7 | Credits updated | Toast + live meter animates down (e.g. 250→244) everywhere the meter is shown (topbar chip + wallet page) | — | — | — |

### Flow C — AI Analyst Chat

| # | Sees | System does | Loading | Empty | Error |
|---|---|---|---|---|---|
| 1 | Suggested-question chips (client §21, 5 questions) above an input bar; no prior bubbles-chrome | — | — | First visit: chips + placeholder text, no history | — |
| 2 | User types or clicks a chip, hits Enter | Streams request with dataset context to the engine | Answer card appears with a skeleton, then streams text into **Answer** first, then **Possible Reasons**, then **Recommended Actions** (staged reveal, not one blob) | — | Stream failure mid-way → partial card kept, small inline "Response interrupted — Retry" instead of wiping the answer |
| 3 | Footer of each answer card: "Based on: Nabda Retail Demo dataset" | Builds trust, non-negotiable per identity goal | — | — | — |

### Flow D — Pricing → Upgrade → Services (Consultation/Training/Integration/Enterprise)

| # | Sees | System does | Empty | Error |
|---|---|---|---|---|
| 1 | Pricing page, Monthly/Annual toggle, 4 cards | Toggle recalculates displayed price client-side from `admin_config` values (monthly×12×0.8 for annual) | — | Config fetch fails → falls back to last-known static defaults, no blank pricing page |
| 2 | "Upgrade" on a plan card | Demo confirmation Dialog: "This is a demo — no payment is taken. Your plan is now Growth." Updates `subscriptions.plan` | — | — |
| 3 | Consultation / Training / Integration / Enterprise forms | Field-validated form (client §20/§47/§48/§49 field lists) | On submit: writes a `leads` row, success screen "We'll be in touch within 1 business day" | — | Validation errors inline; submit failure → toast + form values retained (never clear a failed form) |

### Flow E — Admin

| # | Sees | System does | Empty | Error |
|---|---|---|---|---|
| 1 | Overview stat cards (Users/MRR/Trials/Conversion) | Reads aggregate queries | Pre-any-users state: cards show "0" not blank, with a subtle "waiting for first signups" caption | Query failure → per-card error chip, not a full-page crash |
| 2 | Config tab | Table grouped by category, each row: key, current value, **inline edit** (click value → becomes `Input` + Save/Cancel icon buttons) | Save writes `admin_config`, and the pricing page reflects it on next load (proves AC5's "config not hard-coded" story live, on stage) | — | Save failure → row reverts, inline error text under that row |
| 3 | Leads tab | Table of submitted service leads with status badge (`New`) | — | "No leads yet" empty state | — |

---

## 5. Business Health Score component (hero visual — spec in full)

**Structure:** one `Card` containing two zones, side-by-side at `lg+` (stacked on mobile):
1. **Arc gauge** (custom SVG, ~180° semicircle, rounded stroke caps): 0–100 scale. Filled arc animates 0→score over `900ms` on mount (`--ease-nabda`), big tabular number in the center (`text-5xl font-extrabold`, Bricolage Grotesque), "/100" in `text-muted-foreground`, band label below ("Strong" / "Needs Attention" / "At Risk"), small delta chip if a prior score exists ("+4 vs last month", teal if positive, red if negative — using text-safe colors).
   - Band coloring: **0–40 → `danger-bright` arc / `danger` text**, **41–70 → `warning-bright` arc / `warning` text**, **71–100 → `success-bright` arc / `success` text**. Demo value 78 → success band.
2. **6-factor breakdown**: Revenue, Customers, Inventory, Finance/Profitability, Operations/Growth, Risk — six rows, each a label + shadcn `Progress` bar (0–100, colored by that factor's own band using the same 3-band rule) + numeric score at the row end. This is a deliberate choice over a radar/spider chart: **6 Progress rows ship tomorrow (demo-critical, ~30 min to build on an existing shadcn primitive). A Recharts `RadarChart` is a nicer report-style visual but is explicitly nice-to-have / M2** — flag it, don't build it under time pressure.

Caption under the whole card, small `text-muted-foreground`: *"Business Health Score is an analytical indicator based on available data, not an independent financial or audit judgment."* (client §34/§8 verbatim disclaimer — must ship, it's a trust/legal cue, not decoration.)

---

## 6. Component inventory (shadcn/ui primitives → Nabda usage)

| Component | shadcn primitive | Variants / props | States to implement |
|---|---|---|---|
| Button | `button` | `primary` (blue), `secondary`, `outline`, `ghost`, `destructive`, sizes `sm/md/lg`, icon-only | default, hover, focus-visible (ring), active/pressed, disabled, loading (spinner replaces label, width locked to prevent layout shift) |
| Card | `card` | flat / elevated (`shadow-md`) / interactive (hover lift `translateY(-2px)` + `shadow-lg`, disabled under reduced-motion). Marketing variant: `rounded-2xl`, `1px solid rgba(255,255,255,0.06)` border, optional `border-t-2` colored accent | default, hover (interactive only), focus-within |
| Badge | `badge` | severity variants mapped to text-safe colors: `risk-high` (danger-solid bg/white text), `risk-medium`/`risk-low` (warning/muted outline), `opportunity` (success outline), `insight` (insight outline), `new` (primary), `coming-soon` (muted, disabled look) | static; no interactive state needed |
| Tabs | `tabs` | Insights (All/Risks/Opportunities), Admin sections, Report TOC-as-tabs on mobile | keyboard arrow-key navigation (native), focus ring on tab, active underline `bg-primary` |
| Sheet | `sheet` | mobile sidebar drawer, "Ask Nabda AI" quick-access panel (nice-to-have FAB), Buy Credits panel | open/close, focus trap, Esc closes, overlay click closes |
| Sidebar | `sidebar` (shadcn sidebar block) | app + admin shells | expanded / icon-rail / drawer (see §3.2), active-route highlight |
| Dialog | `dialog` | Upgrade confirm, Take-Action confirm, Buy Credits confirm | open/close, focus trap, Esc, destructive actions get `destructive` button variant |
| Dropdown Menu | `dropdown-menu` | user avatar menu, locale switcher, table row actions | keyboard nav, focus ring, `aria-expanded` |
| Select | `select` | Onboarding fields, presentation style/audience, plan filters | default, focus, disabled ("Coming soon" data-source rows use disabled styling instead of Select where checkboxes are used) |
| Input / Textarea | `input` / `textarea` | forms, chat input | default, focus, error (red border + `aria-describedby` message), disabled |
| Form | `form` (react-hook-form + zod resolver) | every form in the app | inline validation on blur, submit-time full validation, error summary announced via `aria-live` on submit |
| Progress | `progress` | Health Score 6-factor bars, credit wallet meter, file upload progress, AI processing % | animated fill, color-banded (see §5), reduced-motion = instant fill |
| Table | `table` | Plan comparison, Admin users/revenue/usage/leads, Credit transaction history | sortable header (usage/admin tables), sticky header on scroll, empty-state row, loading = skeleton rows |
| Accordion | `accordion` | Insight card expand (Why/Impact/Action), Pricing FAQ (nice-to-have) | single-open, keyboard toggle, focus ring |
| Switch | `switch` | Monthly/Annual pricing toggle, Settings dark-mode toggle (nice-to-have) | on/off, focus, disabled |
| Avatar | `avatar` | topbar user menu | image / initials fallback |
| Tooltip | `tooltip` | credit-cost hints on generate buttons, disabled-button reasons | hover + keyboard focus triggers it (not hover-only) |
| Toast (sonner) | `sonner` | credit deduction, save confirmations, errors | success/error/info variants, auto-dismiss 4s, screen-reader announced |
| Skeleton | `skeleton` | every async card/table before data resolves | shimmer animation, disabled under reduced-motion |
| Alert | `alert` | dashboard/report load failures, processing failure | default / destructive |
| Chart | `chart` (shadcn chart wrapper on Recharts) | Revenue trend (Line + forecast dashed segment), Top products (Bar), Customer trend (Line/Area), Admin revenue-by-stream (stacked Bar) | loading = skeleton block same size as chart, empty = "Not enough data yet" placeholder inside the chart frame, each chart has an `aria-label` one-line trend summary |
| **HealthScoreGauge** (custom) | composed SVG + Card | see §5 | mount animation, reduced-motion static |
| **KPICard** (custom) | Card + JetBrains Mono eyebrow + tabular number + delta chip | value, label, delta, trend sparkline optional | loading skeleton, error mini-state ("—") |
| **InsightCard** (custom) | Card + Badge + Accordion | risk / opportunity variant | default, expanded, loading skeleton |
| **PipelineStepper** (custom) | composed Badge/Separator, not a shadcn primitive (too specific to build generically) | 7 stages | active (pulsing dot, disabled under reduced-motion), complete (check), pending |
| **CreditMeter** (custom) | Progress + JetBrains Mono numerals | wallet type (AI/Slides), used/remaining/reset date | low-balance state (<10%) switches Progress color to `warning-bright` |
| **PricingCard** (custom) | Card + Badge("Recommended") + Button | 4 variants incl. Custom (CTA = "Contact Sales" not "Upgrade") | default, recommended (ring-2 ring-primary + slight scale), current-plan (disabled button "Current Plan") |
| **AdminConfigRow** (custom) | Table row + Input + Button(icon) | editable value cell | view / editing / saving (spinner) / error (revert + inline message) |
| **SlideThumbnail** (custom) | Card, aspect-video | title + bullet preview | skeleton while generating |
| **LeadForm** (custom) | Form composition per service | 4 instances (Consultation/Training/Integration/Enterprise) with different field sets per client §20/§47/§48/§49 | validating, submitting, success (replaces form with confirmation), error |
| **LogoTicker** (custom, marketing) | infinite CSS-scroll row (`animation: ticker 32s linear infinite`) | logo/tech strip under hero | static wrapped row under reduced-motion |
| **GiantWordmark** (custom, marketing) | huge low-opacity text block (`text-[12vw] opacity-[0.06]`) | footer background device | none (decorative, `aria-hidden="true"`) |
| **ProcessStepper** (custom, marketing) | numbered badges + connecting rule | "How it Works" 4-step rail | horizontal `lg+`, stacked mobile |

---

## 7. Screen layout specs (demo-critical screens)

For every screen: **mobile-first**, breakpoints per §8. Unless noted, content max-width in the app is `max-w-7xl` centered with `px-4 md:px-6 lg:px-8` gutters.

**01 — Landing (marketing, dark theme forced via `.theme-marketing`).** Match bafarlabs.com's signature devices exactly:
- Sticky topbar (logo, nav links hidden <900px behind menu, primary CTA "Start Free Trial").
- **Eyebrow device:** `w-5 h-px bg-primary` rule + JetBrains Mono uppercase label (e.g. "AI BUSINESS INTELLIGENCE PLATFORM"), used above every major section heading, not just the hero.
- **Hero headline:** Bricolage Grotesque 800, `text-5xl`/`text-6xl`, one word in synthetic-italic 500 weight muted color (see §1.3 resolution) — e.g. "Turn Your Business Data Into *Intelligent* Decisions." Subhead, primary CTA + secondary "See How It Works."
- **Hero background:** radial blue (`primary`) + teal (`success-bright`) glow blobs (`blur-[80px]`, low opacity ~12–18%), plus a faint CSS grid-line mask (`background-image: linear-gradient` grid at ~4–6% opacity) behind the copy — glows/grid never sit behind body text at full contrast-breaking opacity; verify contrast of headline text over the busiest blob overlap before shipping.
- **Section alternation:** dark (`brand-ink`/`brand-void-2`/`brand-void-alt`, rotate between the three for depth) ↔ light (`marketing-cream`) sections down the page, per bafarlabs.
- **Logo/tech ticker:** horizontal infinite-scroll row directly under the hero (client logos or "Powered by Nabda AI Intelligence Engine" partner-style row) — cheap to build, include if landing-page time allows (not release-blocking).
- **Capability cards:** `rounded-2xl`, hairline border, `border-t-2` colored accent (rotate blue/teal/purple/amber per card), a large faded icon (`opacity-[0.08]`, 100–140px) pinned to the `inset-block-end`/`inset-inline-end` corner — same device as the existing pitch deck's `.card .ghost`, just redone with logical properties for RTL safety.
- **How-It-Works:** `ProcessStepper` — numbered mono badges (01–04) — Connect → Analyze → Understand → Act — horizontal rail `lg+`, stacked cards mobile.
- **Trust strip:** "Saudi-built · Enterprise-ready · Bank-grade encryption" mono microcopy row.
- **Pricing preview:** 3 cards + "See full pricing."
- **Footer:** nav link groups + AR/EN switch + legal links, with a `GiantWordmark` ("NABDA AI") bleeding off the bottom edge at ~6% opacity, `aria-hidden`.

**02/03 — Auth / Free Trial.** Single-column centered `Card`, max-width `max-w-md`, dark theme (continuity with landing). Tabs: Sign in / Sign up. Signup form fields per Flow A step 2. Social auth: not in scope for tomorrow (flag as nice-to-have, do not stub broken buttons).

**04 — Onboarding wizard.** Centered `max-w-2xl` card on light app background, 3-dot/number `Stepper` header, one step per screen, `Back`/`Next` buttons bottom-right(LTR)/bottom-start(logical), progress persists on refresh (autosave, per Flow A).

**05 — Data Upload.** `max-w-4xl`, two-column grid at `md+` (stacked mobile): left = "Use Nabda Retail Demo Data" (recommended card, subtle `ring-1 ring-primary/30`, dataset stat chips: "12 months · 340 orders · 58 products · 1,200 customers"), right = upload dropzone card. Manual-entry as a small text link below, opens a minimal `Dialog` with 4–5 basic KPI inputs (nice-to-have depth — link must exist, full form can be thin).

**06 — AI Processing.** Full-viewport, no sidebar/topbar chrome (focus mode), centered `PipelineStepper` vertical list + status line + `Progress` bar, ambient background motion (respects reduced-motion).

**07 — Executive Dashboard.** App shell (sidebar+topbar). Row 1: Health Score card, full-width. Row 2: KPI grid — 2 cols mobile, 3 cols `md`, 4 cols `xl` (Revenue, Growth %, Customers/Retention, Inventory Risk — client §33 numbers). Row 3: charts grid — 1 col mobile/`md`, 2 col `lg+` (Revenue Trend w/ forecast dash, Top Products bar). Row 4: 3-column `lg+` strip (Top Risks / Top Opportunities / Top Recommendation), 1 col stacked below `lg`. Floating "Ask Nabda AI" button bottom-end (nice-to-have quick access; the dedicated `/app/analyst` page is demo-critical either way).

**08/09 — Insights / Risk & Opportunity Center.** Tabs at top, filter chips (severity) inline-end of tabs at `md+`, wraps below on mobile. Card grid: 1 col mobile, 2 col `md`, 3 col `xl`.

**10 — Recommendations.** Single column list (cards read better linearly here, priority order matters), `max-w-3xl`, priority badge + "Take Action"/"Dismiss" button row per card.

**11 — AI Analyst Chat.** `max-w-3xl` centered column. Suggested-chip row (wraps), scrollable answer stream area (`min-h-[50vh]`), sticky input bar at bottom of the viewport (not page) with Textarea + Send.

**12 — Report Viewer.** Two-column at `lg+`: sticky TOC sidebar (`w-64`) + main content (`flex-1 max-w-3xl`); TOC collapses to a `Select`-driven jump menu below `lg`. Action bar (Download PDF / Generate Presentation) sticky at top of content pane.

**13 — Presentation Generator.** Form step (`max-w-xl` centered) → result step (thumbnail grid, 1 col mobile, 2 col `md`, 3 col `lg+`), each thumbnail opens a `Dialog` with a larger preview.

**14 — Pricing.** `max-w-6xl`. Toggle centered above cards. Card grid: 1 col mobile, 2 col `sm`, 4 col `lg+` (Basic/Growth[elevated]/Pro/Custom). Comparison `Table` below, full-bleed on mobile with horizontal scroll (`overflow-x-auto`), sticky first column.

**15 — Credit Wallet.** Two wallet cards side-by-side `md+` (stacked mobile): AI Credits, Slides. Action row (Generate Report / Buy Credits / Upgrade) below. Transaction `Table` at bottom.

**22 — Admin Dashboard.** Separate shell, same token system, `Tabs` for Overview/Users/Revenue/Usage/Leads/Config. Stat-card row 2 col mobile / 4 col `lg+`. Config tab table full-width with inline-edit cells (see §6 AdminConfigRow).

---

## 8. Responsive spec (concrete, not "it adapts")

| Breakpoint | Width | Sidebar | KPI grid | Chart grid | Pricing cards | Tables |
|---|---|---|---|---|---|---|
| Base (mobile) | 0–767px | Hidden, hamburger → `Sheet` drawer | 2 cols | 1 col, stacked | 1 col | Horizontal scroll, sticky first col |
| `md` | 768–1023px | Hidden, hamburger → `Sheet` drawer | 3 cols | 1 col | 2 cols | Horizontal scroll |
| `lg` | 1024–1279px | Icon-rail, 72px, tooltip labels | 3 cols | 2 cols | 4 cols (tight) | Full table, no scroll |
| `xl+` | 1280px+ | Full, 260px, icon+label | 4 cols | 2 cols | 4 cols | Full table |

Touch targets: all interactive elements ≥44×44px regardless of breakpoint (buttons `min-h-11`, icon-buttons `size-11` on touch contexts, `size-9` acceptable only for mouse-only desktop dropdown triggers).

---

## 9. Accessibility spec

- **Contrast:** per §1.2 table; the text-safe/-bright rule is the enforcement mechanism.
- **Focus:** every interactive element gets a visible `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background` (shadcn default) — never `outline-none` without a replacement ring.
- **Keyboard:** Tab order follows visual/DOM order (logical properties keep this correct in RTL automatically); `Tabs`/`Accordion`/`Dropdown Menu`/`Select` use native ARIA patterns via Radix (shadcn's underlying primitive) — arrow keys move between tab triggers, Esc closes menus/dialogs/sheets and returns focus to the trigger. Chat input: `Enter` sends, `Shift+Enter` inserts a newline.
- **Skip link:** "Skip to content" as the first focusable element on every authenticated page, jumping past the sidebar.
- **ARIA (only where semantic HTML is insufficient):** `aria-live="polite"` region on the AI Processing status line and the streaming chat answer; `aria-label` on icon-only buttons (locale switch, notification bell, sidebar collapse); `aria-describedby` linking form inputs to their error text; charts get one-line `aria-label` trend summaries (e.g. "Revenue trend, rising, ends at 1.24 million SAR"); decorative marketing devices (`GiantWordmark`, glow blobs, grid mask) get `aria-hidden="true"`.
- **Touch targets:** ≥44px, see §8.
- **Color is never the sole indicator:** every risk/opportunity/warning badge pairs color with an icon + text label ("High Risk", not just a red dot).
- **Reduced motion:** `prefers-reduced-motion: reduce` — see §1.4 for the exact fallback per animated component (gauge, stepper, card hover, ticker).
- **Forms:** labels always visible (no placeholder-as-label), error text programmatically associated, submit button disabled state also carries `aria-disabled` + tooltip explaining why (e.g. insufficient credits) rather than being silently inert.

---

## 10. Demo-critical vs nice-to-have — explicit build-order flags

**Demo-critical (must ship tomorrow):** all of §7's screens in light app theme + dark marketing theme matching bafarlabs devices (eyebrow+rule, hero headline+glow/grid, alternating dark/cream sections, capability cards with corner icon, process stepper, footer wordmark); Health Score arc gauge + 6-factor Progress rows; risk/opportunity cards with What/Why/Impact/Action; structured (non-bubble) AI chat; report PDF download; presentation thumbnail-grid demo output; pricing monthly/annual toggle reading from config; credit meter with live deduction; all 4 lead forms; admin overview + config live-edit tab; full AR/EN + RTL on Landing and Dashboard (AC6); Bricolage Grotesque + Almarai wired as the only two UI fonts.

**Nice-to-have (build only if time remains, tokens/structure already support adding them later without rework):** logo/tech ticker (cheap, include if landing-page time allows, not release-blocking); app-wide dark-mode toggle (tokens exist now, §1.5; wiring the `Switch` is optional polish); floating "Ask Nabda AI" quick-access FAB on Dashboard (the dedicated page is enough); Radar-chart alternative for the 6-factor breakdown; report Share/Compare buttons (render disabled with a tooltip, don't hide — shows product scale per client §52); Pricing FAQ accordion; sortable admin tables; manual-data-entry form depth beyond 4–5 fields; notification bell functionality (icon can render inert for the demo, must not be a broken/dead click that throws a console error); `opsz` axis fine-tuning on Bricolage Grotesque display headings (variable-default rendering is acceptable without it).

---

## 11. Handoff checklist for frontend-developer

1. `globals.css` and `tailwind.config.ts` updated verbatim from §1.5 before any screen work starts.
2. Fonts wired via `next/font/google`: **Bricolage Grotesque** (`--font-bricolage`, variable, no fixed weight array), **Almarai** (`--font-almarai`, weights `300/400/700/800`), **JetBrains Mono** (`--font-jetbrains-mono`, eyebrows/data-labels only); `font-arabic` class applied to `<html>`/`<body>` when `locale === 'ar'`. No Inter, IBM Plex Sans Arabic, or Fraunces anywhere in the codebase (superseded).
3. Marketing pages visually match **bafarlabs.com**'s Precision Intelligence system: dark/cream alternating sections, radial glow + grid-mask hero, eyebrow+rule labels, rounded-2xl hairline-border cards with top accent, capability-card corner icon, logo ticker (if time allows), numbered process stepper, footer giant wordmark.
4. `next-intl` locale routing live with `dir` set from locale in the root layout; every string used in a demo-critical screen exists in both `en.json` and `ar.json` — no raw-key fallbacks visible.
5. Zero `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-`/`text-left`/`text-right` utilities anywhere in the app (logical properties only) — grep-able, should be a code-review gate.
6. Every "-bright" color token used only on badges/icons/chart-fills/dark surfaces; every text/icon-on-light instance uses the text-safe token (§1.2 rule).
7. Health Score gauge matches §5 exactly: 3-color banding, center tabular number, disclaimer caption present.
8. AI Analyst renders as structured Answer/Reasons/Actions cards — no chat bubbles, no avatar-bubble chrome.
9. Every async surface (dashboard cards, charts, tables, chat answers) has a `Skeleton` loading state and an `Alert`/inline error state — no component may render blank on slow network or API failure.
10. Every list-type screen (Insights, Recommendations, Reports, Presentations, Admin Leads/Users tables) has a defined empty state per §4 flow tables — not a bare "no data" string.
11. All interactive elements pass a keyboard-only pass: Tab reaches everything, Esc closes overlays, focus ring visible throughout, chat Enter/Shift+Enter works.
12. Credit deduction is visibly transactional in the UI: meter animates, a toast confirms, and the number is consistent across topbar chip + wallet page + admin usage tab.
13. Admin `/admin/config` edit → Pricing page value change is demoed working end-to-end before calling M1 done (this is the literal proof of AC5 / client §52).
14. `prefers-reduced-motion` fallbacks implemented for: gauge sweep, pipeline stepper pulse, card hover-lift, skeleton shimmer, logo ticker.
15. Run the full §32/§54 client demo script end-to-end on a deployed preview in both `en` and `ar` before marking M1 done — this is the actual acceptance test, not a per-component checklist.
