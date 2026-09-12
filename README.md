# ParkingYou website

Greenfield replacement for the ParkingYou B.V. marketing website (parkingyou.nl), moving off the
proprietary CMS owned by an external agency.

**Scope: the marketing website only.** The customer-facing PWA is a separate project and is not
built here.

## Ground rules

- Aeroparker is the system of record for bookings, products, inventory and pricing. This codebase
  **reads from it and deep links into it. It never writes to it.**
- EU data residency throughout. AVG/GDPR compliant. No personal data leaves the EU.
- Mobile first. The performance target is Core Web Vitals in the green on a midrange Android
  device over 4G.
- Code, comments, commit messages and documentation in **English**. All user-facing copy, UI
  labels, error messages, URL paths, slugs and CMS field labels in **Dutch**.

## Running it

```
npm install
npm run dev            # http://localhost:3000
npm run check          # typecheck + lint
npm run content:validate
npm run build && npm run start
```

Screenshots for review (needs a running server):

```
npx tsx scripts/screenshots.ts        # 390px and 1280px, into screenshots/
```

## Current state

Phase 1 in progress. The scaffold, the design tokens and the location template exist; the
remaining templates do not yet.

| Route | Status |
| --- | --- |
| `/parkeren/{stad}/{locatie}` | Built. The reference template |
| `/` | Thin placeholder so the prototype is navigable |
| `/locaties`, `/parkeren/{stad}`, `/parkeren-bij/...`, `/abonnementen`, `/zakelijk`, `/veelgestelde-vragen`, `/nieuws`, `/contact` | Not built yet |

| Document | What it covers |
| --- | --- |
| [`docs/DESIGN-TOKENS.md`](docs/DESIGN-TOKENS.md) | The shared visual language, and the measured contrast ratios behind it |
| [`content/README.md`](content/README.md) | What in the mock content is real and what is placeholder |
| [`docs/AEROPARKER-AUDIT.md`](docs/AEROPARKER-AUDIT.md) | Endpoints, auth, freshness, failure modes, and the design that survives them |
| [`docs/URL-INVENTORY.csv`](docs/URL-INVENTORY.csv) | 269 old URLs mapped to proposed new URLs and 301 targets |
| [`docs/IA.md`](docs/IA.md) | Information architecture, Dutch URL structure, internal linking |
| [`docs/CONTENT-MODEL.md`](docs/CONTENT-MODEL.md) | Collections, fields, editable versus Aeroparker-synced |

Two decisions were open and are now answered (`docs/IA.md` §2):

- **D1: restructure the URLs.** `/parkeren/{stad}/{locatie}` and `/parkeren-bij/{stad}/{poi}`.
- **D2: keep English as a real hreflang pair** under `/en`, with Dutch slugs in both locales.

## Planned phases

1. High-fidelity prototype on typed mock data, deployable to a Vercel preview.
2. Payload CMS 3 in the same Next.js app, on Postgres (Supabase, EU region), with self-service
   editing and on-demand revalidation.
3. Aeroparker integration: typed client, zod-validated responses, nightly sync, reconciliation.
4. SEO, performance and compliance: structured data, redirect map, Lighthouse CI budgets, consent.
5. Ship: CI, production Vercel project, runbook, Dutch manual for the business user.
