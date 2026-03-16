'use client'

import { useReducer, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { type ScanResult } from '@/lib/scanner'
import { rebuildSite } from '@/lib/site-rebuilder'
import { UnifiedInput } from '@/components/create/UnifiedInput'
import { DiscoveryChat, type DiscoveryMessage } from '@/components/create/DiscoveryChat'
import { type TemplateItem } from '@/components/create/TemplateInspiration'

// ─── Types ────────────────────────────────────────────────────────────────────

type BuildPlan = {
  siteName: string
  industry: string
  designStyle: string
  colorPalette: Record<string, string>
  typography: Record<string, string>
  layout: Record<string, string>
  pages: {
    name: string
    slug: string
    purpose: string
    sections: {
      type: string
      variant?: string
      headline?: string
      subheadline?: string
      title?: string
      subtitle?: string
      cta?: { text: string; action: string }
      items?: { title: string; description: string; icon?: string }[]
      notes?: string
    }[]
  }[]
  contentTone: string
  conversionStrategy: Record<string, unknown>
  seoStrategy: Record<string, unknown>
  motionPreset: Record<string, unknown>
  preserveFromScan?: Record<string, unknown>
}

// ─── State ────────────────────────────────────────────────────────────────────

type Step = 'input' | 'discovery' | 'generating'

type State = {
  step: Step
  // Step 1
  description: string
  url: string
  uploadedImage: string | null
  selectedTemplateId: string | null
  selectedTemplateSeedText: string | null
  documentText: string | null
  // Scan
  scanStatus: 'idle' | 'scanning' | 'done' | 'error'
  scanResult: ScanResult | null
  // Step 2
  messages: DiscoveryMessage[]
  discoveryContext: Record<string, unknown>
  progress: { current: number; total: number }
  readyToGenerate: boolean
  isAiThinking: boolean
  // Planning + Generation
  buildPlan: BuildPlan | null
  isGenerating: boolean
  buildStatus: string
  buildProgress: number
  buildError: string | null
}

type Action =
  | { type: 'SET_DESCRIPTION'; value: string }
  | { type: 'SET_URL'; value: string }
  | { type: 'SET_IMAGE'; value: string | null }
  | { type: 'SELECT_TEMPLATE'; id: string | null; seedText: string | null }
  | { type: 'SET_DOCUMENT_TEXT'; value: string | null }
  | { type: 'APPEND_DOCUMENT_TEXT'; value: string }
  | { type: 'GO_DISCOVERY' }
  | { type: 'GO_INPUT' }
  | { type: 'SCAN_START' }
  | { type: 'SCAN_DONE'; result: ScanResult }
  | { type: 'SCAN_ERROR' }
  | { type: 'AI_THINKING' }
  | { type: 'AI_RESPONSE'; message: DiscoveryMessage; context: Record<string, unknown>; progress: { current: number; total: number }; ready: boolean }
  | { type: 'USER_MESSAGE'; message: DiscoveryMessage }
  | { type: 'SYSTEM_MESSAGE'; message: DiscoveryMessage }
  | { type: 'START_BUILD' }
  | { type: 'SET_PLAN'; plan: BuildPlan }
  | { type: 'BUILD_PROGRESS'; status: string; progress: number }
  | { type: 'BUILD_DONE' }
  | { type: 'BUILD_ERROR'; error: string }

const initialState: State = {
  step: 'input',
  description: '',
  url: '',
  uploadedImage: null,
  selectedTemplateId: null,
  selectedTemplateSeedText: null,
  documentText: null,
  scanStatus: 'idle',
  scanResult: null,
  messages: [],
  discoveryContext: {},
  progress: { current: 0, total: 6 }
,
  readyToGenerate: false,
  isAiThinking: false,
  buildPlan: null,
  isGenerating: false,
  buildStatus: '',
  buildProgress: 0,
  buildError: null,
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_DESCRIPTION':
      return { ...state, description: action.value }
    case 'SET_URL':
      return { ...state, url: action.value }
    case 'SET_IMAGE':
      return { ...state, uploadedImage: action.value }
    case 'SELECT_TEMPLATE':
      return { ...state, selectedTemplateId: action.id, selectedTemplateSeedText: action.seedText }
    case 'SET_DOCUMENT_TEXT':
      return { ...state, documentText: action.value }
    case 'APPEND_DOCUMENT_TEXT':
      return { ...state, documentText: (state.documentText ? state.documentText + '\n\n---\n\n' : '') + action.value }
    case 'GO_DISCOVERY':
      return { ...state, step: 'discovery' }
    case 'GO_INPUT':
      return { ...state, step: 'input', messages: [], discoveryContext: {}, progress: { current: 0, total: 6 }
, readyToGenerate: false, isAiThinking: false, buildPlan: null }
    case 'SCAN_START':
      return { ...state, scanStatus: 'scanning' }
    case 'SCAN_DONE':
      return { ...state, scanStatus: 'done', scanResult: action.result }
    case 'SCAN_ERROR':
      return { ...state, scanStatus: 'error' }
    case 'AI_THINKING':
      return { ...state, isAiThinking: true }
    case 'AI_RESPONSE':
      return {
        ...state,
        isAiThinking: false,
        messages: [...state.messages, action.message],
        discoveryContext: action.context,
        progress: action.progress,
        readyToGenerate: action.ready,
      }
    case 'USER_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] }
    case 'SYSTEM_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] }
    case 'START_BUILD':
      return { ...state, isGenerating: true, buildStatus: 'Preparing...', buildProgress: 0, buildError: null }
    case 'SET_PLAN':
      return { ...state, buildPlan: action.plan }
    case 'BUILD_PROGRESS':
      return { ...state, buildStatus: action.status, buildProgress: action.progress }
    case 'BUILD_DONE':
      return { ...state, isGenerating: false, buildStatus: '', buildProgress: 0 }
    case 'BUILD_ERROR':
      return { ...state, isGenerating: false, buildStatus: '', buildProgress: 0, buildError: action.error }
    default:
      return state
  }
}

