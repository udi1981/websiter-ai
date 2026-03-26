'use client'

import { useReducer, useCallback, useRef, useState, useEffect } from 'react'
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

type Step = 'welcome' | 'describe' | 'import-site' | 'inspiration' | 'questions' | 'summary' | 'building' | 'input' | 'discovery' | 'generating'

type EntryPath = 'describe' | 'import' | 'inspiration' | null
type PreserveMode = 'preserve' | 'rebuild'
type LanguageMode = 'he' | 'en' | 'bilingual'

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
  // Onboarding v2
  entryPath: EntryPath
  languageMode: LanguageMode
  primaryLanguage: 'he' | 'en'
  preserveMode: PreserveMode
  inspirationLikes: string[]
  questionAnswers: Record<string, string>
  questionIndex: number
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
  | { type: 'SET_ENTRY_PATH'; path: EntryPath }
  | { type: 'SET_LANGUAGE_MODE'; mode: LanguageMode }
  | { type: 'SET_PRIMARY_LANGUAGE'; lang: 'he' | 'en' }
  | { type: 'SET_PRESERVE_MODE'; mode: PreserveMode }
  | { type: 'TOGGLE_INSPIRATION_LIKE'; value: string }
  | { type: 'SET_QUESTION_ANSWER'; key: string; value: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'GO_STEP'; step: Step }

