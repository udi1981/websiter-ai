# UBuilder AI — Claude Code Context

> AI-powered website builder: Wix + Shopify + HubSpot + AI Agent — all in one platform.
> Built as a TypeScript monorepo with Turborepo, pnpm, and strict conventions.
> Package scope: `@ubuilder/*` | Codename: websiter.ai

## Vision

Democratize professional web presence through AI. Users describe what they want in plain text — the system generates a complete, multi-page website with stunning design, real images, SEO optimization, and built-in business tools.

**Target users:** SMBs, freelancers, agencies (Hebrew-first market, then global)
**Differentiators:** AI generates entire sites, GSO (Generative Search Optimization), built-in CRM + commerce, AI chatbot agent on published sites, website scanner that clones and improves competitor sites.

---

## Reality Alignment

This document contains both current system reality and longer-term product vision.
When there is any conflict, **current implementation reality takes precedence** over aspirational architecture.

### Current Runtime Truth
- **Frontend/runtime:** Next.js 15 (App Router) on Node.js — single app in `apps/web`
- **API/runtime:** Next.js API route handlers inside `apps/web/src/app/api/` — no separate API server
- **Database:** PostgreSQL via Neon + Drizzle ORM
- **Auth:** Better Auth — email/password login only
- **AI:** Claude API (primary, complex tasks) + Gemini 2.0 Flash (fallback) — direct API calls from route handlers, no AI router package
- **Core generation:** DB-backed jobs, typed artifacts, section-composer-based pipeline
- **Publish flow:** implemented — sets status, injects chatbot widget, refreshes chatbot_context artifact
- **Chatbot + lead capture:** implemented — Claude-powered responses, session/message persistence, lead capture with auto-tenant creation
- **Current deployment target:** Node.js runtime (Vercel), not Cloudflare Workers

### Currently Implemented
- Visual editor with live preview
- Section registry (112 variants, 19 categories) + section composer
- Site CRUD (create, read, update, delete/archive)
- Publish flow with chatbot widget injection
- Generation pipeline (discovery → strategy → design → cross-check → content → images → build → QA → CPO)
- Generation observability (DB-backed jobs, steps, artifacts with typed schemas)
- Chatbot sessions + messages (multi-turn, persisted)
- Lead capture from chatbot → CRM leads table
- Chatbot context refresh on republish

### Implemented Partially
- Image generation integration (asset_manifest created but slots are 'pending', Unsplash fallbacks used)
- Analytics UI (returns `comingSoon: true` — fake metrics removed)
- Fallback architecture (server-side fallback in pipeline, but not yet industry-varied)
- CRM leads (DB-persisted from chatbot, but no full CRM UI)

### Not Yet Implemented
- Redis / Upstash / BullMQ — no cache or queue system
- Cloudflare Workers runtime — runtime is Node.js on Vercel
- Cloudflare R2 — images use data URLs, no object storage
- Meilisearch — no search engine
- Sentry — no error monitoring
- PostHog — no analytics/telemetry
- Stripe / PayPlus — no payment processing
- Resend / React Email — no transactional email
- Storybook — no component stories
- Google OAuth / magic link auth — only email/password works
- `apps/api` — described as separate Hono service but does not exist; all API routes are in `apps/web`
- `packages/ai` — described as AI router package but does not exist; AI calls go directly to APIs
- `packages/i18n` — described but does not exist
- `apps/renderer` — shell only, no real rendering logic
- CRM Campaigns / Customers — in-memory mock data only
- Team 101 real agents — post-publish agent orchestration is a no-op placeholder
- SEO Monitor, Content Scheduler, GSO scoring — no implementation
- Block editor / block rendering — pages stored as HTML, not JSON block trees
- Multi-page generation — only homepage generation works
- Website Scanner V2 deep analysis — protocol described below but no code
- Design DNA extraction — no implementation
- Analytics dashboard — no real data collection

### Documentation Rule
Do not describe planned systems as if they already exist.
Mark planned systems explicitly as **"Not Yet Implemented"** until they are real.
See `NOT_YET_IMPLEMENTED.md` for the complete frozen-scope list.

---

## Architecture (Current Reality)

```
                    +-------------------+
                    |   apps/web        |  Next.js 15 (App Router)
                    |   Dashboard +     |  Port 3000
                    |   Visual Editor + |
                    |   API Routes      |  ← All API routes live here
                    +--------+----------+
                             |
          +------------------+------------------+
          |                                     |
+---------v-----+                      +--------v------+
| packages/db   |                      | apps/renderer |
| Drizzle ORM   |                      | (shell only — |
| PostgreSQL    |                      |  NOT YET      |
| (Neon)        |                      |  IMPLEMENTED) |
+---------------+                      +---------------+

Shared:
  packages/types  — TypeScript type definitions
  packages/ui     — Shared UI components (minimal)
  packages/utils  — Utility functions (prefixedId, slug, etc.)
  packages/config — ESLint, TSConfig, Tailwind v4
```

