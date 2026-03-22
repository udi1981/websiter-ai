'use client'

import { useReducer, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { type ScanResult } from '@/lib/scanner'
import { rebuildSite } from '@/lib/site-rebuilder'
import { PREMIUM_GENERATION_PROMPT, buildUserPromptFromPlan } from '@/lib/generation-prompt'
import { composePage, hasGenerator, resolveVariantId } from '@/lib/section-composer'
import type { PageComposition, PageSection, SectionCategory } from '@ubuilder/types'
import { createSite } from '@/lib/sites-api'
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
      variantId?: string
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

type SiteLocale = 'en' | 'he'

type State = {
  step: Step
  // Step 1
  locale: SiteLocale
  description: string
  url: string
  uploadedImage: string | null
  selectedTemplateId: string | null
  selectedTemplateSeedText: string | null
  documentText: string | null
  // Scan
  scanStatus: 'idle' | 'scanning' | 'done' | 'error'
  scanResult: ScanResult | null
  /** Full deep scan result — preserves 100% of scanner intelligence */
  deepScanData: Record<string, unknown> | null
  scanMode: 'copy' | 'inspiration' | null
  sourceOwnership: 'self_owned' | 'third_party' | null
  scanJobId: string | null
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
  | { type: 'SET_LOCALE'; value: SiteLocale }
  | { type: 'SET_DESCRIPTION'; value: string }
  | { type: 'SET_URL'; value: string }
  | { type: 'SET_IMAGE'; value: string | null }
  | { type: 'SELECT_TEMPLATE'; id: string | null; seedText: string | null }
  | { type: 'SET_DOCUMENT_TEXT'; value: string | null }
  | { type: 'APPEND_DOCUMENT_TEXT'; value: string }
  | { type: 'GO_DISCOVERY' }
  | { type: 'GO_INPUT' }
  | { type: 'SCAN_START' }
  | { type: 'SCAN_DONE'; result: ScanResult; deepData?: Record<string, unknown>; scanJobId?: string }
  | { type: 'SCAN_ERROR' }
  | { type: 'SET_SOURCE_OWNERSHIP'; value: 'self_owned' | 'third_party' }
  | { type: 'AI_THINKING' }
  | { type: 'AI_RESPONSE'; message: DiscoveryMessage; context: Record<string, unknown>; progress: { current: number; total: number }; ready: boolean }
  | { type: 'USER_MESSAGE'; message: DiscoveryMessage }
  | { type: 'SYSTEM_MESSAGE'; message: DiscoveryMessage }
  | { type: 'START_BUILD' }
  | { type: 'SET_PLAN'; plan: BuildPlan }
  | { type: 'BUILD_PROGRESS'; status: string; progress: number }
  | { type: 'BUILD_DONE' }
  | { type: 'BUILD_ERROR'; error: string }
  | { type: 'SET_SCAN_MODE'; scanMode: 'copy' | 'inspiration' }

const initialState: State = {
  step: 'input',
  locale: 'he',
  description: '',
  url: '',
  uploadedImage: null,
  selectedTemplateId: null,
  selectedTemplateSeedText: null,
  documentText: null,
  scanStatus: 'idle',
  scanResult: null,
  deepScanData: null,
  scanMode: null,
  sourceOwnership: null,
  scanJobId: null,
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
    case 'SET_LOCALE':
      return { ...state, locale: action.value }
    case 'SET_DESCRIPTION': {
      // Auto-detect Hebrew text and switch locale accordingly
      const hasHebrew = /[\u0590-\u05FF]/.test(action.value)
      const autoLocale = hasHebrew ? 'he' : state.locale
      return { ...state, description: action.value, locale: autoLocale }
    }
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
      return { ...state, scanStatus: 'done', scanResult: action.result, deepScanData: action.deepData ?? null, scanJobId: action.scanJobId ?? null }
    case 'SCAN_ERROR':
      return { ...state, scanStatus: 'error' }
    case 'SET_SOURCE_OWNERSHIP':
      return { ...state, sourceOwnership: action.value }
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
    case 'SYSTEM_MESSAGE': {
      // Replace existing message with same id (for live-updating progress), otherwise append
      const existingIdx = state.messages.findIndex(m => m.id === action.message.id)
      if (existingIdx >= 0) {
        const updated = [...state.messages]
        updated[existingIdx] = action.message
        return { ...state, messages: updated }
      }
      return { ...state, messages: [...state.messages, action.message] }
    }
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
    case 'SET_SCAN_MODE':
      return { ...state, scanMode: action.scanMode }
    default:
      return state
  }
}

// ─── Page Component ──────────────────────────────────────────────────────────

/** Build auth headers — includes x-user-id from localStorage for session resilience */
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const stored = localStorage.getItem('ubuilder_user')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed?.id) headers['x-user-id'] = parsed.id
    }
  } catch { /* ignore */ }
  return headers
}

