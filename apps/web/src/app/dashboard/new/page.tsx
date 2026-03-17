'use client'

import { useReducer, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { type ScanResult } from '@/lib/scanner'
import { rebuildSite } from '@/lib/site-rebuilder'
import { PREMIUM_GENERATION_PROMPT, buildUserPromptFromPlan } from '@/lib/generation-prompt'
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
  /** Full deep scan result — preserves 100% of scanner intelligence */
  deepScanData: Record<string, unknown> | null
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
  | { type: 'SCAN_DONE'; result: ScanResult; deepData?: Record<string, unknown> }
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
  deepScanData: null,
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
      return { ...state, scanStatus: 'done', scanResult: action.result, deepScanData: action.deepData ?? null }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discoveryContext: state.discoveryContext,
          scanResult: scanPayload,
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
  }, [state.discoveryContext, state.scanResult, state.deepScanData, state.description, state.selectedTemplateId])

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

                  dispatch({ type: 'SCAN_DONE', result: scanResult, deepData: deepResult })
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
        const streamTimeout = setTimeout(() => streamController.abort(), 300000) // 300s — Claude needs time for 64K token generation

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
          // Strip markdown fences robustly (handles whitespace, newlines, various fence formats)
          html = html.trim()
          html = html.replace(/^\s*```(?:html|HTML)?\s*\n?/, '')
          html = html.replace(/\n?\s*```\s*$/, '')
          html = html.trim()
          console.log(`[Build] Stream generation complete: ${html.length} chars, starts with: "${html.substring(0, 50)}"`)
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

      const fallbackSystem = PREMIUM_GENERATION_PROMPT

      // Build scan DNA section for fallback prompt
      let scanDnaSection = ''
      if (state.deepScanData) {
        const ds = state.deepScanData
        const dt = ds.designTokens as Record<string, unknown> | undefined
        const dna = ds.designDna as Record<string, unknown> | undefined
        const rp = ds.rebuildPlan as Record<string, unknown> | undefined
        const parts: string[] = ['## ORIGINAL SITE DNA (rebuild this site, upgraded)']
        if (dna) parts.push(`Design analysis: ${JSON.stringify(dna)}`)
        if (dt) {
          const tokens = dt as { colors?: { hex: string; usage: string }[]; fonts?: { family: string; usage: string }[]; cssVariables?: Record<string, string> }
          if (tokens.colors?.length) parts.push(`Colors: ${tokens.colors.slice(0, 10).map(c => `${c.hex} (${c.usage})`).join(', ')}`)
          if (tokens.fonts?.length) parts.push(`Fonts: ${tokens.fonts.map(f => `${f.family} (${f.usage})`).join(', ')}`)
          if (tokens.cssVariables) parts.push(`CSS vars: ${Object.entries(tokens.cssVariables).slice(0, 15).map(([k, v]) => `${k}: ${v}`).join('; ')}`)
        }
        if (rp) {
          const plan = rp as { preserve?: string[]; improve?: string[] }
          if (plan.preserve?.length) parts.push(`Preserve: ${plan.preserve.join(', ')}`)
          if (plan.improve?.length) parts.push(`Improve: ${plan.improve.join(', ')}`)
        }
        scanDnaSection = parts.join('\n') + '\n\n'
      }

      const fallbackUser = `Build a PHENOMENAL website that looks like it cost $20,000+ to build.

## BRAND
- **Name:** ${siteName}
- **Industry:** ${businessType}
- **Description:** "${state.description}"

## CONTEXT FROM DISCOVERY
${discoveryInfo}

${scanDnaSection}## REQUIREMENTS
1. 12-16 unique sections, each with distinct visual treatment
2. Massive hero with gradient overlay, jaw-dropping typography
3. Professional, realistic content specific to this business
4. Full CSS design system with custom properties
5. Scroll animations, mobile menu, smooth scroll, parallax
6. Schema.org structured data + SEO meta tags
7. 1200+ lines of premium code
8. Every section must have a DIFFERENT layout — no repetitive patterns`

      try {
        dispatch({ type: 'BUILD_PROGRESS', status: 'Generating with AI...', progress: 30 })
        const fallbackController = new AbortController()
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 180000)
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
          html = html.trim()
          html = html.replace(/^\s*```(?:html|HTML)?\s*\n?/, '')
          html = html.replace(/\n?\s*```\s*$/, '')
          html = html.trim()
          console.log(`[Build] Fallback generation complete: ${html.length} chars`)
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
      console.log(`[Build] Saved site ${siteId} with ${html.length} chars of HTML`)

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
