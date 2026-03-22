# Teams Protocol — AI Agent Teams

> Portable team definition file. Copy to any project root for consistent team structure.
> Created by @hr | UBuilder AI

---

## Claude Code Development Agents

| # | Agent | Role | Trigger Keywords | Owned Files |
|---|-------|------|-----------------|-------------|
| 1 | @architect | Tech Lead / System Architect | architecture, refactor, dependency, review, new package | All — reviews everything before merge |
| 2 | @frontend | Frontend Engineer | styling, layout, component, responsive, RTL, animation, editor | `apps/web/src/**`, `packages/ui/**` |
| 3 | @backend | Backend Engineer | API, endpoint, database, migration, auth, service | `apps/api/src/**`, `packages/db/**` |
| 4 | @ai-eng | AI Integration Specialist | AI, prompt, generate, Claude, Gemini, scanner | `packages/ai/**`, AI API routes |
| 5 | @designer | UI/UX Designer / Design System Owner | design, color, typography, accessibility, tokens, animation | Design tokens, component specs |
| 6 | @devops | DevOps / Infrastructure | deploy, CI, environment, monitoring, Vercel, Cloudflare | CI/CD, infra config |
| 7 | @pm | Product Manager / Sprint Planner | backlog, sprint, priority, user story, feature request | `BACKLOG.md`, sprint planning |
| 8 | @qa | QA Engineer / Testing Specialist | test, coverage, performance, bug, regression | Tests, audits, verification |
| 9 | @seo | SEO / GSO / Content Strategy | SEO, GSO, Schema.org, meta, i18n, content strategy | SEO config, i18n, meta tags |
| 10 | @hr | Team Manager / Agent Coordinator | new agent, team gaps, assign tasks, create specialist | `.claude/agents/**`, team docs |

---

## Team 100 — Site Builders (20 Agents)

Multi-agent website creation system. Operates as a world-class digital studio.
Workflow: `Discovery → [CPO Review] → Research → Strategy → [CPO Review] → UX → Design → Content → [CPO Review] → Build → Mobile Audit → SEO + GEO → [CPO Review] → CMS → AI Agent → Integrations → [CPO Review] → Testing → Optimization → [CPO Final Sign-Off] → Launch`

### Core Workflow Agents (1-12)

| # | Agent | Skills | Trigger |
|---|-------|--------|---------|
| 1 | Product Orchestrator | Product Thinking, System Coordination, Decision Prioritization, Project Flow Management | Manages entire workflow |
| 2 | Conversational Discovery | NLU, Context Mapping, Dynamic Question Generation, Ambiguity Resolution | User interview |
| 3 | Market Intelligence | Competitor Analysis, Market Pattern Recognition, Content Benchmarking, Opportunity Identification | Competitor scan |
| 4 | Website Strategy | Information Architecture, User Journey Design, Conversion Strategy, Page Structure Planning | Site planning |
| 5 | UX Architecture | Interaction Design, Navigation Systems, Usability Optimization, Engagement Design | UX planning |
| 6 | Visual Design | Design Systems, Typography Selection, Color Strategy, Visual Hierarchy | Design system |
| 7 | Website Generation | Section Registry Selection, Section Composer, Effects Orchestration, Responsive Design, RTL Support | Section-based code generation |
| 8 | CMS Architect | Content Modeling, Admin Experience Design, Permission Systems | CMS setup |
| 9 | AI Website Agent Designer | Agent Personality Design, Conversation Flow Design, Task Automation | Chatbot agent |
| 10 | Data Architecture | Database Architecture, API Planning, Data Flow Engineering | Data layer |
| 11 | Simulation Users | UX Testing, Friction Detection, Conversion Testing | User simulation |
| 12 | Optimization | Behavior Analysis, UX Improvement, Conversion Optimization | Post-build optimization |

### Extended Agents (13-20)

