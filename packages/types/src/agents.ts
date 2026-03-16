/** Complete agent definitions for Team 100 (Site Builders) and Team 101 (Site Infrastructure) */

import type { Team101Agent } from './team101'

// ---------------------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------------------

/** Skill definition for an agent */
export type AgentSkill = {
  /** Unique skill identifier (kebab-case) */
  id: string
  /** English display name */
  name: string
  /** Hebrew display name */
  nameHe: string
  /** What this skill does */
  description: string
  /** API endpoints and tools this skill uses */
  tools: string[]
  /** Keywords or events that activate this skill */
  triggers: string[]
}

/** Full agent definition */
export type AgentDefinition = {
  /** Unique agent identifier (kebab-case) */
  id: string
  /** Which team this agent belongs to */
  team: 'team100' | 'team101'
  /** English display name */
  name: string
  /** Hebrew display name */
  nameHe: string
  /** English role description */
  role: string
  /** Hebrew role description */
  roleHe: string
  /** All skills this agent can perform */
  skills: AgentSkill[]
  /** Other agent IDs this agent depends on */
  dependencies: string[]
  /** Priority 1-10, higher = more important */
  priority: number
}

/** Union of all Team 100 agent identifiers */
export type Team100Agent =
  | 'discovery-strategist'
  | 'planning-architect'
  | 'design-director'
  | 'content-writer'
  | 'frontend-builder'
  | 'seo-optimizer'
  | 'media-curator'
  | 'quality-inspector'
  | 'editor-agent'

/** Union of all agent identifiers across both teams */
export type AgentId = Team100Agent | Team101Agent

// ---------------------------------------------------------------------------
// Team 100 Agent Definitions — Site Builders
// ---------------------------------------------------------------------------

/** Discovery Strategist — leads the discovery conversation with the user */
export const DISCOVERY_STRATEGIST: AgentDefinition = {
  id: 'discovery-strategist',
  team: 'team100',
  name: 'Discovery Strategist',
  nameHe: 'אסטרטג גילוי',
  role: 'Leads the discovery conversation to understand the business and extract site requirements',
  roleHe: 'מוביל את שיחת הגילוי כדי להבין את העסק ולחלץ דרישות לאתר',
  skills: [
    {
      id: 'ask-business-questions',
      name: 'Ask Business Questions',
      nameHe: 'שאלות עסקיות',
      description: 'Asks targeted questions to understand the business type, goals, audience, and competitive landscape',
      tools: ['/api/ai/discovery'],
      triggers: ['new_site', 'start_discovery', 'business_type'],
    },
    {
      id: 'extract-dimensions',
      name: 'Extract Dimensions',
      nameHe: 'חילוץ ממדים',
      description: 'Extracts structured dimensions (industry, audience, tone, goals) from free-text user input',
      tools: ['/api/ai/discovery'],
      triggers: ['user_response', 'free_text_input'],
    },
    {
      id: 'detect-industry',
      name: 'Detect Industry',
      nameHe: 'זיהוי תעשייה',
      description: 'Classifies the business into an industry vertical and recommends relevant sections and features',
      tools: ['/api/ai/discovery'],
      triggers: ['business_description', 'url_provided'],
    },
    {
      id: 'analyze-scan-results',
      name: 'Analyze Scan Results',
      nameHe: 'ניתוח תוצאות סריקה',
      description: 'Processes website scanner output to extract competitive insights and improvement opportunities',
      tools: ['/api/ai/discovery', '/api/scan'],
      triggers: ['scan_complete', 'competitor_url'],
    },
  ],
  dependencies: [],
  priority: 10,
}

/** Planning Architect — creates the site blueprint and page structure */
export const PLANNING_ARCHITECT: AgentDefinition = {
  id: 'planning-architect',
  team: 'team100',
  name: 'Planning Architect',
  nameHe: 'אדריכל תכנון',
  role: 'Creates the full site blueprint including page structure, section order, and design system selection',
  roleHe: 'יוצר את התוכנית הכוללת לאתר כולל מבנה עמודים, סדר מקטעים ובחירת מערכת עיצוב',
  skills: [
    {
      id: 'create-site-plan',
      name: 'Create Site Plan',
      nameHe: 'יצירת תוכנית אתר',
      description: 'Generates a complete site plan with pages, sections per page, navigation structure, and content hierarchy',
      tools: ['/api/ai/planning'],
      triggers: ['discovery_complete', 'plan_site'],
    },
    {
      id: 'select-sections',
      name: 'Select Sections',
      nameHe: 'בחירת מקטעים',
      description: 'Chooses the optimal section types and variants for each page based on industry and goals',
      tools: ['/api/ai/planning'],
      triggers: ['page_planning', 'section_selection'],
    },
    {
      id: 'choose-design-system',
      name: 'Choose Design System',
      nameHe: 'בחירת מערכת עיצוב',
      description: 'Selects color palette, typography, spacing, and visual style that matches the brand personality',
      tools: ['/api/ai/planning'],
      triggers: ['design_selection', 'brand_analysis'],
    },
    {
      id: 'plan-seo-strategy',
      name: 'Plan SEO Strategy',
      nameHe: 'תכנון אסטרטגיית SEO',
      description: 'Defines keyword targets, meta strategy, Schema.org types, and content structure for search optimization',
      tools: ['/api/ai/planning'],
      triggers: ['seo_planning', 'keyword_research'],
    },
  ],
  dependencies: ['discovery-strategist'],
  priority: 9,
}