**Not yet implemented in architecture:**
- `apps/api` (Hono) — planned separate API server, currently all routes in `apps/web`
- `packages/ai` — planned AI router package, currently direct API calls
- `packages/i18n` — planned i18n package

## Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Monorepo | Turborepo + pnpm | **Active** |
| Language | TypeScript (strict) | **Active** |
| Frontend | Next.js 15 (App Router) | **Active** |
| UI | React 19 | **Active** |
| Styling | Tailwind CSS v4 | **Active** |
| Database | PostgreSQL (Neon) | **Active** |
| ORM | Drizzle ORM | **Active** |
| AI (complex) | Claude API | **Active** — direct calls from route handlers |
| AI (fast) | Gemini 2.0 Flash | **Active** — fallback in pipeline + chatbot |
| Auth | Better Auth | **Active** — email/password only |
| Backend | Hono | **Not Yet Implemented** — routes are Next.js API handlers |
| Cache | Redis (Upstash) | **Not Yet Implemented** |
| Queue | BullMQ | **Not Yet Implemented** |
| AI (device) | Gemini Nano | **Not Yet Implemented** |
| Payments | Stripe + PayPlus | **Not Yet Implemented** |
| Storage | Cloudflare R2 | **Not Yet Implemented** — images are data URLs |
| Search | Meilisearch | **Not Yet Implemented** |
| Email | Resend + React Email | **Not Yet Implemented** |
| Monitoring | Sentry + PostHog | **Not Yet Implemented** |
| Hosting | Vercel (Node.js) | **Active** — not Cloudflare Workers |

## Directory Structure (Current Reality)

```
apps/
  web/src/
    app/                    — Next.js App Router pages
      (auth)/               — Auth group (login)
      api/                  — All API route handlers (sites, ai, crm, chatbot, generation)
      dashboard/            — Dashboard + new site creation
      editor/[siteId]/      — Visual editor
      site/[slug]/          — Published site viewer
    components/
      editor/               — Editor-specific (AIChatPanel, EditorPreview, SectionPicker, etc.)
      create/               — Discovery chat component
    lib/                    — App-specific utilities
      sections/             — Section generator functions (hero, content, utility)
      section-registry.ts   — 112 variant definitions
      section-composer.ts   — composePage(), section CRUD
      section-effects.ts    — 25 premium CSS/JS effects
      generation-tracker.ts — DB-backed job/step/artifact tracking
      chatbot-widget.ts     — Chatbot widget HTML generator
      agent-orchestrator.ts — AI agent calls (strategy, design, content, etc.)
      auth-middleware.ts    — Auth middleware for API routes
  renderer/src/             — Shell only (NOT YET IMPLEMENTED)

packages/
  db/src/
    schema/                 — Drizzle table definitions
    client.ts               — Database connection
  types/src/                — Type definitions (section, generation, result, etc.)
  ui/src/                   — Shared components (minimal)
  utils/src/                — Utility functions (prefixedId, slug)
  config/                   — ESLint, TSConfig, Tailwind v4 config
```

**Packages that do NOT exist (despite being referenced in older docs):**
- `packages/ai` — no AI router package
- `packages/i18n` — no i18n package

## Coding Conventions

- **TypeScript strict mode** everywhere
- Use `type` not `interface` for type definitions
- File naming: `kebab-case.ts` (e.g., `generation-tracker.ts`)
- Component naming: PascalCase (e.g., `EditorPreview.tsx`)
- `const` arrow functions for components: `const MyComponent = () => {}`
- Import order: external deps → `@ubuilder/*` packages → relative imports
- Named exports only, no default exports (except Next.js pages)
- Use Drizzle ORM — no raw SQL (exception: leads table due to schema mismatch)
- Error handling: Result pattern `{ ok: true, data } | { ok: false, error }` — avoid try/catch in business logic
- All entity IDs via `prefixedId()` from `@ubuilder/utils`
- Soft deletes only (status: 'archived') — never hard delete user data
- Timestamps: `createdAt` and `updatedAt` on all tables
- Tailwind only — no custom CSS files (except global tokens)
- All API routes require auth middleware (except public site routes and chatbot endpoint)
- API responses: `{ ok: true, data }` or `{ ok: false, error }` (note: some older code uses `success` instead of `ok`)

## Design Tokens