| # | Agent | Skills | Trigger |
|---|-------|--------|---------|
| 13 | SEO Strategist | Schema.org, Meta Tags, Page Speed, Internal Linking, Sitemap, Technical SEO | SEO optimization |
| 14 | Content Strategist & Writer | Brand Voice, Headlines, Microcopy, Blog Strategy, Social Proof, Multi-Language | Content creation |
| 15 | Accessibility & Performance Auditor | WCAG, Color Contrast, Screen Reader, Core Web Vitals, Lighthouse, Keyboard Nav | A11y + performance |
| 16 | Integration Architect | Payments (Stripe/PayPlus), Email, CRM, Analytics, Social, Calendar, WhatsApp | External integrations |
| 17 | Launch & Growth Manager | Pre-Launch Checklist, Domain/DNS, Post-Launch Monitoring, A/B Testing, Growth Playbook | Go-live |
| 18 | GEO Specialist | AI Content Structuring, Entity Authority, Citational Density, Schema Stacking, AI Visibility | Generative Engine Optimization |
| 19 | Mobile Experience Architect | Touch Targets, Thumb Zone, Mobile Nav, Mobile Forms, Mobile Performance, Cross-Device | Mobile-first QA |
| 20 | CPO — Quality Guardian | Intent Fidelity, Quality Scoring, Specificity Enforcement, Cross-Agent Consistency, Final Sign-Off | Quality gate at every stage |

### Team 100 Core Principles
1. **Discovery Before Building** — Never generate without understanding the business
2. **Dynamic Question Engine** — Each answer triggers gap detection and next question generation
3. **GEO-First Architecture** — Optimized for AI models (ChatGPT, Gemini, Copilot, Perplexity)
4. **Mobile-First Always** — Every feature must work flawlessly on mobile
5. **CPO Quality Gate** — No output passes without CPO review. Below 8/10 = redo
6. **Vision-Code Alignment** — Every protocol, workflow, and agent definition must be reflected in actual running code. If it's in a document but not in the codebase, it's a TODO, not a capability. Agents are only "real" when their logic is wired into the generation pipeline.
7. **Media as Core Engine** — Media is not an afterthought ("pick a stock photo"). It's a generation orchestration engine that runs during site build: hero visuals, motion presets, video slots, shader backgrounds, and slot logic (generate / regenerate / replace / reference / lock). Every section has defined media slots with AI-ready prompts.
8. **Creative Excellence Layer** — Quality is not just "correct code" or "good SEO scores." A dedicated creative review phase evaluates: Does this site feel rare? Is the visual hierarchy breathtaking? Does the typography create emotion? Is the whitespace luxurious? Does the color palette feel intentional and cohesive? A site that passes all technical checks but doesn't make people screenshot and share is not done.

### Section-Based Architecture
Team 100 uses a **section registry** with 112 premium variants across 19 categories (navbar, hero, features, testimonials, pricing, CTA, FAQ, footer, gallery, team, stats, contact, partners, how-it-works, blog, portfolio, comparison, newsletter, about). Each variant has:
- A generator function producing production-ready HTML with inline styles, responsive breakpoints, RTL support, and animation effects
- Registry metadata: industries, tags, animation level, theme, responsive flag
- Media slots: defined image/video positions with AI generation prompts
- Effects: 25 premium effects (scroll-reveal, tilt-card, glow, shimmer, aurora, liquid-glass, parallax, etc.)

**Generation flow:** AI Planning selects variants from the registry based on business type and strategy → Section Composer assembles the page → Effects collector injects CSS/JS → Section markers enable editor swap/reorder

---

## Team 101 — Site Infrastructure (6 Agents)

Post-publish operations. Activates after Team 100 hands off the built site.

| # | Agent | Role | Activation |
|---|-------|------|------------|
| 1 | CRM Manager | Leads, customers, scoring, segmentation | Immediate |
| 2 | Analytics Engine | Metrics, reports, trends, insights | Immediate |
| 3 | Campaign Manager | Email/SMS campaigns, A/B testing, engagement | Day 1 |
| 4 | Content Scheduler | Blog planning, article generation, automated publishing | Week 1 |
| 5 | SEO Monitor | Rankings, backlinks, indexing, GSO scoring | Week 1 |
| 6 | Chatbot Agent | Visitor engagement, lead collection, appointment scheduling | Immediate |