/** Design Director — controls all visual design decisions */
export const DESIGN_DIRECTOR: AgentDefinition = {
  id: 'design-director',
  team: 'team100',
  name: 'Design Director',
  nameHe: 'מנהל עיצוב',
  role: 'Controls all visual design decisions including colors, typography, layout, spacing, and motion',
  roleHe: 'שולט בכל החלטות העיצוב הויזואלי כולל צבעים, טיפוגרפיה, פריסה, מרווחים ותנועה',
  skills: [
    {
      id: 'select-color-palette',
      name: 'Select Color Palette',
      nameHe: 'בחירת פלטת צבעים',
      description: 'Generates a harmonious color palette with primary, secondary, accent, and neutral colors based on brand and industry',
      tools: ['/api/ai/analyze-design'],
      triggers: ['color_selection', 'brand_colors', 'palette'],
    },
    {
      id: 'choose-typography',
      name: 'Choose Typography',
      nameHe: 'בחירת טיפוגרפיה',
      description: 'Selects font families, scale, weights, and line heights for headings, body, and accent text',
      tools: ['/api/ai/analyze-design'],
      triggers: ['font_selection', 'typography', 'heading_style'],
    },
    {
      id: 'design-layout',
      name: 'Design Layout',
      nameHe: 'עיצוב פריסה',
      description: 'Defines grid systems, section widths, content alignment, and responsive breakpoint behavior',
      tools: ['/api/ai/analyze-design'],
      triggers: ['layout_design', 'grid', 'responsive'],
    },
    {
      id: 'create-motion-presets',
      name: 'Create Motion Presets',
      nameHe: 'יצירת הגדרות תנועה',
      description: 'Defines scroll reveal animations, hover effects, transitions, parallax, and sticky behaviors',
      tools: ['/api/ai/analyze-design'],
      triggers: ['animation', 'motion', 'scroll_effects', 'hover'],
    },
    {
      id: 'analyze-design-dna',
      name: 'Analyze Design DNA',
      nameHe: 'ניתוח DNA עיצובי',
      description: 'Extracts the design DNA from a scanned website — colors, fonts, spacing, shadows, border-radius, and component patterns',
      tools: ['/api/ai/analyze-design', '/api/scan'],
      triggers: ['scan_complete', 'design_extraction', 'competitor_analysis'],
    },
  ],
  dependencies: ['planning-architect'],
  priority: 8,
}

/** Content Writer — writes all site copy and text content */
export const CONTENT_WRITER: AgentDefinition = {
  id: 'content-writer',
  team: 'team100',
  name: 'Content Writer',
  nameHe: 'כותב תוכן',
  role: 'Writes all site copy including headlines, descriptions, CTAs, FAQs, and testimonials',
  roleHe: 'כותב את כל תוכן האתר כולל כותרות, תיאורים, קריאות לפעולה, שאלות נפוצות ועדויות',
  skills: [
    {
      id: 'write-headlines',
      name: 'Write Headlines',
      nameHe: 'כתיבת כותרות',
      description: 'Creates compelling, conversion-focused headlines and subheadlines for hero sections and page headers',
      tools: ['/api/ai/generate-site'],
      triggers: ['headline', 'hero_text', 'page_title'],
    },
    {
      id: 'write-ctas',
      name: 'Write CTAs',
      nameHe: 'כתיבת קריאות לפעולה',
      description: 'Crafts action-oriented button text and call-to-action copy that drives conversions',
      tools: ['/api/ai/generate-site'],
      triggers: ['cta', 'button_text', 'conversion'],
    },
    {
      id: 'write-descriptions',
      name: 'Write Descriptions',
      nameHe: 'כתיבת תיאורים',
      description: 'Writes feature descriptions, service explanations, about-us narratives, and product copy',
      tools: ['/api/ai/generate-site'],
      triggers: ['description', 'features', 'about', 'services'],
    },
    {
      id: 'write-faq',
      name: 'Write FAQ',
      nameHe: 'כתיבת שאלות נפוצות',
      description: 'Generates industry-relevant FAQ questions and answers optimized for featured snippets and GSO',
      tools: ['/api/ai/generate-site'],
      triggers: ['faq', 'questions', 'answers'],
    },
    {
      id: 'write-testimonials',
      name: 'Write Testimonials',
      nameHe: 'כתיבת עדויות',
      description: 'Creates realistic, trust-building testimonial content matched to the business type',
      tools: ['/api/ai/generate-site'],
      triggers: ['testimonials', 'reviews', 'social_proof'],
    },
    {
      id: 'translate-content',
      name: 'Translate Content',
      nameHe: 'תרגום תוכן',
      description: 'Translates all site content between Hebrew and English while preserving tone and cultural context',
      tools: ['/api/ai/generate-site'],
      triggers: ['translate', 'language_switch', 'rtl', 'hebrew'],
    },
  ],
  dependencies: ['planning-architect'],
  priority: 8,
}

