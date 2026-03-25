# UBuilder AI (websiter.ai) — System Documentation / תיעוד מערכת מלא

**Version:** 2026-03-25 | **Branch:** main | **Commit:** `078acab`

---

## A. PROJECT VISION & GOALS / חזון ומטרות

UBuilder AI is an AI-powered website builder aiming to be "Wix + Shopify + HubSpot + AI Agent — all in one platform."

**Target users:** Small-medium businesses, freelancers, agencies. Hebrew-first market, then global.

**Core value proposition:** Users describe what they want in plain text (or paste a URL to clone/improve), and the system generates a complete multi-page website with:
- Premium visual design (not template-looking)
- Real content specific to the business
- Built-in CRM and lead capture
- AI chatbot on published sites
- SEO/GSO optimization (planned)
- Commerce and payments (planned)

**8-Phase Roadmap:**
1. **(NOW)** Dream-quality website generation — ~85% done
2. Mobile editor experience
3. CRM wired to real database
4. Payments (Stripe + PayPlus)
5. Content & SEO/GSO engine
6. Communication (email, SMS, WhatsApp)
7. AI chatbot on published sites (partially done)
8. Analytics & intelligence

**Key user feedback driving development:**
- User is unhappy with generic/template-looking output — wants every site to feel unique and premium
- Discovery/planning content MUST flow to generators — no placeholder text when real data exists
- Claude must be primary AI, Gemini only as fallback
- Scanner must do deep 5-10 min analysis
- No content-aware image generation/matching system wanted (the user prefers real images from scan)

---

## B. CURRENT ARCHITECTURE / ארכיטקטורה נוכחית

### Monorepo Structure

```
websiter.ai/                    (root — Turborepo + pnpm)
  apps/
    web/                        THE ONLY ACTIVE APP — Next.js 15 (App Router)
      src/
        app/                    Pages + API routes
        components/             React components (editor, create, dashboard)
        lib/                    Core business logic (generators, pipeline, scanner, etc.)
    renderer/                   SHELL ONLY — no real implementation

  packages/
    db/                         Drizzle ORM schemas + PostgreSQL client (Neon)
    types/                      Shared TypeScript type definitions
    utils/                      Utility functions (prefixedId, slug generation)
    ui/                         Shared UI components (minimal)
    config/                     ESLint, TSConfig, Tailwind v4 config
```

### Active Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 15 (App Router) | React 19, Tailwind CSS v4 |
| Database | PostgreSQL (Neon) + Drizzle ORM | Cloud-hosted serverless Postgres |
| AI Primary | Claude API (claude-sonnet-4-20250514) | Direct HTTP calls, 90s timeout per agent call |
| AI Fallback | Gemini 2.5 Flash | Falls back when Claude fails after 2 retries |
| Auth | Better Auth | Email/password only |
| Hosting | Vercel | Node.js runtime, maxDuration=600s for pipeline |
| Monorepo | Turborepo + pnpm | Package scope: `@ubuilder/*` |

### What Does NOT Exist (despite being documented)

- `apps/api` (Hono backend) — does not exist, all routes in `apps/web`
- `packages/ai` (AI router) — does not exist, direct API calls
- `packages/i18n` — does not exist
- Redis/Upstash/BullMQ — no cache or queue
- Cloudflare R2 — no object storage, images are data URLs or external URLs
- Stripe/PayPlus — no payment code
- Sentry/PostHog — no monitoring or analytics
- Meilisearch — no search engine
- Resend/React Email — no email system
- Storybook — no component stories

---

## C. WHAT'S ALREADY BUILT AND WORKING / מה עובד

### Core Flow (end-to-end)
1. **Authentication** — Better Auth email/password login
2. **Site creation** — Two paths: "describe your business" (discovery chat) or "paste a URL" (scanner)
3. **Generation pipeline** — 6-phase AI pipeline (strategy, design, content, images, build, QA/CPO)
4. **Section-based composition** — 112 section variants across 19 categories
5. **Visual editor** — Live HTML preview with section identification via comment markers
6. **Publishing** — Sets status to published, injects chatbot widget
7. **Published site viewer** — `/site/[slug]` serves the generated HTML, `/site/[slug]/[...page]` serves inner pages
8. **AI chatbot** — Claude-powered, session/message persistence, lead capture
9. **Multi-page generation** — For scan-based sites, generates 3-5 pages (homepage + inner pages)

### Section System
- **19 categories:** navbar, hero, features, testimonials, pricing, cta, faq, footer, gallery, team, stats, contact, partners, how-it-works, blog, portfolio, comparison, newsletter, about
- **112 variants** with metadata (industries, tags, animation, theme)
- **25 premium CSS/JS effects:** scroll-reveal, tilt-card, glow, shimmer, aurora, etc.
- **7 background effects:** floating-orbs, particles-canvas, wave-canvas, grid-pattern, shooting-stars, aurora-gradient, dot-matrix
- **Art direction system:** Selects visual direction based on industry
- **Premium variant enforcement:** Deterministically upgrades key sections to premium variants