// ─── Page Component ──────────────────────────────────────────────────────────

const NewSitePage = () => {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, initialState)

  // ─── Discovery API call ──────────────────────────────────────────────────

  const callDiscovery = useCallback(async (userMessages: DiscoveryMessage[], context: Record<string, unknown>, scanResult: ScanResult | null) => {
    dispatch({ type: 'AI_THINKING' })

    try {
      const res = await fetch('/api/ai/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialInput: {
            description: state.description,
            templateId: state.selectedTemplateId,
            scanResult: scanResult ? {
              businessType: scanResult.businessType,
              businessName: scanResult.businessName,
              sections: scanResult.sections?.map(s => s.type),
              colors: scanResult.colors?.slice(0, 5),
            } : undefined,
            hasUploadedImage: !!state.uploadedImage,
            documentText: state.documentText || undefined,
          },
          messages: userMessages
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          context,
        }),
      })

      if (!res.ok) throw new Error('Discovery API failed')

      const data = await res.json()

      if (data.ok) {
        const aiMessage: DiscoveryMessage = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: data.data.question,
          suggestions: data.data.suggestions,
        }

        dispatch({
          type: 'AI_RESPONSE',
          message: aiMessage,
          context: data.data.context || context,
          progress: data.data.progress || { current: 0, total: 6 },
          ready: data.data.readyToGenerate || false,
        })
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (err) {
      console.error('Discovery API call failed:', err)
      const fallbackMessage: DiscoveryMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Tell me more about your business — what do you do and who are your customers?',
        suggestions: ['Service business', 'Online store', 'Portfolio / Creative', 'Local business'],
      }
      dispatch({
        type: 'AI_RESPONSE',
        message: fallbackMessage,
        context,
        progress: { current: 1, total: 6 },
        ready: false,
      })
    }
  }, [state.description, state.selectedTemplateId, state.uploadedImage, state.documentText])

  // ─── Planning API call ─────────────────────────────────────────────────

  const callPlanning = useCallback(async (): Promise<BuildPlan | null> => {
    dispatch({ type: 'BUILD_PROGRESS', status: 'Team 100 is planning your site...', progress: 10 })

    try {
      const res = await fetch('/api/ai/planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discoveryContext: state.discoveryContext,
          scanResult: state.scanResult ? {
            colors: state.scanResult.colors,
            fonts: state.scanResult.fonts,
            sections: state.scanResult.sections,
            navigation: state.scanResult.navigation,
            headings: state.scanResult.headings,
            paragraphs: state.scanResult.paragraphs?.slice(0, 20),
            images: state.scanResult.images?.slice(0, 15),
            businessType: state.scanResult.businessType,
            businessName: state.scanResult.businessName,
            title: state.scanResult.title,
            description: state.scanResult.description,
            seoMeta: state.scanResult.seoMeta,
            motion: state.scanResult.motion,
            designDna: state.scanResult.designDna,
          } : undefined,
          description: state.description,
          templateId: state.selectedTemplateId,
        }),
      })

      if (!res.ok) throw new Error('Planning API failed')

      const data = await res.json()
      if (data.ok && data.data?.plan) {
        dispatch({ type: 'SET_PLAN', plan: data.data.plan })
        dispatch({ type: 'BUILD_PROGRESS', status: 'Build plan ready — generating site...', progress: 25 })
        return data.data.plan as BuildPlan
      }
      throw new Error('No plan returned')
    } catch (err) {
      console.error('Planning failed:', err)
      dispatch({ type: 'BUILD_PROGRESS', status: 'Planning skipped — generating directly...', progress: 15 })
      return null
    }
  }, [state.discoveryContext, state.scanResult, state.description, state.selectedTemplateId])

  // ─── Build prompt from plan ────────────────────────────────────────────

  const buildPromptFromPlan = (plan: BuildPlan) => {
    const systemPrompt = `You are the world's best web designer. You craft digital experiences that make people's jaws drop — sites that win design awards and look like they cost $15,000+ to build.

## OUTPUT
Return ONLY the HTML — from <!DOCTYPE html> to </html>. No markdown, no explanations.

## TECHNICAL REQUIREMENTS
- ALL CSS in a single <style> tag in <head>. NO external CSS frameworks. NO Tailwind CDN.
- CSS custom properties at :root for the ENTIRE design system (colors, fonts, spacing, shadows, radii, transitions)
- Fluid typography using clamp() for ALL text sizes
- Mobile-first responsive: base → 768px → 1024px → 1280px
- Google Fonts via <link> tag
- Single <script> before </body> with:
  - IntersectionObserver scroll-reveal with stagger delays
  - Sticky header: transparent → solid on scroll
  - Smooth scroll for anchor links
  - Mobile hamburger → fullscreen overlay menu
  - Counter animation for stats
  - Subtle parallax on hero
  - Testimonial auto-carousel (if testimonials exist)
  - Back-to-top button
  - Lazy loading images with fade-in

## IMAGE STRATEGY
Use Unsplash: https://images.unsplash.com/photo-{ID}?w={W}&h={H}&fit=crop&q=80
ONLY use these verified IDs:
People: 1522202176988-66273c2fd55f, 1507003211169-0a1dd7228f2d, 1494790108377-be9c29b29330, 1573496359142-b8d87734a5a2, 1560250097-0b93528c311a, 1438761681033-6461ffad8d80, 1472099645785-5658abf4ff4e
Business: 1497366216548-37526070297c, 1497366811353-6870744d04b2, 1560472354-b33ff0c44a43, 1553877522-43269d4ea984, 1542744173-8e7e91415657, 1521737711867-e3b97375f902
Food: 1517248135467-4c7edcad34c4, 1414235077428-338989a2e8c0, 1504674900247-0877df9cc836, 1555396273-367ea4eb4db5, 1476224203421-9ac39bcb3327, 1540189549336-e6e99c3679fe, 1565299624946-b28f40a0ae38
Tech: 1460925895917-afdab827c52f, 1518770660439-4636190af475, 1550751827-4bd374c3f58b, 1451187580459-43490279c0fa, 1519389950473-47ba0277781c
Fitness: 1534438327276-14e5300c3a48, 1571019613454-1cb2f99b2d8b, 1517836357463-d25dfeac3438
Medical: 1629909613654-28e377c37b09, 1588776814546-1ffcf47267a5
Real Estate: 1600596542815-ffad4c1539a9, 1600585154340-be6161a56b0c, 1512917774080-9991f1c4c750
E-commerce: 1441986300917-64674bd600d8, 1556905055-8f358a7a47b2, 1560506840-ec148e82a604

## DESIGN EXCELLENCE
- GENEROUS whitespace — premium sites breathe. When in doubt, add MORE space.
- Clear visual hierarchy: hero headline massive (clamp 3-6rem), section headings large, body comfortable
- Color: 60% neutral, 30% primary, 10% accent — cohesive and intentional
- Every section must have a DIFFERENT layout — no repetitive card grids
- Alternate section backgrounds for visual rhythm (white → subtle gray → white → accent)
- Typography: mix serif + sans-serif for personality. Tight letter-spacing on headlines.
- Cards: hover lift effect (translateY + shadow increase)
- Buttons: hover scale(1.02) + shadow
- Scroll reveal animations: fade-up, fade-left, fade-right, scale-in with stagger
- Custom scrollbar styling for premium feel
- Include Schema.org structured data (Organization/LocalBusiness)
- Include proper SEO meta tags (title, description, viewport, og:tags)

## QUALITY GATES
✓ Jaw-dropping on first load — genuinely impressive
✓ Cohesive color system — nothing random
✓ 10-14 unique sections, each visually distinct
✓ Generous whitespace throughout
✓ Smooth, purposeful animations
✓ Beautiful at 375px AND 1920px
✓ Professional, realistic content — never lorem ipsum
✓ Minimum 1000 lines of premium code

Follow the build plan EXACTLY. Every section, color, font, and piece of content must match the plan.`

    // Serialize the plan into a readable format for the generation AI
    const sections = plan.pages?.[0]?.sections || []
    const sectionList = sections.map((s, i) => {
      let desc = `${i + 1}. ${s.type.toUpperCase()}${s.variant ? ` (${s.variant})` : ''}`
      if (s.headline) desc += `\n   Headline: "${s.headline}"`
      if (s.subheadline) desc += `\n   Subheadline: "${s.subheadline}"`
      if (s.title) desc += `\n   Title: "${s.title}"`
      if (s.subtitle) desc += `\n   Subtitle: "${s.subtitle}"`
      if (s.cta) desc += `\n   CTA: "${s.cta.text}" → ${s.cta.action}`
      if (s.items?.length) {
        desc += `\n   Items:`
        s.items.forEach(item => {
          desc += `\n     - ${item.icon || '•'} ${item.title}: ${item.description}`
        })
      }
      if (s.notes) desc += `\n   Notes: ${s.notes}`
      return desc
    }).join('\n\n')

    const userPrompt = `Build a phenomenal website following the Team 100 build plan:

## IDENTITY
SITE: ${plan.siteName}
INDUSTRY: ${plan.industry}
DESIGN STYLE: ${plan.designStyle}
CONTENT TONE: ${plan.contentTone}

## COLOR PALETTE (use these exact colors)
${Object.entries(plan.colorPalette || {}).map(([k, v]) => `  --color-${k}: ${v}`).join('\n')}

## TYPOGRAPHY
  Headings: ${plan.typography?.headingFont || 'Inter'} (weight: ${plan.typography?.headingWeight || '700'})
  Body: ${plan.typography?.bodyFont || 'Inter'} (weight: ${plan.typography?.bodyWeight || '400'})
  ${plan.typography?.accentFont ? `Accent: ${plan.typography.accentFont}` : ''}

## LAYOUT
  Max width: ${plan.layout?.maxWidth || '1280px'}
  Header: ${plan.layout?.headerStyle || 'fixed-transparent'}
  Hero: ${plan.layout?.heroStyle || 'full-screen-image-overlay'}
  Section spacing: ${plan.layout?.sectionSpacing || 'clamp(5rem, 10vw, 9rem)'}

## SECTIONS (build ALL of these, in this exact order)
${sectionList}

## CONVERSION STRATEGY
  Primary Goal: ${(plan.conversionStrategy as Record<string, unknown>)?.primaryGoal || 'generate leads'}
  Main CTA: ${(plan.conversionStrategy as Record<string, unknown>)?.mainCTA || 'Get Started'}
  Trust Elements: ${JSON.stringify((plan.conversionStrategy as Record<string, unknown>)?.trustElements || [])}

## SEO
  <title>: ${(plan.seoStrategy as Record<string, unknown>)?.metaTitle || plan.siteName}
  <meta description>: ${(plan.seoStrategy as Record<string, unknown>)?.metaDescription || ''}
  Keywords: ${JSON.stringify((plan.seoStrategy as Record<string, unknown>)?.targetKeywords || [])}

## MOTION
  Intensity: ${(plan.motionPreset as Record<string, unknown>)?.intensity || 'moderate'}
  Scroll reveal: ${(plan.motionPreset as Record<string, unknown>)?.scrollReveal !== false ? 'yes - fade-up with stagger' : 'minimal'}
  Hover effects: ${(plan.motionPreset as Record<string, unknown>)?.hoverEffects !== false ? 'yes - lift + shadow on cards, scale on buttons' : 'subtle'}
  Parallax: ${(plan.motionPreset as Record<string, unknown>)?.parallax ? 'yes - subtle on hero' : 'no'}

${plan.preserveFromScan ? `## PRESERVED FROM ORIGINAL SITE\n${(plan.preserveFromScan as Record<string, unknown>)?.notes || 'Colors, fonts, and section order preserved from the scanned original site. Match the original closely.'}` : ''}

## REMEMBER
- Follow this plan PRECISELY. Use the exact colors, fonts, headlines, and content specified.
- Write ALL content as realistic, professional, industry-specific copy. Never lorem ipsum.
- Make the hero section jaw-droppingly beautiful — this is the first impression.
- Each section must have a UNIQUE visual layout. No two sections should look the same.
- Include a FAQ section with real, helpful questions and detailed answers.
- Include Schema.org structured data appropriate for this business type.
- The site must look phenomenal on mobile. Not just "responsive" — genuinely beautiful on a phone.`

    return { systemPrompt, userPrompt }
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleContinue = useCallback(async () => {
    dispatch({ type: 'GO_DISCOVERY' })

    // Start deep URL scan in background if URL provided
    let scanResult: ScanResult | null = null
    if (state.url.trim()) {
      dispatch({ type: 'SCAN_START' })
      dispatch({
        type: 'SYSTEM_MESSAGE',
        message: {
          id: `msg_scan_${Date.now()}`,
          role: 'system',
          content: `🔍 Team 100 Deep Scanner is analyzing ${state.url.trim()}... This may take 1-3 minutes.`,
        },
      })

      try {
        const url = state.url.trim().startsWith('http') ? state.url.trim() : `https://${state.url.trim()}`

        // Use deep scanner with SSE progress
        const res = await fetch('/api/scan/deep', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })

        if (res.ok && res.body) {
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n\n')
            buffer = lines.pop() || ''

            for (const block of lines) {
              const eventMatch = block.match(/^event: (\w+)\ndata: ([\s\S]+)$/)
              if (!eventMatch) continue
              const [, eventType, dataStr] = eventMatch
              try {
                const data = JSON.parse(dataStr)

                if (eventType === 'progress') {
                  dispatch({
                    type: 'SYSTEM_MESSAGE',
                    message: {
                      id: `msg_scan_progress_${Date.now()}`,
                      role: 'system',
                      content: `📊 ${data.message} (${data.percent}%)`,
                    },
                  })
                } else if (eventType === 'phase') {
                  if (data.status === 'running') {
                    dispatch({
                      type: 'SYSTEM_MESSAGE',
                      message: {
                        id: `msg_phase_${Date.now()}`,
                        role: 'system',
                        content: `⚡ ${data.description}`,
                      },
                    })
                  }
                } else if (eventType === 'result' && data.ok) {
                  // Convert deep scan result to ScanResult format for compatibility
                  const deepResult = data.data
                  scanResult = {
                    url: deepResult.url,
                    domain: deepResult.domain,
                    title: deepResult.seoMeta?.title || '',
                    description: deepResult.seoMeta?.description || '',
                    favicon: '',
                    ogImage: deepResult.seoMeta?.ogTags?.['og:image'] || '',
                    colors: (deepResult.designTokens?.colors || []).map((c: { hex: string; usage: string; frequency: number }) => ({
                      hex: c.hex,
                      usage: c.usage as 'primary' | 'secondary' | 'background' | 'text' | 'accent' | 'border',
                      frequency: c.frequency,
                    })),
                    fonts: (deepResult.designTokens?.fonts || []).map((f: { family: string; usage: string; weight: string; source: string }) => ({
                      family: f.family,
                      usage: f.usage as 'heading' | 'body' | 'accent',
                      weight: f.weight,
                      source: f.source as 'google-fonts' | 'system' | 'custom',
                    })),
                    sections: deepResult.contentMap?.[0]?.sections || [],
                    navigation: deepResult.navigation || [],
                    headings: deepResult.contentMap?.[0]?.headings || [],
                    paragraphs: [],
                    images: (deepResult.images || []).slice(0, 20),
                    ctaButtons: deepResult.contentMap?.[0]?.ctaButtons || [],
                    seoMeta: deepResult.seoMeta || { title: '', description: '', keywords: '', canonical: '', ogTags: {} },
                    businessType: deepResult.businessType || '',
                    businessName: deepResult.siteName || '',
                    motion: deepResult.motion ? {
                      hasAnimationLibrary: deepResult.motion.hasAnimationLibrary,
                      hasScrollAnimations: deepResult.motion.hasScrollAnimations,
                      hasParallax: deepResult.motion.hasParallax,
                      hasStickyHeader: deepResult.motion.hasStickyHeader,
                      suggestedPreset: 'moderate' as const,
                    } : undefined,
                    designDna: deepResult.designDna || undefined,
                  } as ScanResult

                  dispatch({ type: 'SCAN_DONE', result: scanResult })
                  dispatch({
                    type: 'SYSTEM_MESSAGE',
                    message: {
                      id: `msg_scan_done_${Date.now()}`,
                      role: 'system',
                      content: `✅ Deep scan complete — analyzed ${deepResult.pageCount} pages, found ${deepResult.designTokens?.colors?.length || 0} colors, ${deepResult.designTokens?.fonts?.length || 0} fonts, ${deepResult.contentMap?.reduce((s: number, p: { sections: unknown[] }) => s + p.sections.length, 0) || 0} sections. Design DNA captured in ${Math.round(deepResult.scanDuration / 1000)}s.`,
                    },
                  })
                } else if (eventType === 'error') {
                  throw new Error(data.error)
                }
              } catch { /* skip malformed events */ }
            }
          }
        } else {
          throw new Error('Deep scan request failed')
        }
      } catch (err) {
        console.error('Deep scan failed:', err)
        dispatch({ type: 'SCAN_ERROR' })
        dispatch({
          type: 'SYSTEM_MESSAGE',
          message: {
            id: `msg_scan_err_${Date.now()}`,
            role: 'system',
            content: `⚠️ Scan encountered an issue. Continuing with discovery questions...`,
          },
        })
      }
    }

    // Start first discovery question
    await callDiscovery([], {}, scanResult)
  }, [state.url, callDiscovery])

  const handleTemplateSelect = useCallback((template: TemplateItem) => {
    if (state.selectedTemplateId === template.id) {
      dispatch({ type: 'SELECT_TEMPLATE', id: null, seedText: null })
      dispatch({ type: 'SET_DESCRIPTION', value: '' })
    } else {
      dispatch({ type: 'SELECT_TEMPLATE', id: template.id, seedText: template.seedText })
      dispatch({ type: 'SET_DESCRIPTION', value: template.seedText })
    }
  }, [state.selectedTemplateId])

  const handleChatFileUpload = useCallback((file: { name: string; textContent: string }) => {
    // Append document text to state
    dispatch({ type: 'APPEND_DOCUMENT_TEXT', value: file.textContent })

    // Show system message in chat
    const charCount = file.textContent.length
    dispatch({
      type: 'SYSTEM_MESSAGE',
      message: {
        id: `msg_upload_${Date.now()}`,
        role: 'system',
        content: `📄 ${file.name} uploaded — ${charCount.toLocaleString()} characters extracted. AI will use this content for your website.`,
      },
    })
  }, [])

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: DiscoveryMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
    }
    dispatch({ type: 'USER_MESSAGE', message: userMessage })

    const allMessages = [...state.messages, userMessage]
    await callDiscovery(allMessages, state.discoveryContext, state.scanResult)
  }, [state.messages, state.discoveryContext, state.scanResult, callDiscovery])

  const handleBuild = useCallback(async () => {
    // Prevent double-click race condition
    if (state.isGenerating) return
    dispatch({ type: 'START_BUILD' })

    try {
    // ─── Phase 1: Planning ──────────────────────────────────────────────
    const plan = await callPlanning()

    const siteName = plan?.siteName
      || (state.discoveryContext.business_name as string)
      || state.description.slice(0, 40)
      || 'My Website'

    let html = ''

    // ─── Phase 2: Generation (from plan or direct) ─────────────────────
    if (plan) {
      // Generate from the structured build plan
      const { systemPrompt, userPrompt } = buildPromptFromPlan(plan)

      try {
        dispatch({ type: 'BUILD_PROGRESS', status: 'AI is building your site from the plan...', progress: 30 })

        const streamController = new AbortController()
        const streamTimeout = setTimeout(() => streamController.abort(), 90000) // 90s client-side limit

        const res = await fetch('/api/ai/generate-site-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemPrompt, userPrompt, siteName }),
          signal: streamController.signal,
        })

        if (res.ok && res.body) {
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''

              for (const line of lines) {
                if (!line.startsWith('data: ')) continue
                try {
                  const event = JSON.parse(line.slice(6))
                  if (event.type === 'chunk' && event.text) {
                    html += event.text
                    const progress = Math.min(95, 30 + Math.round((html.length / 20000) * 65))
                    dispatch({ type: 'BUILD_PROGRESS', status: `Building... ${progress}%`, progress })
                  } else if (event.type === 'done') {
                    dispatch({ type: 'BUILD_PROGRESS', status: 'Finalizing...', progress: 98 })
                  } else if (event.type === 'error') {
                    throw new Error(event.error)
                  }
                } catch { /* skip malformed */ }
              }
            }
          } finally {
            reader.releaseLock()
          }
          html = html.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim()
        }
        clearTimeout(streamTimeout)
      } catch (err) {
        console.error('Streaming generation failed:', err)
      }
    }

    // ─── Fallback: generate without plan ────────────────────────────────
    if (!html || html.length < 500) {
      const businessType = (state.discoveryContext.industry as string) || state.selectedTemplateId || 'business'

      // Build a basic prompt from discovery context
      const discoveryInfo = Object.entries(state.discoveryContext)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join('\n')

      const fallbackSystem = `You are an elite web designer. Generate a complete, stunning HTML website.
Return ONLY the HTML — from <!DOCTYPE html> to </html>. No markdown fences, no explanations.
Include ALL CSS in a single <style> tag. Include JS for scroll animations, mobile menu, and smooth scroll in a single <script> before </body>.
Use Google Fonts via <link> tag. Use Unsplash images.
Make it look like a $10,000 agency-built website. 800+ lines minimum.`

      const fallbackUser = `Create a stunning website.\n\nBusiness: ${siteName}\nType: ${businessType}\nContext:\n${discoveryInfo}\nDescription: "${state.description}"`

      try {
        dispatch({ type: 'BUILD_PROGRESS', status: 'Generating with AI...', progress: 30 })
        const fallbackController = new AbortController()
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 90000)
        const res = await fetch('/api/ai/generate-site-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemPrompt: fallbackSystem, userPrompt: fallbackUser, siteName }),
          signal: fallbackController.signal,
        })
        if (res.ok && res.body) {
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''
              for (const line of lines) {
                if (!line.startsWith('data: ')) continue
                try {
                  const event = JSON.parse(line.slice(6))
                  if (event.type === 'chunk' && event.text) {
                    html += event.text
                    const progress = Math.min(95, 30 + Math.round((html.length / 20000) * 65))
                    dispatch({ type: 'BUILD_PROGRESS', status: `Building... ${progress}%`, progress })
                  }
                } catch { /* skip */ }
              }
            }
          } finally {
            reader.releaseLock()
          }
          html = html.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim()
        }
        clearTimeout(fallbackTimeout)
      } catch {
        // Try non-streaming with timeout
        try {
          const nsController = new AbortController()
          const nsTimeout = setTimeout(() => nsController.abort(), 60000)
          const res = await fetch('/api/ai/generate-site', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              designDna: state.scanResult?.designDna || { designStyle: 'modern-premium' },
              siteName,
              businessType,
            }),
            signal: nsController.signal,
          })
          clearTimeout(nsTimeout)
          if (res.ok) {
            const data = await res.json()
            if (data.ok && data.data?.html) html = data.data.html
          }
        } catch { /* fall through to template */ }
      }
    }

    // ─── Fallback: template ─────────────────────────────────────────────
    if (!html || html.length < 500) {
      dispatch({ type: 'BUILD_PROGRESS', status: 'Building from templates...', progress: 60 })

      if (state.scanResult) {
        html = rebuildSite(state.scanResult)
      } else {
        const templateId = state.selectedTemplateId || 'business'
        try {
          const res = await fetch(`/templates/${templateId}/index.html`)
          html = await res.text()
        } catch { /* empty */ }
      }
    }

    // ─── Save and navigate ──────────────────────────────────────────────
    if (html && html.length > 100) {
      dispatch({ type: 'BUILD_PROGRESS', status: 'Saving your site...', progress: 100 })
      const siteId = `site_${Date.now()}`
      const slug = siteName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      const savedSites = (() => {
        try {
          const stored = localStorage.getItem('ubuilder_sites')
          return stored ? JSON.parse(stored) : []
        } catch {
          return []
        }
      })()
      savedSites.push({
        id: siteId,
        name: siteName,
        status: 'draft',
        lastEdited: 'Just now',
        url: `${slug}.ubuilder.co`,
        description: state.description,
        template: state.selectedTemplateId || 'ai-generated',
      })
      localStorage.setItem('ubuilder_sites', JSON.stringify(savedSites))
      localStorage.setItem(`ubuilder_html_${siteId}`, html)

      // Also save the build plan for the editor to reference
      if (plan) {
        localStorage.setItem(`ubuilder_plan_${siteId}`, JSON.stringify(plan))
      }

      router.push(`/editor/${siteId}`)
    } else {
      dispatch({ type: 'BUILD_ERROR', error: 'Generation produced no usable output. Please try again or use a template.' })
      return
    }

    dispatch({ type: 'BUILD_DONE' })
    } catch (err) {
      console.error('Build failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during site generation.'
      dispatch({ type: 'BUILD_ERROR', error: errorMessage })
    }
  }, [state, router, callPlanning])

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] bg-bg px-0 py-0 sm:px-4 sm:py-8 md:py-12">
      {state.step === 'input' && (
        <UnifiedInput
          description={state.description}
          onDescriptionChange={(v) => dispatch({ type: 'SET_DESCRIPTION', value: v })}
          url={state.url}
          onUrlChange={(v) => dispatch({ type: 'SET_URL', value: v })}
          uploadedImage={state.uploadedImage}
          onImageUpload={(v) => dispatch({ type: 'SET_IMAGE', value: v })}
          selectedTemplateId={state.selectedTemplateId}
          onTemplateSelect={handleTemplateSelect}
          onContinue={handleContinue}
          isDisabled={state.isAiThinking}
          onDocumentText={(v) => dispatch({ type: 'SET_DOCUMENT_TEXT', value: v })}
        />
      )}

      {(state.step === 'discovery' || state.step === 'generating') && (
        <DiscoveryChat
          messages={state.messages}
          onSendMessage={handleSendMessage}
          progress={state.progress}
          readyToGenerate={state.readyToGenerate}
          isAiThinking={state.isAiThinking}
          onBuild={handleBuild}
          onBack={() => dispatch({ type: 'GO_INPUT' })}
          isBuilding={state.isGenerating}
          buildStatus={state.buildStatus}
          buildProgress={state.buildProgress}
          onFileUpload={handleChatFileUpload}
          error={state.buildError}
          onRetry={() => handleBuild()}
        />
      )}
    </div>
  )
}

export default NewSitePage