/** Frontend Builder — generates the actual HTML/CSS/JS output */
export const FRONTEND_BUILDER: AgentDefinition = {
  id: 'frontend-builder',
  team: 'team100',
  name: 'Frontend Builder',
  nameHe: 'בונה צד לקוח',
  role: 'Generates production-quality HTML, CSS, and animations for every section and page',
  roleHe: 'מייצר HTML, CSS ואנימציות באיכות הפקה לכל מקטע ועמוד',
  skills: [
    {
      id: 'generate-html',
      name: 'Generate HTML',
      nameHe: 'יצירת HTML',
      description: 'Generates semantic, accessible HTML with Tailwind CSS classes for complete page sections',
      tools: ['/api/ai/generate-site-stream'],
      triggers: ['generate_page', 'build_section', 'html_output'],
    },
    {
      id: 'add-animations',
      name: 'Add Animations',
      nameHe: 'הוספת אנימציות',
      description: 'Injects CSS animations, scroll-triggered reveals, hover effects, and transition behaviors',
      tools: ['/api/ai/generate-site-stream'],
      triggers: ['animation', 'motion', 'scroll_reveal', 'hover_effect'],
    },
    {
      id: 'optimize-responsive',
      name: 'Optimize Responsive',
      nameHe: 'אופטימיזציה רספונסיבית',
      description: 'Ensures all generated HTML works across mobile, tablet, and desktop breakpoints with proper stacking',
      tools: ['/api/ai/generate-site-stream'],
      triggers: ['responsive', 'mobile', 'breakpoint', 'stacking'],
    },
    {
      id: 'inject-schema-org',
      name: 'Inject Schema.org',
      nameHe: 'הזרקת Schema.org',
      description: 'Adds JSON-LD structured data (LocalBusiness, FAQ, Product, Article, etc.) to generated pages',
      tools: ['/api/ai/generate-site-stream'],
      triggers: ['schema_org', 'structured_data', 'json_ld'],
    },
    {
      id: 'build-sections',
      name: 'Build Sections',
      nameHe: 'בניית מקטעים',
      description: 'Composes individual section components (hero, features, pricing, etc.) into complete page layouts',
      tools: ['/api/ai/generate-site-stream'],
      triggers: ['section_build', 'page_compose', 'layout_assembly'],
    },
  ],
  dependencies: ['design-director', 'content-writer'],
  priority: 9,
}

/** SEO Optimizer — handles all search engine and generative search optimization */
export const SEO_OPTIMIZER: AgentDefinition = {
  id: 'seo-optimizer',
  team: 'team100',
  name: 'SEO Optimizer',
  nameHe: 'מומחה קידום אתרים',
  role: 'Handles all SEO and GSO optimization including meta tags, Schema.org, Open Graph, and Bing optimization',
  roleHe: 'מטפל בכל אופטימיזציית SEO ו-GSO כולל תגיות מטא, Schema.org, Open Graph ואופטימיזציה ל-Bing',
  skills: [
    {
      id: 'add-meta-tags',
      name: 'Add Meta Tags',
      nameHe: 'הוספת תגיות מטא',
      description: 'Generates optimized title tags, meta descriptions, and canonical URLs for every page',
      tools: ['/api/ai/agent-chat'],
      triggers: ['meta_tags', 'title_tag', 'meta_description'],
    },
    {
      id: 'add-schema-org',
      name: 'Add Schema.org',
      nameHe: 'הוספת Schema.org',
      description: 'Adds comprehensive JSON-LD structured data matching the business type and page content',
      tools: ['/api/ai/agent-chat'],
      triggers: ['schema_org', 'structured_data', 'rich_snippets'],
    },
    {
      id: 'optimize-faq',
      name: 'Optimize FAQ for GSO',
      nameHe: 'אופטימיזציית שאלות נפוצות ל-GSO',
      description: 'Structures FAQ content with FAQPage schema to maximize appearance in generative search answers',
      tools: ['/api/ai/agent-chat'],
      triggers: ['faq_seo', 'gso', 'featured_snippets'],
    },
    {
      id: 'add-open-graph',
      name: 'Add Open Graph',
      nameHe: 'הוספת Open Graph',
      description: 'Generates Open Graph and Twitter Card meta tags for rich social media sharing previews',
      tools: ['/api/ai/agent-chat'],
      triggers: ['open_graph', 'social_sharing', 'twitter_card'],
    },
    {
      id: 'optimize-for-bing',
      name: 'Optimize for Bing',
      nameHe: 'אופטימיזציה ל-Bing',
      description: 'Adds Bing-specific optimizations including IndexNow, clear content structure, and entity markup',
      tools: ['/api/ai/agent-chat'],
      triggers: ['bing', 'indexnow', 'copilot'],
    },
    {
      id: 'add-alt-text',
      name: 'Add Alt Text',
      nameHe: 'הוספת טקסט חלופי',
      description: 'Generates descriptive, keyword-rich alt text for all images on the site',
      tools: ['/api/ai/agent-chat'],
      triggers: ['alt_text', 'image_seo', 'accessibility'],
    },
  ],
  dependencies: ['frontend-builder'],
  priority: 7,
}

