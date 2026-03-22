# UBuilder AI — Vision & Roadmap

> The ultimate AI-powered platform for one-person businesses.
> One tool replaces: website builder + CRM + payments + content + marketing + analytics.
> Everything runs on AI. Everything works from a phone.

---

## Mission

Give every one-man-show business owner a **complete digital operation** powered by AI.
Not just a website — a connected business system where:
- The **website** attracts customers through AI-optimized content and design
- The **CRM** tracks every lead, customer, and interaction automatically
- **Payments** flow seamlessly (invoices, subscriptions, one-time purchases)
- **Content** is generated and published automatically (blogs, articles, social)
- **SEO/GSO** keeps the business visible in AI search engines and traditional search
- **Communication** reaches customers through email, SMS, WhatsApp
- **Analytics** shows what's working and what needs attention
- **AI Agent** on the published site answers visitor questions, books appointments, captures leads

All managed from a single mobile dashboard. All powered by AI.

---

## Roadmap — Priority Phases

Priorities shift dynamically based on which phase we're executing.
Each phase must be COMPLETE and PRODUCTION-READY before the next begins.

### Phase 1: Dream-Quality Website Generation (NOW — TOP PRIORITY)

**Goal:** Generate websites so stunning that users screenshot them and share.
**Status:** 85% complete. Pipeline works, but quality needs to reach "phenomenal" level.

| Task | Status | Priority |
|------|--------|----------|
| AI Discovery Chat | DONE | - |
| AI Planning (variant selection from 112-section registry) | DONE | - |
| Section-composed generation (instant from generators) | DONE | - |
| AI streaming generation (Claude/Gemini fallback) | DONE | - |
| Visual Editor with AI chat agent | DONE | - |
| Section Picker (add/remove/swap sections) | DONE | - |
| Section markers for editor identification | DONE | - |
| Deep URL scanner (7-phase competitor analysis) | DONE | - |
| Publishing to public URL | DONE | - |
| **Creative Excellence Review** | TODO | HIGH |
| **Media orchestration (hero visuals, AI images, video slots)** | TODO | HIGH |
| **Content quality engine (industry-specific, Hebrew-native copy)** | TODO | HIGH |
| **Mobile-first editor experience** | TODO | MEDIUM |
| **Template gallery (pre-built industry sites)** | TODO | MEDIUM |

**Definition of Done:**
- Generate 10 sites across industries (SaaS, restaurant, law, dental, fitness, ecommerce, portfolio, agency, real estate, consulting)
- Each site scores 9+/10 on: visual impact, content quality, mobile experience, SEO readiness
- Hebrew sites are native-quality, not translated
- Sites load under 3 seconds, Lighthouse 90+

---

### Phase 2: Editor & Management Experience

**Goal:** Business owners can manage their site entirely from mobile.
**Depends on:** Phase 1 complete.

| Task | Priority |
|------|----------|
| Mobile-optimized editor (bottom sheets, touch targets, gestures) | HIGH |
| Rich text editing (inline, not code) | HIGH |
| Image upload and management (Cloudflare R2) | HIGH |
| Site settings (domain, favicon, analytics code) | MEDIUM |
| Multi-page support (not just single-page sites) | MEDIUM |
| Version history and rollback | LOW |

---

### Phase 3: CRM — Customer Relationship Core

**Goal:** Every site visitor becomes a tracked lead. Every interaction is logged.
**Depends on:** Phase 1 complete, Phase 2 in progress.

| Task | Priority |
|------|----------|
| Wire CRM to Drizzle/Neon (replace in-memory stubs) | CRITICAL |
| Lead capture from site forms (auto-create leads) | HIGH |
| Customer profiles with interaction history | HIGH |
| Lead scoring (AI-based) | MEDIUM |
| Mobile CRM dashboard | HIGH |
| WhatsApp/call integration (link to external system) | MEDIUM |
| AI call summary (connect to external call system) | FUTURE |

---

### Phase 4: Payments & Invoicing

**Goal:** Accept payments and send invoices from the platform.
**Depends on:** Phase 3 (CRM provides customer data).

