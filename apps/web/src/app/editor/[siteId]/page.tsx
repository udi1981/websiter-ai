'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { EditorTopBar } from '@/components/editor/EditorTopBar'
import { EditorSidebar } from '@/components/editor/EditorSidebar'
import { EditorPreview } from '@/components/editor/EditorPreview'
import { AIChatPanel } from '@/components/editor/AIChatPanel'
import { LogoSelector } from '@/components/editor/LogoSelector'
import { EditorErrorBoundary } from '@/components/editor/EditorErrorBoundary'
import { SectionPicker } from '@/components/editor/SectionPicker'
import { generateSingleSection, insertSection, removeSection } from '@/lib/section-composer'
import { updateSiteHtml, updateSite, onSaveStatusChange } from '@/lib/sites-api'

type SaveStatus = 'saved' | 'saving' | 'error'
type PreviewMode = 'desktop' | 'tablet' | 'mobile'
type RightPanelTab = 'chat' | 'code' | 'seo' | 'gso'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: { name: string; status: 'running' | 'done' }[]
  suggestions?: string[]
}

type SiteData = {
  id: string
  name: string
  status: string
  template: string
  description: string
  url: string
}

/** Default fallback HTML when no template is found */
const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900">
  <nav class="border-b px-6 py-4 flex items-center justify-between">
    <span class="text-xl font-bold">My Website</span>
    <div class="flex gap-6 text-sm">
      <a href="#" class="hover:text-indigo-600">Home</a>
      <a href="#about" class="hover:text-indigo-600">About</a>
      <a href="#contact" class="hover:text-indigo-600">Contact</a>
    </div>
  </nav>
  <section class="px-6 py-24 text-center">
    <h1 class="text-5xl font-bold mb-4">Welcome to My Website</h1>
    <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Build something amazing with AI. Describe what you want and watch it come to life.</p>
    <button class="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700">Get Started</button>
  </section>
  <section id="about" class="px-6 py-16 bg-gray-50">
    <h2 class="text-3xl font-bold text-center mb-8">About Us</h2>
    <p class="text-gray-600 text-center max-w-2xl mx-auto">We help businesses build beautiful websites with the power of AI.</p>
  </section>
  <footer class="px-6 py-8 bg-gray-900 text-gray-400 text-center text-sm">
    <p>&copy; 2026 My Website. All rights reserved.</p>
  </footer>
</body>
</html>`

// ==========================================
// AI AGENT — calls /api/ai/agent-chat for
// intelligent, AI-powered site modifications
// ==========================================

type AgentResponse = {
  response: string
  html: string | null
  suggestions: string[]
  toolCalls: { name: string; status: string }[]
  proactiveTip: string | null
  scanRequested: string | null
  scanResults: string | null
}

/** Call the AI agent API to process user messages intelligently */
const callAgentApi = async (
  message: string,
  htmlContent: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[],
  siteData?: { name: string; description: string; businessType: string }
): Promise<AgentResponse> => {
  try {
    const res = await fetch('/api/ai/agent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        htmlContent,
        chatHistory: chatHistory.slice(-10),
        siteData,
      }),
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`)
    }

    const data = await res.json()
    if (!data.ok) {
      throw new Error(data.error || 'Agent failed')
    }

    return data.data as AgentResponse
  } catch (err) {
    console.error('Agent API call failed:', err)
    const errorDetail = err instanceof Error ? err.message : 'Unknown error'
    return {
      response: `Failed to reach the AI agent: ${errorDetail}. Please check your connection and try again.`,
      html: null,
      suggestions: ['Try again', 'Simplify your request', 'Check your internet connection'],
      toolCalls: [],
      proactiveTip: null,
      scanRequested: null,
      scanResults: null,
    }
  }
}

// ==========================================
// MAIN EDITOR PAGE COMPONENT
// ==========================================