### Scanner System
- **Deep scan** — Multi-page crawl with 7 phases and AI analysis
- **Content extraction** — Extracts structured content (text, images, products, FAQ, contact)
- **Scan content bridge** — Deterministic content injection from scan data into sections
- **Scan-to-composition** — Synthesizes generation artifacts from scan context

### Generation Observability
- **DB-backed jobs** — Every generation run creates a job row with status tracking
- **Steps** — Each pipeline phase tracked with timing, prompt/response sizes
- **Artifacts** — Typed JSON artifacts saved at each step

### CRM (Partial)
- **Leads table** — Real DB persistence from chatbot conversations
- **Chatbot sessions/messages** — Persisted in PostgreSQL
- **Chatbot context refresh** — Regenerated on republish

---

## D. WHAT'S NOT YET BUILT / מה עוד לא נבנה

### Infrastructure
- Redis / Upstash / BullMQ — no cache or queue
- Meilisearch — no search engine
- Resend / React Email — no transactional email
- Sentry — no error monitoring
- PostHog — no analytics/telemetry
- Cloudflare R2 — images use data URLs or external URLs
- Stripe / PayPlus — no payment processing

### Features
- **Analytics dashboard** — API returns `comingSoon: true`
- **CRM Campaigns** — In-memory mock data only
- **CRM Customers** — In-memory mock data only
- **Team 101 agents** — No-op placeholder
- **SEO Monitor / GSO scoring** — No implementation
- **Block editor** — Pages stored as HTML, not JSON block trees
- **Google OAuth / magic links** — Only email/password
- **Blog system** — DB schema exists but no working generation
- **Forms system** — DB schema exists but no form builder
- **Real image generation** — Skipped for scan-based sites

---

## E. KEY TECHNICAL DECISIONS / החלטות טכניות

1. **Section-based pages (not block-based)** — HTML with `<!-- section:category:variant-id -->` comment markers
2. **DB-backed generation jobs** — Tracked in PostgreSQL with jobs, steps, typed artifacts
3. **Direct AI API calls** — Claude primary, Gemini fallback, no router package
4. **SSE for pipeline** — Real-time progress streaming
5. **Deterministic scan content bridge** — Direct data injection, no AI involved
6. **Art direction system** — Constrains AI within visual profiles per industry
7. **Premium variant enforcement** — Deterministic section upgrade after AI design
8. **Fallback architecture** — Industry section maps when AI fails
9. **Multi-page via raw SQL** — Real DB schema differs from Drizzle schema
10. **90s per-agent, 600s total timeout** — Balances reliability vs completion

---

## F. THE GENERATION PIPELINE / צינור היצירה

Main file: `apps/web/src/app/api/ai/pipeline/route.ts` (~1800 lines)

### Input
```
POST /api/ai/pipeline
Body: {
  description: string,
  locale: 'he' | 'en',
  discoveryContext?: {},
  scanJobId?: string,
  scanMode?: 'copy' | 'inspiration',
  sourceOwnership?: 'self_owned' | 'third_party',
  uploadedLogo?: string,      // Base64 data URL
  documentText?: string,       // Uploaded document text
}
```

### Pipeline Phases

```
INIT → Create job + draft site in DB, load scan artifacts

PHASE 1: STRATEGY → businessName, industry, targetAudience, USPs
PHASE 2: DESIGN → colorPalette, typography, sections with variantIds
  + Cross-check (non-fatal)
  + Variant ID validation
  + Premium variant enforcement
PHASE 3: CONTENT → headlines, items, CTAs per section (chunked: 4 sections per call)
  + If fails: build from structured scan data (not silent fallback)
PHASE 3.5: IMAGES → Skip for scan-based (use real images), generate for others
PHASE 4: BUILD → merge + bridge + composePage() → full HTML
  + Multi-page: generate inner pages from scan data
PHASE 5: QA → section count, variant check (non-fatal)
PHASE 6: CPO → score 6 dimensions (non-fatal)

COMPLETE → Save HTML to DB, stream to frontend
```

---

## G. THE SCANNER SYSTEM / מערכת הסורק

### 7 Phases
1. Site Discovery — Crawl pages (limited to ~8 for memory)
2. Page Fetch — HTML + CSS per page
3. Design System — Colors, fonts, spacing, tokens
4. Content Architecture — Sections, headings, CTAs
5. Media Intelligence — Image catalog with roles
6. Responsive Audit — Breakpoints, mobile nav
7. AI Analysis — Design DNA + rebuild plan