| Task | Priority |
|------|----------|
| Stripe integration (global payments) | HIGH |
| PayPlus integration (Israeli market, credit guard) | HIGH |
| Invoice generation (AI-powered, Hebrew/English) | HIGH |
| Recurring payments / subscriptions | MEDIUM |
| Payment dashboard (revenue, transactions, refunds) | MEDIUM |
| Financial reports | LOW |

---

### Phase 5: Content & SEO/GSO Engine

**Goal:** AI generates and publishes content that drives organic traffic from both traditional search and AI search engines.
**Depends on:** Phase 1 (sites exist), Phase 3 (CRM informs content strategy).

| Task | Priority |
|------|----------|
| Blog article generator (AI writes industry-relevant articles) | HIGH |
| Auto-publish with SEO optimization | HIGH |
| GSO scoring (how well AI engines can cite the content) | HIGH |
| Content calendar (automated publishing schedule) | MEDIUM |
| Schema.org structured data automation | MEDIUM |
| Social media content generation | LOW |

---

### Phase 6: Communication & Automation

**Goal:** Reach customers automatically through email, SMS, WhatsApp.
**Depends on:** Phase 3 (CRM), Phase 4 (Payments).

| Task | Priority |
|------|----------|
| Email system (Resend + React Email templates) | HIGH |
| Campaign manager (email sequences, newsletters) | HIGH |
| SMS integration | MEDIUM |
| WhatsApp Business API | MEDIUM |
| Automation rules (trigger → action) | HIGH |
| AI-powered email writing | MEDIUM |

---

### Phase 7: AI Site Agent (Chatbot)

**Goal:** Every published site has an AI assistant that answers questions, captures leads, and books appointments.
**Depends on:** Phase 3 (CRM stores captured data), Phase 5 (content powers answers).

| Task | Priority |
|------|----------|
| Embeddable chatbot widget | HIGH |
| AI trained on site content | HIGH |
| Lead capture through chat | HIGH |
| Appointment booking | MEDIUM |
| Hand-off to human (WhatsApp/phone) | MEDIUM |

---

### Phase 8: Analytics & Intelligence

**Goal:** Business owners see what's working and get AI recommendations.
**Depends on:** All previous phases generating data.

| Task | Priority |
|------|----------|
| Site analytics dashboard (visitors, conversions, sources) | HIGH |
| CRM analytics (lead funnel, conversion rates) | HIGH |
| Content performance (which articles drive traffic) | MEDIUM |
| AI insights ("Your FAQ page drives 40% of leads — expand it") | MEDIUM |
| Revenue dashboards (from payments data) | MEDIUM |

---

## Architecture Principles

1. **AI-First** — Every feature is powered by AI. Manual processes are temporary placeholders.
2. **Mobile-First** — The primary user manages their business from a phone. Desktop is secondary.
3. **Hebrew-Native** — Hebrew is not a translation. It's the primary language. RTL is default.
4. **Data-Driven** — The system learns from every interaction and improves automatically.
5. **One-Man-Show Focused** — The user is alone. They don't have a "team." The AI IS their team.
6. **Progressive Value** — Each phase delivers standalone value. Users don't wait for "everything" to ship.
7. **Vision-Code Alignment** — If it's in a protocol but not in the code, it's a TODO, not a feature.

---

## Current Reality Check

**What works today (production-ready):**
- AI generates complete websites from text description
- Deep URL scanning reverse-engineers competitor sites
- Visual editor with AI chat for modifications
- 112 premium section templates with 25 effects
- Section picker for adding/swapping/removing sections
- Publishing to public URLs
- User authentication (email + Google OAuth)

**What exists as skeleton (needs wiring):**
- CRM schema + API stubs (needs Drizzle persistence)
- Blog/content schema (needs routes + generators)
- GSO scoring schema (needs implementation)

**What's completely missing:**
- Payments (Stripe/PayPlus)
- Email sending (Resend)
- Analytics (PostHog)
- Chatbot widget
- Image AI generation
- Mobile editor experience

---

## North Star Metric

**Active Sites with Revenue** — The number of published sites that have:
1. Live, beautiful website
2. Active CRM with leads
3. At least one payment processed
4. Content being published
5. Positive SEO/GSO trajectory

This is the metric that proves the platform delivers on its promise:
turning a one-man-show into a fully operational digital business.