/** Media Curator — handles images and media selection */
export const MEDIA_CURATOR: AgentDefinition = {
  id: 'media-curator',
  team: 'team100',
  name: 'Media Curator',
  nameHe: 'אוצר מדיה',
  role: 'Handles image selection, AI image prompts, alt text optimization, and gallery curation',
  roleHe: 'מטפל בבחירת תמונות, פרומפטים לתמונות AI, אופטימיזציית טקסט חלופי ואוצרות גלריה',
  skills: [
    {
      id: 'select-images',
      name: 'Select Images',
      nameHe: 'בחירת תמונות',
      description: 'Finds and selects high-quality stock images that match the brand, industry, and section context',
      tools: ['/api/images/upload'],
      triggers: ['image_selection', 'stock_photo', 'hero_image'],
    },
    {
      id: 'generate-image-prompts',
      name: 'Generate Image Prompts',
      nameHe: 'יצירת פרומפטים לתמונות',
      description: 'Creates detailed AI image generation prompts for custom visuals, icons, and illustrations',
      tools: ['/api/images/upload'],
      triggers: ['ai_image', 'custom_visual', 'illustration'],
    },
    {
      id: 'optimize-alt-text',
      name: 'Optimize Alt Text',
      nameHe: 'אופטימיזציית טקסט חלופי',
      description: 'Writes SEO-optimized, accessible alt text for every image based on visual content and page context',
      tools: ['/api/images/upload'],
      triggers: ['alt_text', 'image_accessibility'],
    },
    {
      id: 'curate-gallery',
      name: 'Curate Gallery',
      nameHe: 'אוצרות גלריה',
      description: 'Organizes and curates image galleries with consistent style, aspect ratios, and visual flow',
      tools: ['/api/images/upload'],
      triggers: ['gallery', 'portfolio', 'image_grid'],
    },
  ],
  dependencies: ['design-director'],
  priority: 6,
}

/** Quality Inspector — final quality gate before publishing */
export const QUALITY_INSPECTOR: AgentDefinition = {
  id: 'quality-inspector',
  team: 'team100',
  name: 'Quality Inspector',
  nameHe: 'מפקח איכות',
  role: 'Performs final quality checks on HTML validity, accessibility, design consistency, SEO, and responsiveness',
  roleHe: 'מבצע בדיקות איכות סופיות על תקינות HTML, נגישות, עקביות עיצוב, SEO ורספונסיביות',
  skills: [
    {
      id: 'validate-html',
      name: 'Validate HTML',
      nameHe: 'אימות HTML',
      description: 'Checks generated HTML for semantic correctness, valid nesting, and W3C compliance',
      tools: ['/api/ai/agent-chat'],
      triggers: ['html_validation', 'markup_check'],
    },
    {
      id: 'check-accessibility',
      name: 'Check Accessibility',
      nameHe: 'בדיקת נגישות',
      description: 'Audits pages for WCAG 2.1 AA compliance including contrast, focus order, ARIA labels, and keyboard navigation',
      tools: ['/api/ai/agent-chat'],
      triggers: ['accessibility', 'wcag', 'a11y'],
    },
    {
      id: 'score-design',
      name: 'Score Design',
      nameHe: 'ניקוד עיצוב',
      description: 'Evaluates visual design quality including spacing consistency, color harmony, typography hierarchy, and alignment',
      tools: ['/api/ai/agent-chat'],
      triggers: ['design_review', 'visual_score'],
    },
    {
      id: 'check-seo',
      name: 'Check SEO',
      nameHe: 'בדיקת SEO',
      description: 'Verifies all SEO elements are present and properly configured — meta tags, headings, schema, sitemap',
      tools: ['/api/ai/agent-chat'],
      triggers: ['seo_audit', 'seo_check'],
    },
    {
      id: 'check-gso',
      name: 'Check GSO',
      nameHe: 'בדיקת GSO',
      description: 'Scores the site for generative search optimization — FAQ structure, entity clarity, citation-worthiness',
      tools: ['/api/ai/agent-chat'],
      triggers: ['gso_audit', 'gso_score'],
    },
    {
      id: 'check-responsive',
      name: 'Check Responsive',
      nameHe: 'בדיקת רספונסיביות',
      description: 'Validates responsive behavior across mobile (375px), tablet (768px), and desktop (1280px) breakpoints',
      tools: ['/api/ai/agent-chat'],
      triggers: ['responsive_check', 'mobile_check', 'breakpoint_test'],
    },
  ],
  dependencies: ['frontend-builder', 'seo-optimizer', 'media-curator'],
  priority: 8,
}