const NewSitePage = () => {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, initialState)
  const discoveryFailCount = useRef(0)
  const discoveryRetryCount = useRef(0)

  // ─── Discovery API call ──────────────────────────────────────────────────

  const callDiscovery = useCallback(async (userMessages: DiscoveryMessage[], context: Record<string, unknown>, scanResult: ScanResult | null) => {
    dispatch({ type: 'AI_THINKING' })

    try {
      // Add timeout to prevent indefinite hanging
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 60000) // 60s max

      const res = await fetch('/api/ai/discovery', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          initialInput: {
            description: state.description,
            templateId: state.selectedTemplateId,
            scanResult: scanResult ? {
              businessType: scanResult.businessType,
              businessName: scanResult.businessName,
              sections: scanResult.sections?.map((s: { type: string; title?: string }) => ({ type: s.type, title: s.title })),
              colors: scanResult.colors?.slice(0, 8),
              fonts: scanResult.fonts?.slice(0, 4),
              designDna: scanResult.designDna,
            } : undefined,
            hasUploadedImage: !!state.uploadedImage,
            documentText: state.documentText || undefined,
          },
          messages: userMessages
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          context,
          locale: state.locale,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!res.ok) throw new Error('Discovery API failed')

      const data = await res.json()

      if (data.ok) {
        // Reset fail/retry counters on success
        discoveryFailCount.current = 0
        discoveryRetryCount.current = 0

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

      // Retry once before showing fallback — the first failure is often transient
      if (discoveryRetryCount.current < 1) {
        discoveryRetryCount.current++
        console.log('[Discovery] Retrying after failure...')
        await new Promise(r => setTimeout(r, 3000))
        try {
          const retryRes = await fetch('/api/ai/discovery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              initialInput: {
                description: state.description,
                templateId: state.selectedTemplateId,
                scanResult: undefined,
                hasUploadedImage: !!state.uploadedImage,
                documentText: state.documentText || undefined,
              },
              messages: userMessages
                .filter(m => m.role !== 'system')
                .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
              context,
              locale: state.locale,
            }),
          })
          if (retryRes.ok) {
            const retryData = await retryRes.json()
            if (retryData.ok) {
              discoveryRetryCount.current = 0
              discoveryFailCount.current = 0
              dispatch({
                type: 'AI_RESPONSE',
                message: {
                  id: `msg_${Date.now()}`,
                  role: 'assistant',
                  content: retryData.data.question,
                  suggestions: retryData.data.suggestions,
                },
                context: retryData.data.context || context,
                progress: retryData.data.progress || { current: 0, total: 6 },
                ready: retryData.data.readyToGenerate || false,
              })
              return
            }
          }
        } catch { /* fall through to fallback */ }
      }

      discoveryFailCount.current++

      // Pre-populate context from description so handleBuild won't have empty context
      const fallbackContext = {
        ...context,
        business_name: context.business_name || state.description.slice(0, 40),
        industry: context.industry || state.description,
      }

      // On 2nd failure — stop asking, auto-trigger build
      if (discoveryFailCount.current >= 2) {
        const isHe = state.locale === 'he'
        dispatch({
          type: 'AI_RESPONSE',
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: isHe
              ? 'יש לנו מספיק מידע! בונים את האתר שלך עכשיו... 🚀'
              : 'We have enough info! Building your site now... 🚀',
          },
          context: fallbackContext,
          progress: { current: 6, total: 6 },
          ready: true,
        })
        return
      }

      // First failure — show locale-aware fallback question
      const isHe = state.locale === 'he'
      const fallbackMessage: DiscoveryMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: isHe
          ? 'ספר/י לי עוד על העסק שלך — מה את/ה עושה ומי הלקוחות שלך?'
          : 'Tell me more about your business — what do you do and who are your customers?',
        suggestions: isHe
          ? ['עסק שירותי', 'חנות אונליין', 'פורטפוליו / קריאטיב', 'עסק מקומי']
          : ['Service business', 'Online store', 'Portfolio / Creative', 'Local business'],
      }
      dispatch({
        type: 'AI_RESPONSE',
        message: fallbackMessage,
        context: fallbackContext,
        progress: { current: 1, total: 6 },
        ready: false,
      })
    }
  }, [state.description, state.selectedTemplateId, state.uploadedImage, state.documentText, state.locale])

  // ─── Planning API call ─────────────────────────────────────────────────

  const callPlanning = useCallback(async (): Promise<BuildPlan | null> => {
    dispatch({ type: 'BUILD_PROGRESS', status: 'Team 100 is planning your site...', progress: 10 })

    try {
      // Build scan payload — prefer full deep scan data over flattened legacy result
      const scanPayload = state.deepScanData
        ? {
            // Full deep scan intelligence — 100% preserved
            ...state.deepScanData,
            // Ensure key fields are always present
            businessType: (state.deepScanData.businessType as string) || state.scanResult?.businessType,
            businessName: (state.deepScanData.siteName as string) || state.scanResult?.businessName,
            _source: 'deep-scan-v2' as const,
          }
        : state.scanResult
          ? {
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
              _source: 'legacy-scan' as const,
            }
          : undefined

      const res = await fetch('/api/ai/planning', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          discoveryContext: state.discoveryContext,
          scanResult: scanPayload,
          description: state.description,
          templateId: state.selectedTemplateId,
          locale: state.locale,
        }),
      })

      if (!res.ok) throw new Error('Planning API failed')

      const data = await res.json()
      if (data.ok && data.data?.plan) {
        const plan = data.data.plan as BuildPlan
        const sections = plan.pages?.[0]?.sections || []
        console.log(`[Build] Plan received: "${plan.siteName}", ${sections.length} sections, variantIds:`, sections.map((s: { variantId?: string }) => s.variantId).filter(Boolean))
        dispatch({ type: 'SET_PLAN', plan })
        dispatch({ type: 'BUILD_PROGRESS', status: 'Build plan ready — generating site...', progress: 25 })
        return plan
      }
      throw new Error('No plan returned')
    } catch (err) {
      console.error('[Build] Planning failed:', err)
      dispatch({ type: 'BUILD_PROGRESS', status: 'Planning skipped — generating directly...', progress: 15 })
      return null
    }
  }, [state.discoveryContext, state.scanResult, state.deepScanData, state.description, state.selectedTemplateId, state.locale])

  // ─── Try section-composed generation (uses pre-built generators) ──────

  /** Check if the plan has variantId fields that map to our section registry */
  const tryComposedGeneration = (plan: BuildPlan, generatedImages: Record<string, string> = {}): string | null => {
    const allSections = plan.pages?.[0]?.sections || []

    // Build nav links from non-nav/non-footer sections
    const navLinks = allSections
      .filter(s => s.type !== 'navbar' && s.type !== 'footer')
      .map(s => ({
        label: s.title || s.headline || s.type.charAt(0).toUpperCase() + s.type.slice(1),
        href: `#${s.type}`,
      }))

    const resolvedSections: PageSection[] = allSections
      .filter(s => {
        if (!s.variantId) return false
        const resolved = resolveVariantId(s.variantId)
        if (resolved && resolved !== s.variantId) {
          console.log(`[Build] Resolved variantId: "${s.variantId}" → "${resolved}"`)
          s.variantId = resolved
        }
        return resolved !== null
      })
      .map((s, i) => {
        // Map plan fields to generator param names
        const isNav = s.type === 'navbar'
        const isHero = s.type === 'hero'
        const ctaAction = s.cta?.action === 'scroll-to-contact' ? '#contact'
          : s.cta?.action === 'link' ? '#' : `#${s.cta?.action || 'contact'}`

        return {
          id: `section-${i}`,
          category: s.type as SectionCategory,
          variantId: s.variantId!,
          order: i,
          content: {
            // Common fields
            businessName: plan.siteName,
            businessType: plan.industry,
            locale: state.locale,
            primaryColor: plan.colorPalette?.primary,
            secondaryColor: plan.colorPalette?.secondary,
            // Nav-specific: brand + links
            ...(isNav ? {
              brand: plan.siteName,
              links: navLinks,
              ctaText: (plan.conversionStrategy as { mainCTA?: string })?.mainCTA || s.cta?.text || 'Get Started',
              ctaLink: ctaAction,
            } : {}),
            // Hero-specific: title/subtitle/cta mapping
            ...(isHero ? {
              title: s.headline || s.title || `Welcome to ${plan.siteName}`,
              subtitle: s.subheadline || s.subtitle || '',
              ctaText: s.cta?.text || (plan.conversionStrategy as { mainCTA?: string })?.mainCTA || 'Get Started',
              ctaLink: ctaAction,
              secondaryCtaText: 'Learn More',
              secondaryCtaLink: '#features',
            } : {}),
            // Content sections: title + subtitle + items
            ...(!isNav && !isHero ? {
              title: s.title || s.headline || '',
              subtitle: s.subtitle || s.subheadline || '',
              headline: s.headline || s.title || '',
              subheadline: s.subheadline || s.subtitle || '',
              items: s.items,
              ctaText: s.cta?.text,
              ctaLink: ctaAction,
              notes: s.notes,
            } : {}),
          },
          images: {
            ...(s.type === 'hero' && generatedImages.hero ? { hero: generatedImages.hero, imageUrl: generatedImages.hero } : {}),
            ...(s.type === 'about' && generatedImages.about ? { imageUrl: generatedImages.about } : {}),
            ...(s.type === 'features' && generatedImages.features ? { imageUrl: generatedImages.features } : {}),
            ...(s.type === 'gallery' ? { gallery_0: generatedImages.gallery_0, gallery_1: generatedImages.gallery_1, gallery_2: generatedImages.gallery_2 } : {}),
            ...(generatedImages.logo ? { logo: generatedImages.logo } : {}),
          },
        }
      })

    // Log what matched
    console.log(`[Build] Section composition: ${allSections.length} planned, ${resolvedSections.length} resolved. IDs:`, resolvedSections.map(s => s.variantId))
    const unmatched = allSections.filter(s => s.variantId && !hasGenerator(s.variantId))
    if (unmatched.length) console.log(`[Build] Unmatched variantIds:`, unmatched.map(s => s.variantId))

    // Only use composed generation if at least 6 sections resolved
    if (resolvedSections.length < 3) {
      console.log(`[Build] Not enough sections for composition (${resolvedSections.length} < 3), falling back to AI generation`)
      return null
    }

    const composition: PageComposition = {
      id: `composed-${Date.now()}`,
      siteName: plan.siteName,
      locale: state.locale,
      palette: {
        primary: plan.colorPalette?.primary || '#7C3AED',
        primaryHover: plan.colorPalette?.primaryHover || plan.colorPalette?.primary || '#6D28D9',
        secondary: plan.colorPalette?.secondary || '#06B6D4',
        accent: plan.colorPalette?.accent || '#F59E0B',
        background: plan.colorPalette?.background || '#0B0F1A',
        backgroundAlt: plan.colorPalette?.backgroundAlt || '#111827',
        text: plan.colorPalette?.text || '#F9FAFB',
        textMuted: plan.colorPalette?.textMuted || '#9CA3AF',
        border: plan.colorPalette?.border || '#1F2937',
      },
      fonts: {
        heading: plan.typography?.headingFont || 'Inter',
        body: plan.typography?.bodyFont || 'Inter',
        headingWeight: plan.typography?.headingWeight || '700',
        bodyWeight: plan.typography?.bodyWeight || '400',
      },
      sections: resolvedSections,
    }

    return composePage(composition)
  }

  // ─── Build prompt from plan ────────────────────────────────────────────

  const buildPromptFromPlan = (plan: BuildPlan) => {
    let userPrompt = buildUserPromptFromPlan(plan)

    // Inject deep scan design context for maximum fidelity
    if (state.deepScanData) {
      const ds = state.deepScanData
      const designTokens = ds.designTokens as Record<string, unknown> | undefined
      const rebuildPlan = ds.rebuildPlan as Record<string, unknown> | undefined
      const scanDesignDna = ds.designDna as Record<string, unknown> | undefined

      const scanContext: string[] = ['\n\n## ORIGINAL SITE DNA (from deep scan — match this closely)']

      if (scanDesignDna) {
        scanContext.push(`Design DNA analysis: ${JSON.stringify(scanDesignDna)}`)
      }

      if (designTokens) {
        const dt = designTokens as { spacing?: string[]; borderRadius?: string[]; shadows?: string[]; gradients?: string[]; cssVariables?: Record<string, string> }
        if (dt.spacing?.length) scanContext.push(`Spacing values to match: ${dt.spacing.join(', ')}`)
        if (dt.borderRadius?.length) scanContext.push(`Border radius to match: ${dt.borderRadius.join(', ')}`)
        if (dt.shadows?.length) scanContext.push(`Box shadows to match: ${dt.shadows.slice(0, 5).join(' | ')}`)
        if (dt.gradients?.length) scanContext.push(`Gradients to match: ${dt.gradients.slice(0, 5).join(' | ')}`)
        if (dt.cssVariables && Object.keys(dt.cssVariables).length > 0) {
          scanContext.push(`CSS custom properties from original:\n${Object.entries(dt.cssVariables).slice(0, 25).map(([k, v]) => `  ${k}: ${v}`).join('\n')}`)
        }
      }

      if (rebuildPlan) {
        const rp = rebuildPlan as { preserve?: string[]; improve?: string[]; upgrade?: string[] }
        if (rp.preserve?.length) scanContext.push(`MUST PRESERVE from original: ${rp.preserve.join(', ')}`)
        if (rp.improve?.length) scanContext.push(`IMPROVE over original: ${rp.improve.join(', ')}`)
        if (rp.upgrade?.length) scanContext.push(`UPGRADE opportunities: ${rp.upgrade.join(', ')}`)
      }

      if (scanContext.length > 1) {
        userPrompt += scanContext.join('\n')
      }
    }

    return {
      systemPrompt: PREMIUM_GENERATION_PROMPT,
      userPrompt,
    }
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleContinue = useCallback(async () => {
    dispatch({ type: 'GO_DISCOVERY' })

    // Start first discovery question IMMEDIATELY — scan waits until this completes
    // This ensures discovery gets the Claude API call without competition from scan
    const discoveryPromise = callDiscovery([], {}, null)

    // Wait for discovery to complete BEFORE starting scan
    // Root cause fix: firing both simultaneously overloads the dev server
    await discoveryPromise

    // Start deep URL scan in BACKGROUND if URL provided (after discovery succeeded)
    if (state.url.trim()) {
      if (!state.scanMode) {
        dispatch({
          type: 'SYSTEM_MESSAGE',
          message: {
            id: `msg_scan_intent_${Date.now()}`,
            role: 'system',
            content: state.locale === 'he'
              ? '🔍 מצאנו URL! סורקים את האתר ברקע בזמן שנמשיך לשוחח...'
              : '🔍 URL detected! Scanning in the background while we chat...',
          },
        })
        dispatch({ type: 'SET_SCAN_MODE', scanMode: 'inspiration' })
      }

      dispatch({ type: 'SCAN_START' })
      dispatch({
        type: 'SYSTEM_MESSAGE',
        message: {
          id: `msg_scan_${Date.now()}`,
          role: 'system',
          content: `🔍 Team 100 Deep Scanner is analyzing ${state.url.trim()}... This may take 1-3 minutes.`,
        },
      })

      // Run scan in background — don't await, don't block discovery
      const scanInBackground = async () => {
        try {
          const url = state.url.trim().startsWith('http') ? state.url.trim() : `https://${state.url.trim()}`

          // Add timeout to scan to prevent indefinite hanging
          const scanController = new AbortController()
          const scanTimeout = setTimeout(() => scanController.abort(), 120000) // 2 min max

          const ownership = state.sourceOwnership || 'third_party'
          const mode = state.scanMode || 'inspiration'

          const res = await fetch('/api/scan/v2/deep', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              url,
              sourceOwnership: ownership,
              scanMode: mode,
            }),
            signal: scanController.signal,
          })

          clearTimeout(scanTimeout)

          if (res.ok && res.body) {
            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            let capturedScanJobId: string | undefined

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

                  // Capture scanJobId from init event
                  if (eventType === 'phase' && data.phase === 'init' && data.scanJobId) {
                    capturedScanJobId = data.scanJobId as string
                  }

                  if (eventType === 'progress') {
                    // Use stable id so progress updates replace each other (not flood chat)
                    dispatch({
                      type: 'SYSTEM_MESSAGE',
                      message: {
                        id: 'msg_scan_live_progress',
                        role: 'system',
                        content: data.percent > 0
                          ? `🔍 סריקה: ${data.message} (${data.percent}%)`
                          : `🔍 סריקה בתהליך... עמודים נטענים (עלול לקחת 1-2 דקות)`,
                      },
                    })
                  } else if (eventType === 'phase') {
                    if (data.status === 'running') {
                      dispatch({
                        type: 'SYSTEM_MESSAGE',
                        message: {
                          id: 'msg_scan_live_progress',
                          role: 'system',
                          content: `⚡ ${data.description || data.phase}...`,
                        },
                      })
                    } else if (data.status === 'done') {
                      dispatch({
                        type: 'SYSTEM_MESSAGE',
                        message: {
                          id: 'msg_scan_live_progress',
                          role: 'system',
                          content: `✅ ${data.phase} הושלם`,
                        },
                      })
                    }
                  } else if (eventType === 'result' && data.ok) {
                    const deepResult = data.data
                    const scanResultFromDeep = {
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

                    dispatch({ type: 'SCAN_DONE', result: scanResultFromDeep, deepData: deepResult, scanJobId: capturedScanJobId || data.scanJobId as string })
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

      // Fire and forget — scan runs in background while user answers questions
      scanInBackground()
    }
  }, [state.url, state.locale, state.scanMode, state.sourceOwnership, callDiscovery])

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

    // Ensure minimum context — never build with empty context
    const effectiveContext = Object.keys(state.discoveryContext).filter(k => state.discoveryContext[k]).length > 0
      ? state.discoveryContext
      : { business_name: state.description.slice(0, 40), industry: state.description }

    try {
    const siteName = (effectiveContext.business_name as string)
      || state.description.slice(0, 40)
      || 'My Website'

    let html = ''
    let realSiteId: string | null = null
    let realJobId: string | null = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let plan: any = null

    // ─── PRIMARY: Team 100 Pipeline (agents + cross-checks + CPO) ──────
    try {
      dispatch({ type: 'BUILD_PROGRESS', status: '🚀 Team 100 activated — @strategist analyzing...', progress: 5 })

      const pipelineController = new AbortController()
      const pipelineTimeout = setTimeout(() => pipelineController.abort(), 300000) // 5 min max

      const pipelineRes = await fetch('/api/ai/pipeline', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          description: state.description,
          locale: state.locale,
          discoveryContext: effectiveContext,
          deepScanData: state.deepScanData || null,
          scanJobId: state.scanJobId || undefined,
          scanMode: state.scanMode || undefined,
          sourceOwnership: state.sourceOwnership || undefined,
        }),
        signal: pipelineController.signal,
      })

      // Bug #3: Explicitly handle non-OK responses
      if (!pipelineRes.ok) {
        const errText = await pipelineRes.text().catch(() => 'Unknown error')
        throw new Error(`Pipeline returned ${pipelineRes.status}: ${errText.slice(0, 200)}`)
      }

      if (pipelineRes.body) {
        const reader = pipelineRes.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let currentPhase = 'initializing' // Bug #4: Track current phase for error context

        const phaseProgress: Record<string, number> = {
          strategy: 15, design: 35, content: 50, images: 65, build: 75, qa: 85, cpo: 92, complete: 100,
        }

        const phaseLabels: Record<string, string> = {
          strategy: '🧠 @strategist analyzing business...',
          design: '🎨 @designer choosing sections & effects...',
          content: '✍️ @content generating copy...',
          images: '🖼️ @media generating custom images...',
          build: '🏗️ @frontend composing HTML...',
          qa: '🔍 @qa checking quality...',
          cpo: '⭐ @cpo scoring design...',
          complete: '✅ Site ready!',
        }

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
                const phase = event.phase as string
                const status = event.status as string
                currentPhase = phase // Bug #4: Track for error messages

                // Update progress
                const progress = phaseProgress[phase] || 50
                let label = phaseLabels[phase] || `${phase}...`

                if (status === 'cross-check') label = `🔄 Cross-checking ${phase}...`
                if (status === 'retry') label = `🔧 @designer revising based on feedback...`
                if (status === 'needs-improvement') label = `⚠️ CPO scored ${event.overall}/10 — requesting improvements...`

                dispatch({ type: 'BUILD_PROGRESS', status: label, progress })

                // Capture real siteId + jobId from pipeline init event
                if (phase === 'init' && event.siteId) {
                  realSiteId = event.siteId as string
                  realJobId = event.jobId as string || null
                  console.log(`[Pipeline] Real site: ${realSiteId}, job: ${realJobId}`)
                }

                // Capture HTML from build phase or complete
                if (phase === 'complete' && event.html) {
                  html = event.html as string
                  console.log(`[Pipeline] Complete! HTML: ${html.length} chars, CPO: ${event.cpoScore}/10`)
                }
                if (phase === 'build' && status === 'complete' && event.html) {
                  html = event.html as string
                }
                if (phase === 'error') {
                  console.error('[Pipeline] Error:', event.error)
                  throw new Error(event.error as string)
                }
              } catch (parseErr) {
                if (parseErr instanceof Error && parseErr.message.startsWith('[Pipeline]')) throw parseErr
                /* skip malformed SSE lines */
              }
            }
          }
        } finally {
          reader.releaseLock()
        }
      }
      clearTimeout(pipelineTimeout)
    } catch (pipelineErr) {
      const errMsg = pipelineErr instanceof Error ? pipelineErr.message : 'Unknown error'
      console.warn(`[Build] Pipeline failed during phase: ${errMsg}`)
      // Bug #6: Show descriptive error with phase info
      const isHe = state.locale === 'he'
      dispatch({
        type: 'BUILD_PROGRESS',
        status: isHe
          ? `⚠️ שגיאה בשלב הבנייה — מנסה שיטה חלופית...`
          : `⚠️ Build error — trying backup method...`,
        progress: 20,
      })
    }

    // ─── FALLBACK: Old inline flow (if pipeline produced no HTML) ──────
    if (!html || html.length < 500) {
      console.log('[Build] Pipeline produced no HTML, using old planning flow')
      dispatch({ type: 'BUILD_PROGRESS', status: 'Using backup generation...', progress: 20 })

      plan = await callPlanning()
      if (plan) {
        // Generate images
        let generatedImages: Record<string, string> = {}
        try {
          dispatch({ type: 'BUILD_PROGRESS', status: 'Creating visuals...', progress: 30 })
          const imgRes = await fetch('/api/ai/generate-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessName: plan.siteName,
              businessType: plan.industry,
              locale: state.locale,
              colorPalette: plan.colorPalette,
              sections: plan.pages?.[0]?.sections || [],
            }),
          })
          if (imgRes.ok) {
            const imgData = await imgRes.json()
            if (imgData.ok && imgData.images) generatedImages = imgData.images
          }
        } catch { /* use fallbacks */ }

        // Try composed generation
        const composedHtml = tryComposedGeneration(plan, generatedImages)
        if (composedHtml) {
          html = composedHtml
          dispatch({ type: 'BUILD_PROGRESS', status: 'Site composed!', progress: 95 })
        } else {
          // Streaming fallback
          const { systemPrompt, userPrompt } = buildPromptFromPlan(plan)
          try {
            dispatch({ type: 'BUILD_PROGRESS', status: 'AI generating...', progress: 40 })
            const res = await fetch('/api/ai/generate-site-stream', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ systemPrompt, userPrompt, siteName: plan.siteName || siteName, locale: state.locale }),
            })
            if (res.ok && res.body) {
              const reader = res.body.getReader()
              const decoder = new TextDecoder()
              let buf = ''
              try {
                while (true) {
                  const { done, value } = await reader.read()
                  if (done) break
                  buf += decoder.decode(value, { stream: true })
                  const lines = buf.split('\n')
                  buf = lines.pop() || ''
                  for (const line of lines) {
                    if (!line.startsWith('data: ')) continue
                    try {
                      const ev = JSON.parse(line.slice(6))
                      if (ev.type === 'chunk' && ev.text) html += ev.text
                    } catch { /* skip */ }
                  }
                }
              } finally { reader.releaseLock() }
              html = html.trim().replace(/^\s*```(?:html|HTML)?\s*\n?/, '').replace(/\n?\s*```\s*$/, '').trim()
            }
          } catch { /* fall through */ }
        }
      }
    }

    // ─── Fallback: compose from default plan (no API needed) ───────────
    if (!html || html.length < 500) {
      dispatch({ type: 'BUILD_PROGRESS', status: state.locale === 'he' ? 'בונה אתר מתבנית...' : 'Building from template...', progress: 60 })

      if (state.scanResult) {
        html = rebuildSite(state.scanResult)
      } else {
        // Create an industry-tailored plan — varies sections, colors, and variants per business type
        const isHeFallback = state.locale === 'he'
        const industry = ((effectiveContext.industry as string) || state.description || 'business').toLowerCase()

        // Industry-specific color palettes
        const industryPalettes: Record<string, Record<string, string>> = {
          restaurant: { primary: '#D97706', secondary: '#991B1B', accent: '#F59E0B', background: '#1C1412', text: '#FEF3C7' },
          food: { primary: '#D97706', secondary: '#991B1B', accent: '#F59E0B', background: '#1C1412', text: '#FEF3C7' },
          beauty: { primary: '#EC4899', secondary: '#A855F7', accent: '#F9A8D4', background: '#1A0E17', text: '#FDF2F8' },
          salon: { primary: '#EC4899', secondary: '#A855F7', accent: '#F9A8D4', background: '#1A0E17', text: '#FDF2F8' },
          spa: { primary: '#EC4899', secondary: '#A855F7', accent: '#F9A8D4', background: '#1A0E17', text: '#FDF2F8' },
          law: { primary: '#1E3A5F', secondary: '#92400E', accent: '#D4A574', background: '#0F1419', text: '#E2E8F0' },
          finance: { primary: '#1E3A5F', secondary: '#0D9488', accent: '#D4A574', background: '#0F1419', text: '#E2E8F0' },
          tech: { primary: '#3B82F6', secondary: '#06B6D4', accent: '#8B5CF6', background: '#0B0F1A', text: '#F1F5F9' },
          saas: { primary: '#3B82F6', secondary: '#06B6D4', accent: '#8B5CF6', background: '#0B0F1A', text: '#F1F5F9' },
          realestate: { primary: '#0D9488', secondary: '#1E3A5F', accent: '#D97706', background: '#0F1419', text: '#F0FDFA' },
          fitness: { primary: '#EF4444', secondary: '#F97316', accent: '#FBBF24', background: '#1A0A0A', text: '#FEF2F2' },
          ecommerce: { primary: '#8B5CF6', secondary: '#EC4899', accent: '#F59E0B', background: '#0F0B1A', text: '#F5F3FF' },
          watches: { primary: '#D4A574', secondary: '#1E293B', accent: '#F59E0B', background: '#0A0A0F', text: '#E2E8F0' },
          interior: { primary: '#A3886D', secondary: '#2D3748', accent: '#D69E2E', background: '#121210', text: '#F7FAFC' },
          design: { primary: '#A3886D', secondary: '#2D3748', accent: '#D69E2E', background: '#121210', text: '#F7FAFC' },
        }

        // Industry-specific section+variant combos
        const industryVariants: Record<string, { hero: string; features: string; extra: { type: string; variantId: string; title: string }[] }> = {
          restaurant: { hero: 'hero-split-image', features: 'features-zigzag', extra: [
            { type: 'gallery', variantId: 'gallery-masonry', title: isHeFallback ? 'התפריט שלנו' : 'Our Menu' },
            { type: 'about', variantId: 'about-story', title: isHeFallback ? 'הסיפור שלנו' : 'Our Story' },
          ]},
          food: { hero: 'hero-split-image', features: 'features-zigzag', extra: [
            { type: 'gallery', variantId: 'gallery-masonry', title: isHeFallback ? 'התפריט שלנו' : 'Our Menu' },
          ]},
          beauty: { hero: 'hero-parallax-layers', features: 'features-hoverable-cards', extra: [
            { type: 'pricing', variantId: 'pricing-animated-cards', title: isHeFallback ? 'המחירון שלנו' : 'Our Pricing' },
            { type: 'gallery', variantId: 'gallery-before-after', title: isHeFallback ? 'לפני ואחרי' : 'Before & After' },
          ]},
          salon: { hero: 'hero-parallax-layers', features: 'features-hoverable-cards', extra: [
            { type: 'pricing', variantId: 'pricing-animated-cards', title: isHeFallback ? 'המחירון שלנו' : 'Our Pricing' },
          ]},
          law: { hero: 'hero-minimal-text', features: 'features-icon-grid', extra: [
            { type: 'team', variantId: 'team-grid', title: isHeFallback ? 'הצוות שלנו' : 'Our Team' },
            { type: 'faq', variantId: 'faq-accordion', title: isHeFallback ? 'שאלות נפוצות' : 'FAQ' },
          ]},
          finance: { hero: 'hero-minimal-text', features: 'features-tabs', extra: [
            { type: 'stats', variantId: 'stats-counter', title: isHeFallback ? 'המספרים שלנו' : 'Our Numbers' },
          ]},
          tech: { hero: 'hero-aurora', features: 'features-bento-grid', extra: [
            { type: 'how-it-works', variantId: 'how-it-works-steps', title: isHeFallback ? 'איך זה עובד' : 'How It Works' },
            { type: 'pricing', variantId: 'pricing-toggle', title: isHeFallback ? 'תוכניות מחירים' : 'Pricing Plans' },
          ]},
          saas: { hero: 'hero-gradient-mesh', features: 'features-bento-grid', extra: [
            { type: 'how-it-works', variantId: 'how-it-works-steps', title: isHeFallback ? 'איך זה עובד' : 'How It Works' },
            { type: 'comparison', variantId: 'comparison-table', title: isHeFallback ? 'למה אנחנו' : 'Why Us' },
          ]},
          realestate: { hero: 'hero-fullscreen-video', features: 'features-carousel', extra: [
            { type: 'gallery', variantId: 'gallery-lightbox', title: isHeFallback ? 'הנכסים שלנו' : 'Our Properties' },
            { type: 'stats', variantId: 'stats-icon-cards', title: isHeFallback ? 'בנתונים' : 'By the Numbers' },
          ]},
          fitness: { hero: 'hero-particles', features: 'features-tabs', extra: [
            { type: 'pricing', variantId: 'pricing-gradient', title: isHeFallback ? 'מסלולים' : 'Plans' },
            { type: 'team', variantId: 'team-carousel', title: isHeFallback ? 'המאמנים שלנו' : 'Our Trainers' },
          ]},
          ecommerce: { hero: 'hero-product-showcase', features: 'features-carousel', extra: [
            { type: 'gallery', variantId: 'gallery-filterable', title: isHeFallback ? 'המוצרים שלנו' : 'Our Products' },
            { type: 'partners', variantId: 'partners-logo-marquee', title: isHeFallback ? 'מותגים' : 'Brands' },
          ]},
          watches: { hero: 'hero-product-showcase', features: 'features-hoverable-cards', extra: [
            { type: 'gallery', variantId: 'gallery-lightbox', title: isHeFallback ? 'הקולקציה' : 'The Collection' },
            { type: 'about', variantId: 'about-story', title: isHeFallback ? 'הסיפור שלנו' : 'Our Story' },
          ]},
          interior: { hero: 'hero-magazine', features: 'features-zigzag', extra: [
            { type: 'portfolio', variantId: 'portfolio-case-study', title: isHeFallback ? 'הפרויקטים שלנו' : 'Our Projects' },
            { type: 'gallery', variantId: 'gallery-masonry', title: isHeFallback ? 'גלריה' : 'Gallery' },
          ]},
          design: { hero: 'hero-magazine', features: 'features-zigzag', extra: [
            { type: 'portfolio', variantId: 'portfolio-grid', title: isHeFallback ? 'עבודות' : 'Portfolio' },
          ]},
        }

        // Find matching industry key from description
        const matchedKey = Object.keys(industryPalettes).find(k => industry.includes(k)) || ''
        const palette = industryPalettes[matchedKey] || { primary: '#7C3AED', secondary: '#06B6D4', accent: '#F59E0B', background: '#0B0F1A', text: '#F1F5F9' }
        const variants = industryVariants[matchedKey] || { hero: 'hero-gradient-mesh', features: 'features-bento-grid', extra: [] }

        // Pick font pair based on industry mood
        const fontPairs: Record<string, { heading: string; body: string }> = {
          restaurant: { heading: isHeFallback ? 'Frank Ruhl Libre' : 'Playfair Display', body: isHeFallback ? 'Assistant' : 'Inter' },
          beauty: { heading: isHeFallback ? 'Bellefair' : 'Cormorant Garamond', body: isHeFallback ? 'Heebo' : 'Inter' },
          law: { heading: isHeFallback ? 'David Libre' : 'Lora', body: isHeFallback ? 'Heebo' : 'Inter' },
          tech: { heading: isHeFallback ? 'Heebo' : 'Space Grotesk', body: isHeFallback ? 'Assistant' : 'Inter' },
          fitness: { heading: isHeFallback ? 'Secular One' : 'Oswald', body: isHeFallback ? 'Heebo' : 'Inter' },
          watches: { heading: isHeFallback ? 'Suez One' : 'Cormorant Garamond', body: isHeFallback ? 'Heebo' : 'Inter' },
          interior: { heading: isHeFallback ? 'Frank Ruhl Libre' : 'Playfair Display', body: isHeFallback ? 'Assistant' : 'Inter' },
        }
        const fonts = fontPairs[matchedKey] || { heading: isHeFallback ? 'Heebo' : 'Inter', body: isHeFallback ? 'Assistant' : 'Inter' }

        // Build sections list — varies per industry
        const sections: BuildPlan['pages'][0]['sections'] = [
          { type: 'navbar', variantId: matchedKey === 'law' ? 'navbar-minimal' : matchedKey === 'ecommerce' ? 'navbar-mega-menu' : 'navbar-floating', title: siteName },
          { type: 'hero', variantId: variants.hero, headline: siteName, subheadline: state.description, cta: { text: isHeFallback ? 'צור קשר' : 'Get Started', action: 'scroll-to-contact' } },
          { type: 'features', variantId: variants.features, title: isHeFallback ? 'השירותים שלנו' : 'Our Services' },
          ...variants.extra,
          { type: 'testimonials', variantId: matchedKey === 'law' ? 'testimonials-featured' : matchedKey === 'beauty' ? 'testimonials-before-after' : 'testimonials-carousel', title: isHeFallback ? 'מה הלקוחות אומרים' : 'What Our Clients Say' },
          { type: 'cta', variantId: matchedKey === 'tech' ? 'cta-glassmorphism' : matchedKey === 'fitness' ? 'cta-video-background' : 'cta-gradient-banner', title: isHeFallback ? 'מוכנים להתחיל?' : 'Ready to Get Started?', cta: { text: isHeFallback ? 'דברו איתנו' : 'Contact Us', action: 'scroll-to-contact' } },
          { type: 'contact', variantId: 'contact-form-map', title: isHeFallback ? 'צור קשר' : 'Contact Us' },
          { type: 'footer', variantId: matchedKey === 'tech' ? 'footer-mega' : 'footer-multi-column', title: siteName },
        ]

        const defaultPlan: BuildPlan = {
          siteName: siteName,
          industry: (effectiveContext.industry as string) || state.description || 'business',
          designStyle: matchedKey === 'law' ? 'classic' : matchedKey === 'tech' ? 'futuristic' : matchedKey === 'beauty' ? 'elegant' : 'modern',
          colorPalette: palette,
          typography: { headingFont: fonts.heading, bodyFont: fonts.body },
          layout: { maxWidth: '1200px' },
          contentTone: 'professional',
          conversionStrategy: { mainCTA: isHeFallback ? 'צור קשר' : 'Contact Us' },
          seoStrategy: {},
          motionPreset: { scrollReveal: true },
          pages: [{ name: 'Home', slug: '/', purpose: 'homepage', sections }],
        }
        const composedFallback = tryComposedGeneration(defaultPlan, {})
        if (composedFallback) {
          html = composedFallback
          plan = defaultPlan
          dispatch({ type: 'BUILD_PROGRESS', status: state.locale === 'he' ? 'האתר מוכן!' : 'Site ready!', progress: 95 })
        }
      }
    }

    // ─── Save and navigate ──────────────────────────────────────────────
    // Final cleanup — ensure no markdown fences remain
    if (html) {
      html = html.trim()
      html = html.replace(/^\s*```(?:html|HTML)?\s*\n?/, '')
      html = html.replace(/\n?\s*```\s*$/, '')
      html = html.trim()
    }

    console.log(`[Build] Final HTML: ${html?.length || 0} chars, has DOCTYPE: ${html?.includes('<!DOCTYPE') || false}`)

    if (html && html.length > 100) {
      dispatch({ type: 'BUILD_PROGRESS', status: 'Saving your site...', progress: 100 })
      // Use real DB siteId from pipeline if available, otherwise generate local one
      const siteId = realSiteId || `site_${Date.now()}`
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
      console.log(`[Build] Saved site ${siteId} with ${html.length} chars of HTML`)

      // Also save the build plan for the editor to reference
      if (plan) {
        localStorage.setItem(`ubuilder_plan_${siteId}`, JSON.stringify(plan))
      }

      // Persist to database (fire-and-forget) — skip if pipeline already created the site
      if (!realSiteId) {
        createSite({
          id: siteId,
          name: siteName,
          slug,
          html,
          buildPlan: plan || undefined,
          industry: plan?.industry || undefined,
          primaryColor: plan?.colorPalette?.primary || '#7C3AED',
          sourceUrl: state.url || undefined,
        }).catch(err => console.warn('[Build] DB sync failed:', err))
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
    <div className={`min-h-[100dvh] bg-bg px-0 py-0 sm:px-4 sm:py-8 md:py-12${state.locale === 'he' ? ' rtl' : ''}`} dir={state.locale === 'he' ? 'rtl' : 'ltr'}>
      {/* Language selector — shown at top of input step */}
      {state.step === 'input' && (
        <div className="flex justify-center pt-4 pb-2 sm:pt-0 sm:pb-4">
          <div className="inline-flex items-center rounded-xl border border-border bg-bg-secondary p-1 gap-1">
            <button
              onClick={() => dispatch({ type: 'SET_LOCALE', value: 'en' })}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                state.locale === 'en'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text hover:bg-bg-tertiary'
              }`}
              aria-label="English language"
            >
              English
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_LOCALE', value: 'he' })}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                state.locale === 'he'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text hover:bg-bg-tertiary'
              }`}
              aria-label="Hebrew language"
            >
              עברית
            </button>
          </div>
        </div>
      )}

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
          sourceOwnership={state.sourceOwnership}
          onSourceOwnershipChange={(v) => dispatch({ type: 'SET_SOURCE_OWNERSHIP', value: v })}
          scanMode={state.scanMode}
          onScanModeChange={(v) => dispatch({ type: 'SET_SCAN_MODE', scanMode: v })}
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
