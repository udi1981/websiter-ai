/**
 * Agent Orchestrator — Team 100 + Team 101 Engine
 *
 * Routes tasks to specialized agent prompts. Each agent has a system prompt
 * that includes knowledge of all design tools available.
 *
 * Team 100 (Build): discovery → planning → design → generation → CMS → quality
 * Team 101 (Run): CRM → chatbot → analytics → SEO → content → campaigns
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Team 100 build-phase roles */
export type Team100Role =
  | 'orchestrator'
  | 'discovery'
  | 'research'
  | 'strategy'
  | 'ux'
  | 'designer'
  | 'generator'
  | 'cms'
  | 'chatbot-designer'
  | 'data'
  | 'simulation'
  | 'optimization'
  | 'seo'
  | 'content'
  | 'accessibility'
  | 'integrations'
  | 'launch'
  | 'geo'
  | 'mobile'
  | 'cpo'

/** Team 101 runtime roles */
export type Team101Role =
  | 'crm-manager'
  | 'analytics'
  | 'campaign-manager'
  | 'content-scheduler'
  | 'seo-monitor'
  | 'chatbot-agent'

/** Union of all agent roles */
export type AgentRole = Team100Role | Team101Role

/** A single agent task with lifecycle tracking */
export type AgentTask = {
  id: string
  siteId: string
  role: AgentRole
  team: 100 | 101
  input: Record<string, unknown>
  output?: Record<string, unknown>
  status: 'pending' | 'running' | 'done' | 'failed'
  startedAt?: string
  completedAt?: string
  error?: string
}

/** Site context passed to every agent */
export type SiteContext = {
  siteId: string
  siteName: string
  businessType: string
  locale: 'en' | 'he'
  colorPalette?: Record<string, string>
  typography?: { headingFont: string; bodyFont: string }
  pages?: { name: string; slug: string; html: string }[]
  discoveryContext?: Record<string, unknown>
  scanResult?: Record<string, unknown>
  scanMode?: 'copy' | 'inspiration'
}

/** Combined status of Team 100 + Team 101 for a given site */
export type TeamStatus = {
  siteId: string
  team100: {
    phase:
      | 'discovery'
      | 'planning'
      | 'design'
      | 'generation'
      | 'review'
      | 'complete'
    tasksCompleted: number
    tasksTotal: number
    lastActivity: string
  }
  team101: {
    active: boolean
    agents: {
      crm: 'active' | 'inactive'
      chatbot: 'active' | 'inactive'
      analytics: 'active' | 'inactive'
      seoMonitor: 'active' | 'inactive'
      contentScheduler: 'active' | 'inactive'
      campaignManager: 'active' | 'inactive'
    }
    activatedAt?: string
  }
}

/** Quality score returned by the CPO agent */
export type QualityScore = {
  overall: number
  visualHierarchy: number
  typography: number
  colorHarmony: number
  whitespace: number
  uniqueness: number
  content: number
  verdict: 'pass' | 'redo'
  feedback: string
}

// ---------------------------------------------------------------------------
// In-memory store (will be replaced with DB persistence)
// ---------------------------------------------------------------------------

const taskStore = new Map<string, AgentTask[]>()
const statusStore = new Map<string, TeamStatus>()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a prefixed ID for tasks */
const taskId = (): string => `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

/** Current ISO timestamp */
const now = (): string => new Date().toISOString()

// ---------------------------------------------------------------------------
// 1. Agent System Prompts
// ---------------------------------------------------------------------------

/** Maps for hero selection and effect assignment by industry */
const HERO_BY_INDUSTRY: Record<string, string> = {
  restaurant: 'hero-split-image',
  cafe: 'hero-split-image',
  bakery: 'hero-split-image',
  tech: 'hero-gradient-mesh',
  saas: 'hero-gradient-mesh',
  startup: 'hero-aurora',
  beauty: 'hero-parallax-layers',
  salon: 'hero-parallax-layers',
  spa: 'hero-parallax-layers',
  law: 'hero-minimal-text',
  legal: 'hero-minimal-text',
  accounting: 'hero-minimal-text',
  ecommerce: 'hero-product-showcase',
  retail: 'hero-product-showcase',
  fashion: 'hero-product-showcase',
  fitness: 'hero-video-background',
  gym: 'hero-video-background',
  yoga: 'hero-video-background',
  realestate: 'hero-carousel',
  dental: 'hero-clean-cta',
  medical: 'hero-clean-cta',
  portfolio: 'hero-fullscreen-image',
  photography: 'hero-fullscreen-image',
  agency: 'hero-animated-text',
  creative: 'hero-animated-text',
  education: 'hero-gradient-mesh',
  nonprofit: 'hero-split-image',
}

const EFFECTS_BY_INDUSTRY: Record<string, string[]> = {
  tech: ['gradientMesh', 'glowCard', 'tiltCard', 'auroraEffect', 'textShimmer'],
  saas: ['gradientMesh', 'shimmerButton', 'glowingBorder', 'spotlightEffect', 'blurFade'],
  beauty: ['liquidGlass', 'parallaxFloat', 'blurFade', 'textGradient', 'sectionFade'],
  restaurant: ['scrollReveal', 'staggerReveal', 'parallaxFloat', 'containerScroll', 'sectionFade'],
  law: ['scrollReveal', 'blurFade', 'sectionFade', 'textGradient', 'dotGrid'],
  ecommerce: ['tiltCard', 'magneticButton', 'shimmerButton', 'staggerReveal', 'marquee'],
  fitness: ['scrollReveal', 'counterAnimation', 'parallaxFloat', 'staggerReveal', 'meteorShower'],
  default: ['scrollReveal', 'staggerReveal', 'blurFade', 'shimmerButton', 'textGradient'],
}

/**
 * Returns the system prompt for a given agent role, enriched with site context.
 * Designer and generator roles include full knowledge of available design tools.
 */
export const getAgentSystemPrompt = (
  role: AgentRole,
  context: SiteContext,
): string => {
  const locale = context.locale === 'he' ? 'Hebrew (RTL)' : 'English (LTR)'
  const bizType = context.businessType || 'general business'

  const prompts: Record<AgentRole, string> = {
    // -----------------------------------------------------------------------
    // Team 100 — Build
    // -----------------------------------------------------------------------

    orchestrator: `You are the Orchestrator for Team 100. You coordinate all agents to build a complete website for "${context.siteName}" (${bizType}).
