# NABDA AI — Pricing Conflicts & Open Decisions

> The client shared multiple documents with **contradictory pricing**. This MUST be resolved
> before the pricing page and credit engine are locked. Doc A §52 already says: do NOT hard-code
> prices — make them admin-configurable. We follow that. But the DEMO needs default values, so
> the human must pick which set the investor sees tomorrow.

## CONFLICT 1 — Two different subscription price/credit models

| Plan | Doc A + Doc C (Investor spec/deck) | Doc B §13 + Doc D (Design prompt / pricing summary) |
|---|---|---|
| Basic | **99 SAR/mo**, 50 credits | **49 SAR/mo**, 1,000 credits |
| Growth | **199 SAR/mo**, 120 credits | **149 SAR/mo**, 4,000 credits |
| Pro | **399 SAR/mo**, 250 credits | **3,399 SAR/mo**, 12,000 credits |
| Enterprise | Custom | Custom |

- Doc A/C: credits = "reports / analysis credits" (coarse, ~1 credit per analysis).
- Doc B/D: credits = fine-grained AI usage units (1,000s per month).
- **Pro at 3,399 SAR/mo (Doc B/D) is 8.5× the 399 SAR/mo (Doc A/C).** Likely a typo (399 vs 3,399), OR Doc B Pro is a genuinely different tier. NEEDS DECISION.

## CONFLICT 2 — Pro annual credit math (Doc D)

- Doc D states Pro annual: 144,000 Credits — SAR 4,078/year → **SAR 383/year** after 20%.
- 20% off 4,078 = 3,262.40, not 383. And 4,078 ≠ 3,399×12 (=40,788).
- Doc B §14 itself flags: 4,788 SAR does not match 3,399 SAR/mo. Multiple broken numbers here.
- **Pro annual price is unusable as-is. NEEDS DECISION.**

## CONFLICT 3 — Credits vs Slides are two separate products (Doc B)

Doc B defines TWO independent credit systems:
- **AI Credits** (§13): Basic 1,000 / Growth 4,000 / Pro 12,000 per month.
- **PPT Slides Credits** (§11): Basic 80 / Growth 300 / Pro 900 slides per month.

Doc A treats presentations as consuming from a single credit pool or a separate paid transaction (§16).
**Decision: one unified credit pool, or two separate wallets (AI Credits + Slides)?**

## CONFLICT 4 — "Credits" meaning

- Doc A §15/16: credits = AI processing/usage abstraction (variable cost per action).
- Doc A §12: "reports / analysis credits" (1 credit ≈ 1 report).
These are reconcilable (a report costs N credits) but the DEFAULT consumption table must be defined. Doc A §17 gives only relative ("higher workload") not numbers. **NEEDS a default credit-cost table.**

---

## RECOMMENDED DEFAULT FOR TOMORROW'S DEMO (ponytail: pick one, make it admin-editable)

Unless the human says otherwise, the demo will use:

- **Subscription prices: Doc A/C** — Basic 99, Growth 199, Pro 399 SAR/mo (cleaner, matches investor deck the client will present).
- **Credit granularity: Doc B/D** — Basic 1,000 / Growth 4,000 / Pro 12,000 monthly AI credits (gives a realistic "184/250" style meter). NOTE: this pairs Doc A prices with Doc B credit counts — a deliberate merge.
- **Slides: separate wallet**, Basic 80 / Growth 300 / Pro 900 slides/mo.
- **Annual: flat 20% off monthly×12**, computed at runtime (ignore the broken hard-coded annual numbers).
- **Consultation: 375 SAR/hr, Nabda share 112.50 (30%)** — consistent across all docs, no conflict.

All values seeded into an admin-editable config table so the human can change them live. See PROJECT_PLAN.md.

## YOUR DECISION NEEDED (human)
1. Which subscription price set — 99/199/399 (A/C) or 49/149/3,399 (B/D)?
2. Pro monthly: 399 or 3,399 SAR? (typo check)
3. One credit wallet or two (AI Credits + Slides)?
4. Confirm annual = monthly×12 −20%, ignoring the broken printed annual figures?
