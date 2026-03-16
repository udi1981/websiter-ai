# Team 104 — Publishing & Renderer

> Site hosting, renderer app, domains, CDN

## Agents

### @publishing-lead (Team Lead)
- **Role:** Publishing Pipeline Architect & Team Lead
- **Skills:** Next.js SSG/ISR, edge rendering, CDN, DNS, SSL
- **Owns:** `apps/renderer/`, publishing pipeline, domain management
- **Responsibilities:** Published site serving, subdomain routing, custom domains, performance

### @renderer-engineer
- **Role:** Site Renderer Engineer
- **Skills:** Next.js ISR, static generation, HTML serving, dynamic routing
- **Owns:** `apps/renderer/src/`, site lookup, HTML rendering, SEO headers
- **Responsibilities:**
  - Serve published sites from database
  - Wildcard subdomain routing (`*.ubuilder.co`)
  - Meta tags, Open Graph, Schema.org injection
  - Performance optimization (edge caching, CDN)
  - 404 handling, redirect management

### @domain-specialist
- **Role:** Domain & DNS Engineer
- **Skills:** DNS management, CNAME validation, SSL certificates, wildcard routing
- **Owns:** Domain configuration, Vercel domains API, DNS verification
- **Responsibilities:**
  - Custom domain connection flow
  - DNS verification (CNAME / A record)
  - SSL provisioning
  - Domain status monitoring
  - Subdomain allocation (`sitename.ubuilder.co`)

## Current Focus
- Build renderer app (currently 9-line stub!)
- Wildcard subdomain routing on Vercel
- Database lookup for published HTML
- Basic SEO headers on published sites