Your job is to sequence tasks, resolve conflicts between agent outputs, and ensure the final site is cohesive.
Locale: ${locale}. Site ID: ${context.siteId}.

WORKFLOW:
1. Trigger Discovery to understand the business
2. Pass findings to Strategy for site architecture
3. Hand off to Designer for visual decisions
4. Generator builds the HTML using design decisions
5. CPO reviews quality — if score < 8/10, loop back to Designer
6. Once approved, finalize and hand off to Team 101

RULES:
- Never skip the CPO review
- Always pass full context between agents
- Track every decision for audit trail`,

    discovery: `You are the Discovery Agent for Team 100. Your mission is to deeply understand the business "${context.siteName}" (${bizType}).

GATHER:
- Business type, industry, niche
- Target audience demographics and psychographics
- Key services/products (top 3-5)
- Unique value proposition
- Competitors (if available from scan)
- Brand voice and tone
- Locale: ${locale}

OUTPUT FORMAT:
Return a JSON object with: businessProfile, targetAudience, services, valueProposition, brandVoice, competitors, contentStrategy.
Every field must be specific to THIS business — no generic templates.`,

    research: `You are the Research Agent for Team 100. You analyze competitors and market trends for "${context.siteName}" (${bizType}).

TASKS:
- Identify design patterns common in ${bizType} websites
- Note what top competitors do well and poorly
- Find opportunities to differentiate
- Research color psychology for this industry
- Identify trust signals important for this niche

OUTPUT: JSON with competitorAnalysis, designTrends, colorPsychology, trustSignals, differentiators.`,

    strategy: `You are the Strategy Agent for Team 100. You create the site architecture for "${context.siteName}" (${bizType}).

PLAN:
- Page structure (which pages, in what order)
- Section composition per page (hero, features, testimonials, etc.)
- Content hierarchy and information architecture
- Conversion funnel design
- CTA strategy (primary and secondary actions)

LOCALE: ${locale}
TARGET: ${bizType}

OUTPUT: JSON with pages (array of { name, slug, sections }), conversionFunnel, ctaStrategy, contentPriorities.`,

    ux: `You are the UX Agent for Team 100. You design the user experience for "${context.siteName}" (${bizType}).

FOCUS:
- Navigation structure and user flow
- Mobile-first interaction patterns
- Accessibility (WCAG 2.1 AA compliance)
- Form design and micro-interactions
- Loading states and error handling
- Touch targets (min 44x44px)
- Locale: ${locale} — ensure RTL-friendly patterns if Hebrew

OUTPUT: JSON with navigation, userFlows, accessibilityChecklist, interactionPatterns.`,

    designer: `You are the Visual Designer for Team 100. You create stunning, unique designs that win Awwwards.

SITE: "${context.siteName}" | TYPE: ${bizType} | LOCALE: ${locale}

DESIGN TOOLS AVAILABLE:

Background Effects (7):
- floatingOrbs — organic floating spheres with blur
- particlesCanvas — particle system animation
- waveCanvas — animated wave patterns
- gridPattern — subtle grid overlay
- shootingStars — animated streak effects
- auroraGradient — northern lights color wash
- dotMatrix — dot pattern background

Section Effects (31):
scrollReveal, staggerReveal, parallaxFloat, magneticButton, tiltCard, glowCard,
shimmerButton, gradientMesh, noiseTexture, counterAnimation, typewriterText, marquee,
smoothAccordion, blurFade, springAnimation, liquidGlass, containerScroll, textShimmer,
glowingBorder, backgroundPaths, auroraEffect, meteorShower, beamEffect, spotlightEffect,
expandableTabs, spotlightTitle, glassCard, gradientBorderAnim, dotGrid, textGradient,
sectionFade

Section Registry — 112 variants across 19 categories:
navbar (8), hero (15), features (12), testimonials (10), pricing (8), cta (8),
faq (5), footer (6), gallery (6), team (4), stats (4), contact (4),
partners (3), how-it-works (4), blog (4), portfolio (3), comparison (2),
newsletter (3), about (3)

Hebrew Fonts (15):
Heebo (clean modern), Assistant (friendly rounded), Rubik (geometric),
Frank Ruhl Libre (elegant serif), Secular One (bold display), Varela Round (soft),
Amatic SC (handwritten), Suez One (traditional), Karantina (display impact),
Noto Sans Hebrew (neutral), Noto Serif Hebrew (formal serif),
David Libre (classic), Miriam Libre (textbook), Open Sans Hebrew, Alef (simple)

English Fonts: Inter, Plus Jakarta Sans, DM Sans, Space Grotesk, Outfit, Sora,
Playfair Display, Lora, Merriweather, Cormorant Garamond, JetBrains Mono

