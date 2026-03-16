'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { EditorTopBar } from '@/components/editor/EditorTopBar'
import { EditorSidebar } from '@/components/editor/EditorSidebar'
import { EditorPreview } from '@/components/editor/EditorPreview'
import { AIChatPanel } from '@/components/editor/AIChatPanel'

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
        chatHistory: chatHistory.slice(-10), // Last 10 messages for context
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
    return {
      response: 'Sorry, I had trouble processing that request. Please try again or be more specific about what you want to change.',
      html: null,
      suggestions: ['Change the heading', 'Update colors', 'Add a section', 'Switch to dark mode'],
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
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [rightPanel, setRightPanel] = useState<RightPanelTab>('chat')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [selectMode, setSelectMode] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [version, setVersion] = useState(1)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)

  // Load site data from localStorage
  useEffect(() => {
    const sites = JSON.parse(localStorage.getItem('ubuilder_sites') || '[]')
    const site = sites.find((s: SiteData) => s.id === siteId)

    if (!site) {
      router.push('/dashboard')
      return
    }

    setSiteData(site)

    // Check if we have saved HTML content for this site
    const savedHtml = localStorage.getItem(`ubuilder_html_${siteId}`)
    if (savedHtml) {
      setHtmlContent(savedHtml)
      setHistory([savedHtml])
      setHistoryIndex(0)
      setLoading(false)
    } else {
      // Load template HTML
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
          // Use fallback HTML
          setHtmlContent(fallbackHtml)
          setHistory([fallbackHtml])
          setHistoryIndex(0)
          localStorage.setItem(`ubuilder_html_${siteId}`, fallbackHtml)
          setLoading(false)
        })
    }

    // Load saved version
    const savedVersion = localStorage.getItem(`ubuilder_version_${siteId}`)
    if (savedVersion) setVersion(parseInt(savedVersion, 10))

    // Load saved chat
    const savedChat = localStorage.getItem(`ubuilder_chat_${siteId}`)
    if (savedChat) setChatMessages(JSON.parse(savedChat))
  }, [siteId, router])

  // Push new HTML state to history
  const pushHtmlState = useCallback(
    (newHtml: string) => {
      setHtmlContent(newHtml)

      // Truncate future history if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newHtml)

      // Keep max 50 states
      if (newHistory.length > 50) newHistory.shift()

      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)

      // Save to localStorage
      localStorage.setItem(`ubuilder_html_${siteId}`, newHtml)
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
    }
  }, [history, historyIndex, siteId])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const nextHtml = history[newIndex]
      setHtmlContent(nextHtml)
      localStorage.setItem(`ubuilder_html_${siteId}`, nextHtml)
    }
  }, [history, historyIndex, siteId])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleUndo, handleRedo])

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
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
      }
      setChatMessages((prev) => [...prev, userMsg])

      // Warn if HTML is > 80KB
      const HTML_WARN_SIZE = 80 * 1024
      if (htmlContent.length > HTML_WARN_SIZE) {
        const warnMsg: ChatMessage = {
          id: `msg-warn-${Date.now()}`,
          role: 'assistant',
          content: `Note: Your site HTML is large (${Math.round(htmlContent.length / 1024)}KB). The AI will work with a truncated version for context. Complex changes may need to be done in smaller steps.`,
        }
        setChatMessages((prev) => [...prev, warnMsg])
      }

      setIsGenerating(true)

      // Show "thinking" indicator with tool calls
      const thinkingMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        toolCalls: [{ name: 'Analyzing request', status: 'running' as const }],
      }
      setChatMessages((prev) => [...prev, thinkingMsg])

      // Build chat history for context
      const chatHistoryForApi = chatMessages
        .filter((m) => m.content)
        .map((m) => ({ role: m.role, content: m.content }))

      // Call the AI agent API
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

      // Apply HTML changes if any
      if (result.html && result.html !== htmlContent) {
        handleHtmlChange(result.html)
      }

      // Handle scanRequested — show scanning message and feed results back
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

        // If scan results weren't already returned from the API, call scan endpoint directly
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

        // Feed scan results back into the agent for analysis
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

        // Update scanning message to done
        setChatMessages((prev) => prev.map((m) =>
          m.id === scanningMsg.id
            ? { ...m, content: `Scanned ${result.scanRequested}`, toolCalls: [{ name: 'Scanning URL', status: 'done' as const }] }
            : m
        ))

        // Apply any HTML changes from scan follow-up
        if (scanFollowUp.html && scanFollowUp.html !== htmlContent) {
          handleHtmlChange(scanFollowUp.html)
        }

        // Build the scan analysis response
        let scanResponseText = scanFollowUp.response
        if (scanFollowUp.proactiveTip) {
          scanResponseText += `\n\n\u{1F4A1} **Tip:** ${scanFollowUp.proactiveTip}`
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

      // Build tool calls display
      const toolCalls = result.toolCalls?.length
        ? result.toolCalls.map((t) => ({ name: t.name, status: 'done' as const }))
        : result.html
          ? [
              { name: 'Analyzing page structure', status: 'done' as const },
              { name: 'Modifying HTML', status: 'done' as const },
            ]
          : undefined

      // Build response with proactive tip if available
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

      // Replace the thinking message with the actual response
      setChatMessages((prev) => {
        const withoutThinking = prev.filter((m) => m.id !== thinkingMsg.id)
        const updated = [...withoutThinking, assistantMsg]
        localStorage.setItem(`ubuilder_chat_${siteId}`, JSON.stringify(updated))
        return updated
      })
      setIsGenerating(false)
    },
    [htmlContent, handleHtmlChange, siteId, chatMessages, siteData]
  )

  const handleSiteNameChange = useCallback(
    (newName: string) => {
      if (!siteData) return
      const updated = { ...siteData, name: newName }
      setSiteData(updated)

      // Update in localStorage
      const sites = JSON.parse(localStorage.getItem('ubuilder_sites') || '[]')
      const idx = sites.findIndex((s: SiteData) => s.id === siteId)
      if (idx >= 0) {
        sites[idx].name = newName
        localStorage.setItem('ubuilder_sites', JSON.stringify(sites))
      }
    },
    [siteData, siteId]
  )

  const handlePreview = useCallback(() => {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }, [htmlContent])

  const handlePublish = useCallback(() => {
    setPublishDialogOpen(true)
    // Update site status
    if (siteData) {
      const sites = JSON.parse(localStorage.getItem('ubuilder_sites') || '[]')
      const idx = sites.findIndex((s: SiteData) => s.id === siteId)
      if (idx >= 0) {
        sites[idx].status = 'published'
        sites[idx].lastEdited = new Date().toLocaleDateString()
        localStorage.setItem('ubuilder_sites', JSON.stringify(sites))
      }
    }
  }, [siteData, siteId])

  const handleElementSelected = useCallback(
    (info: { tag: string; text: string; classList: string }) => {
      setSelectMode(false)
      const desc = info.text.trim().slice(0, 60)
      const contextMsg = `I selected a <${info.tag}> element${desc ? ` with text "${desc}"` : ''}. What would you like to change about it?`
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: contextMsg,
          suggestions: [
            `Change this text`,
            `Change its color`,
            `Remove this element`,
          ],
        },
      ])
      setRightPanel('chat')
    },
    []
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-10 w-10 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-text-muted">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
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
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          expanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded((prev) => !prev)}
          htmlContent={htmlContent}
          onHtmlChange={handleHtmlChange}
          siteName={siteData?.name || ''}
          onSiteNameChange={handleSiteNameChange}
        />

        <EditorPreview
          previewMode={previewMode}
          htmlContent={htmlContent}
          selectMode={selectMode}
          onElementSelected={handleElementSelected}
        />

        <AIChatPanel
          activeTab={rightPanel}
          onTabChange={setRightPanel}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          htmlContent={htmlContent}
          onHtmlChange={handleHtmlChange}
          version={version}
        />
      </div>

      {/* Select Mode Toggle (floating) */}
      <button
        onClick={() => setSelectMode((prev) => !prev)}
        className={`fixed bottom-6 start-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-xl transition-all ${
          selectMode
            ? 'bg-primary text-white shadow-primary/30'
            : 'bg-bg-secondary text-text border border-border hover:border-primary'
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
        </svg>
        {selectMode ? 'Click an element to select it' : 'Select to Edit'}
      </button>

      {/* Publish Dialog */}
      {publishDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-bg border border-border p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
                <svg className="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-text">Site Published!</h3>
                <p className="text-xs text-text-muted">Your site is now live</p>
              </div>
            </div>
            <div className="rounded-lg bg-bg-tertiary px-3 py-2 mb-4">
              <p className="text-xs text-text-muted mb-1">Your site URL</p>
              <p className="text-sm font-medium text-primary">{siteData?.url || 'your-site.ubuilder.co'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPublishDialogOpen(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-bg-secondary transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://${siteData?.url || 'your-site.ubuilder.co'}`)
                  setPublishDialogOpen(false)
                }}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
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

export default EditorPage