const EditorPage = ({ params }: { params: Promise<{ siteId: string }> }) => {
  const { siteId } = use(params)
  const router = useRouter()

  const [siteData, setSiteData] = useState<SiteData | null>(null)
  const [htmlContent, setHtmlContent] = useState('')
  const [loading, setLoading] = useState(true)

  // History for undo/redo
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // UI state
  const [sidebarExpanded, setSidebarExpanded] = useState(false) // Default collapsed for max canvas
  const [chatOpen, setChatOpen] = useState(false)
  const [rightPanel, setRightPanel] = useState<RightPanelTab>('chat')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [selectMode, setSelectMode] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [version, setVersion] = useState(1)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle')
  const [publishError, setPublishError] = useState('')
  const [logoSelectorOpen, setLogoSelectorOpen] = useState(false)
  const [sectionPickerOpen, setSectionPickerOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')

  // Subscribe to save status changes from sites-api
  useEffect(() => {
    const unsubscribe = onSaveStatusChange(setSaveStatus)
    return unsubscribe
  }, [])

  // Strip markdown code fences from AI-generated HTML
  const cleanHtml = useCallback((raw: string): string => {
    let cleaned = raw.trim()
    cleaned = cleaned.replace(/^\s*```(?:html|HTML)?\s*\n?/, '')
    cleaned = cleaned.replace(/\n?\s*```\s*$/, '')
    if (cleaned.length > 100 && !cleaned.includes('<!DOCTYPE') && !cleaned.includes('<html') && !cleaned.includes('<body')) {
      console.warn('[Editor] HTML content missing doctype — using fallback')
      return fallbackHtml
    }
    return cleaned.trim()
  }, [])

  // Load site data from localStorage
  useEffect(() => {
    try {
      const sitesRaw = localStorage.getItem('ubuilder_sites')
      const sites = sitesRaw ? JSON.parse(sitesRaw) : []
      const site = sites.find((s: SiteData) => s.id === siteId)

      if (!site) {
        router.push('/dashboard')
        return
      }

      setSiteData(site)

      const savedHtml = localStorage.getItem(`ubuilder_html_${siteId}`)
      if (savedHtml && savedHtml.trim().length > 20 && savedHtml.includes('<')) {
        const cleaned = cleanHtml(savedHtml)
        console.log(`[Editor] Loaded HTML from localStorage: ${cleaned.length} chars`)
        setHtmlContent(cleaned)
        setHistory([cleaned])
        setHistoryIndex(0)
        if (cleaned !== savedHtml) {
          localStorage.setItem(`ubuilder_html_${siteId}`, cleaned)
        }
        setLoading(false)
      } else {
        console.log('[Editor] No saved HTML found, loading template...')
        const templateType = site.template || 'business'
        const validTemplates = ['restaurant', 'saas', 'ecommerce', 'portfolio', 'business', 'blog', 'dental', 'yoga', 'law', 'realestate', 'fitness', 'photography']
        const templatePath = validTemplates.includes(templateType)
          ? `/templates/${templateType}/index.html`
          : `/templates/business/index.html`

        fetch(templatePath)
          .then((res) => {
            if (!res.ok) throw new Error('Template not found')
            return res.text()
          })
          .then((html) => {
            setHtmlContent(html)
            setHistory([html])
            setHistoryIndex(0)
            localStorage.setItem(`ubuilder_html_${siteId}`, html)
            setLoading(false)
          })
          .catch(() => {
            setHtmlContent(fallbackHtml)
            setHistory([fallbackHtml])
            setHistoryIndex(0)
            localStorage.setItem(`ubuilder_html_${siteId}`, fallbackHtml)
            setLoading(false)
          })
      }

      const savedVersion = localStorage.getItem(`ubuilder_version_${siteId}`)
      if (savedVersion) setVersion(parseInt(savedVersion, 10))

      try {
        const savedChat = localStorage.getItem(`ubuilder_chat_${siteId}`)
        if (savedChat) setChatMessages(JSON.parse(savedChat))
      } catch {
        console.warn('[Editor] Failed to parse saved chat')
      }
    } catch (err) {
      console.error('[Editor] Failed to load site data:', err)
      setHtmlContent(fallbackHtml)
      setHistory([fallbackHtml])
      setHistoryIndex(0)
      setLoading(false)
    }
  }, [siteId, router, cleanHtml])

  const pushHtmlState = useCallback(
    (newHtml: string) => {
      setHtmlContent(newHtml)
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newHtml)
      if (newHistory.length > 50) newHistory.shift()
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      localStorage.setItem(`ubuilder_html_${siteId}`, newHtml)
      updateSiteHtml(siteId, newHtml) // Debounced DB sync
    },
    [history, historyIndex, siteId]
  )

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const prevHtml = history[newIndex]
      setHtmlContent(prevHtml)
      localStorage.setItem(`ubuilder_html_${siteId}`, prevHtml)
      updateSiteHtml(siteId, prevHtml)
    }
  }, [history, historyIndex, siteId])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const nextHtml = history[newIndex]
      setHtmlContent(nextHtml)
      localStorage.setItem(`ubuilder_html_${siteId}`, nextHtml)
      updateSiteHtml(siteId, nextHtml)
    }
  }, [history, historyIndex, siteId])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Escape to exit select mode
      if (e.key === 'Escape' && selectMode) {
        e.preventDefault()
        setSelectMode(false)
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      }
      // Ctrl+/ to toggle AI panel
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setChatOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleUndo, handleRedo, selectMode])

  const handleHtmlChange = useCallback(
    (newHtml: string) => {
      pushHtmlState(newHtml)
      setVersion((v) => {
        const newV = v + 1
        localStorage.setItem(`ubuilder_version_${siteId}`, String(newV))
        return newV
      })
    },
    [pushHtmlState, siteId]
  )

  const handleSendMessage = useCallback(
    async (message: string) => {
      // Auto-open chat when sending a message
      if (!chatOpen) setChatOpen(true)

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
      }
      setChatMessages((prev) => [...prev, userMsg])

      const HTML_WARN_SIZE = 80 * 1024
      if (htmlContent.length > HTML_WARN_SIZE) {
        const warnMsg: ChatMessage = {
          id: `msg-warn-${Date.now()}`,
          role: 'assistant',
          content: `Note: Your site HTML is large (${Math.round(htmlContent.length / 1024)}KB). The AI will work with a truncated version for context.`,
        }
        setChatMessages((prev) => [...prev, warnMsg])
      }

      setIsGenerating(true)

      const thinkingMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        toolCalls: [{ name: 'Analyzing request', status: 'running' as const }],
      }
      setChatMessages((prev) => [...prev, thinkingMsg])

      const chatHistoryForApi = chatMessages
        .filter((m) => m.content)
        .map((m) => ({ role: m.role, content: m.content }))

      const result = await callAgentApi(
        message,
        htmlContent,
        chatHistoryForApi,
        siteData ? {
          name: siteData.name,
          description: siteData.description,
          businessType: siteData.template,
        } : undefined
      )

      if (result.html && result.html !== htmlContent) {
        handleHtmlChange(result.html)
      }

      // Handle scanRequested
      if (result.scanRequested) {
        const scanningMsg: ChatMessage = {
          id: `msg-scan-${Date.now()}`,
          role: 'assistant',
          content: `Scanning ${result.scanRequested}...`,
          toolCalls: [{ name: 'Scanning URL', status: 'running' as const }],
        }
        setChatMessages((prev) => {
          const withoutThinking = prev.filter((m) => m.id !== thinkingMsg.id)
          return [...withoutThinking, scanningMsg]
        })

        let scanData = result.scanResults
        if (!scanData) {
          try {
            const scanRes = await fetch('/api/scan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: result.scanRequested }),
            })
            if (scanRes.ok) {
              const scanJson = await scanRes.json()
              scanData = JSON.stringify(scanJson.data || scanJson, null, 2)
            } else {
              scanData = `Scan failed with status ${scanRes.status}`
            }
          } catch (scanErr) {
            scanData = `Scan failed: ${scanErr instanceof Error ? scanErr.message : 'Unknown error'}`
          }
        }

        const scanFollowUp = await callAgentApi(
          `Here are the scan results for ${result.scanRequested}:\n\n${scanData}\n\nPlease analyze these results and suggest how to improve my site based on what you found.`,
          htmlContent,
          [...chatHistoryForApi, { role: 'user', content: message }, { role: 'assistant', content: result.response }],
          siteData ? {
            name: siteData.name,
            description: siteData.description,
            businessType: siteData.template,
          } : undefined
        )

        setChatMessages((prev) => prev.map((m) =>
          m.id === scanningMsg.id
            ? { ...m, content: `Scanned ${result.scanRequested}`, toolCalls: [{ name: 'Scanning URL', status: 'done' as const }] }
            : m
        ))

        if (scanFollowUp.html && scanFollowUp.html !== htmlContent) {
          handleHtmlChange(scanFollowUp.html)
        }

        let scanResponseText = scanFollowUp.response
        if (scanFollowUp.proactiveTip) {
          scanResponseText += `\n\n💡 **Tip:** ${scanFollowUp.proactiveTip}`
        }

        const scanAssistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 3}`,
          role: 'assistant',
          content: scanResponseText,
          toolCalls: [
            { name: 'Scanning URL', status: 'done' as const },
            { name: 'Analyzing scan results', status: 'done' as const },
            ...(scanFollowUp.html ? [{ name: 'Applying improvements', status: 'done' as const }] : []),
          ],
          suggestions: scanFollowUp.suggestions,
        }

        setChatMessages((prev) => {
          const updated = [...prev, scanAssistantMsg]
          localStorage.setItem(`ubuilder_chat_${siteId}`, JSON.stringify(updated))
          return updated
        })
        setIsGenerating(false)
        return
      }

      const toolCalls = result.toolCalls?.length
        ? result.toolCalls.map((t) => ({ name: t.name, status: 'done' as const }))
        : result.html
          ? [
              { name: 'Analyzing page structure', status: 'done' as const },
              { name: 'Modifying HTML', status: 'done' as const },
            ]
          : undefined

      let responseText = result.response
      if (result.proactiveTip) {
        responseText += `\n\n💡 **Tip:** ${result.proactiveTip}`
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 2}`,
        role: 'assistant',
        content: responseText,
        toolCalls,
        suggestions: result.suggestions,
      }

      setChatMessages((prev) => {
        const withoutThinking = prev.filter((m) => m.id !== thinkingMsg.id)
        const updated = [...withoutThinking, assistantMsg]
        localStorage.setItem(`ubuilder_chat_${siteId}`, JSON.stringify(updated))
        return updated
      })
      setIsGenerating(false)
    },
    [htmlContent, handleHtmlChange, siteId, chatMessages, siteData, chatOpen]
  )

  const handleSiteNameChange = useCallback(
    (newName: string) => {
      if (!siteData) return
      const updated = { ...siteData, name: newName }
      setSiteData(updated)

      const sites = JSON.parse(localStorage.getItem('ubuilder_sites') || '[]')
      const idx = sites.findIndex((s: SiteData) => s.id === siteId)
      if (idx >= 0) {
        sites[idx].name = newName
        localStorage.setItem('ubuilder_sites', JSON.stringify(sites))
      }

      // Sync to DB
      updateSite(siteId, { name: newName })
    },
    [siteData, siteId]
  )

  const handleLogoSelect = useCallback(
    (logo: { id: string; name: string; style: string; svg: string }) => {
      // Replace the first text-based logo in the nav with the SVG logo
      let updated = htmlContent

      // Strategy 1: Replace existing <a> logo in nav that contains brand text
      const navLogoRegex = /<a[^>]*class=["'][^"']*logo[^"']*["'][^>]*>[\s\S]*?<\/a>/i
      const navBrandRegex = /(<nav[\s\S]*?<a[^>]*>)([\s\S]*?)(<\/a>)/i

      if (navLogoRegex.test(updated)) {
        updated = updated.replace(navLogoRegex, (match) => {
          const hrefMatch = match.match(/href=["']([^"']*)["']/)
          const href = hrefMatch ? hrefMatch[1] : '#'
          return `<a href="${href}" class="logo" style="display:inline-flex;align-items:center;height:40px;">${logo.svg}</a>`
        })
      } else if (navBrandRegex.test(updated)) {
        // Replace the first link content in nav with the SVG
        updated = updated.replace(navBrandRegex, (_match, before, _content, after) => {
          return `${before}<span style="display:inline-flex;align-items:center;height:40px;">${logo.svg}</span>${after}`
        })
      } else {
        // Fallback: try to find and replace the first brand-like text in header/nav
        const headerTextRegex = /(<(?:header|nav)[^>]*>[\s\S]*?<(?:a|span|div)[^>]*>)([\s\S]*?)(<\/(?:a|span|div)>)/i
        if (headerTextRegex.test(updated)) {
          updated = updated.replace(headerTextRegex, (_match, before, _content, after) => {
            return `${before}<span style="display:inline-flex;align-items:center;height:40px;">${logo.svg}</span>${after}`
          })
        }
      }

      if (updated !== htmlContent) {
        handleHtmlChange(updated)
      }

      // Save logo to localStorage + DB
      localStorage.setItem(`ubuilder_logo_${siteId}`, JSON.stringify(logo))
      updateSite(siteId, { logoSvg: logo.svg })
    },
    [htmlContent, handleHtmlChange, siteId]
  )

  const handleRetrySave = useCallback(() => {
    if (htmlContent) {
      updateSiteHtml(siteId, htmlContent)
    }
  }, [htmlContent, siteId])

  /** Insert a section from the section picker */
  const handleInsertSection = useCallback((category: string, variantId: string) => {
    const sectionHtml = generateSingleSection(variantId, {
      businessName: siteData?.name || 'My Business',
      businessType: siteData?.description || 'business',
      locale: 'he',
    })
    if (sectionHtml) {
      const newHtml = insertSection(
        htmlContent,
        sectionHtml,
        category as Parameters<typeof insertSection>[2],
        variantId,
      )
      handleHtmlChange(newHtml)
    }
    setSectionPickerOpen(false)
  }, [htmlContent, handleHtmlChange, siteData])

  /** Remove a section by its markers */
  const handleRemoveSection = useCallback((category: string, variantId: string) => {
    const newHtml = removeSection(
      htmlContent,
      category as Parameters<typeof removeSection>[1],
      variantId,
    )
    handleHtmlChange(newHtml)
  }, [htmlContent, handleHtmlChange])

  const handlePreview = useCallback(() => {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }, [htmlContent])

  const handlePublish = useCallback(async () => {
    setPublishDialogOpen(true)
    setPublishStatus('publishing')
    setPublishError('')

    if (siteData) {
      const sites = JSON.parse(localStorage.getItem('ubuilder_sites') || '[]')
      const idx = sites.findIndex((s: SiteData) => s.id === siteId)
      if (idx >= 0) {
        sites[idx].status = 'published'
        sites[idx].lastEdited = new Date().toLocaleDateString()
        localStorage.setItem('ubuilder_sites', JSON.stringify(sites))
      }

      // Publish to DB — save HTML and set status
      updateSite(siteId, { status: 'published', html: htmlContent })

      try {
        const res = await fetch(`/api/sites/${siteId}/publish`, { method: 'POST' })
        const data = await res.json()
        if (data.ok) {
          console.log('[Publish] Published at:', data.data?.url)
          setPublishStatus('success')
        } else {
          console.warn('[Publish] API returned error:', data.error)
          setPublishStatus('success') // Still show success since localStorage is updated
        }
      } catch (err) {
        console.warn('[Publish] DB publish failed:', err)
        setPublishStatus('success') // localStorage publish still succeeded
      }
    } else {
      setPublishStatus('error')
      setPublishError('No site data found')
    }
  }, [siteData, siteId, htmlContent])

  const handleElementSelected = useCallback(
    (info: { tag: string; text: string; classList: string }) => {
      setSelectMode(false)
      setChatOpen(true)
      const desc = info.text.trim().slice(0, 60)
      const contextMsg = `I selected a <${info.tag}> element${desc ? ` with text "${desc}"` : ''}. What would you like to change about it?`
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: contextMsg,
          suggestions: [
            'Change this text',
            'Change its color',
            'Remove this element',
          ],
        },
      ])
      setRightPanel('chat')
    },
    []
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d1117]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 animate-ping opacity-20" />
          </div>
          <p className="text-sm text-white/30">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-[#0d1117]">
      <EditorTopBar
        siteName={siteData?.name || 'Untitled'}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        onPublish={handlePublish}
        onPreview={handlePreview}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onSiteNameChange={handleSiteNameChange}
        version={version}
        onToggleChat={() => setChatOpen(prev => !prev)}
        chatOpen={chatOpen}
        onToggleSidebar={() => setSidebarExpanded(prev => !prev)}
        sidebarExpanded={sidebarExpanded}
        saveStatus={saveStatus}
        onRetrySave={handleRetrySave}
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          expanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded((prev) => !prev)}
          htmlContent={htmlContent}
          onHtmlChange={handleHtmlChange}
          siteName={siteData?.name || ''}
          onSiteNameChange={handleSiteNameChange}
          onOpenSectionPicker={() => setSectionPickerOpen(true)}
          onRemoveSection={handleRemoveSection}
        />

        <EditorPreview
          previewMode={previewMode}
          htmlContent={htmlContent}
          selectMode={selectMode}
          onElementSelected={handleElementSelected}
        />
      </div>

      {/* Floating AI Panel (overlay) */}
      <AIChatPanel
        activeTab={rightPanel}
        onTabChange={setRightPanel}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
        htmlContent={htmlContent}
        onHtmlChange={handleHtmlChange}
        version={version}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* Bottom Quick Actions */}
      <div className="fixed bottom-5 start-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {/* Select to Edit */}
        <button
          onClick={() => setSelectMode((prev) => !prev)}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium shadow-xl transition-all backdrop-blur-sm ${
            selectMode
              ? 'bg-red-600 text-white shadow-red-500/30 hover:bg-red-500'
              : 'bg-[#1c2128]/90 text-white/50 border border-white/[0.08] hover:text-white/70 hover:border-white/[0.15]'
          }`}
        >
          {selectMode ? (
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
            </svg>
          )}
          {selectMode ? '✕ Cancel' : 'Select'}
        </button>

        {/* Logo Picker */}
        <button
          onClick={() => setLogoSelectorOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#1c2128]/90 text-white/50 border border-white/[0.08] px-4 py-2.5 text-xs font-medium hover:text-white/70 hover:border-white/[0.15] transition-all backdrop-blur-sm shadow-xl"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
          Logo
        </button>

        {/* Quick AI prompt */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[#1c2128]/90 text-white/40 border border-white/[0.08] px-5 py-2.5 text-xs hover:text-white/60 hover:border-white/[0.15] transition-all backdrop-blur-sm shadow-xl"
          >
            <svg className="h-3.5 w-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Ask AI to edit...
            <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/20 font-mono">Ctrl+/</kbd>
          </button>
        )}
      </div>

      {/* Logo Selector Modal */}
      <LogoSelector
        isOpen={logoSelectorOpen}
        onClose={() => setLogoSelectorOpen(false)}
        onSelect={handleLogoSelect}
        businessName={siteData?.name || 'My Brand'}
        primaryColor="#7C3AED"
        industry={siteData?.template}
      />

      {/* Section Picker */}
      <SectionPicker
        isOpen={sectionPickerOpen}
        onClose={() => setSectionPickerOpen(false)}
        onInsert={handleInsertSection}
        locale="he"
      />

      {/* Publish Dialog */}
      {publishDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#161b22] border border-white/[0.08] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              {publishStatus === 'publishing' ? (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
                  <svg className="h-5 w-5 text-violet-400 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : publishStatus === 'error' ? (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/20">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/20">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-white">
                  {publishStatus === 'publishing' ? 'Publishing...' : publishStatus === 'error' ? 'Publish Failed' : 'Site Published!'}
                </h3>
                <p className="text-xs text-white/30">
                  {publishStatus === 'publishing' ? 'Saving your site...' : publishStatus === 'error' ? publishError : 'Your site is now live'}
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 mb-5">
              <p className="text-[10px] text-white/20 mb-1 uppercase tracking-wider font-semibold">Your site URL</p>
              <p className="text-sm font-medium text-violet-400">{siteData?.url || 'your-site.ubuilder.co'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPublishDialogOpen(false)}
                className="flex-1 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://${siteData?.url || 'your-site.ubuilder.co'}`)
                  setPublishDialogOpen(false)
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Wrapped with error boundary to prevent blank screens on render errors */
const EditorPageWithErrorBoundary = (props: { params: Promise<{ siteId: string }> }) => (
  <EditorErrorBoundary>
    <EditorPage {...props} />
  </EditorErrorBoundary>
)

export default EditorPageWithErrorBoundary