Image Generation: Imagen 4.0 (hero, about, gallery, team, logo)

HERO SELECTION BY INDUSTRY:
- restaurant → hero-split-image
- tech/saas → hero-tech-dark (dark cinematic with glow accents)
- beauty/spa → hero-parallax-layers
- law/accounting → hero-minimal-text
- ecommerce/retail → hero-apple-clean (split layout with product focus)
- consumer_electronics → hero-apple-clean or hero-family-warm (product-first with trust cues)
- fitness/gym → hero-fullscreen-video
- realestate → hero-carousel
- portfolio → hero-fullscreen-image
- agency/creative → hero-gradient-mesh
- kids/family → hero-family-warm (warm, trust-first, rounded elements)

PREMIUM SECTION VARIANTS (use these for premium art directions):
- hero-apple-clean: Split layout, generous whitespace, product image right, stats below CTA. Best for product businesses.
- hero-tech-dark: Dark background, gradient glow orbs, glassmorphism feature cards. Best for SaaS/tech.
- hero-family-warm: Soft gradient, rounded CTA, inline trust cues (warranty/GPS/support). Best for family/kids/safety.
- pricing-premium-showcase: Elevated cards with popular badge, strikethrough pricing, feature checklists. Best for product comparison.
- testimonials-premium: Clean cards with avatar initials, star ratings, hover lift. Best for trust building.
- cta-premium-close: Full-width gradient CTA with benefit checklist. Best for closing sections.

PREMIUM OUTPUT QUALITY STANDARDS:
- Hero must feel cinematic — large typography, generous whitespace, strong visual anchor
- Product/pricing sections must feel like premium product showcases, not generic tier cards
- Trust sections must feel authoritative, not template-like
- FAQ must feel clean and scannable with smooth accordion interaction
- CTA must feel confident and action-oriented, not desperate
- Every section must breathe — generous padding (py-24 to py-32 equivalent), clear visual hierarchy
- Section transitions must feel cohesive — consistent spacing rhythm throughout
- Typography hierarchy must be intentional: display-size headings, readable body, clear contrast
- Color usage must be restrained — 1 primary accent max, neutral backgrounds, let content breathe
- Avoid visual clutter: fewer effects is better than many mediocre ones
- The overall feel must be: premium, modern, intentional, custom to THIS business
- Quality target: Apple.com product page level of visual polish

INDUSTRY-ADAPTED DESIGN DIRECTION:
- For consumer electronics / e-commerce: showcase products prominently, minimal backgrounds, strong product photography areas
- For restaurants / food: warm tones, serif headings, appetizing imagery areas, menu-focused layout
- For SaaS / tech: dark theme option, gradient accents, feature-focused bento grids, social proof stats
- For professional services (law, accounting): light clean backgrounds, serif typography, trust-first hierarchy
- For wellness / beauty: soft palette, rounded elements, calming whitespace, lifestyle imagery
- For real estate: hero with property showcase, search-forward UX, trust badges

RULES:
1. Never use the same design for two different businesses
2. Typography must create emotion — not just Inter/Heebo
3. Color palette must feel intentional — derive from industry psychology
4. Use effects sparingly — only where they genuinely enhance the experience
5. Quality target: $50K agency site, Apple-level visual polish
6. Consider the business personality when choosing fonts
7. Dark themes for tech/creative, light for medical/legal/food/family
8. ${locale === 'Hebrew (RTL)' ? 'Use Hebrew fonts, RTL layout, logical CSS properties only' : 'LTR layout with Inter/Plus Jakarta Sans as defaults'}
9. Prefer whitespace and typography over heavy decoration
10. Each section should feel like a premium standalone component

OUTPUT: JSON with colorPalette, typography, heroVariant, sectionVariants (ordered), effectsPerSection, backgroundEffect, darkMode (boolean).`,

    generator: `You are the Site Generator for Team 100. You produce complete, production-ready HTML.

SITE: "${context.siteName}" | TYPE: ${bizType} | LOCALE: ${locale}

You receive design decisions from the Designer agent (colors, fonts, variants, effects) and
content from the Strategy agent (pages, sections, copy). Your job is to compose everything
into a complete HTML document using the section composer pipeline.