### Team 100 → Team 101 Handoff
When a site is published, Team 100 passes to Team 101:
- Site configuration (id, slug, domain, industry, locale)
- Design DNA (colors, fonts, brand voice)
- Content inventory (pages, sections, CTAs)
- SEO baseline (current scores, keywords, Schema.org)
- Activation plan (which Team 101 agents to start, in what order)

---

## Team Routing Rules

| Keywords | Route To |
|----------|----------|
| styling, layout, component, responsive, RTL, animation | @frontend |
| API, endpoint, database, migration, auth, service | @backend |
| AI, prompt, generate, Claude, Gemini, scanner | @ai-eng |
| deploy, CI, environment, monitoring, Vercel, Cloudflare | @devops |
| test, coverage, performance, bug, regression | @qa |
| SEO, GSO, Schema.org, meta, i18n, content | @seo |
| design, color, typography, accessibility, tokens | @designer |
| backlog, sprint, priority, user story | @pm |
| architecture, refactor, dependency, review, new package | @architect |
| new agent, team gaps, assign tasks | @hr |

---

## Collaboration Workflows

### New Feature Flow
```
@pm (defines story) → @architect (designs approach) → specialists execute in parallel:
  @frontend (UI) + @backend (API) + @ai-eng (AI logic)
  → @qa (tests) → @devops (deploy) → @architect (final review)
```

### Bug Fix Flow
```
@qa (documents bug) → @hr (routes to specialist) → specialist fixes + regression test
  → @architect (reviews fix)
```

### Sprint Planning Flow
```
@pm (updates BACKLOG.md) → @hr (assigns agents) → @architect (reviews approach)
  → parallel execution → @qa (validates) → @devops (ships)
```

### Site Creation Flow (Team 100)
```
Orchestrator → Discovery → [CPO] → Market Intel → Strategy → [CPO]
  → UX → Visual Design → Content → [CPO]
  → Section Selection (AI picks variants from 112-section registry)
  → Media Orchestration (hero visuals, motion, video, shaders per slot)
  → Section Composer (assembles page from generators + effects)
  → Mobile Audit → SEO + GEO → [CPO]
  → Creative Excellence Review (visual hierarchy, emotion, uniqueness — redo if < 9/10)
  → CMS → AI Agent → Integrations → [CPO]
  → Simulation Testing → Optimization → [CPO Final]
  → Launch → Handoff to Team 101
```

---

## Phase Assignment Template

Use this template when creating a new implementation plan:

```markdown
| Phase | Lead Team | Supporting Teams | Reviewer |
|-------|-----------|-----------------|----------|
| 1 — [Phase Name] | **@lead** | @support | @reviewer |
| 2 — [Phase Name] | **@lead** | @support | @reviewer |
```

---

## New Agent Creation Template

When creating a new agent, include ALL of the following:

```markdown
# @agent-name — Role Title

## Role
[One paragraph describing what this agent does]

## Trigger Patterns
keyword1, keyword2, keyword3

## Primary Responsibilities
1. [Responsibility 1]
2. [Responsibility 2]
3. [Responsibility 3]
4. [Responsibility 4]
5. [Responsibility 5]

## Specializations
- [Technology/framework 1]
- [Technology/framework 2]

## Owned Files & Directories
- `path/to/owned/**`

## Collaboration
- **Works with @agent** to [purpose]
- **Hands off to @agent** when [condition]

## Invoke When
- [Situation 1]
- [Situation 2]
```

---

## Cross-Project Reuse

To use this protocol in another project:
1. Copy `teams-protocol.md` to the new project root
2. Copy `.claude/agents/*.md` for each needed agent
3. Adjust owned files/directories per project structure
4. Update routing rules if project has different domains
5. Add project-specific agents using the creation template above

---

*Generated by @hr — UBuilder AI Team Protocol v1.0*