const initialState: State = {
  step: 'welcome',
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
  entryPath: null,
  languageMode: 'he',
  primaryLanguage: 'he',
  preserveMode: 'preserve',
  inspirationLikes: [],
  questionAnswers: {},
  questionIndex: 0,
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
      // Don't override 'building' step — new onboarding stays on building screen
      return { ...state, step: state.step === 'building' ? 'building' : 'discovery' }
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
    case 'SET_ENTRY_PATH':
      return { ...state, entryPath: action.path }
    case 'SET_LANGUAGE_MODE': {
      const locale = action.mode === 'en' ? 'en' : 'he'
      return { ...state, languageMode: action.mode, locale, primaryLanguage: locale as 'he' | 'en' }
    }
    case 'SET_PRIMARY_LANGUAGE':
      return { ...state, primaryLanguage: action.lang, locale: action.lang }
    case 'SET_PRESERVE_MODE':
      return { ...state, preserveMode: action.mode }
    case 'TOGGLE_INSPIRATION_LIKE': {
      const likes = state.inspirationLikes.includes(action.value)
        ? state.inspirationLikes.filter(l => l !== action.value)
        : [...state.inspirationLikes, action.value]
      return { ...state, inspirationLikes: likes }
    }
    case 'SET_QUESTION_ANSWER':
      return { ...state, questionAnswers: { ...state.questionAnswers, [action.key]: action.value } }
    case 'NEXT_QUESTION':
      return { ...state, questionIndex: state.questionIndex + 1 }
    case 'GO_STEP':
      return { ...state, step: action.step }
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
      const pipelineTimeout = setTimeout(() => pipelineController.abort(), 600000) // 5 min max

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
          uploadedLogo: state.uploadedImage || undefined,
          documentText: state.documentText || undefined,
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

    // ─── RECOVERY: If SSE stream ended before HTML arrived, fetch from DB ──────
    if ((!html || html.length < 500) && realSiteId) {
      console.log('[Build] SSE stream ended before HTML — fetching from DB for site:', realSiteId)
      dispatch({ type: 'BUILD_PROGRESS', status: '⏳ Retrieving generated site...', progress: 95 })
      try {
        // Wait a few seconds for server-side build to finish
        await new Promise(r => setTimeout(r, 5000))
        const siteRes = await fetch(`/api/sites/${realSiteId}`, { headers: getAuthHeaders() })
        if (siteRes.ok) {
          const siteData = await siteRes.json()
          if (siteData.ok && siteData.data?.html && siteData.data.html.length > 1000) {
            html = siteData.data.html
            console.log(`[Build] Recovered HTML from DB: ${html.length} chars`)
          }
        }
      } catch (fetchErr) {
        console.warn('[Build] DB fetch failed:', fetchErr)
      }
    }

    // ─── FALLBACK: Old inline flow (only if pipeline AND DB recovery both failed) ──────
    if (!html || html.length < 500) {
      console.log('[Build] No HTML from pipeline or DB, using old planning flow')
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

  // ─── Onboarding Helpers ──────────────────────────────────────────────────

  const isHe = state.locale === 'he'
  const t = (he: string, en: string) => isHe ? he : en

  // File upload handler for enrichment chips
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      if (file.type.startsWith('image/')) {
        dispatch({ type: 'SET_IMAGE', value: text })
      } else {
        // Extract text from document
        const content = text.slice(0, 10000)
        dispatch({ type: 'APPEND_DOCUMENT_TEXT', value: content })
      }
    }
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file)
    } else {
      reader.readAsText(file)
    }
    e.target.value = '' // reset
  }, [])

  // Navigate to a path screen from welcome
  const goToPath = useCallback((path: EntryPath) => {
    dispatch({ type: 'SET_ENTRY_PATH', path })
    if (path === 'describe') {
      dispatch({ type: 'GO_STEP', step: 'describe' })
    } else if (path === 'import') {
      dispatch({ type: 'SET_SOURCE_OWNERSHIP', value: 'self_owned' })
      dispatch({ type: 'SET_SCAN_MODE', scanMode: 'copy' })
      dispatch({ type: 'GO_STEP', step: 'import-site' })
    } else if (path === 'inspiration') {
      dispatch({ type: 'SET_SOURCE_OWNERSHIP', value: 'third_party' })
      dispatch({ type: 'SET_SCAN_MODE', scanMode: 'inspiration' })
      dispatch({ type: 'GO_STEP', step: 'inspiration' })
    }
  }, [])

  // Start scan + build from import/inspiration screens
  const handleStartScanAndBuild = useCallback(async () => {
    dispatch({ type: 'GO_STEP', step: 'summary' })
  }, [])

  // Start build from summary — merges onboarding answers, then triggers pipeline
  const handleConfirmBuild = useCallback(async () => {
    dispatch({ type: 'GO_STEP', step: 'building' })
    dispatch({ type: 'START_BUILD' })

    // Enrich discoveryContext with onboarding question answers
    const enrichedContext = {
      ...state.discoveryContext,
      ...state.questionAnswers,
      preserveMode: state.preserveMode,
      inspirationLikes: state.inspirationLikes,
      languageMode: state.languageMode,
      primaryLanguage: state.primaryLanguage,
      entryPath: state.entryPath,
    }
    // Set enriched context via a single AI_RESPONSE dispatch
    dispatch({
      type: 'AI_RESPONSE',
      message: { id: 'onboarding-summary', role: 'system', content: 'Onboarding complete' },
      context: enrichedContext,
      progress: { current: 1, total: 1 },
      ready: true,
    })

    // If URL present (import-site or inspiration flow), trigger scan then build
    // Skip discovery — not needed when we already have a URL to scan
    if (state.url.trim().length > 5) {
      // Start scan directly, then build after scan completes
      const scanThenBuild = async () => {
        // Heartbeat lives outside try so it can be cleared in catch
        let heartbeatProgress = 3
        let heartbeat: ReturnType<typeof setInterval> | null = null
        const isHe = state.locale === 'he'

        try {
          const url = state.url.trim().startsWith('http') ? state.url.trim() : `https://${state.url.trim()}`
          const ownership = state.sourceOwnership || 'third_party'
          const mode = state.scanMode || 'inspiration'

          dispatch({ type: 'SCAN_START' })
          dispatch({ type: 'BUILD_PROGRESS', status: isHe ? '🔍 בודקים סריקות קודמות...' : '🔍 Checking for previous scans...', progress: 2 })

          // Try to reuse a recent completed scan for the same URL
          // Mode 3 (rebuild) always forces a fresh scan to get perPageSections
          let existingScanJobId: string | undefined
          const forceRescan = state.preserveMode === 'rebuild'
          if (!forceRescan) {
            try {
              const checkRes = await fetch(`/api/scan/check?url=${encodeURIComponent(url)}`, { headers: getAuthHeaders() })
              if (checkRes.ok) {
                const checkData = await checkRes.json()
                if (checkData.ok && checkData.scanJobId) {
                  existingScanJobId = checkData.scanJobId
                  console.log(`[Build] Found existing scan job: ${existingScanJobId}`)
                  dispatch({ type: 'BUILD_PROGRESS', status: isHe ? '✅ נמצאה סריקה קודמת! ממשיכים לבנייה...' : '✅ Found previous scan! Continuing to build...', progress: 40 })
                }
              }
            } catch { /* check failed, will do fresh scan */ }
          } else {
            console.log('[Build] Mode 3 rebuild — forcing fresh scan for perPageSections')
          }

          let scanJobId: string | undefined = existingScanJobId
          let scanResult: Record<string, unknown> | null = null
          const isHeLang = isHe

          if (existingScanJobId) {
            // Skip scan, go directly to generation with existing scan data
            console.log('[Build] Skipping scan — using existing job:', existingScanJobId)
          } else {
          dispatch({ type: 'BUILD_PROGRESS', status: isHe ? '🔍 סורקים את האתר...' : '🔍 Scanning your site...', progress: 3 })

          // Heartbeat: increment progress every 6 seconds during long crawl phase
          const crawlMessages = isHe
            ? ['🔍 סורקים עמודים באתר...', '📄 מחפשים תוכן ומוצרים...', '🧩 מזהים מבנה האתר...', '🎨 מנתחים עיצוב...', '📊 מעבדים נתונים...', '🏷️ מחלצים מחירים...', '📱 בודקים רספונסיביות...']
            : ['🔍 Crawling pages...', '📄 Finding content...', '🧩 Detecting structure...', '🎨 Analyzing design...', '📊 Processing data...', '🏷️ Extracting prices...', '📱 Checking responsiveness...']
          let msgIdx = 0
          heartbeat = setInterval(() => {
            // Keep advancing slowly — scan can take 2+ minutes for product enrichment
            if (heartbeatProgress < 40) {
              heartbeatProgress += 1.5
              msgIdx++
              dispatch({ type: 'BUILD_PROGRESS', status: crawlMessages[msgIdx % crawlMessages.length], progress: Math.round(heartbeatProgress) })
            } else if (heartbeatProgress < 42) {
              // Very slow final crawl — still show life
              heartbeatProgress += 0.5
              dispatch({ type: 'BUILD_PROGRESS', status: isHe ? '⏳ עוד רגע, מסיימים לנתח...' : '⏳ Almost done analyzing...', progress: Math.round(heartbeatProgress) })
            }
          }, 5000) // Every 5 seconds

          const scanController = new AbortController()
          const scanTimeout = setTimeout(() => scanController.abort(), 180000) // 3 min max

          const res = await fetch('/api/scan/v2/deep', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ url, sourceOwnership: ownership, scanMode: mode }),
            signal: scanController.signal,
          })

          clearTimeout(scanTimeout)
          // NOTE: Do NOT clearInterval(heartbeat) here — the SSE stream is still reading.
          // The heartbeat keeps progress moving while waiting for server SSE events.

          let scanPhaseIdx = 0

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

                  if (eventType === 'phase' && data.phase === 'init' && data.scanJobId) {
                    scanJobId = data.scanJobId
                    dispatch({ type: 'BUILD_PROGRESS', status: isHeLang ? '🔍 מתחילים לסרוק...' : '🔍 Starting scan...', progress: 5 })
                  }

                  if (eventType === 'phase' && data.status === 'running') {
                    // Update status text for each scan phase — ALWAYS use Hebrew when locale is he
                    const phaseNames: Record<string, string> = {
                      discovery: isHeLang ? '🔍 סורקים עמודים באתר...' : '🔍 Crawling pages...',
                      'visual-dna': isHeLang ? '🎨 מנתחים עיצוב ומותג...' : '🎨 Analyzing design...',
                      components: isHeLang ? '🧩 מזהים רכיבים ותבניות...' : '🧩 Detecting components...',
                      content: isHeLang ? '📄 מחלצים תוכן ומוצרים...' : '📄 Extracting content...',
                      'brand-intelligence': isHeLang ? '💡 מנתחים מותג ושוק...' : '💡 Analyzing brand...',
                      technical: isHeLang ? '⚙️ ניתוח טכני ומבנה...' : '⚙️ Technical analysis...',
                      'strategic-insights': isHeLang ? '📊 בונים אסטרטגיה...' : '📊 Strategic analysis...',
                    }
                    // Always use our Hebrew label, ignore English server description
                    const label = phaseNames[data.phase] || (isHeLang ? '🔍 סורקים...' : 'Scanning...')
                    scanPhaseIdx++
                    // Jump heartbeat forward to match real phase progress
                    heartbeatProgress = Math.max(heartbeatProgress, 5 + scanPhaseIdx * 5)
                    dispatch({ type: 'BUILD_PROGRESS', status: label, progress: Math.min(heartbeatProgress, 38) })
                  }

                  if (eventType === 'phase' && data.status === 'done') {
                    scanPhaseIdx++
                    heartbeatProgress = Math.max(heartbeatProgress, 5 + scanPhaseIdx * 5)
                    const phaseDoneLabels: Record<string, string> = {
                      'content-extraction': isHeLang ? '📦 מחלצים מוצרים ומחירים...' : '📦 Extracting products...',
                      'discovery': isHeLang ? '✓ סריקת עמודים הושלמה' : '✓ Page crawl complete',
                      'visual-dna': isHeLang ? '✓ ניתוח עיצוב הושלם' : '✓ Design analysis complete',
                      'content': isHeLang ? '✓ תוכן חולץ בהצלחה' : '✓ Content extracted',
                    }
                    const doneLabel = phaseDoneLabels[data.phase] || ''
                    if (doneLabel) dispatch({ type: 'BUILD_PROGRESS', status: doneLabel, progress: Math.min(heartbeatProgress, 40) })
                  }

                  if (eventType === 'progress') {
                    const serverPct = data.percent || 0
                    const mappedPct = Math.max(5, Math.min(Math.round(serverPct * 0.4), 40))
                    heartbeatProgress = Math.max(heartbeatProgress, mappedPct)
                    const msg = (isHeLang && serverPct === 100)
                      ? '✅ הסריקה הושלמה!'
                      : data.message || (isHeLang ? 'סורקים...' : 'Scanning...')
                    dispatch({ type: 'BUILD_PROGRESS', status: msg, progress: heartbeatProgress })
                  }

                  if (eventType === 'result' && data.ok) {
                    scanResult = data.data as Record<string, unknown>
                    clearInterval(heartbeat) // NOW stop heartbeat — scan is truly done
                    dispatch({
                      type: 'SCAN_DONE',
                      result: data.data,
                      deepData: data.data,
                      scanJobId,
                    })
                  }
                } catch { /* skip malformed SSE lines */ }
              }
            }
            reader.releaseLock()
          } else {
            console.warn('[Build] Scan failed, proceeding without scan data')
            dispatch({ type: 'SCAN_ERROR' })
          }

          // Stop heartbeat — scan SSE stream is done (success or failure)
          clearInterval(heartbeat)
          } // end of else (fresh scan) block

          // Now trigger the actual generation pipeline directly with scan data
          dispatch({ type: 'BUILD_PROGRESS', status: isHeLang ? '🚀 מתחילים לבנות את האתר...' : '🚀 Starting generation...', progress: 42 })

          const pipelineController = new AbortController()
          const pipelineTimeout = setTimeout(() => pipelineController.abort(), 600000)

          const pipelineRes = await fetch('/api/ai/pipeline', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              description: state.description || `${state.url.trim()} - imported site`,
              locale: state.locale,
              discoveryContext: enrichedContext,
              deepScanData: scanResult || null,
              scanJobId: scanJobId || undefined,
              scanMode: mode,
              sourceOwnership: ownership,
              uploadedLogo: state.uploadedImage || undefined,
              documentText: state.documentText || undefined,
            }),
            signal: pipelineController.signal,
          })

          if (!pipelineRes.ok) {
            const errText = await pipelineRes.text().catch(() => 'Unknown error')
            throw new Error(`Pipeline returned ${pipelineRes.status}: ${errText.slice(0, 200)}`)
          }

          let html = ''
          let realSiteId: string | null = null
          let realJobId: string | null = null

          if (pipelineRes.body) {
            const pReader = pipelineRes.body.getReader()
            const pDecoder = new TextDecoder()
            let pBuffer = ''

            const phaseProgress: Record<string, number> = {
              init: 42, strategy: 50, design: 60, content: 70, images: 78, build: 85, qa: 90, cpo: 95, complete: 100,
            }
            const phaseLabels: Record<string, string> = {
              strategy: state.locale === 'he' ? '🧠 מנתחים אסטרטגיה...' : '🧠 Analyzing strategy...',
              design: state.locale === 'he' ? '🎨 מעצבים...' : '🎨 Designing...',
              content: state.locale === 'he' ? '✍️ כותבים תוכן...' : '✍️ Writing content...',
              images: state.locale === 'he' ? '🖼️ מכינים תמונות...' : '🖼️ Preparing images...',
              build: state.locale === 'he' ? '🏗️ בונים את האתר...' : '🏗️ Building site...',
              qa: state.locale === 'he' ? '🔍 בודקים איכות...' : '🔍 Quality check...',
              cpo: state.locale === 'he' ? '⭐ סקירה סופית...' : '⭐ Final review...',
              complete: state.locale === 'he' ? '✅ האתר מוכן!' : '✅ Site ready!',
            }

            try {
              while (true) {
                const { done, value } = await pReader.read()
                if (done) break
                pBuffer += pDecoder.decode(value, { stream: true })
                const pLines = pBuffer.split('\n')
                pBuffer = pLines.pop() || ''

                for (const line of pLines) {
                  if (!line.startsWith('data: ')) continue
                  try {
                    const event = JSON.parse(line.slice(6))
                    const phase = event.phase as string

                    if (phase === 'init' && event.siteId) {
                      realSiteId = event.siteId
                      realJobId = event.jobId || null
                    }

                    const progress = phaseProgress[phase] || 50
                    const label = phaseLabels[phase] || `${phase}...`
                    dispatch({ type: 'BUILD_PROGRESS', status: label, progress })

                    if ((phase === 'complete' || phase === 'build') && event.html) {
                      html = event.html
                    }
                    if (phase === 'error') {
                      throw new Error(event.error)
                    }
                  } catch (parseErr) {
                    if (parseErr instanceof Error && parseErr.message.startsWith('[Pipeline]')) throw parseErr
                    /* skip malformed SSE lines */
                  }
                }
              }
            } finally {
              pReader.releaseLock()
            }
          }
          clearTimeout(pipelineTimeout)

          // DB recovery if SSE ended before HTML arrived
          if ((!html || html.length < 500) && realSiteId) {
            await new Promise(r => setTimeout(r, 5000))
            try {
              const siteRes = await fetch(`/api/sites/${realSiteId}`, { headers: getAuthHeaders() })
              if (siteRes.ok) {
                const siteData = await siteRes.json()
                if (siteData.ok && siteData.data?.html?.length > 1000) {
                  html = siteData.data.html
                }
              }
            } catch { /* */ }
          }

          if (html && html.length > 500) {
            const siteId = realSiteId || `site_${Date.now()}`
            const slug = (enrichedContext.business_name || 'site').toString().toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'site'
            const savedSites = (() => { try { return JSON.parse(localStorage.getItem('ubuilder_sites') || '[]') } catch { return [] } })()
            savedSites.push({ id: siteId, name: enrichedContext.business_name || state.description?.slice(0, 30) || 'New Site', status: 'draft', lastEdited: 'Just now', url: `${slug}.ubuilder.co` })
            localStorage.setItem('ubuilder_sites', JSON.stringify(savedSites))
            localStorage.setItem(`ubuilder_html_${siteId}`, html)
            dispatch({ type: 'BUILD_DONE' })
            router.push(`/editor/${siteId}`)
          } else {
            dispatch({ type: 'BUILD_ERROR', error: state.locale === 'he' ? 'לא הצלחנו לבנות את האתר. נסו שוב.' : 'Generation failed. Please try again.' })
          }
        } catch (err) {
          if (heartbeat) clearInterval(heartbeat)
          console.error('[Build] Scan+build failed:', err)
          dispatch({ type: 'BUILD_ERROR', error: isHe ? 'שגיאה בסריקת האתר. נסו שוב.' : 'Site scan failed. Please try again.' })
        }
      }

      await scanThenBuild()
    } else {
      await handleBuild()
    }
  }, [state.url, state.discoveryContext, state.questionAnswers, state.preserveMode, state.inspirationLikes, state.languageMode, state.primaryLanguage, state.entryPath, handleContinue, handleBuild])

  // Questions flow
  const questions = [
    {
      key: 'purpose',
      question: t('מה המטרה העיקרית של האתר?', 'What is the main purpose of your website?'),
      chips: [
        { label: t('🛒 למכור מוצרים', '🛒 Sell products'), value: 'sell' },
        { label: t('📞 ליצור קשר', '📞 Get contacts'), value: 'contact' },
        { label: t('💼 להציג שירותים', '💼 Show services'), value: 'services' },
        { label: t('📖 לספק מידע', '📖 Provide info'), value: 'info' },
      ],
      required: true,
    },
    {
      key: 'sections',
      question: t('מה חשוב שיופיע באתר?', 'What should appear on your site?'),
      chips: [
        { label: t('🛍️ מוצרים', '🛍️ Products'), value: 'products' },
        { label: t('💰 מחירון', '💰 Pricing'), value: 'pricing' },
        { label: t('❓ שאלות נפוצות', '❓ FAQ'), value: 'faq' },
        { label: t('📸 גלריה', '📸 Gallery'), value: 'gallery' },
        { label: t('📝 טופס', '📝 Contact form'), value: 'form' },
        { label: t('⭐ המלצות', '⭐ Testimonials'), value: 'testimonials' },
      ],
      required: true,
      multiSelect: true,
    },
  ]

  const conditionalQuestions = [
    {
      key: 'productCount',
      question: t('כמה מוצרים יש לכם בערך?', 'How many products do you have?'),
      chips: [
        { label: '1-5', value: '1-5' },
        { label: '6-20', value: '6-20' },
        { label: '21-100', value: '21-100' },
        { label: '100+', value: '100+' },
      ],
      condition: () => state.questionAnswers.purpose === 'sell',
    },
    {
      key: 'style',
      question: t('מה הסגנון שמתאים לכם?', 'What style fits you?'),
      chips: [
        { label: t('🎯 מודרני', '🎯 Modern'), value: 'modern' },
        { label: t('🏛️ קלאסי', '🏛️ Classic'), value: 'classic' },
        { label: t('✨ מינימליסטי', '✨ Minimalist'), value: 'minimal' },
        { label: t('🎨 נועז', '🎨 Bold'), value: 'bold' },
        { label: t('🤖 תבחרו בשבילי', '🤖 Choose for me'), value: 'auto' },
      ],
      condition: () => !state.url && !state.selectedTemplateId,
    },
  ]

  const activeQuestions = [
    ...questions,
    ...conditionalQuestions.filter(q => q.condition()),
  ]
  const currentQuestion = activeQuestions[state.questionIndex]
  const isLastQuestion = state.questionIndex >= activeQuestions.length - 1

  // Build summary items
  const summaryItems = [
    { icon: '🏢', label: t('עסק', 'Business'), value: state.description.slice(0, 80) || t('(לא צוין)', '(not specified)') },
    { icon: '🌐', label: t('שפה', 'Language'), value: state.languageMode === 'bilingual' ? t(`דו-לשוני (${state.primaryLanguage === 'he' ? 'עברית ראשית' : 'English first'})`, `Bilingual (${state.primaryLanguage === 'he' ? 'Hebrew first' : 'English first'})`) : state.locale === 'he' ? 'עברית' : 'English' },
    ...(state.questionAnswers.purpose ? [{ icon: '🎯', label: t('מטרה', 'Purpose'), value: { sell: t('מכירת מוצרים', 'Sell products'), contact: t('יצירת קשר', 'Get contacts'), services: t('הצגת שירותים', 'Show services'), info: t('מידע', 'Information') }[state.questionAnswers.purpose] || state.questionAnswers.purpose }] : []),
    ...(state.url ? [{ icon: '🔗', label: t('אתר מקור', 'Source site'), value: state.url.replace(/^https?:\/\//, '').slice(0, 40) }] : []),
    ...(state.entryPath === 'import' ? [{ icon: state.preserveMode === 'preserve' ? '🛡️' : '🔄', label: t('אסטרטגיה', 'Strategy'), value: state.preserveMode === 'preserve' ? t('שמירה מלאה', 'Full preserve') : t('שדרוג ובנייה מחדש', 'Rebuild & upgrade') }] : []),
    ...(state.uploadedImage ? [{ icon: '🖼️', label: t('לוגו', 'Logo'), value: t('הועלה ✓', 'Uploaded ✓') }] : []),
    ...(state.documentText ? [{ icon: '📄', label: t('מסמך', 'Document'), value: `${state.documentText.length.toLocaleString()} ${t('תווים', 'chars')}` }] : []),
    ...(state.selectedTemplateId ? [{ icon: '🎨', label: t('תבנית', 'Template'), value: state.selectedTemplateId }] : []),
  ]

  // Progress steps for building screen
  const progressSteps = [
    ...(state.url ? [
      { key: 'scan', label: t('סריקת האתר', 'Site Scanning'), detail: '' },
      { key: 'analyze', label: t('ניתוח עיצוב', 'Design Analysis'), detail: '' },
    ] : []),
    { key: 'strategy', label: t('אסטרטגיה עסקית', 'Business Strategy'), detail: '' },
    { key: 'design', label: t('עיצוב ויזואלי', 'Visual Design'), detail: '' },
    { key: 'content', label: t('כתיבת תוכן', 'Content Writing'), detail: '' },
    { key: 'images', label: t('יצירת מדיה', 'Media Creation'), detail: '' },
    { key: 'build', label: t('הרכבת האתר', 'Site Assembly'), detail: '' },
    { key: 'qa', label: t('בדיקת איכות', 'Quality Check'), detail: '' },
    { key: 'cpo', label: t('אישור סופי', 'Final Approval'), detail: '' },
  ]

  // Map build phase to progress step index
  const phaseToStepIdx: Record<string, number> = {}
  const hasUrl = !!state.url
  if (hasUrl) { phaseToStepIdx['scan'] = 0; phaseToStepIdx['analyze'] = 1 }
  const offset = hasUrl ? 2 : 0
  phaseToStepIdx['strategy'] = offset
  phaseToStepIdx['design'] = offset + 1
  phaseToStepIdx['content'] = offset + 2
  phaseToStepIdx['images'] = offset + 3
  phaseToStepIdx['build'] = offset + 4
  phaseToStepIdx['qa'] = offset + 5
  phaseToStepIdx['cpo'] = offset + 6

  // Parse current phase from buildStatus
  const currentPhaseKey = (() => {
    const s = state.buildStatus.toLowerCase()
    if (s.includes('strategist') || s.includes('strategy') || s.includes('אסטרטג')) return 'strategy'
    if (s.includes('designer') || s.includes('design') || s.includes('עיצוב')) return 'design'
    if (s.includes('content') || s.includes('תוכן') || s.includes('copy')) return 'content'
    if (s.includes('image') || s.includes('media') || s.includes('מדיה')) return 'images'
    if (s.includes('frontend') || s.includes('build') || s.includes('compos') || s.includes('הרכב')) return 'build'
    if (s.includes('qa') || s.includes('quality') || s.includes('בדיק')) return 'qa'
    if (s.includes('cpo') || s.includes('scor') || s.includes('אישור')) return 'cpo'
    if (s.includes('scan') || s.includes('סריק') || s.includes('סורק')) return 'scan'
    return null
  })()
  const currentStepIdx = currentPhaseKey ? (phaseToStepIdx[currentPhaseKey] ?? -1) : -1

  // Fun facts rotation
  const [funFactIdx, setFunFactIdx] = useState(0)
  const funFacts = [
    t('כל אתר נבדק ע״י צוות AI של 7 סוכנים מומחים', 'Every site is reviewed by a team of 7 AI experts'),
    t('האתר שלכם יהיה מותאם לנייד מהרגע הראשון', 'Your site will be mobile-ready from day one'),
    t('אנחנו שומרים את המוצרים, המחירים וה-FAQ שלכם', 'We preserve your products, prices, and FAQs'),
    t('UBuilder מנתח מעל 50 היבטים של האתר שלכם', 'UBuilder analyzes 50+ aspects of your site'),
  ]
  useEffect(() => {
    if (state.step !== 'building') return
    const timer = setInterval(() => setFunFactIdx(i => (i + 1) % funFacts.length), 8000)
    return () => clearInterval(timer)
  }, [state.step, funFacts.length])

  // Live elapsed timer for building screen
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  useEffect(() => {
    if (state.step !== 'building') { setElapsedSeconds(0); return }
    const timer = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [state.step])
  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `0:${sec.toString().padStart(2, '0')}`
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  const containerClass = `min-h-[100dvh] bg-bg${state.locale === 'he' ? ' rtl' : ''}`
  const cardClass = 'group cursor-pointer rounded-2xl border border-border bg-bg-secondary p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5'
  const chipClass = (active: boolean) => `rounded-xl px-4 py-2.5 text-sm font-medium transition-all cursor-pointer border ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-bg-secondary text-text-muted hover:border-primary/30 hover:text-text'}`
  const primaryBtn = 'w-full rounded-xl bg-gradient-to-r from-primary to-primary-hover px-6 py-4 text-center text-base font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'
  const secondaryBtn = 'w-full rounded-xl border border-border px-6 py-3 text-center text-sm font-medium text-text-muted transition-all hover:border-primary/30 hover:text-text'
  const backBtn = 'flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors cursor-pointer'

  // Enrichment chips shared across screens
  const EnrichmentChips = () => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const logoInputRef = useRef<HTMLInputElement>(null)
    return (
      <div>
        <p className="text-sm text-text-muted mb-3">{t('העשירו את האתר שלכם', 'Enrich your site')}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => fileInputRef.current?.click()} className={chipClass(!!state.documentText)}>
            📄 {t('קבצים ותוכן', 'Files & content')} {state.documentText ? '✓' : ''}
          </button>
          <button onClick={() => logoInputRef.current?.click()} className={chipClass(!!state.uploadedImage)}>
            🖼️ {t('לוגו', 'Logo')} {state.uploadedImage ? '✓' : ''}
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.csv,.html" className="hidden" onChange={handleFileUpload} />
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>
        {state.uploadedImage && (
          <div className="mt-2 flex items-center gap-2">
            <img src={state.uploadedImage} alt="Logo" className="h-8 w-auto rounded" />
            <span className="text-xs text-text-muted">{t('לוגו הועלה', 'Logo uploaded')}</span>
            <button onClick={() => dispatch({ type: 'SET_IMAGE', value: null })} className="text-xs text-red-400 hover:text-red-300">✕</button>
          </div>
        )}
        {state.documentText && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-text-muted">📄 {state.documentText.length.toLocaleString()} {t('תווים', 'chars')}</span>
            <button onClick={() => dispatch({ type: 'SET_DOCUMENT_TEXT', value: null })} className="text-xs text-red-400 hover:text-red-300">✕</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={containerClass} dir={state.locale === 'he' ? 'rtl' : 'ltr'}>

      {/* ═══ SCREEN 1: WELCOME ═══ */}
      {state.step === 'welcome' && (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-xl space-y-8 text-center">
            <div>
              <div className="mb-4 text-4xl">⚡</div>
              <h1 className="text-3xl font-bold text-text sm:text-4xl">{t('בואו נבנה את האתר המושלם שלכם', "Let's build your perfect website")}</h1>
              <p className="mt-3 text-base text-text-muted">{t('ספרו לנו איך תרצו להתחיל — אנחנו נדאג לשאר', "Tell us how you'd like to start — we'll handle the rest")}</p>
            </div>

            <div className="space-y-3">
              <button onClick={() => goToPath('describe')} className={cardClass + ' w-full text-start'}>
                <div className="text-2xl mb-1">✍️</div>
                <div className="font-semibold text-text">{t('ספרו לנו על העסק שלכם', 'Describe your business')}</div>
                <div className="text-sm text-text-muted mt-1">{t('"אני אספר מה אני צריך"', '"I\'ll tell you what I need"')}</div>
              </button>

              <button onClick={() => goToPath('import')} className={cardClass + ' w-full text-start'}>
                <div className="text-2xl mb-1">🔗</div>
                <div className="font-semibold text-text">{t('יש לי כבר אתר', 'I already have a website')}</div>
                <div className="text-sm text-text-muted mt-1">{t('"ייבאו ושדרגו את האתר שלי"', '"Import and upgrade my site"')}</div>
              </button>

              <button onClick={() => goToPath('inspiration')} className={cardClass + ' w-full text-start'}>
                <div className="text-2xl mb-1">✨</div>
                <div className="font-semibold text-text">{t('יש לי אתר להשראה', 'I have a website for inspiration')}</div>
                <div className="text-sm text-text-muted mt-1">{t('"בנו לי משהו בהשראת האתר הזה"', '"Build something inspired by this"')}</div>
              </button>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              💡 {t('אפשר לשלב: אתר קיים + קבצים, השראה + לוגו, תבנית + תוכן שלכם', 'You can combine: site + files, inspiration + logo, template + your content')}
            </p>

            <div className="space-y-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{t('שפת האתר', 'Website language')}</p>
              <div className="flex justify-center gap-2">
                {(['he', 'en', 'bilingual'] as LanguageMode[]).map(mode => (
                  <button key={mode} onClick={() => dispatch({ type: 'SET_LANGUAGE_MODE', mode })} className={chipClass(state.languageMode === mode)}>
                    {mode === 'he' ? 'עברית' : mode === 'en' ? 'English' : t('דו-לשוני', 'Bilingual')}
                  </button>
                ))}
              </div>
              {state.languageMode === 'bilingual' && (
                <div className="flex justify-center gap-2 mt-2">
                  <p className="text-xs text-text-muted self-center">{t('שפה ראשית:', 'Primary:')}</p>
                  <button onClick={() => dispatch({ type: 'SET_PRIMARY_LANGUAGE', lang: 'he' })} className={chipClass(state.primaryLanguage === 'he') + ' text-xs !px-3 !py-1.5'}>עברית</button>
                  <button onClick={() => dispatch({ type: 'SET_PRIMARY_LANGUAGE', lang: 'en' })} className={chipClass(state.primaryLanguage === 'en') + ' text-xs !px-3 !py-1.5'}>English</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCREEN 2A: DESCRIBE BUSINESS ═══ */}
      {state.step === 'describe' && (
        <div className="flex min-h-[100dvh] flex-col items-center px-4 py-8">
          <div className="w-full max-w-xl space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={() => dispatch({ type: 'GO_STEP', step: 'welcome' })} className={backBtn}>← {t('חזרה', 'Back')}</button>
              <div className="flex gap-1">
                {(['he', 'en'] as const).map(l => (
                  <button key={l} onClick={() => dispatch({ type: 'SET_LOCALE', value: l })} className={`text-xs px-2 py-1 rounded ${state.locale === l ? 'text-primary font-medium' : 'text-text-muted'}`}>
                    {l === 'he' ? 'עב' : 'EN'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-text">✍️ {t('ספרו לנו על העסק שלכם', 'Describe your business')}</h2>
              <p className="mt-2 text-sm text-text-muted">{t('ככל שתספרו יותר, האתר שלכם יהיה מדויק יותר', 'The more you share, the more precise your site')}</p>
            </div>

            <textarea
              value={state.description}
              onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', value: e.target.value })}
              placeholder={t('תארו את העסק שלכם — מה אתם עושים, למי, ומה מיוחד בכם...', 'Describe your business — what you do, for whom, and what makes you special...')}
              className="w-full rounded-xl border border-border bg-bg-secondary px-4 py-4 text-text placeholder-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[120px] resize-none"
              dir="auto"
            />

            <EnrichmentChips />

            <button
              onClick={() => dispatch({ type: 'GO_STEP', step: 'questions' })}
              disabled={state.description.trim().length < 10}
              className={primaryBtn}
            >
              {t('← המשך', 'Continue →')}
            </button>
          </div>
        </div>
      )}

      {/* ═══ SCREEN 2B: IMPORT OWN WEBSITE ═══ */}
      {state.step === 'import-site' && (
        <div className="flex min-h-[100dvh] flex-col items-center px-4 py-8">
          <div className="w-full max-w-xl space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={() => dispatch({ type: 'GO_STEP', step: 'welcome' })} className={backBtn}>← {t('חזרה', 'Back')}</button>
              <div className="flex gap-1">
                {(['he', 'en'] as const).map(l => (
                  <button key={l} onClick={() => dispatch({ type: 'SET_LOCALE', value: l })} className={`text-xs px-2 py-1 rounded ${state.locale === l ? 'text-primary font-medium' : 'text-text-muted'}`}>
                    {l === 'he' ? 'עב' : 'EN'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-text">🔗 {t('הדביקו את כתובת האתר שלכם', 'Paste your website URL')}</h2>
              <p className="mt-2 text-sm text-text-muted">{t('אנחנו נסרוק את האתר שלכם ונבנה לכם גרסה חדשה', "We'll scan your site and build you a new version")}</p>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 start-4 flex items-center text-text-muted">🔗</span>
              <input
                type="url"
                value={state.url}
                onChange={(e) => dispatch({ type: 'SET_URL', value: e.target.value })}
                placeholder="https://www.example.com"
                className="w-full rounded-xl border border-border bg-bg-secondary ps-12 pe-4 py-4 text-text placeholder-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                dir="ltr"
              />
            </div>

            <div>
              <p className="text-sm text-text-muted mb-3">{t('מה תרצו שנעשה?', 'What should we do?')}</p>
              <div className="space-y-3">
                <button onClick={() => dispatch({ type: 'SET_PRESERVE_MODE', mode: 'preserve' })} className={`${cardClass} w-full text-start ${state.preserveMode === 'preserve' ? '!border-primary bg-primary/5' : ''}`}>
                  <div className="font-semibold text-text">🛡️ {t('שמרו כמה שאפשר', 'Preserve as much as possible')}</div>
                  <div className="text-sm text-text-muted mt-1">{t('מוצרים, תוכן, שאלות, עיצוב — הכל נשמר', 'Products, content, FAQ, design — keep it all')}</div>
                </button>
                <button onClick={() => dispatch({ type: 'SET_PRESERVE_MODE', mode: 'rebuild' })} className={`${cardClass} w-full text-start ${state.preserveMode === 'rebuild' ? '!border-primary bg-primary/5' : ''}`}>
                  <div className="font-semibold text-text">🔄 {t('שדרגו ובנו מחדש', 'Rebuild and upgrade')}</div>
                  <div className="text-sm text-text-muted mt-1">{t('קחו את הבסיס ותנו ל-AI לשדרג את הכל', 'Take the foundation, let AI upgrade everything')}</div>
                </button>
              </div>
            </div>

            <EnrichmentChips />

            <button
              onClick={handleStartScanAndBuild}
              disabled={state.url.trim().length < 5}
              className={primaryBtn}
            >
              {t('← סרקו את האתר שלי', 'Scan my site →')}
            </button>
          </div>
        </div>
      )}

      {/* ═══ SCREEN 2C: INSPIRATION SITE ═══ */}
      {state.step === 'inspiration' && (
        <div className="flex min-h-[100dvh] flex-col items-center px-4 py-8">
          <div className="w-full max-w-xl space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={() => dispatch({ type: 'GO_STEP', step: 'welcome' })} className={backBtn}>← {t('חזרה', 'Back')}</button>
              <div className="flex gap-1">
                {(['he', 'en'] as const).map(l => (
                  <button key={l} onClick={() => dispatch({ type: 'SET_LOCALE', value: l })} className={`text-xs px-2 py-1 rounded ${state.locale === l ? 'text-primary font-medium' : 'text-text-muted'}`}>
                    {l === 'he' ? 'עב' : 'EN'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-text">✨ {t('באיזה אתר אתם רוצים להתעורר?', 'Which site inspires you?')}</h2>
              <p className="mt-2 text-sm text-text-muted">{t('נלמד מהאתר הזה ונבנה לכם משהו מקורי', "We'll learn from this site and build something original")}</p>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 start-4 flex items-center text-text-muted">🔗</span>
              <input
                type="url"
                value={state.url}
                onChange={(e) => dispatch({ type: 'SET_URL', value: e.target.value })}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-border bg-bg-secondary ps-12 pe-4 py-4 text-text placeholder-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                dir="ltr"
              />
            </div>

            <textarea
              value={state.description}
              onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', value: e.target.value })}
              placeholder={t('ספרו לנו על העסק שלכם (חובה)', 'Describe your business (required)')}
              className="w-full rounded-xl border border-border bg-bg-secondary px-4 py-4 text-text placeholder-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[80px] resize-none"
              dir="auto"
            />

            <div>
              <p className="text-sm text-text-muted mb-3">{t('מה אהבתם באתר?', 'What did you like?')}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: t('🎨 צבעים', '🎨 Colors'), value: 'colors' },
                  { label: t('✏️ סגנון', '✏️ Style'), value: 'style' },
                  { label: t('📐 מבנה', '📐 Layout'), value: 'layout' },
                  { label: t('✨ אווירה', '✨ Mood'), value: 'mood' },
                ].map(item => (
                  <button key={item.value} onClick={() => dispatch({ type: 'TOGGLE_INSPIRATION_LIKE', value: item.value })} className={chipClass(state.inspirationLikes.includes(item.value))}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <EnrichmentChips />

            <button
              onClick={handleStartScanAndBuild}
              disabled={state.url.trim().length < 5 || state.description.trim().length < 10}
              className={primaryBtn}
            >
              {t('← סרקו והתחילו', 'Scan & start →')}
            </button>
          </div>
        </div>
      )}

      {/* ═══ SCREEN 3: SMART FOLLOW-UP QUESTIONS ═══ */}
      {state.step === 'questions' && (
        <div className="flex min-h-[100dvh] flex-col items-center px-4 py-8">
          <div className="w-full max-w-xl space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={() => dispatch({ type: 'GO_STEP', step: state.entryPath === 'describe' ? 'describe' : 'welcome' })} className={backBtn}>← {t('חזרה', 'Back')}</button>
              <span className="text-xs text-text-muted">{t('שאלה', 'Question')} {state.questionIndex + 1} / {activeQuestions.length}</span>
            </div>

            {state.questionIndex === 0 && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                <p className="text-sm text-text">🤖 {t('כמה שאלות קצרות שיעזרו לנו לבנות בדיוק את מה שאתם צריכים', 'A few quick questions to help us build exactly what you need')}</p>
              </div>
            )}

            {currentQuestion && (
              <div className="rounded-2xl bg-bg-secondary border border-border p-6 space-y-4">
                <p className="text-lg font-semibold text-text">🤖 {currentQuestion.question}</p>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.chips.map(chip => (
                    <button
                      key={chip.value}
                      onClick={() => {
                        dispatch({ type: 'SET_QUESTION_ANSWER', key: currentQuestion.key, value: chip.value })
                        if (!currentQuestion.multiSelect) {
                          if (isLastQuestion) {
                            dispatch({ type: 'GO_STEP', step: 'summary' })
                          } else {
                            dispatch({ type: 'NEXT_QUESTION' })
                          }
                        }
                      }}
                      className={chipClass(state.questionAnswers[currentQuestion.key] === chip.value)}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                {currentQuestion.multiSelect && (
                  <button
                    onClick={() => {
                      if (isLastQuestion) dispatch({ type: 'GO_STEP', step: 'summary' })
                      else dispatch({ type: 'NEXT_QUESTION' })
                    }}
                    className="text-sm text-primary hover:text-primary-hover font-medium"
                  >
                    {t('← המשך', 'Continue →')}
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => dispatch({ type: 'GO_STEP', step: 'summary' })}
              className={secondaryBtn}
            >
              {t('← דלגו ובנו עכשיו', 'Skip & build now →')}
            </button>

            <div className="flex justify-center gap-1.5">
              {activeQuestions.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= state.questionIndex ? 'bg-primary' : 'bg-border'}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCREEN 4: SUMMARY / CONFIRMATION ═══ */}
      {state.step === 'summary' && (
        <div className="flex min-h-[100dvh] flex-col items-center px-4 py-8">
          <div className="w-full max-w-xl space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={() => {
                const prevStep = state.entryPath === 'describe' ? 'questions' : state.entryPath === 'import' ? 'import-site' : 'inspiration'
                dispatch({ type: 'GO_STEP', step: prevStep })
              }} className={backBtn}>← {t('חזרה', 'Back')}</button>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-text">📋 {t('הנה מה שהבנו — נכון?', "Here's what we understood — correct?")}</h2>
            </div>

            <div className="rounded-2xl bg-bg-secondary border border-border p-6 space-y-3">
              {summaryItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <span className="text-xs text-text-muted uppercase tracking-wider">{item.label}</span>
                    <p className="text-sm text-text font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleConfirmBuild} className={primaryBtn}>
              {t('← בנו את האתר שלי', 'Build my site →')}
            </button>

            <button onClick={() => {
              const prevStep = state.entryPath === 'describe' ? 'describe' : state.entryPath === 'import' ? 'import-site' : 'inspiration'
              dispatch({ type: 'GO_STEP', step: prevStep })
            }} className={secondaryBtn}>
              {t('← חזרה לעריכה', 'Back to edit')}
            </button>
          </div>
        </div>
      )}

      {/* ═══ SCREEN 5: LIVE PROGRESS ═══ */}
      {state.step === 'building' && (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-xl space-y-8 text-center">
            <div>
              <div className="text-4xl mb-3">⚡</div>
              <h2 className="text-2xl font-bold text-text">{t('בונים את האתר שלכם...', 'Building your website...')}</h2>
              <p className="text-sm text-text-muted mt-2">
                {state.url
                  ? t('הסריקה והבנייה לוקחים 5-7 דקות', 'Scanning and building takes 5-7 minutes')
                  : t('הבנייה לוקחת 3-4 דקות', 'Building takes 3-4 minutes')
                }
              </p>
            </div>

            {/* Main progress bar + timer */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-700 ease-out" style={{ width: `${state.buildProgress}%` }} />
              </div>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400/80">{t('המערכת פעילה', 'System active')}</span>
                </div>
                <span className="text-sm text-text-muted font-mono">{formatElapsed(elapsedSeconds)}</span>
                <span className="text-sm text-text-muted">{state.buildProgress}%</span>
              </div>
            </div>

            {/* Active step spotlight */}
            {state.buildStatus && (
              <div className="rounded-2xl bg-bg-secondary border border-primary/20 p-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin text-primary text-xl">🔄</div>
                  <p className="text-base font-medium text-text">{state.buildStatus}</p>
                </div>
              </div>
            )}

            {/* Full timeline */}
            <div className="rounded-2xl bg-bg-secondary border border-border p-4 text-start space-y-1.5">
              {progressSteps.map((step, i) => {
                const isDone = currentStepIdx > i
                const isActive = currentStepIdx === i
                const isPending = currentStepIdx < i
                return (
                  <div key={step.key} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                    <span className="text-base w-6 text-center">
                      {isDone ? '✅' : isActive ? '🔄' : '○'}
                    </span>
                    <span className={`text-sm flex-1 ${isDone ? 'text-text-muted' : isActive ? 'text-text font-medium' : 'text-text-muted/50'}`}>
                      {step.label}
                    </span>
                    {isActive && <span className="text-xs text-primary animate-pulse">←</span>}
                  </div>
                )
              })}
            </div>

            {/* Fun fact */}
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
              <p className="text-sm text-text-muted">💡 {funFacts[funFactIdx]}</p>
            </div>

            {/* Error state */}
            {state.buildError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 space-y-3">
                <p className="text-sm text-red-400">{state.buildError}</p>
                <button onClick={() => handleBuild()} className="text-sm font-medium text-primary hover:text-primary-hover">{t('נסו שוב', 'Try again')}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ LEGACY: old discovery/generating (kept as fallback) ═══ */}
      {(state.step === 'input' || state.step === 'discovery' || state.step === 'generating') && (
        <>
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
        </>
      )}
    </div>
  )
}

export default NewSitePage