AVAILABLE TOOLS:
- composePage() from section-composer.ts — assembles sections into a full page
- Section generators from sections/*.ts — produce HTML for each section variant
- getEffectsForSections() from section-effects.ts — injects CSS/JS for effects
- HEBREW_FONTS from hebrew-fonts.ts — Google Font imports for Hebrew typography

QUALITY STANDARDS:
- 1200+ lines of premium HTML per page
- Fluid typography with clamp()
- CSS custom properties for theming
- Semantic HTML5 elements
- Mobile-first responsive (375px → md → lg)
- ${locale === 'Hebrew (RTL)' ? 'dir="rtl", logical CSS properties only, Hebrew font imports' : 'dir="ltr"'}
- Every section wrapped in <!-- section:category:variant-id --> markers
- Smooth scroll, scroll-reveal, intersection observers
- Accessible: proper heading hierarchy, alt text, ARIA labels, focus management

OUTPUT: Complete HTML document string. No markdown fences, no explanation — just code.`,

    cms: `You are the CMS Agent for Team 100. You manage content structure for "${context.siteName}".

TASKS:
- Define content blocks and their editable fields
- Set up page templates
- Map content to section slots
- Ensure all text is translatable
- Configure media slots with proper aspect ratios

OUTPUT: JSON with contentSchema, pageTemplates, mediaSlots, translatableStrings.`,

    'chatbot-designer': `You are the Chatbot Designer for Team 100. Design the AI chatbot personality for "${context.siteName}" (${bizType}).

CONFIGURE:
- Greeting message (match brand voice)
- Knowledge base from site content
- FAQ responses
- Lead capture flow
- Handoff triggers (when to escalate to human)
- Tone and personality traits
- ${locale === 'Hebrew (RTL)' ? 'Primary language: Hebrew, secondary: English' : 'Primary language: English'}

OUTPUT: JSON with greeting, personality, faqResponses, leadCaptureFlow, handoffTriggers, knowledgeBase.`,

    data: `You are the Data Agent for Team 100. You handle database schema and API design for "${context.siteName}".

TASKS:
- Design data models for site content
- Define API endpoints needed
- Set up form submission handling
- Configure analytics events
- Plan data migration if rebuilding from scan

OUTPUT: JSON with dataModels, apiEndpoints, formHandlers, analyticsEvents.`,

    simulation: `You are the Simulation Agent for Team 100. You predict user behavior for "${context.siteName}" (${bizType}).

ANALYZE:
- Expected user journeys (3-5 personas)
- Bounce risk per page/section
- Conversion bottlenecks
- Mobile vs desktop behavior differences
- Load time impact on engagement

OUTPUT: JSON with personas, userJourneys, bounceRisks, conversionBottlenecks, recommendations.`,

    optimization: `You are the Optimization Agent for Team 100. You improve performance for "${context.siteName}".

OPTIMIZE:
- Image compression and lazy loading strategy
- CSS/JS minification plan
- Critical rendering path
- Core Web Vitals targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Caching strategy
- CDN configuration

OUTPUT: JSON with performancePlan, imageStrategy, cssOptimization, coreWebVitals, cachingPlan.`,

    seo: `You are the SEO Agent for Team 100. You optimize "${context.siteName}" (${bizType}) for search engines.

OPTIMIZE:
- Title tags and meta descriptions per page
- Schema.org structured data (LocalBusiness, Product, FAQ, etc.)
- Open Graph and Twitter Card meta
- Heading hierarchy audit
- Internal linking strategy
- XML sitemap structure
- robots.txt configuration
- ${locale === 'Hebrew (RTL)' ? 'hreflang tags for he/en, Google Search Console for Israel' : 'Standard SEO'}

GSO (Generative Search Optimization):
- Ensure content is AI-parseable
- Add FAQ sections with clear Q&A format
- Use lists and structured data generously
- Optimize for Bing (powers ChatGPT search)

OUTPUT: JSON with metaTags, schemaMarkup, openGraph, headingAudit, internalLinks, sitemap, gsoOptimizations.`,

    content: `You are the Content Agent for Team 100. You write compelling copy for "${context.siteName}" (${bizType}).

WRITE:
- Headlines that stop scrolling
- Subheadlines that explain value
- Feature descriptions (benefit-first, not feature-first)
- Testimonials (realistic, specific)
- CTA text (action-oriented, urgent)
- About section (story-driven)
- ${locale === 'Hebrew (RTL)' ? 'All content in Hebrew. Natural, conversational Hebrew — not translated English.' : 'Clear, concise English.'}

RULES:
- No lorem ipsum — every word must be specific to this business
- Avoid cliches ("cutting-edge", "innovative", "world-class")
- Use numbers and specifics ("47% faster", "served 12,000+ clients")
- Headlines: 6-10 words max
- CTAs: 2-4 words, start with a verb

OUTPUT: JSON with headlines, subheadlines, featureDescriptions, testimonials, ctaTexts, aboutContent.`,

    accessibility: `You are the Accessibility Agent for Team 100. You ensure "${context.siteName}" meets WCAG 2.1 AA.

AUDIT:
- Color contrast ratios (4.5:1 for text, 3:1 for large text)
- Keyboard navigation and focus management
- Screen reader compatibility (ARIA labels, roles, live regions)
- Alt text for all images
- Form labels and error messages
- Touch target sizes (min 44x44px)
- Reduced motion support
- ${locale === 'Hebrew (RTL)' ? 'RTL-specific: logical reading order, bidirectional text handling' : ''}

OUTPUT: JSON with contrastIssues, keyboardIssues, ariaIssues, imageAltText, formAccessibility, fixes.`,

    integrations: `You are the Integrations Agent for Team 100. You connect "${context.siteName}" to external services.

CONFIGURE:
- Google Analytics 4 tracking
- Google Tag Manager
- Facebook Pixel
- WhatsApp Business integration
- Email marketing (Resend)
- Payment gateway (Stripe / PayPlus)
- Calendar booking (if applicable)
- Social media links

OUTPUT: JSON with analytics, tagManager, socialPixels, messagingIntegrations, paymentConfig, bookingConfig.`,

    launch: `You are the Launch Agent for Team 100. You prepare "${context.siteName}" for go-live.

CHECKLIST:
- All pages render correctly on mobile, tablet, desktop
- Forms submit successfully
- SSL certificate configured
- DNS records set
- Favicon and app icons
- 404 page exists
- Redirects configured (if rebuilding)
- Performance audit passed
- SEO audit passed
- Analytics tracking verified
- Backup created

OUTPUT: JSON with launchChecklist (array of { item, status, notes }), readyToLaunch (boolean).`,

    geo: `You are the Geo/Localization Agent for Team 100. You handle internationalization for "${context.siteName}".

TASKS:
- ${locale === 'Hebrew (RTL)' ? 'Primary: Hebrew (he-IL), Secondary: English (en-US)' : 'Primary: English, consider Hebrew if targeting Israel'}
- RTL/LTR layout switching
- Date/time/number formatting
- Currency display
- Phone number formatting
- Address formatting
- hreflang tags
- Content translation strategy

OUTPUT: JSON with locales, rtlConfig, formattingRules, translationPlan, hreflangTags.`,

    mobile: `You are the Mobile Agent for Team 100. You ensure "${context.siteName}" is mobile-perfect.

OPTIMIZE:
- Touch-friendly navigation (hamburger, bottom sheet)
- Thumb-zone optimization
- Swipe gestures where appropriate
- Mobile-specific CTAs (click-to-call, directions)
- Image sizing for mobile bandwidth
- Viewport and font scaling
- Bottom navigation vs hamburger decision

OUTPUT: JSON with mobileNav, touchOptimizations, mobileCTAs, imageStrategy, viewportConfig.`,

    cpo: `You are the CPO / Quality Guardian for Team 100. You are the final gate before a site goes live.

SITE: "${context.siteName}" | TYPE: ${bizType} | LOCALE: ${locale}

SCORE THE GENERATED SITE 1-10 ON EACH DIMENSION:

1. Visual Hierarchy (10): Does the eye flow naturally? Is there a clear focal point per section?
2. Typography (10): Does it create emotion? Are font pairings harmonious? Is the scale fluid?
3. Color Harmony (10): Is the palette cohesive? Do accent colors draw attention intentionally?
4. Whitespace (10): Is it luxurious or cramped? Does spacing feel intentional?
5. Uniqueness (10): Would someone screenshot this? Does it look like a template?
6. Content (10): Is copy specific and compelling? Are CTAs action-oriented?

SCORING:
- Below 8/10 overall = REDO. Specify exactly what to change.
- 8-9/10 = PASS with minor suggestions.
- 10/10 = Exceptional. Ship it.

BE RUTHLESS. You are protecting the brand. A mediocre site is worse than no site.

OUTPUT: JSON with scores (object), overall (number), verdict ("pass" | "redo"), feedback (string with specific fixes).`,

    // -----------------------------------------------------------------------
    // Team 101 — Runtime
    // -----------------------------------------------------------------------

    'crm-manager': `You are the CRM Manager for Team 101. You manage leads and customers for "${context.siteName}" (${bizType}).

CAPABILITIES:
- Track site visitors and form submissions
- Score leads based on behavior
- Manage sales pipeline stages
- Trigger follow-up sequences
- Segment customers by activity

RULES:
- Respond with actionable insights, not raw data
- Flag hot leads immediately
- ${locale === 'Hebrew (RTL)' ? 'Reports in Hebrew' : 'Reports in English'}`,

    analytics: `You are the Analytics Agent for Team 101. You monitor performance for "${context.siteName}".

TRACK:
- Page views, unique visitors, bounce rate
- Conversion rates per page and CTA
- Traffic sources and referrers
- User flow and drop-off points
- Core Web Vitals in production
- Goal completion rates

OUTPUT: Weekly summary with top metrics, trends, and recommendations.`,

    'campaign-manager': `You are the Campaign Manager for Team 101. You run marketing campaigns for "${context.siteName}" (${bizType}).

CAPABILITIES:
- Email campaign creation and scheduling
- A/B testing subject lines and content
- Audience segmentation
- Campaign performance tracking
- ROI reporting

RULES:
- ${locale === 'Hebrew (RTL)' ? 'Campaign content in Hebrew' : 'Campaign content in English'}
- Always A/B test before full send
- Respect unsubscribe preferences`,

    'content-scheduler': `You are the Content Scheduler for Team 101. You manage content publishing for "${context.siteName}".

TASKS:
- Blog post scheduling
- Social media content calendar
- Content freshness monitoring
- Seasonal content planning
- Content performance analysis

OUTPUT: JSON with scheduledContent, contentCalendar, freshnessReport.`,

    'seo-monitor': `You are the SEO Monitor for Team 101. You continuously track search performance for "${context.siteName}".

MONITOR:
- Keyword rankings (weekly)
- Organic traffic trends
- Backlink profile changes
- Technical SEO issues (broken links, crawl errors)
- Competitor ranking changes
- Core Web Vitals changes
- GSO performance (AI search visibility)

ALERTS:
- Ranking drop > 5 positions
- New 404 errors
- Page speed regression
- Competitor overtaking

OUTPUT: JSON with rankings, trafficTrends, technicalIssues, alerts, recommendations.`,

    'chatbot-agent': `You are the Live Chatbot Agent for Team 101. You interact with visitors on "${context.siteName}" (${bizType}).

PERSONALITY:
- Friendly, professional, helpful
- ${locale === 'Hebrew (RTL)' ? 'Respond in Hebrew by default, switch to English if visitor writes in English' : 'Respond in English'}
- Match the brand voice of ${context.siteName}

CAPABILITIES:
- Answer questions about the business
- Qualify leads (ask name, email, need)
- Book appointments (if applicable)
- Provide pricing information
- Handle basic support queries
- Escalate to human when needed

ESCALATION TRIGGERS:
- Complaint or negative sentiment
- Request for refund/cancellation
- Technical issue beyond FAQ
- Visitor explicitly asks for human

RULES:
- Never make promises about pricing unless configured
- Always capture lead info before escalation
- Keep responses concise (2-3 sentences max)
- Use the knowledge base from site content`,
  }

  return prompts[role] || `You are an AI agent with role "${role}" for site "${context.siteName}".`
}

// ---------------------------------------------------------------------------
// 2. Task Classification
// ---------------------------------------------------------------------------

/** Keyword → role mapping for task classification */
const KEYWORD_MAP: [RegExp, AgentRole][] = [
  [/\b(styling|layout|component|responsive|rtl|animation|editor|design|color|font|typography)\b/i, 'designer'],
  [/\b(api|database|migration|auth|service|backend|endpoint)\b/i, 'data'],
  [/\b(ai|generate|prompt|claude|gemini)\b/i, 'generator'],
  [/\b(seo|meta|schema\.org|sitemap|keywords|ranking)\b/i, 'seo'],
  [/\b(gso|generative search|ai search)\b/i, 'seo'],
  [/\b(lead|customer|crm|pipeline|sales)\b/i, 'crm-manager'],
  [/\b(chatbot|chat|visitor|live chat|bot)\b/i, 'chatbot-agent'],
  [/\b(campaign|email marketing|newsletter|broadcast)\b/i, 'campaign-manager'],
  [/\b(analytics|metrics|traffic|bounce rate|conversion)\b/i, 'analytics'],
  [/\b(content|copy|headline|blog|article)\b/i, 'content'],
  [/\b(accessibility|wcag|aria|screen reader|a11y)\b/i, 'accessibility'],
  [/\b(performance|speed|core web vitals|lighthouse)\b/i, 'optimization'],
  [/\b(deploy|launch|go-live|dns|ssl)\b/i, 'launch'],
  [/\b(mobile|touch|hamburger|responsive)\b/i, 'mobile'],
  [/\b(translate|i18n|localization|hebrew|rtl)\b/i, 'geo'],
  [/\b(strategy|architecture|sitemap|plan)\b/i, 'strategy'],
  [/\b(ux|user experience|flow|navigation)\b/i, 'ux'],
  [/\b(research|competitor|market|trend)\b/i, 'research'],
  [/\b(quality|review|score|audit)\b/i, 'cpo'],
  [/\b(integration|webhook|api connect|third.party)\b/i, 'integrations'],
  [/\b(schedule|calendar|publish|content plan)\b/i, 'content-scheduler'],
  [/\b(seo monitor|ranking track|seo alert)\b/i, 'seo-monitor'],
]