```
Primary:      #7C3AED (purple-600)
Secondary:    #06B6D4 (cyan-500)
Accent:       #F59E0B (amber-500)
Success:      #10B981
Warning:      #F59E0B
Error:        #EF4444

Theme:        Dark by default, light mode via [data-theme="light"]
Background:   #0B0F1A (dark), #FFFFFF (light)
Fonts:        Inter (body), Heebo (Hebrew), JetBrains Mono (code)

RTL:          ALWAYS use logical CSS properties
              margin-inline-start ✓   margin-left ✗
              padding-inline-end ✓    padding-right ✗
              inset-inline-start ✓    left ✗

Breakpoints:  375px (mobile-first) → md: (tablet) → lg: (desktop)
Mobile UX:    Bottom sheets, not side panels
Desktop UX:   Side panels, multi-column layouts
Border radius: rounded-lg (8px default)
Spacing:      4px grid (Tailwind default)
```

## Commands

```bash
pnpm dev              # Start all apps in dev mode
pnpm dev --filter web  # Start only web app
pnpm build            # Build everything
pnpm lint             # Lint all packages
pnpm test             # Run all tests
pnpm db:push          # Push Drizzle schema changes to DB
pnpm db:studio        # Open Drizzle Studio (DB GUI)
pnpm db:generate      # Generate migration files
pnpm db:migrate       # Run migrations
```

## Environment Variables

Currently required:
```
DATABASE_URL=postgresql://...       # Neon PostgreSQL connection string
CLAUDE_API_KEY=sk-ant-...           # Claude API for generation + chatbot
GEMINI_API_KEY=AIza...              # Gemini Flash fallback
BETTER_AUTH_SECRET=...              # Auth session signing
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Not yet used (planned for future):
```
REDIS_URL=redis://...               # Not Yet Implemented
STRIPE_SECRET_KEY=sk_...            # Not Yet Implemented
STRIPE_WEBHOOK_SECRET=whsec_...     # Not Yet Implemented
R2_ACCESS_KEY=...                   # Not Yet Implemented
R2_SECRET_KEY=...                   # Not Yet Implemented
R2_BUCKET_URL=...                   # Not Yet Implemented
RESEND_API_KEY=re_...               # Not Yet Implemented
API_URL=http://localhost:8787       # Not Yet Implemented (no separate API server)
```

## Important Rules

1. **NEVER install new packages** without asking first — prefer existing deps
2. **ALWAYS run `pnpm build`** after changes to verify no type errors
3. **All text content** must support Hebrew (RTL) — use logical properties
4. **Prefer Server Components** in Next.js — only use 'use client' when needed
5. **NEVER use physical CSS properties** (left/right) — always logical (start/end)
6. **NEVER import from another app directly** — use packages/* for shared code
7. **ALWAYS use prefixedId()** from @ubuilder/utils for new entity IDs
8. **When adding a new DB table**, create schema in packages/db/src/schema/ and export from index.ts
9. **Do not describe planned systems as if they already exist** — mark as "Not Yet Implemented"

## Git Workflow

```
Branch naming:   feat/description, fix/description, chore/description
Commits:         Conventional commits (feat:, fix:, chore:, docs:, refactor:, test:)
PR process:      Create branch → implement → pnpm build → PR to main
Main branch:     main (protected, default)
```

---

## Section-Based Generation System

Sites are built from a **section registry** with 112 premium variants across 19 categories. This replaces raw AI HTML generation with structured, composable, swappable sections.

### Architecture
```
AI Planning (selects variants from registry based on business type)
  → Section Composer (calls generator functions, wraps with markers)
  → Effects Collector (detects CSS classes, injects CSS/JS)
  → Complete HTML with <!-- section:category:variant-id --> markers
  → Editor can identify, swap, reorder, add, remove sections