/** Editor Agent — the live chat agent in the visual editor (user-facing) */
export const EDITOR_AGENT: AgentDefinition = {
  id: 'editor-agent',
  team: 'team100',
  name: 'Editor Agent',
  nameHe: 'סוכן עריכה',
  role: 'The live AI assistant in the visual editor that helps users modify, improve, and optimize their site',
  roleHe: 'העוזר החכם בעורך הויזואלי שעוזר למשתמשים לשנות, לשפר ולמטב את האתר שלהם',
  skills: [
    {
      id: 'modify-html',
      name: 'Modify HTML',
      nameHe: 'עריכת HTML',
      description: 'Modifies existing HTML sections based on user instructions — text changes, style updates, structural edits',
      tools: ['/api/ai/agent-chat'],
      triggers: ['edit', 'change', 'modify', 'update'],
    },
    {
      id: 'add-sections',
      name: 'Add Sections',
      nameHe: 'הוספת מקטעים',
      description: 'Generates and inserts new sections (testimonials, pricing, FAQ, gallery, etc.) into existing pages',
      tools: ['/api/ai/agent-chat'],
      triggers: ['add_section', 'new_section', 'insert'],
    },
    {
      id: 'remove-sections',
      name: 'Remove Sections',
      nameHe: 'הסרת מקטעים',
      description: 'Removes sections from the page and adjusts surrounding layout for visual continuity',
      tools: ['/api/ai/agent-chat'],
      triggers: ['remove', 'delete', 'hide_section'],
    },
    {
      id: 'change-styles',
      name: 'Change Styles',
      nameHe: 'שינוי סגנונות',
      description: 'Updates colors, fonts, spacing, backgrounds, and other visual styles across sections or the entire site',
      tools: ['/api/ai/agent-chat'],
      triggers: ['style', 'color', 'font', 'background', 'spacing'],
    },
    {
      id: 'scan-url',
      name: 'Scan URL',
      nameHe: 'סריקת כתובת',
      description: 'Scans a competitor or reference URL and applies design ideas or content structure to the current site',
      tools: ['/api/ai/agent-chat', '/api/scan'],
      triggers: ['scan', 'url', 'competitor', 'reference'],
    },
    {
      id: 'suggest-improvements',
      name: 'Suggest Improvements',
      nameHe: 'הצעת שיפורים',
      description: 'Analyzes the current page and suggests specific design, content, and conversion improvements',
      tools: ['/api/ai/agent-chat'],
      triggers: ['improve', 'suggest', 'feedback', 'review'],
    },
    {
      id: 'optimize-seo-live',
      name: 'Optimize SEO',
      nameHe: 'אופטימיזציית SEO',
      description: 'Adds or improves SEO elements on the current page — meta tags, headings, schema, alt text',
      tools: ['/api/ai/agent-chat'],
      triggers: ['seo', 'meta', 'schema', 'keywords'],
    },
  ],
  dependencies: [],
  priority: 10,
}

// ---------------------------------------------------------------------------
// Team 101 Agent Definitions — Site Infrastructure
// ---------------------------------------------------------------------------

/** CRM Manager — manages leads and customers for published sites */
export const CRM_MANAGER: AgentDefinition = {
  id: 'crm-manager',
  team: 'team101',
  name: 'CRM Manager',
  nameHe: 'מנהל CRM',
  role: 'Manages leads, customers, scoring, segmentation, and interaction tracking for published sites',
  roleHe: 'מנהל לידים, לקוחות, ניקוד, פילוח ומעקב אינטראקציות לאתרים מפורסמים',
  skills: [
    {
      id: 'create-lead',
      name: 'Create Lead',
      nameHe: 'יצירת ליד',
      description: 'Captures new leads from website forms, chat conversations, and API integrations',
      tools: ['/api/crm/leads'],
      triggers: ['form_submit', 'chat_message', 'new_visitor'],
    },
    {
      id: 'update-lead-status',
      name: 'Update Lead Status',
      nameHe: 'עדכון סטטוס ליד',
      description: 'Moves leads through the pipeline — new, contacted, qualified, converted, or lost',
      tools: ['/api/crm/leads'],
      triggers: ['lead_action', 'status_change', 'qualification'],
    },
    {
      id: 'score-lead',
      name: 'Score Lead',
      nameHe: 'ניקוד ליד',
      description: 'Calculates lead scores based on engagement, demographics, behavior, and fit criteria',
      tools: ['/api/crm/leads'],
      triggers: ['interaction', 'page_view', 'form_submit', 'scoring_schedule'],
    },
    {
      id: 'segment-customers',
      name: 'Segment Customers',
      nameHe: 'פילוח לקוחות',
      description: 'Groups customers into segments by behavior, value, location, purchase history, and engagement level',
      tools: ['/api/crm/customers'],
      triggers: ['segmentation', 'audience_build', 'campaign_prep'],
    },
    {
      id: 'track-interactions',
      name: 'Track Interactions',
      nameHe: 'מעקב אינטראקציות',
      description: 'Records all customer touchpoints — page views, form submissions, emails, purchases, and chat messages',
      tools: ['/api/crm/leads', '/api/crm/customers'],
      triggers: ['page_view', 'form_submit', 'email_open', 'purchase'],
    },
    {
      id: 'import-leads',
      name: 'Import Leads',
      nameHe: 'ייבוא לידים',
      description: 'Bulk imports leads from CSV, Excel, or external CRM systems with deduplication and mapping',
      tools: ['/api/crm/leads'],
      triggers: ['import', 'csv_upload', 'migration'],
    },
    {
      id: 'export-data',
      name: 'Export Data',
      nameHe: 'ייצוא נתונים',
      description: 'Exports leads, customers, and interaction data to CSV or JSON for external analysis',
      tools: ['/api/crm/leads', '/api/crm/customers'],
      triggers: ['export', 'download', 'report_export'],
    },
  ],
  dependencies: [],
  priority: 9,
}

