# UBuilder AI — Claude Code Context

> AI-powered website builder: Wix + Shopify + HubSpot + AI Agent — all in one platform.
> Built as a TypeScript monorepo with Turborepo, pnpm, and strict conventions.
> Package scope: `@ubuilder/*` | Codename: websiter.ai

## Vision

Democratize professional web presence through AI. Users describe what they want in plain text — the system generates a complete, multi-page website with stunning design, real images, SEO optimization, and built-in business tools.

**Target users:** SMBs, freelancers, agencies (Hebrew-first market, then global)
**Differentiators:** AI generates entire sites, GSO (Generative Search Optimization), built-in CRM + commerce, AI chatbot agent on published sites, website scanner that clones and improves competitor sites.

---

## Architecture

```
                    +-------------------+
                    |   apps/web        |  Next.js 15 (App Router)
                    |   Dashboard +     |  Port 3000
                    |   Visual Editor   |
                    +--------+----------+
                             |
                    +--------v----------+
                    |   apps/api        |  Hono Framework
                    |   REST API        |  Port 8787
                    |   (services +     |
                    |    middleware)     |
                    +--------+----------+
                             |
          +------------------+------------------+
          |                  |                  |
+---------v-----+  +---------v-----+  +--------v------+
| packages/db   |  | packages/ai   |  | apps/renderer |
| Drizzle ORM   |  | AI Router     |  | Published     |
| PostgreSQL    |  | Claude/Gemini |  | Sites (SSG)   |
| (Neon)        |  | Generators    |  | Port 3001     |
+---------------+  +---------------+  +---------------+

Shared:
  packages/types  — TypeScript type definitions
  packages/ui     — Shared UI components
  packages/utils  — Utility functions
  packages/i18n   — Internationalization (en, he)
  packages/config — ESLint, TSConfig, Tailwind v4
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Monorepo | Turborepo + pnpm | 2.4.4 / 10.x |
| Language | TypeScript (strict) | 5.8.2 |
| Frontend | Next.js (App Router) | 15 |
| UI | React | 19 |
| Styling | Tailwind CSS | v4 |
| Backend | Hono | 4.7.4 |
| Database | PostgreSQL (Neon) | Serverless |
| ORM | Drizzle ORM | 0.40 |
| Cache | Redis (Upstash) | Serverless |
| Queue | BullMQ | — |
| AI (complex) | Claude API (Sonnet 4) | Anthropic |
| AI (fast) | Gemini 2.0 Flash | Google |
| AI (device) | Gemini Nano | Browser |
| Auth | Better Auth | email + Google OAuth + magic links |
| Payments | Stripe + PayPlus | Global + Israel |
| Storage | Cloudflare R2 | S3-compatible |
| Search | Meilisearch | — |
| Email | Resend + React Email | — |
| Monitoring | Sentry (errors) + PostHog (analytics) | — |
| Hosting | Vercel (frontend) + Cloudflare Workers (API) | — |

## Directory Structure

```
apps/
  web/src/
    app/                    — Next.js App Router pages
      (auth)/               — Auth group (login, register)
      dashboard/            — Dashboard + new site creation
      editor/[siteId]/      — Visual editor
    components/
      editor/               — Editor-specific (AIChatPanel, EditorPreview, etc.)
    lib/                    — App-specific utilities
  api/src/
    routes/                 — Hono route handlers (thin — delegate to services)
    services/               — Business logic (one file per domain, max 200 lines)
    middleware/             — Auth, rate-limit, validation
  renderer/src/             — Published site SSG/ISR renderer

packages/
  db/src/
    schema/                 — Drizzle table definitions (one file per domain)
    client.ts               — Database connection
  ai/src/
    router.ts               — AI Router (task → model mapping + fallback chain)
    clients/                — AI API clients (claude.ts, gemini.ts)
    generators/             — Site, page, content, design-dna generators
    scanner/                — Website scanner
    prompts/                — System prompts
  ui/src/                   — Shared components (button, card, dialog, etc.)
  types/src/                — Type definitions (block, site, user, ai, result)
  utils/src/                — Utility functions (id, slug, date, validation)
  i18n/                     — i18n config + message files (en.json, he.json)
  config/                   — ESLint, TSConfig, Tailwind v4 config