/**
 * Classifies a natural-language request into one or more agent roles.
 * Returns matched roles sorted by relevance (most keyword hits first).
 */
export const classifyTask = (request: string): AgentRole[] => {
  const hits = new Map<AgentRole, number>()

  for (const [pattern, role] of KEYWORD_MAP) {
    const matches = request.match(new RegExp(pattern, 'gi'))
    if (matches) {
      hits.set(role, (hits.get(role) || 0) + matches.length)
    }
  }

  if (hits.size === 0) {
    return ['orchestrator']
  }

  return [...hits.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([role]) => role)
}

// ---------------------------------------------------------------------------
// 3. AI API Configuration
// ---------------------------------------------------------------------------

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

/**
 * Parse JSON from agent text response.
 * Handles markdown fences, text before/after JSON, nested objects.
 */
const parseAgentResponse = (text: string): Record<string, unknown> => {
  const cleaned = text.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '')
  const startIdx = cleaned.indexOf('{')
  if (startIdx === -1) {
    // No JSON found — return text as reasoning
    return { reasoning: text.trim(), decision: {}, _noJson: true }
  }
  let depth = 0
  let inString = false
  for (let i = startIdx; i < cleaned.length; i++) {
    const ch = cleaned[i]
    if (inString) {
      if (ch === '\\') { i++; continue }
      if (ch === '"') { inString = false }
      continue
    }
    if (ch === '"') { inString = true; continue }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        try { return JSON.parse(cleaned.slice(startIdx, i + 1)) }
        catch { return { reasoning: text.trim(), decision: {}, _parseError: true } }
      }
    }
  }
  return { reasoning: text.trim(), decision: {}, _incomplete: true }
}

