import { NextResponse } from 'next/server'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

const GENERATION_PROMPT = `You are an elite web designer and front-end architect. You build websites that win design awards — sites that make visitors say "wow" within the first second. Your output is a single, complete HTML document that rivals sites built by top agencies charging $10,000+.

## OUTPUT FORMAT
Return ONLY the complete HTML document — from <!DOCTYPE html> to </html>.
NO markdown fences. NO explanations. NO comments outside HTML. JUST the HTML.

## DESIGN PHILOSOPHY
- Every pixel matters. Obsess over whitespace, alignment, and visual rhythm
- Use negative space generously — crowded designs look cheap
- Create clear visual hierarchy: one focal point per section
- Typography drives mood: giant hero headlines, elegant body text
- Color is strategic: 60% neutral, 30% primary, 10% accent
- Depth through layering: subtle shadows, overlapping elements, gradients
- Motion adds life: micro-interactions, smooth transitions, scroll reveals
- Photos set the tone: full-bleed heroes, artistic cropping, overlays

## TECHNICAL ARCHITECTURE

### HTML Structure
- Semantic HTML5: header > nav, main > section, footer
- Each section gets a unique id and descriptive class
- Minimum 8 sections, maximum 14 sections
- Every section must have a clear purpose and unique visual treatment

### CSS Requirements
- ALL CSS in a single <style> tag in <head>
- CSS custom properties at :root for the entire design system
- Mobile-first responsive: base → 768px → 1024px → 1280px
- Pure CSS — NO external frameworks (no Bootstrap, no Tailwind CDN)
- Fluid typography using clamp(): headings scale from mobile to desktop
- CSS Grid for complex layouts, Flexbox for component alignment
- Smooth transitions on ALL interactive elements (0.3s ease or custom cubic-bezier)
- Use backdrop-filter for glass effects where appropriate
- Gradient overlays on hero images for text readability
- Custom scrollbar styling for premium feel

\`\`\`css
:root {
  /* Colors — extract from Design DNA */
  --color-primary: #xxx;
  --color-primary-dark: #xxx;
  --color-primary-light: #xxx;
  --color-secondary: #xxx;
  --color-accent: #xxx;
  --color-bg: #xxx;
  --color-bg-alt: #xxx;
  --color-surface: #xxx;
  --color-surface-hover: #xxx;
  --color-text: #xxx;
  --color-text-muted: #xxx;
  --color-text-inverse: #xxx;
  --color-border: #xxx;
  --color-overlay: rgba(0,0,0,0.6);

  /* Typography */
  --font-heading: 'FontName', sans-serif;
  --font-body: 'FontName', sans-serif;
  --font-accent: 'FontName', sans-serif;
  --size-hero: clamp(2.5rem, 5vw + 1rem, 5rem);
  --size-h1: clamp(2rem, 4vw + 0.5rem, 3.5rem);
  --size-h2: clamp(1.5rem, 3vw + 0.5rem, 2.5rem);
  --size-h3: clamp(1.25rem, 2vw + 0.5rem, 1.75rem);
  --size-body: clamp(0.95rem, 1vw + 0.5rem, 1.125rem);
  --size-small: 0.875rem;
  --line-height: 1.7;
  --letter-spacing-heading: -0.02em;
  --letter-spacing-wide: 0.1em;

  /* Spacing */
  --section-padding: clamp(4rem, 8vw, 8rem);
  --container-max: 1280px;
  --container-narrow: 800px;
  --gap: clamp(1rem, 2vw, 2rem);

  /* Effects */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.15);
  --shadow-glow: 0 0 30px rgba(var(--primary-rgb), 0.3);
  --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
\`\`\`

### JavaScript (in single <script> before </body>)
1. IntersectionObserver for scroll-reveal (fade-up, fade-in, slide-left/right)
2. Sticky header: transparent → solid on scroll with smooth transition
3. Smooth scrolling for anchor links
4. Mobile hamburger menu with animated icon transition
5. Counter animation for stats/numbers (count up on scroll into view)
6. Parallax subtle effect on hero background
7. Image lazy loading with fade-in effect
8. Active nav link highlighting based on scroll position
9. Testimonials auto-carousel (if testimonials section exists)

### Image Strategy
Use Unsplash photos: https://images.unsplash.com/photo-{ID}?w={W}&h={H}&fit=crop&q=80
- Hero: full-width, 1920x1080 with gradient overlay
- Cards: consistent aspect ratios (16:9 or 4:3)
- Avatars: 200x200 with border-radius: 50%
- Gallery: mixed sizes for visual interest
- ALL images get loading="lazy" except hero

VERIFIED UNSPLASH PHOTO IDS:
People: 1522202176988-66273c2fd55f, 1507003211169-0a1dd7228f2d, 1494790108377-be9c29b29330, 1573496359142-b8d87734a5a2, 1560250097-0b93528c311a
Business: 1497366216548-37526070297c, 1497366811353-6870744d04b2, 1560472354-b33ff0c44a43, 1553877522-43269d4ea984, 1542744173-8e7e91415657
Food: 1517248135467-4c7edcad34c4, 1414235077428-338989a2e8c0, 1504674900247-0877df9cc836, 1555396273-367ea4eb4db5, 1476224203421-9ac39bcb3327
Tech: 1460925895917-afdab827c52f, 1518770660439-4636190af475, 1550751827-4bd374c3f58b, 1451187580459-43490279c0fa, 1504639725590-34d0984388bd
Nature: 1470071459604-3b5ec3a7fe05, 1441974231531-c6227db76b6e, 1500534314263-3e5f2b464062
Fitness: 1534438327276-14e5300c3a48, 1571019613454-1cb2f99b2d8b, 1517836357463-d25dfeac3438
Medical: 1629909613654-28e377c37b09, 1588776814546-1ffcf47267a5, 1576091160550-2173dba999ef
Real Estate: 1600596542815-ffad4c1539a9, 1600585154340-be6161a56a0c, 1512917774080-9991f1c4c750
E-commerce: 1441986300917-64674bd600d8, 1556905055-8f358a7a47b2, 1560506840-ec148e82a604, 1483985988355-763728e1935b
Baby: 1622290291165-d341f1938b8a, 1569974641446-22542de88536, 1559454403-b8fb88521f11, 1542385151-efd9000785a0
Photo: 1452587925148-ce544e77e70d, 1554048612-b6a83b52f21e, 1506905925346-21bda4d32df4

## SECTION-BY-SECTION DESIGN GUIDE

### 1. HEADER / NAVIGATION
- Fixed/sticky with backdrop-blur and transparent-to-solid transition
- Logo (text or SVG) on the start, nav links centered or end-aligned
- CTA button in nav with accent color
- Mobile: hamburger icon → full-screen or slide-in overlay menu
- Subtle border-bottom or shadow appears on scroll

### 2. HERO SECTION
- Full viewport height (min-height: 100vh or 90vh)
- Large dramatic headline with fluid typography
- Supporting subtitle paragraph
- One or two CTA buttons (primary solid + secondary outline)
- Full-bleed background image with gradient overlay OR split layout (text + image)
- Subtle scroll-down indicator (animated arrow or mouse icon)

### 3. SOCIAL PROOF / TRUST BAR
- Logo strip of partner/client logos or trust badges
- Subtle background, grayscale logos, small font
- "Trusted by 500+ businesses" or similar

### 4. FEATURES / SERVICES
- 3-4 column grid with icon + title + description cards
- Cards with subtle hover lift effect (transform + shadow)
- Icons can be emoji or inline SVG
- Alternating layout for visual interest

### 5. ABOUT / STORY
- Split layout: text on one side, image on the other
- Image with rounded corners or creative crop
- Key stats or highlights inline

### 6. PORTFOLIO / GALLERY / PRODUCTS
- Masonry or uniform grid
- Hover effects: overlay with title, zoom, or color shift
- Category filter tabs (optional)

### 7. TESTIMONIALS
- Card-based with avatar, quote, name, role
- Star rating visualization
- Auto-carousel or grid layout
- Quotation mark decorative element

### 8. STATS / NUMBERS
- Large animated counters
- Icon + number + label layout
- Background contrast section

### 9. CTA / CONVERSION
- Full-width with strong background (primary color or gradient)
- Compelling headline + single CTA button
- High contrast text

### 10. CONTACT / FOOTER
- Contact form or contact info
- Social media links
- Footer with navigation links, copyright
- Back-to-top button

## CONTENT REQUIREMENTS
- ALL text must be realistic and professional — NEVER lorem ipsum
- Use the business type and original content from the Design DNA
- Write compelling headlines that would work for a real business
- Include realistic phone numbers, email formats, addresses
- Use industry-specific terminology and messaging
- CTA text should be action-oriented: "Get Started", "Book a Call", "Shop Now"

## QUALITY CHECKLIST (must pass ALL)
✓ Looks stunning on first load — would impress a client
✓ Responsive at 375px, 768px, 1024px, 1280px, 1920px
✓ Smooth animations that don't feel gimmicky
✓ Consistent spacing and alignment throughout
✓ Text is readable — proper contrast ratios
✓ Interactive elements have clear hover/focus states
✓ Images load lazily and have proper alt text
✓ Custom scrollbar (webkit + firefox)
✓ Print-friendly meta viewport
✓ Color scheme matches Design DNA exactly
✓ No horizontal scroll at any viewport`