```

## Coding Conventions

- **TypeScript strict mode** everywhere
- Use `type` not `interface` for type definitions
- File naming: `kebab-case.ts` (e.g., `commerce.service.ts`)
- Component naming: PascalCase (e.g., `ProductCard.tsx`)
- `const` arrow functions for components: `const MyComponent = () => {}`
- Import order: external deps → `@ubuilder/*` packages → relative imports
- Named exports only, no default exports (except Next.js pages)
- Use Next.js Server Actions for mutations
- Use Drizzle ORM — no raw SQL
- Error handling: Result pattern `{ ok: true, data } | { ok: false, error }` — avoid try/catch in business logic
- All entity IDs via `prefixedId()` from `@ubuilder/utils`
- Soft deletes only (status: 'archived') — never hard delete user data
- Timestamps: `createdAt` and `updatedAt` on all tables
- JSDoc comments on all exported functions
- Tests: Vitest (unit), Playwright (e2e)
- Tailwind only — no custom CSS files (except global tokens)
- All API routes require auth middleware (except public site routes)
- API responses: `{ success: true, data }` or `{ success: false, error: { code, message } }`

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

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
CLAUDE_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
R2_ACCESS_KEY=...
R2_SECRET_KEY=...
R2_BUCKET_URL=...
RESEND_API_KEY=re_...
BETTER_AUTH_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_URL=http://localhost:8787
```

## Important Rules

1. **ALWAYS read BACKLOG.md** before starting a new task
2. **ALWAYS update FIXES.md** when you find and fix a bug
3. **ALWAYS update BACKLOG.md** status after completing a task
4. **NEVER install new packages** without asking first — prefer existing deps
5. **ALWAYS run `pnpm build`** after changes to verify no type errors
6. **When creating a new service**, follow the pattern in existing services
7. **When creating a new UI component**, add it to packages/ui
8. **All text content** must support Hebrew (RTL) — use logical properties
9. **Prefer Server Components** in Next.js — only use 'use client' when needed
10. **Keep services thin** — max 200 lines per file, split if larger
11. **NEVER use physical CSS properties** (left/right) — always logical (start/end)
12. **NEVER import from another app directly** — use packages/* for shared code
13. **ALWAYS use prefixedId()** from @ubuilder/utils for new entity IDs
14. **ALWAYS use the Result pattern** (ok/err) from @ubuilder/types for service returns
15. **When adding a new DB table**, create schema in packages/db/src/schema/ and export from index.ts
16. **When adding a new AI task**, update the taskModelMap in packages/ai/src/router.ts
17. **All API responses** follow: `{ success: true, data }` or `{ success: false, error: { code, message } }`

## Git Workflow

```
Branch naming:   feat/description, fix/description, chore/description
Commits:         Conventional commits (feat:, fix:, chore:, docs:, refactor:, test:)
PR process:      Create branch → implement → pnpm build → PR to main
Main branch:     main (protected, default)
```

## AI Router Pattern

All AI requests go through `packages/ai/src/router.ts`:

| Task Type | Model | Use Case |
|-----------|-------|----------|
| chat-response | Gemini Flash | Quick AI chat replies |
| text-rewrite | Gemini Flash | Rewrite text with tone |
| image-search | Gemini Flash | Find matching images |
| translation | Gemini Flash | Translate content |
| block-edit | Gemini Flash | Edit single block |
| page-generation | Claude | Generate full page |
| site-generation | Claude | Generate entire site |
| site-scan | Claude | Analyze competitor site |
| seo-analysis | Claude | SEO audit |
| gso-analysis | Claude | GSO scoring |
| content-generation | Claude | Blog/article generation |

Fallback chain: Gemini Nano → Gemini Flash → Claude → Error

---

## Website Scanner Protocol

This is the authorized workflow for the "Start from URL" feature. Users scan websites they own or have permission to rebuild. The scanner performs a deep 7-phase analysis followed by a structured rebuild.

### Phase 1: Full Site Discovery
- Crawl all reachable internal pages (nav, footer, sitemap, internal links, buttons, menus)
- Output: `analysis/site-map.json`, `analysis/routes.csv`
- For each route: page title, URL, purpose, depth, indexable, in-nav, has forms/media/animations

### Phase 2: Visual & Structural Capture
- Desktop, tablet, mobile screenshots for every important page
- Section-level screenshots for major sections
- Interact with all UI: menus, dropdowns, tabs, accordions, carousels, modals, hover states
- Detect: hero, features, testimonials, pricing, CTA, forms, gallery, footer, custom sections
- Output: `analysis/screenshots/`, `analysis/page-notes/`, `analysis/section-map.json`

### Phase 3: Design System Extraction
- Extract and normalize: colors, gradients, typography (families, scale, line-heights), spacing, border-radius, shadows, layout widths, grid, breakpoints, button/card/form/navbar/footer variants, icon usage, image treatment, background treatment, animation patterns, hover effects, scroll/sticky behavior
- Normalize into reusable design tokens and component patterns
- Output: `analysis/design-tokens.json`, `analysis/components.json`, `analysis/motion-map.json`, `analysis/theme-summary.md`

### Phase 4: Content & Page Architecture
- For each page: primary goal, target audience, section order, content hierarchy, heading structure, CTA structure, trust elements, conversion elements, repeated patterns, reusable blocks
- Classify every section into reusable types with visual variants
- Output: `analysis/content-map.json`, `analysis/page-architecture.md`, `analysis/section-library.json`

### Phase 5: Media Intelligence
- For every image/video: role, aspect ratio, visual subject, style/mood, whether to preserve/regenerate/replace/upgrade
- AI-friendly image brief for rebuild (prompt, negative prompt, reference upload support, lock support)
- Output: `analysis/assets-manifest.json`, `analysis/image-slots.json`, `analysis/video-slots.json`, `analysis/media-strategy.md`

### Phase 6: Responsive & Interaction Audit
- Mobile nav behavior, section stacking, typography/spacing/image changes by breakpoint
- Interactive elements on touch, sticky/motion on small screens
- Output: `analysis/responsive-map.json`, `analysis/interaction-audit.md`

### Phase 7: Rebuild & Upgrade Planning
- What to preserve exactly, rebuild as structured sections, improve, regenerate with AI, replace with stronger media, simplify, enhance (UX, performance, accessibility, responsiveness, motion)
- Output: `analysis/rebuild-spec.md`, `analysis/upgrade-opportunities.md`, `analysis/gap-report.md`

### Rebuild Phase (after analysis)

Read all `analysis/` artifacts as source of truth. Produce:

1. **Section Schema** (`analysis/section-schema.json`) — Reusable section types (hero, features, testimonials, pricing, CTA, gallery, team, stats, FAQ, contact, footer) with variants per industry
2. **Template Schema** (`analysis/template-schema.json`) — Full page templates composed of ordered sections
3. **Theme Token System** (`analysis/theme-tokens.json`) — Normalized colors, typography, spacing, shadows
4. **Motion Preset System** (`analysis/motion-presets.json`) — Scroll reveals, hover effects, transitions, parallax, sticky
5. **Media Slot System** (`analysis/media-schema.json`) — Every image/video slot with:
   - `generate` — AI creates from prompt
   - `regenerate` — Redo with different style
   - `replace` — Upload custom image
   - `reference` — Upload reference image for style matching
   - `lock` — Prevent AI from changing this slot
   - `prompt` — Editable AI prompt for this slot
6. **Build Plan** (`analysis/build-plan.md`) — Implementation plan: what to preserve, rebuild, improve, regenerate

**Scanner rules:**
- Treat as authorized rebuild (user owns or has permission)
- Never do a shallow/homepage-only scan — go deep
- Save ALL findings to `analysis/` directory, not just chat
- Work in phases, complete each thoroughly before moving on
- Document blockers and continue with everything else
- Normalize into reusable abstractions, not one-off notes
- Build an upgraded version, not a raw copy — faithful where appropriate, improved where weak

---

## Agent Team

This project uses a team of specialized AI agents. Each agent has a defined role, owned files, and collaboration patterns. See `.claude/agents/` for full definitions.

| Agent | Role | Trigger Keywords |
|-------|------|-----------------|
| `@architect` | Tech Lead / System Architect | architecture, refactor, dependency, review, new package |
| `@frontend` | Frontend Engineer | styling, layout, component, responsive, RTL, animation, editor |
| `@backend` | Backend Engineer | API, endpoint, database, migration, auth, service |
| `@ai-eng` | AI Integration Specialist | AI, prompt, generate, Claude, Gemini, scanner |
| `@devops` | DevOps / Infrastructure | deploy, CI, environment, monitoring, Vercel, Cloudflare |
| `@pm` | Product Manager | backlog, sprint, priority, user story, feature request |
| `@designer` | UI/UX Designer | design, color, typography, accessibility, tokens, animation |
| `@qa` | QA Engineer | test, coverage, performance, bug, regression |
| `@seo` | SEO / GSO / Content | SEO, GSO, Schema.org, meta, i18n, content strategy |
| `@hr` | Team Manager | new agent, team gaps, assign tasks, create specialist |

### Task Flow

```
New Feature:  @pm → @architect → specialists (@frontend/@backend/@ai-eng) → @qa → @devops → @architect review
Bug Fix:      @qa documents → @hr routes → specialist fixes + regression test → @architect reviews
New Sprint:   @pm updates BACKLOG.md → @hr assigns → @architect reviews approach → parallel execution
Site Scanner: @ai-eng + @designer analyze → @frontend + @backend rebuild → @seo optimizes → @qa validates
```

---

## Current Sprint

See `BACKLOG.md` for current tasks and priorities.
See `FIXES.md` for known bugs and their solutions.