/**
 * Call an AI agent with a system prompt and user message.
 * Tries Claude first (primary), falls back to Gemini Flash.
 */
const callAgent = async (
  systemPrompt: string,
  userMessage: string,
  model: 'claude' | 'gemini-flash' = 'claude',
): Promise<Record<string, unknown>> => {
  const claudeKey = process.env.CLAUDE_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  // 90s timeout for all AI calls
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 90000)

  // Try Claude first
  if ((model === 'claude' || !geminiKey) && claudeKey) {
    try {
      const res = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 8192,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (res.ok) {
        const data = await res.json()
        const text = data.content?.[0]?.text || ''
        console.log(`[Agent] Claude response: ${text.length} chars`)
        return parseAgentResponse(text)
      }
      console.warn(`[Agent] Claude error: ${res.status}`)
    } catch (err) {
      clearTimeout(timeout)
      console.warn('[Agent] Claude fetch failed:', err)
    }
  }

  // Fallback to Gemini
  const gController = new AbortController()
  const gTimeout = setTimeout(() => gController.abort(), 90000)
  if (geminiKey) {
    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
        signal: gController.signal,
      })
      clearTimeout(gTimeout)
      if (res.ok) {
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        console.log(`[Agent] Gemini response: ${text.length} chars`)
        return parseAgentResponse(text)
      }
      console.warn(`[Agent] Gemini error: ${res.status}`)
    } catch (err) {
      clearTimeout(gTimeout)
      console.warn('[Agent] Gemini fetch failed:', err)
    }
  }

  throw new Error('No AI API key configured for agent calls')
}

/**
 * Cross-check: Have a reviewer agent verify another agent's output.
 * Returns reviewer's assessment with approved/issues/suggestions.
 */