/** Analytics Engine — tracks and analyzes site metrics */
export const ANALYTICS_ENGINE: AgentDefinition = {
  id: 'analytics-engine',
  team: 'team101',
  name: 'Analytics Engine',
  nameHe: 'מנוע אנליטיקס',
  role: 'Tracks page views, sessions, conversions, and generates actionable analytics reports',
  roleHe: 'עוקב אחר צפיות, סשנים, המרות ומייצר דוחות אנליטיקס מעשיים',
  skills: [
    {
      id: 'track-page-views',
      name: 'Track Page Views',
      nameHe: 'מעקב צפיות',
      description: 'Records page view events with referrer, device, location, and session context',
      tools: ['/api/crm/analytics'],
      triggers: ['page_view', 'session_start'],
    },
    {
      id: 'compute-metrics',
      name: 'Compute Metrics',
      nameHe: 'חישוב מדדים',
      description: 'Calculates key metrics — bounce rate, avg session duration, conversion rate, pages per session',
      tools: ['/api/crm/analytics'],
      triggers: ['daily_aggregation', 'session_end'],
    },
    {
      id: 'generate-reports',
      name: 'Generate Reports',
      nameHe: 'יצירת דוחות',
      description: 'Creates weekly and monthly analytics reports with trends, comparisons, and actionable insights',
      tools: ['/api/crm/analytics'],
      triggers: ['weekly_report', 'monthly_report', 'dashboard_load'],
    },
    {
      id: 'identify-trends',
      name: 'Identify Trends',
      nameHe: 'זיהוי מגמות',
      description: 'Detects traffic trends, seasonal patterns, and anomalies using historical data analysis',
      tools: ['/api/crm/analytics'],
      triggers: ['trend_analysis', 'anomaly_detected'],
    },
    {
      id: 'predict-churn',
      name: 'Predict Churn',
      nameHe: 'חיזוי נטישה',
      description: 'Identifies visitors and customers at risk of churning based on declining engagement patterns',
      tools: ['/api/crm/analytics'],
      triggers: ['churn_check', 'engagement_drop'],
    },
    {
      id: 'segment-audience',
      name: 'Segment Audience',
      nameHe: 'פילוח קהל',
      description: 'Groups visitors into behavioral segments — new vs returning, high-value, at-risk, power users',
      tools: ['/api/crm/analytics'],
      triggers: ['audience_segmentation', 'visitor_classification'],
    },
  ],
  dependencies: [],
  priority: 8,
}

/** Campaign Manager — email, SMS, and push notification campaigns */
export const CAMPAIGN_MANAGER: AgentDefinition = {
  id: 'campaign-manager',
  team: 'team101',
  name: 'Campaign Manager',
  nameHe: 'מנהל קמפיינים',
  role: 'Creates, schedules, and manages email, SMS, and push notification campaigns with A/B testing',
  roleHe: 'יוצר, מתזמן ומנהל קמפיינים של אימייל, SMS והתראות עם בדיקות A/B',
  skills: [
    {
      id: 'create-campaign',
      name: 'Create Campaign',
      nameHe: 'יצירת קמפיין',
      description: 'Creates email, SMS, or push notification campaigns with AI-generated content and design',
      tools: ['/api/crm/campaigns', '/api/email'],
      triggers: ['new_campaign', 'campaign_create'],
    },
    {
      id: 'segment-audience',
      name: 'Segment Audience',
      nameHe: 'פילוח קהל',
      description: 'Builds targeted audience segments based on lead score, behavior, tags, and purchase history',
      tools: ['/api/crm/campaigns'],
      triggers: ['audience_build', 'segment_create'],
    },
    {
      id: 'schedule-email',
      name: 'Schedule Email',
      nameHe: 'תזמון אימייל',
      description: 'Schedules email delivery for optimal open rates based on audience timezone and engagement patterns',
      tools: ['/api/crm/campaigns', '/api/email'],
      triggers: ['campaign_scheduled', 'send_later'],
    },
    {
      id: 'send-bulk-email',
      name: 'Send Bulk Email',
      nameHe: 'שליחת אימייל מרובה',
      description: 'Sends campaigns to large audiences with rate limiting, bounce handling, and delivery tracking',
      tools: ['/api/crm/campaigns', '/api/email'],
      triggers: ['campaign_send', 'bulk_email'],
    },
    {
      id: 'track-engagement',
      name: 'Track Engagement',
      nameHe: 'מעקב מעורבות',
      description: 'Tracks email opens, link clicks, unsubscribes, and bounces in real time',
      tools: ['/api/crm/campaigns'],
      triggers: ['email_open', 'email_click', 'unsubscribe', 'bounce'],
    },
    {
      id: 'ab-testing',
      name: 'A/B Testing',
      nameHe: 'בדיקות A/B',
      description: 'Runs A/B tests on subject lines, content, send times, and CTAs to optimize campaign performance',
      tools: ['/api/crm/campaigns'],
      triggers: ['ab_test', 'optimize_campaign'],
    },
  ],
  dependencies: ['crm-manager'],
  priority: 7,
}