### Artifacts Produced
- `scan_site_map` — Pages and relationships
- `scan_visual_dna` — Design tokens
- `scan_full_result` — Complete output
- `scan_generation_ctx` — Context for pipeline
- `source_content_model` — Structured content per page
- `content_catalog` — Products, categories, prices
- `site_content_model` — Per-page content with images

---

## H. KNOWN BUGS AND LIMITATIONS / באגים ומגבלות

1. **Memory pressure** — OOM during long generation. Crawl limited to 8 pages.
2. **Pipeline timeout risk** — 10-min limit, 8+ agent calls at 90s each
3. **DB schema drift** — Drizzle schema doesn't match real DB (`tenants` table)
4. **Content quality inconsistency** — AI sometimes generates generic content
5. **Inner pages partially working** — Slug unique constraint issues (recently fixed)
6. **Editor shows only homepage** — No page switcher for inner pages
7. **CRM mock data** — Campaigns/Customers not persisted
8. **Analytics empty** — Returns `comingSoon: true`
9. **No inline text editing** — Editor shows preview only
10. **Single-locale sites** — No bilingual support

---

## I. FILE MAP / מפת קבצים מרכזיים

### Core Pipeline
| File | Purpose |
|------|---------|
| `apps/web/src/app/api/ai/pipeline/route.ts` | Main generation pipeline (~1800 lines) |
| `apps/web/src/lib/agent-orchestrator.ts` | Agent system prompts |
| `apps/web/src/lib/section-composer.ts` | composePage() — sections → HTML |
| `apps/web/src/lib/section-registry.ts` | 112 variant definitions |
| `apps/web/src/lib/section-effects.ts` | 25 CSS/JS effects |
| `apps/web/src/lib/art-direction.ts` | Industry-based art direction |
| `apps/web/src/lib/generation-tracker.ts` | DB job/step/artifact tracking |
| `apps/web/src/lib/artifact-schemas.ts` | Artifact validation |

### Section Generators
| File | Sections |
|------|----------|
| `apps/web/src/lib/sections/hero-sections.ts` | 8 navbar + 15 hero |
| `apps/web/src/lib/sections/content-sections.ts` | 12 features + 10 testimonials + 8 pricing |
| `apps/web/src/lib/sections/premium-sections.ts` | 3 premium heroes + premium pricing/testimonials/CTA |
| `apps/web/src/lib/sections/utility-sections-*.ts` | CTA, FAQ, footer, gallery, team, stats, contact, etc. |

### Scanner
| File | Purpose |
|------|---------|
| `apps/web/src/lib/scanner-v2.ts` | V2 scanner logic |
| `apps/web/src/lib/scan-tracker.ts` | Scan DB persistence |
| `apps/web/src/lib/content-extractor.ts` | Structured content extraction |
| `apps/web/src/lib/scan-content-bridge.ts` | Deterministic content injection |
| `apps/web/src/lib/multi-page-builder.ts` | Multi-page generation |

### Database
| File | Purpose |
|------|---------|
| `packages/db/src/schema/sites.ts` | Sites table |
| `packages/db/src/schema/generation.ts` | Jobs, steps, artifacts, chatbot |
| `packages/db/src/schema/crm.ts` | Leads, customers, campaigns |

---

## J. API ROUTES / נתיבי API

### AI & Generation
- `POST /api/ai/pipeline` — Main generation pipeline (SSE)
- `POST /api/ai/discovery` — Discovery chat
- `POST /api/ai/generate-images` — Image generation
- `POST /api/ai/agent-chat` — Editor AI chat

### Scanner
- `POST /api/scan/v2/deep` — Deep scan (SSE)
- `GET /api/scan/[jobId]` — Scan job status
- `GET /api/scan/check` — Check existing scan

### Sites
- `GET/POST /api/sites` — List/Create sites
- `GET/PATCH/DELETE /api/sites/[siteId]` — Site CRUD
- `POST /api/sites/[siteId]/publish` — Publish

### CRM
- `GET/POST /api/crm/leads` — Leads
- `GET /api/crm/customers` — Customers (mock)
- `GET /api/crm/campaigns` — Campaigns (mock)
- `GET /api/crm/analytics` — Analytics (comingSoon)

### Other
- `POST /api/chatbot/[siteId]` — Chatbot messages
- `GET /api/generation/[jobId]` — Generation status

---

## K. ENVIRONMENT SETUP / הגדרת סביבה

### Required Env Vars
```
DATABASE_URL=postgresql://...
CLAUDE_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
BETTER_AUTH_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Setup
```bash
git clone <repo>
cd websiter.ai
pnpm install
# Create apps/web/.env.local with vars above
pnpm db:push
pnpm dev
# Open http://localhost:3000
```

### Commands
```bash
pnpm dev          # Start dev
pnpm build        # Build (check types)
pnpm db:push      # Push schema
pnpm db:studio    # DB GUI
```

---

**End of document. Last updated: 2026-03-25.**