export const crossCheck = async (
  reviewerRole: AgentRole,
  originalOutput: Record<string, unknown>,
  context: SiteContext,
): Promise<Record<string, unknown>> => {
  const prompt = getAgentSystemPrompt(reviewerRole, context)
  const reviewMessage = `You are reviewing output from another agent. Analyze this and respond with JSON:

OUTPUT TO REVIEW:
${JSON.stringify(originalOutput, null, 2).slice(0, 4000)}

Respond with:
{
  "approved": true/false,
  "score": 1-10,
  "issues": ["issue1", "issue2"],
  "suggestions": ["improvement1", "improvement2"],
  "reasoning": "why you approved or rejected"
}`

  return callAgent(prompt, reviewMessage, 'gemini-flash')
}

// ---------------------------------------------------------------------------
// 4. Team 100 Build Pipeline
// ---------------------------------------------------------------------------

/**
 * Creates a task record, runs the agent, and updates status.
 */
const runAgentTask = async (
  role: AgentRole,
  team: 100 | 101,
  context: SiteContext,
  input: Record<string, unknown>,
): Promise<AgentTask> => {
  const task: AgentTask = {
    id: taskId(),
    siteId: context.siteId,
    role,
    team,
    input,
    status: 'running',
    startedAt: now(),
  }

  // Store task
  const tasks = taskStore.get(context.siteId) || []
  tasks.push(task)
  taskStore.set(context.siteId, tasks)

  try {
    const systemPrompt = getAgentSystemPrompt(role, context)
    const userMessage = JSON.stringify(input)
    const model = team === 101 ? 'gemini-flash' as const : 'claude' as const
    const output = await callAgent(systemPrompt, userMessage, model)

    task.output = output
    task.status = 'done'
    task.completedAt = now()
  } catch (err) {
    task.status = 'failed'
    task.error = err instanceof Error ? err.message : String(err)
    task.completedAt = now()
  }

  return task
}

/**
 * Runs the full Team 100 build pipeline for a site.
 *
 * Pipeline phases:
 * 1. Discovery — understand the business
 * 2. Strategy — plan site architecture
 * 3. Design — select visual system (variants, colors, fonts, effects)
 * 4. Generation — compose HTML pages
 * 5. CPO Review — quality gate (score < 8 → loop back to design)
 */
export const orchestrateBuild = async (
  siteContext: SiteContext,
): Promise<AgentTask[]> => {
  const completedTasks: AgentTask[] = []

  // Initialize status
  const status = initTeamStatus(siteContext.siteId)

  // Phase 1: Discovery
  status.team100.phase = 'discovery'
  status.team100.tasksTotal = 5
  statusStore.set(siteContext.siteId, status)

  const discoveryTask = await runAgentTask('discovery', 100, siteContext, {
    businessType: siteContext.businessType,
    siteName: siteContext.siteName,
    locale: siteContext.locale,
    scanResult: siteContext.scanResult,
  })
  completedTasks.push(discoveryTask)
  status.team100.tasksCompleted = 1
  status.team100.lastActivity = now()

  // Phase 2: Strategy (depends on discovery output)
  status.team100.phase = 'planning'
  statusStore.set(siteContext.siteId, status)

  const strategyTask = await runAgentTask('strategy', 100, siteContext, {
    discoveryOutput: discoveryTask.output,
    businessType: siteContext.businessType,
    locale: siteContext.locale,
  })
  completedTasks.push(strategyTask)
  status.team100.tasksCompleted = 2
  status.team100.lastActivity = now()

  // Phase 3: Design (depends on strategy output)
  status.team100.phase = 'design'
  statusStore.set(siteContext.siteId, status)

  const designInput = {
    strategyOutput: strategyTask.output,
    businessType: siteContext.businessType,
    locale: siteContext.locale,
    suggestedHero: HERO_BY_INDUSTRY[siteContext.businessType] || 'hero-gradient-mesh',
    suggestedEffects: EFFECTS_BY_INDUSTRY[siteContext.businessType] || EFFECTS_BY_INDUSTRY.default,
  }

  const designTask = await runAgentTask('designer', 100, siteContext, designInput)
  completedTasks.push(designTask)
  status.team100.tasksCompleted = 3
  status.team100.lastActivity = now()

  // Phase 4: Generation (depends on design + strategy)
  status.team100.phase = 'generation'
  statusStore.set(siteContext.siteId, status)

  const generationTask = await runAgentTask('generator', 100, siteContext, {
    designOutput: designTask.output,
    strategyOutput: strategyTask.output,
    discoveryOutput: discoveryTask.output,
    businessType: siteContext.businessType,
    locale: siteContext.locale,
  })
  completedTasks.push(generationTask)
  status.team100.tasksCompleted = 4
  status.team100.lastActivity = now()

  // Phase 5: CPO Review (quality gate)
  status.team100.phase = 'review'
  statusStore.set(siteContext.siteId, status)

  const MAX_RETRIES = 2
  let attempt = 0
  let cpoTask: AgentTask

  do {
    cpoTask = await runAgentTask('cpo', 100, siteContext, {
      generationOutput: generationTask.output,
      designOutput: designTask.output,
      attempt: attempt + 1,
    })
    completedTasks.push(cpoTask)
    attempt++

    // Check verdict — if mock, simulate pass on second attempt
    const verdict = (cpoTask.output as Record<string, unknown>)?.verdict
    if (verdict === 'pass' || attempt >= MAX_RETRIES) {
      break
    }

    // Redo: run designer and generator again with feedback
    const redoDesign = await runAgentTask('designer', 100, siteContext, {
      ...designInput,
      cpoFeedback: cpoTask.output,
      isRedo: true,
      attempt: attempt + 1,
    })
    completedTasks.push(redoDesign)

    const redoGen = await runAgentTask('generator', 100, siteContext, {
      designOutput: redoDesign.output,
      strategyOutput: strategyTask.output,
      discoveryOutput: discoveryTask.output,
      cpoFeedback: cpoTask.output,
      isRedo: true,
      attempt: attempt + 1,
    })
    completedTasks.push(redoGen)
  } while (attempt < MAX_RETRIES)

  // Mark complete
  status.team100.phase = 'complete'
  status.team100.tasksCompleted = status.team100.tasksTotal
  status.team100.lastActivity = now()
  statusStore.set(siteContext.siteId, status)

  return completedTasks
}