/** Content Scheduler — blog article planning and automated publishing */
export const CONTENT_SCHEDULER: AgentDefinition = {
  id: 'content-scheduler',
  team: 'team101',
  name: 'Content Scheduler',
  nameHe: 'מתזמן תוכן',
  role: 'Plans, generates, and schedules blog articles and content for ongoing SEO and audience engagement',
  roleHe: 'מתכנן, מייצר ומתזמן מאמרי בלוג ותוכן לקידום SEO מתמשך ומעורבות קהל',
  skills: [
    {
      id: 'generate-content-plan',
      name: 'Generate Content Plan',
      nameHe: 'יצירת תוכנית תוכן',
      description: 'Creates a monthly content calendar with topics, keywords, publish dates, and target audiences',
      tools: ['/api/ai/blog/content-plan'],
      triggers: ['weekly_plan', 'content_gap_detected', 'monthly_planning'],
    },
    {
      id: 'write-article',
      name: 'Write Article',
      nameHe: 'כתיבת מאמר',
      description: 'Generates full blog articles with SEO optimization, internal linking, and Schema.org markup',
      tools: ['/api/ai/blog/generate'],
      triggers: ['article_scheduled', 'write_post'],
    },
    {
      id: 'schedule-publish',
      name: 'Schedule Publish',
      nameHe: 'תזמון פרסום',
      description: 'Schedules articles for publication at optimal times based on audience engagement data',
      tools: ['/api/ai/blog/generate'],
      triggers: ['publish_scheduled', 'auto_publish'],
    },
    {
      id: 'optimize-keywords',
      name: 'Optimize Keywords',
      nameHe: 'אופטימיזציית מילות מפתח',
      description: 'Researches and optimizes target keywords for each article based on search volume and competition',
      tools: ['/api/ai/blog/content-plan'],
      triggers: ['keyword_research', 'seo_optimization'],
    },
    {
      id: 'track-content-performance',
      name: 'Track Content Performance',
      nameHe: 'מעקב ביצועי תוכן',
      description: 'Monitors article traffic, rankings, engagement, and conversion to refine future content strategy',
      tools: ['/api/ai/blog/content-plan'],
      triggers: ['performance_check', 'trending_topic'],
    },
  ],
  dependencies: ['analytics-engine', 'seo-monitor'],
  priority: 7,
}

/** SEO Monitor — ongoing SEO and GSO tracking for published sites */
export const SEO_MONITOR: AgentDefinition = {
  id: 'seo-monitor',
  team: 'team101',
  name: 'SEO Monitor',
  nameHe: 'מוניטור SEO',
  role: 'Continuously monitors search rankings, backlinks, indexing status, and GSO performance',
  roleHe: 'עוקב באופן רציף אחרי דירוגי חיפוש, קישורים נכנסים, סטטוס אינדוקס וביצועי GSO',
  skills: [
    {
      id: 'track-rankings',
      name: 'Track Rankings',
      nameHe: 'מעקב דירוגים',
      description: 'Monitors keyword positions in Google and Bing search results over time',
      tools: ['/api/ai/agent-chat'],
      triggers: ['ranking_change', 'weekly_audit'],
    },
    {
      id: 'monitor-backlinks',
      name: 'Monitor Backlinks',
      nameHe: 'מעקב קישורים נכנסים',
      description: 'Tracks new and lost backlinks, identifies toxic links, and suggests outreach opportunities',
      tools: ['/api/ai/agent-chat'],
      triggers: ['backlink_change', 'link_audit'],
    },
    {
      id: 'check-indexing',
      name: 'Check Indexing',
      nameHe: 'בדיקת אינדוקס',
      description: 'Verifies all site pages are indexed by search engines and identifies crawl issues',
      tools: ['/api/ai/agent-chat'],
      triggers: ['indexing_check', 'new_page_published'],
    },
    {
      id: 'submit-to-search-engines',
      name: 'Submit to Search Engines',
      nameHe: 'הגשה למנועי חיפוש',
      description: 'Submits new and updated pages to Google Search Console and Bing Webmaster Tools via IndexNow',
      tools: ['/api/ai/agent-chat'],
      triggers: ['new_page_published', 'page_updated', 'site_published'],
    },
    {
      id: 'monitor-gso-score',
      name: 'Monitor GSO Score',
      nameHe: 'מעקב ציון GSO',
      description: 'Evaluates how well the site appears in AI-generated search answers (ChatGPT, Copilot, Gemini)',
      tools: ['/api/ai/agent-chat'],
      triggers: ['gso_check', 'weekly_audit'],
    },
    {
      id: 'alert-on-drop',
      name: 'Alert on Drop',
      nameHe: 'התראה על ירידה',
      description: 'Sends alerts when rankings, traffic, or GSO scores drop below defined thresholds',
      tools: ['/api/ai/agent-chat'],
      triggers: ['ranking_drop', 'traffic_drop', 'gso_drop'],
    },
  ],
  dependencies: [],
  priority: 8,
}