```

### Key Files
| File | Purpose |
|------|---------|
| `packages/types/src/section.ts` | 14 section types (SectionCategory, SectionVariant, PageComposition, etc.) |
| `apps/web/src/lib/section-registry.ts` | 112 variant definitions with metadata (industries, tags, animation, theme) |
| `apps/web/src/lib/section-effects.ts` | 25 premium effects (scroll-reveal, tilt-card, glow, shimmer, aurora, etc.) |
| `apps/web/src/lib/section-composer.ts` | composePage(), generateSingleSection(), replaceSection(), insertSection(), removeSection() |
| `apps/web/src/lib/sections/hero-sections.ts` | 23 generators: 8 navbar + 15 hero |
| `apps/web/src/lib/sections/content-sections.ts` | 30 generators: 12 features + 10 testimonials + 8 pricing |
| `apps/web/src/lib/sections/utility-sections-cta-faq-footer.ts` | 19 generators: 8 CTA + 5 FAQ + 6 footer |
| `apps/web/src/lib/sections/utility-sections-gallery-team-stats-contact.ts` | 18 generators: 6 gallery + 4 team + 4 stats + 4 contact |
| `apps/web/src/lib/sections/utility-sections-extra.ts` | 22 generators: partners, how-it-works, blog, portfolio, comparison, newsletter, about |
| `apps/web/src/components/editor/SectionPicker.tsx` | Browsable section catalog UI (19 categories, search, insert) |
| `apps/web/src/components/editor/SectionSwap.tsx` | Floating toolbar for swap/move/remove |

### Section Markers
Generated HTML uses comment markers for editor identification:
```html
<!-- section:hero:hero-gradient-mesh -->
<section>...</section>
<!-- /section:hero:hero-gradient-mesh -->
```

### Categories (19)
navbar (8), hero (15), features (12), testimonials (10), pricing (8), cta (8), faq (5), footer (6), gallery (6), team (4), stats (4), contact (4), partners (3), how-it-works (4), blog (4), portfolio (3), comparison (2), newsletter (3), about (3)

### Core Principles
1. **Vision-Code Alignment** — Every protocol must be reflected in running code. Documents without implementation are TODOs.
2. **Data-Content Synergy** — Discovery data and planning output MUST flow through to every generator. No section should ever show placeholder content when real business content is available from the planning phase.
3. **Creative Excellence** — Every generated site must feel rare, premium, and precisely tailored to the client — not a template with swapped text.

---

## Website Scanner Protocol (NOT YET IMPLEMENTED)

> **Status:** This protocol is documented as a design spec. No scanner code exists yet.
> Do not treat this section as describing current functionality.

This is the planned workflow for the "Start from URL" feature. Users would scan websites they own or have permission to rebuild. The scanner would perform a deep 7-phase analysis followed by a structured rebuild.

### Phase 1: Full Site Discovery
- Crawl all reachable internal pages (nav, footer, sitemap, internal links, buttons, menus)
- Output: `analysis/site-map.json`, `analysis/routes.csv`

### Phase 2: Visual & Structural Capture
- Desktop, tablet, mobile screenshots for every important page
- Section-level screenshots for major sections
- Output: `analysis/screenshots/`, `analysis/page-notes/`, `analysis/section-map.json`

### Phase 3: Design System Extraction
- Extract and normalize: colors, gradients, typography, spacing, shadows, layout, animation patterns
- Output: `analysis/design-tokens.json`, `analysis/components.json`, `analysis/motion-map.json`

### Phase 4: Content & Page Architecture
- For each page: primary goal, target audience, section order, content hierarchy
- Output: `analysis/content-map.json`, `analysis/page-architecture.md`

### Phase 5: Media Intelligence
- For every image/video: role, aspect ratio, visual subject, style/mood
- Output: `analysis/assets-manifest.json`, `analysis/image-slots.json`

### Phase 6: Responsive & Interaction Audit
- Mobile nav behavior, section stacking, typography/spacing changes by breakpoint
- Output: `analysis/responsive-map.json`, `analysis/interaction-audit.md`

### Phase 7: Rebuild & Upgrade Planning
- What to preserve, rebuild, improve, regenerate with AI
- Output: `analysis/rebuild-spec.md`, `analysis/upgrade-opportunities.md`

---

## AI Router Pattern (NOT YET IMPLEMENTED)

> **Status:** The `packages/ai/src/router.ts` package does not exist.
> AI calls currently go directly to Claude/Gemini APIs from route handlers.
> The router pattern below is a planned future architecture.

| Task Type | Model | Use Case |
|-----------|-------|----------|
| site-generation | Claude | Generate entire site (currently implemented inline) |
| chat-response | Gemini Flash | Quick AI chat replies (currently implemented inline) |
| Other task types | Various | Not yet implemented |

---

## Agent Team (NOT YET IMPLEMENTED as automated agents)

> **Status:** These agent roles are used as conceptual personas in prompts during generation,
> not as independently running automated agents. The `@agent` trigger keywords do not activate
> any automated system.

| Agent | Role | Status |
|-------|------|--------|
| `@strategist` | Business strategy + site planning | Used as prompt persona in pipeline |
| `@designer` | Visual design + color/typography | Used as prompt persona in pipeline |
| `@content` | Content writing | Used as prompt persona in pipeline |
| `@qa` | Quality assurance review | Used as prompt persona in pipeline |
| `@cpo` | Chief product officer review | Used as prompt persona in pipeline |
| Other agents | Various roles | Not Yet Implemented |

---

## Current Sprint

See `NOT_YET_IMPLEMENTED.md` for the complete frozen-scope list.
