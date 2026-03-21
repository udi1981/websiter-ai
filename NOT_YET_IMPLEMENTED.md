# Not Yet Implemented

Features described in documentation or CLAUDE.md that have **zero working code** as of 2026-03-20.

## Infrastructure
- **Redis / Upstash / BullMQ** — No cache or queue system connected
- **Meilisearch** — No search engine connected
- **Resend / React Email** — No transactional email system
- **Sentry** — No error monitoring connected
- **PostHog** — No analytics/telemetry connected
- **Cloudflare R2** — No object storage; images use data URLs
- **Cloudflare Workers** — Runtime is Node.js on Vercel, not Workers
- **Stripe / PayPlus** — No payment processing code exists

## Features
- **Analytics dashboard** — API returns `comingSoon: true`; no real analytics collection
- **CRM Campaigns** — In-memory mock data only, no DB persistence
- **CRM Customers** — In-memory mock data only, no DB persistence
- **Team 101 real agents** — Post-publish agent orchestration is a no-op placeholder
- **SEO Monitor** — No implementation
- **Content Scheduler** — No implementation
- **GSO scoring / optimization** — No implementation
- **Block editor / block rendering** — Pages stored as HTML, not JSON block trees
- **Multi-page generation** — Only homepage generation works
- **Website Scanner V2** — Deep analysis phases described in CLAUDE.md have no code
- **AI Router** — `packages/ai/src/router.ts` described but doesn't exist; AI calls go directly to Claude/Gemini APIs
- **Magic link auth** — Only email/password login works
- **Design DNA extraction** — No implementation
- **Storybook** — No component stories exist
- **i18n package** — `packages/i18n` described but doesn't exist
- **apps/api (Hono)** — Described as separate API server but doesn't exist; API routes are Next.js route handlers
- **apps/renderer** — Published site renderer is a shell with no real rendering logic

## Packages with zero or minimal code
- `packages/ai` — Described but doesn't exist
- `packages/i18n` — Described but doesn't exist
- `packages/ui` — Minimal, not a full component library

## What DOES work (core flow)
1. Email/password authentication (Better Auth)
2. AI-powered site generation pipeline (discovery → strategy → design → content → build)
3. Generation observability (DB-backed jobs, steps, artifacts)
4. Section-based composition (112 variants across 19 categories)
5. Visual editor with live preview
6. Publishing to `/site/[slug]`
7. AI chatbot on published sites (Claude API, session persistence)
8. Lead capture from chatbot → CRM leads table
9. Chatbot context refresh on republish