/** Chatbot Agent — AI chatbot on published sites for visitor engagement */
export const CHATBOT_AGENT: AgentDefinition = {
  id: 'chatbot-agent',
  team: 'team101',
  name: 'Chatbot Agent',
  nameHe: 'סוכן צ\'אטבוט',
  role: 'AI chatbot embedded on published sites that answers questions, captures leads, and assists visitors',
  roleHe: 'צ\'אטבוט AI משובץ באתרים מפורסמים שעונה על שאלות, לוכד לידים ומסייע למבקרים',
  skills: [
    {
      id: 'answer-questions',
      name: 'Answer Questions',
      nameHe: 'מענה על שאלות',
      description: 'Answers visitor questions about the business using site content and configured knowledge base',
      tools: ['/api/ai/agent-chat'],
      triggers: ['visitor_message', 'question_asked'],
    },
    {
      id: 'collect-lead-info',
      name: 'Collect Lead Info',
      nameHe: 'איסוף מידע ליד',
      description: 'Conversationally collects contact information (name, email, phone) and creates a CRM lead',
      tools: ['/api/ai/agent-chat', '/api/crm/leads'],
      triggers: ['interested_visitor', 'contact_request'],
    },
    {
      id: 'schedule-appointment',
      name: 'Schedule Appointment',
      nameHe: 'קביעת פגישה',
      description: 'Helps visitors book appointments or consultations by integrating with the business calendar',
      tools: ['/api/ai/agent-chat', '/api/crm/leads'],
      triggers: ['booking_request', 'appointment', 'schedule'],
    },
    {
      id: 'recommend-products',
      name: 'Recommend Products',
      nameHe: 'המלצת מוצרים',
      description: 'Suggests relevant products or services based on visitor questions and browsing behavior',
      tools: ['/api/ai/agent-chat'],
      triggers: ['product_question', 'recommendation_request'],
    },
    {
      id: 'handoff-to-human',
      name: 'Handoff to Human',
      nameHe: 'העברה לנציג אנושי',
      description: 'Escalates complex conversations to a human agent with full chat history and context summary',
      tools: ['/api/ai/agent-chat', '/api/crm/leads'],
      triggers: ['escalation_request', 'complex_question', 'frustrated_visitor'],
    },
  ],
  dependencies: ['crm-manager'],
  priority: 9,
}

// ---------------------------------------------------------------------------
// Agent Collections
// ---------------------------------------------------------------------------

/** All Team 100 agent definitions (Site Builders) */
export const TEAM100_AGENTS: AgentDefinition[] = [
  DISCOVERY_STRATEGIST,
  PLANNING_ARCHITECT,
  DESIGN_DIRECTOR,
  CONTENT_WRITER,
  FRONTEND_BUILDER,
  SEO_OPTIMIZER,
  MEDIA_CURATOR,
  QUALITY_INSPECTOR,
  EDITOR_AGENT,
]

/** All Team 101 agent definitions (Site Infrastructure) */
export const TEAM101_AGENTS: AgentDefinition[] = [
  CRM_MANAGER,
  ANALYTICS_ENGINE,
  CAMPAIGN_MANAGER,
  CONTENT_SCHEDULER,
  SEO_MONITOR,
  CHATBOT_AGENT,
]

/** All agents across both teams */
export const ALL_AGENTS: AgentDefinition[] = [
  ...TEAM100_AGENTS,
  ...TEAM101_AGENTS,
]

/** Lookup agent definition by ID */
export const getAgentById = (id: AgentId): AgentDefinition | undefined =>
  ALL_AGENTS.find(agent => agent.id === id)

/** Lookup all agents that depend on a given agent */
export const getDependents = (agentId: AgentId): AgentDefinition[] =>
  ALL_AGENTS.filter(agent => agent.dependencies.includes(agentId))

// ---------------------------------------------------------------------------
// Team 101 Activation Plan
// ---------------------------------------------------------------------------

/** A task in the activation plan */
export type ActivationTask = {
  /** Which agent performs this task */
  agent: Team101Agent
  /** Human-readable task description */
  task: string
  /** Estimated duration (e.g. '30s', '2min', '5min') */
  duration?: string
  /** Cron schedule for ongoing tasks */
  schedule?: string
}

/** Full activation plan when Team 101 takes over a published site */
export type Team101ActivationPlan = {
  /** Tasks to run immediately after site publish */
  immediate: ActivationTask[]
  /** Tasks to complete within the first day */
  day1: ActivationTask[]
  /** Tasks to complete within the first week */
  week1: ActivationTask[]
  /** Recurring tasks that run on a schedule */
  ongoing: ActivationTask[]
}

/** Standard activation plan when Team 101 takes over a newly published site */
export const DEFAULT_TEAM101_ACTIVATION: Team101ActivationPlan = {
  immediate: [
    { agent: 'analytics-engine', task: 'Install tracking script', duration: '30s' },
    { agent: 'crm-manager', task: 'Initialize CRM tables', duration: '10s' },
    { agent: 'seo-monitor', task: 'Baseline SEO audit', duration: '2min' },
  ],
  day1: [
    { agent: 'content-scheduler', task: 'Generate first content plan', duration: '5min' },
    { agent: 'campaign-manager', task: 'Create welcome email template', duration: '3min' },
    { agent: 'chatbot-agent', task: 'Configure FAQ responses', duration: '2min' },
  ],
  week1: [
    { agent: 'content-scheduler', task: 'Publish 3 blog articles', duration: 'ongoing' },
    { agent: 'seo-monitor', task: 'Submit to Google & Bing', duration: '1min' },
    { agent: 'campaign-manager', task: 'Set up abandoned cart automation', duration: '5min' },
    { agent: 'analytics-engine', task: 'First weekly report', duration: '2min' },
  ],
  ongoing: [
    { agent: 'content-scheduler', task: 'Daily article generation', schedule: '0 8 * * *' },
    { agent: 'analytics-engine', task: 'Daily metrics aggregation', schedule: '0 0 * * *' },
    { agent: 'seo-monitor', task: 'Weekly SEO audit', schedule: '0 6 * * 1' },
    { agent: 'campaign-manager', task: 'Monthly newsletter', schedule: '0 9 1 * *' },
    { agent: 'crm-manager', task: 'Lead scoring recalculation', schedule: '0 2 * * *' },
  ],
}