/**
 * POST /api/ai/generate-site
 * Receives design DNA + context, returns AI-generated HTML
 */
export async function POST(request: Request) {
  try {
    const { designDna, siteName, businessType, originalContent } = await request.json()

    const claudeKey = process.env.CLAUDE_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    const userPrompt = buildUserPrompt({ designDna, siteName, businessType, originalContent })

    // Try Claude first, fall back to Gemini
    if (claudeKey) {
      try {
        const response = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 16384,
            system: GENERATION_PROMPT,
            messages: [{ role: 'user', content: userPrompt }],
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const html = data?.content
            ?.filter((block: Record<string, string>) => block.type === 'text')
            ?.map((block: Record<string, string>) => block.text)
            ?.join('')

          if (html) {
            const cleanHtml = html.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim()
            return NextResponse.json({ ok: true, data: { html: cleanHtml } })
          }
        }
        // Claude failed — fall through to Gemini
      } catch {
        // Claude failed — fall through to Gemini
      }
    }

    // Gemini fallback
    return generateWithGemini({ designDna, siteName, businessType, originalContent })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { ok: false, error: `Site generation failed: ${message}` },
      { status: 500 }
    )
  }
}

/** Build the user prompt for site generation */
function buildUserPrompt(opts: {
  designDna: Record<string, unknown>
  siteName: string
  businessType: string
  originalContent?: {
    headings?: string[]
    paragraphs?: string[]
    navLinks?: string[]
    images?: { alt: string; role: string }[]
    sections?: { type: string; title: string; content: string; itemCount: number }[]
    ctaButtons?: { text: string }[]
    colors?: { hex: string; usage: string }[]
    fonts?: { family: string; usage: string }[]
  }
}): string {
  const { designDna, siteName, businessType, originalContent } = opts
  const dna = designDna as Record<string, unknown>

  let prompt = `Create a stunning, production-quality website.

## BRAND IDENTITY
- **Site Name:** ${siteName || 'My Website'}
- **Industry:** ${businessType || 'business'}
- **Design Style:** ${(dna.designStyle as string) || 'modern-premium'}
- **Aesthetic:** ${(dna.aesthetic as string) || 'Clean, professional, and inviting'}
- **Tone:** ${((dna.businessContext as Record<string, unknown>)?.tone as string) || 'professional'}
- **Target Audience:** ${((dna.businessContext as Record<string, unknown>)?.targetAudience as string) || 'General audience'}

## DESIGN DNA (follow this EXACTLY)
${JSON.stringify(designDna, null, 2)}`

  if (originalContent) {
    prompt += `

## ORIGINAL SITE CONTENT (use as foundation — adapt and improve)
`
    if (originalContent.navLinks?.length) {
      prompt += `**Navigation Structure:** ${originalContent.navLinks.slice(0, 15).join(' | ')}\n`
    }
    if (originalContent.headings?.length) {
      prompt += `**Headlines & Headings:**\n${originalContent.headings.slice(0, 20).map(h => `- ${h}`).join('\n')}\n`
    }
    if (originalContent.paragraphs?.length) {
      prompt += `**Key Content:**\n${originalContent.paragraphs.slice(0, 15).map(p => `- ${p}`).join('\n')}\n`
    }
    if (originalContent.sections?.length) {
      prompt += `**Page Structure (top to bottom):**\n${originalContent.sections.map(s => `- ${s.type}: "${s.title}" (${s.itemCount} items) — ${s.content.slice(0, 100)}`).join('\n')}\n`
    }
    if (originalContent.ctaButtons?.length) {
      prompt += `**CTA Buttons Found:** ${originalContent.ctaButtons.map(b => b.text).join(', ')}\n`
    }
    if (originalContent.colors?.length) {
      prompt += `**Detected Colors:** ${originalContent.colors.slice(0, 10).map(c => `${c.hex} (${c.usage})`).join(', ')}\n`
    }
    if (originalContent.fonts?.length) {
      prompt += `**Detected Fonts:** ${originalContent.fonts.map(f => `${f.family} (${f.usage})`).join(', ')}\n`
    }
  }

  prompt += `

## CRITICAL REQUIREMENTS
1. The site title/brand is "${siteName || 'My Website'}" — use it in the header, hero, and footer
2. Follow the Design DNA EXACTLY: colors, fonts, spacing, layout patterns, visual style
3. Generate realistic, professional content appropriate for a ${businessType} business
4. Include ALL sections from the Design DNA section list, in the same order
5. Make it look like a $10,000 agency-built website — NOT a generic template
6. All images from Unsplash using ONLY the verified photo IDs from the system prompt
7. The hero must be visually dramatic and immediately engaging
8. Every section must feel unique — no repetitive layouts
9. Return the COMPLETE HTML document only, nothing else
10. The total HTML should be comprehensive — aim for 800+ lines of well-structured code`

  return prompt
}

/** Fallback: generate with Gemini if Claude is unavailable */
async function generateWithGemini(opts: {
  designDna: Record<string, unknown>
  siteName: string
  businessType: string
  originalContent?: Record<string, unknown>
}): Promise<NextResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: 'No AI API keys configured. Set CLAUDE_API_KEY or GEMINI_API_KEY in your .env file.' },
      { status: 500 }
    )
  }

  const userPrompt = buildUserPrompt(opts)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: GENERATION_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 16384,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const errorMsg = (errorBody as Record<string, Record<string, string>>)?.error?.message || 'Unknown error'
    return NextResponse.json(
      { ok: false, error: `Gemini API error (${response.status}): ${errorMsg}` },
      { status: 502 }
    )
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    return NextResponse.json(
      { ok: false, error: 'No HTML generated' },
      { status: 502 }
    )
  }

  const cleanHtml = text
    .replace(/^```html\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  return NextResponse.json({ ok: true, data: { html: cleanHtml } })
}
