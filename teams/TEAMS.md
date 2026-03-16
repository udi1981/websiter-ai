# UBuilder AI — Team Organization

> 7 Teams, 25 Agents, Full Coverage

## Team Overview

| Team | Name | Lead | Agents | Focus |
|------|------|------|--------|-------|
| **100** | Core Product | @frontend-lead | 4 | Frontend, UX, Creation Flow, Editor |
| **101** | Infrastructure | @backend-lead | 4 | Database, Auth, API, DevOps |
| **102** | AI Engine | @ai-lead | 4 | AI Generation, Prompts, Scanner |
| **103** | Data Science | @ds-lead | 4 | ML, AI Studio, Analytics, MLOps |
| **104** | Publishing | @publishing-lead | 3 | Renderer, Domains, CDN |
| **105** | Quality | @qa-lead | 5 | Testing, Performance, A11y, SEO |
| **106** | Business | @product-manager | 4 | CRM, Payments, i18n, Product |

## All Agents (25)

### Team 100 — Core Product
1. **@frontend-lead** — Next.js, React, Tailwind, page architecture
2. **@ui-designer** — Components, design tokens, themes, responsive
3. **@creation-flow** — Site creation wizard, discovery chat, templates
4. **@editor-specialist** — Visual editor, iframe, undo/redo, AI chat

### Team 101 — Infrastructure
5. **@backend-lead** — Hono API, services, middleware
6. **@db-engineer** — PostgreSQL, Drizzle ORM, migrations
7. **@auth-specialist** — Better Auth, OAuth, sessions, security
8. **@devops** — Vercel, Cloudflare, R2, CI/CD, monitoring

### Team 102 — AI Engine
9. **@ai-lead** — AI router, model selection, fallback chains
10. **@prompt-engineer** — System prompts, output quality, token efficiency
11. **@scanner-specialist** — 7-phase deep scanner, design DNA extraction
12. **@generation-engineer** — HTML generation, streaming, multi-page sites

### Team 103 — Data Science
13. **@ds-lead** — ML architecture, embeddings, vector search
14. **@ai-studio-engineer** — AI Studio, image gen, style transfer, brand voice
15. **@analytics-engineer** — PostHog, funnels, A/B testing, metrics
16. **@ml-ops** — Model serving, caching, cost tracking, optimization

### Team 104 — Publishing
17. **@publishing-lead** — Publishing pipeline, site hosting architecture
18. **@renderer-engineer** — SSG/ISR, HTML serving, edge caching
19. **@domain-specialist** — DNS, custom domains, SSL, wildcard routing

### Team 105 — Quality
20. **@qa-lead** — Test strategy, coverage, CI integration
21. **@client-agent** — User simulation, E2E testing, flow validation
22. **@performance-agent** — Lighthouse, Core Web Vitals, bundle size
23. **@accessibility-agent** — WCAG 2.1, ARIA, keyboard nav, contrast
24. **@seo-specialist** — Schema.org, meta tags, GSO scoring

### Team 106 — Business
25. **@product-manager** — Roadmap, backlog, feature specs, prioritization
26. **@payments-engineer** — Stripe, PayPlus, subscriptions
27. **@crm-engineer** — Leads, customers, campaigns, analytics
28. **@i18n-specialist** — Hebrew, English, RTL, locale routing

## Collaboration Flow

```
New Feature:   @product-manager → @frontend-lead/@backend-lead → specialists → @qa-lead → @devops
Bug Fix:       @client-agent reports → @qa-lead routes → specialist fixes → @qa-lead verifies
AI Feature:    @ai-lead designs → @prompt-engineer + @generation-engineer build → @qa-lead tests
DB Change:     @db-engineer schema → @backend-lead API → @frontend-lead UI → @qa-lead E2E
Publishing:    @publishing-lead + @renderer-engineer build → @domain-specialist DNS → @seo-specialist meta
Data Science:  @ds-lead architects → @ai-studio-engineer implements → @ml-ops deploys → @analytics-engineer measures
```

## Current Sprint Priority

### Phase 1 (NOW) — Make it work reliably
1. **Team 101** — DB + Auth (replace localStorage)
2. **Team 104** — Renderer (make publishing real)
3. **Team 105** — Error boundaries + stability
4. **Team 100** — Fix server crashes, creation flow stability

### Phase 2 — Make it complete
5. **Team 106** — Stripe payments
6. **Team 102** — Generation quality
7. **Team 105** — Accessibility + SEO
8. **Team 100** — Editor improvements

### Phase 3 — Make it amazing
9. **Team 103** — AI Studio features
10. **Team 106** — CRM + E-commerce
11. **Team 102** — Advanced scanner
12. **Team 103** — Analytics + ML