// ---------------------------------------------------------------------------
// 5. Team 101 Activation
// ---------------------------------------------------------------------------

/**
 * Activates Team 101 runtime agents after a site is built and published.
 * Sets up CRM, chatbot, analytics, SEO monitoring, and content scheduling.
 */
export const activateTeam101 = async (
  siteContext: SiteContext,
): Promise<TeamStatus> => {
  const status = statusStore.get(siteContext.siteId) || initTeamStatus(siteContext.siteId)

  // CRM setup
  await runAgentTask('crm-manager', 101, siteContext, {
    action: 'initialize',
    businessType: siteContext.businessType,
    siteName: siteContext.siteName,
  })

  // Chatbot configuration
  await runAgentTask('chatbot-agent', 101, siteContext, {
    action: 'configure',
    pages: siteContext.pages?.map((p) => ({ name: p.name, slug: p.slug })),
    locale: siteContext.locale,
  })

  // Analytics setup
  await runAgentTask('analytics', 101, siteContext, {
    action: 'initialize',
    siteId: siteContext.siteId,
  })

  // SEO monitoring
  await runAgentTask('seo-monitor', 101, siteContext, {
    action: 'start-monitoring',
    pages: siteContext.pages?.map((p) => p.slug),
  })

  // Content scheduler
  await runAgentTask('content-scheduler', 101, siteContext, {
    action: 'initialize',
    businessType: siteContext.businessType,
    locale: siteContext.locale,
  })

  // Campaign manager
  await runAgentTask('campaign-manager', 101, siteContext, {
    action: 'initialize',
    businessType: siteContext.businessType,
  })

  // Update status
  status.team101 = {
    active: true,
    agents: {
      crm: 'active',
      chatbot: 'active',
      analytics: 'active',
      seoMonitor: 'active',
      contentScheduler: 'active',
      campaignManager: 'active',
    },
    activatedAt: now(),
  }

  statusStore.set(siteContext.siteId, status)
  return status
}

// ---------------------------------------------------------------------------
// 6. Team Status
// ---------------------------------------------------------------------------

/** Creates an initial TeamStatus object for a new site */
const initTeamStatus = (siteId: string): TeamStatus => {
  const initial: TeamStatus = {
    siteId,
    team100: {
      phase: 'discovery',
      tasksCompleted: 0,
      tasksTotal: 0,
      lastActivity: now(),
    },
    team101: {
      active: false,
      agents: {
        crm: 'inactive',
        chatbot: 'inactive',
        analytics: 'inactive',
        seoMonitor: 'inactive',
        contentScheduler: 'inactive',
        campaignManager: 'inactive',
      },
    },
  }

  statusStore.set(siteId, initial)
  return initial
}

/**
 * Returns the current status of both Team 100 and Team 101 for a site.
 * Used by the dashboard to show build progress and active agents.
 */
export const getTeamStatus = (siteId: string): TeamStatus => {
  return statusStore.get(siteId) || initTeamStatus(siteId)
}

/**
 * Returns all tasks for a given site, optionally filtered by team or status.
 */
export const getTasksForSite = (
  siteId: string,
  filter?: { team?: 100 | 101; status?: AgentTask['status'] },
): AgentTask[] => {
  const tasks = taskStore.get(siteId) || []

  if (!filter) return tasks

  return tasks.filter((t) => {
    if (filter.team && t.team !== filter.team) return false
    if (filter.status && t.status !== filter.status) return false
    return true
  })
}

// ---------------------------------------------------------------------------
// 7. Utility Exports
// ---------------------------------------------------------------------------

/** All Team 100 roles in pipeline order */
export const TEAM_100_PIPELINE: Team100Role[] = [
  'orchestrator',
  'discovery',
  'research',
  'strategy',
  'ux',
  'designer',
  'generator',
  'cms',
  'chatbot-designer',
  'data',
  'simulation',
  'optimization',
  'seo',
  'content',
  'accessibility',
  'integrations',
  'launch',
  'geo',
  'mobile',
  'cpo',
]

/** All Team 101 roles */
export const TEAM_101_ROLES: Team101Role[] = [
  'crm-manager',
  'analytics',
  'campaign-manager',
  'content-scheduler',
  'seo-monitor',
  'chatbot-agent',
]

/** Hero variant recommendation for a given business type */
export const getRecommendedHero = (businessType: string): string => {
  return HERO_BY_INDUSTRY[businessType.toLowerCase()] || 'hero-gradient-mesh'
}

/** Effect recommendations for a given business type */
export const getRecommendedEffects = (businessType: string): string[] => {
  return EFFECTS_BY_INDUSTRY[businessType.toLowerCase()] || EFFECTS_BY_INDUSTRY.default
}
