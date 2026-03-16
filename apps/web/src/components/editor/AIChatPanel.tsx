'use client'

import { useState, useRef, useEffect, useMemo } from 'react'

type RightPanelTab = 'chat' | 'code' | 'seo' | 'gso'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: { name: string; status: 'running' | 'done' }[]
  suggestions?: string[]
}

type AIChatPanelProps = {
  activeTab: RightPanelTab
  onTabChange: (tab: RightPanelTab) => void
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  isGenerating: boolean
  htmlContent: string
  onHtmlChange: (html: string) => void
  version: number
}

/** Extract SEO data from HTML */
const extractSeoData = (html: string) => {
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i)
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi
  const h2s: string[] = []
  let h2m
  while ((h2m = h2Regex.exec(html)) !== null) {
    h2s.push(h2m[1].replace(/<[^>]*>/g, '').trim())
  }

  // Count images without alt
  const imgRegex = /<img[^>]*>/gi
  let imgMatch
  let missingAlt = 0
  let totalImages = 0
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    totalImages++
    if (!imgMatch[0].includes('alt=') || /alt=["']\s*["']/i.test(imgMatch[0])) {
      missingAlt++
    }
  }

  const hasSchemaOrg = html.includes('application/ld+json') || html.includes('schema.org')
  const hasCanonical = html.includes('rel="canonical"') || html.includes("rel='canonical'")
  const hasOgTags = html.includes('og:title') || html.includes('og:description')

  let score = 0
  if (titleMatch?.[1]) score += 20
  if (descMatch?.[1]) score += 20
  if (h1Match?.[1]) score += 15
  if (h2s.length > 0) score += 10
  if (missingAlt === 0 && totalImages > 0) score += 10
  if (missingAlt === 0 && totalImages === 0) score += 10
  if (hasSchemaOrg) score += 10
  if (hasCanonical) score += 5
  if (hasOgTags) score += 10

  return {
    title: titleMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '',
    description: descMatch?.[1] || '',
    h1: h1Match?.[1]?.replace(/<[^>]*>/g, '').trim() || '',
    h2s,
    missingAlt,
    totalImages,
    hasSchemaOrg,
    hasCanonical,
    hasOgTags,
    score,
  }
}

/** Extract GSO data from HTML */
const extractGsoData = (html: string) => {
  const checks = [
    { label: 'Schema.org structured data', passed: html.includes('application/ld+json') || html.includes('schema.org') },
    { label: 'FAQ section present', passed: /<(section|div)[^>]*(?:id|class)=["'][^"']*faq[^"']*["']/i.test(html) || html.toLowerCase().includes('frequently asked') },
    { label: 'Structured heading hierarchy', passed: /<h1/i.test(html) && /<h2/i.test(html) },
    { label: 'Meta description present', passed: /<meta[^>]*name=["']description["']/i.test(html) },
    { label: 'Alt text on images', passed: !/<img(?![^>]*alt=["'][^"']+["'])[^>]*>/i.test(html) },
    { label: 'Semantic HTML elements', passed: /<(article|section|nav|header|footer|main|aside)/i.test(html) },
    { label: 'Internal navigation links', passed: /<a[^>]*href=["']#/i.test(html) },
    { label: 'Contact information visible', passed: /(?:email|phone|tel:|mailto:)/i.test(html) },
  ]

  const passed = checks.filter(c => c.passed).length
  const score = Math.round((passed / checks.length) * 100)

  return { checks, score }
}

export const AIChatPanel = ({
  activeTab,
  onTabChange,
  messages,
  onSendMessage,
  isGenerating,
  htmlContent,
  onHtmlChange,
  version,
}: AIChatPanelProps) => {
  const [input, setInput] = useState('')
  const [codeContent, setCodeContent] = useState('')
  const [codeEditing, setCodeEditing] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sync code content with htmlContent
  useEffect(() => {
    if (!codeEditing) {
      setCodeContent(htmlContent)
    }
  }, [htmlContent, codeEditing])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

  const seoData = useMemo(() => extractSeoData(htmlContent), [htmlContent])
  const gsoData = useMemo(() => extractGsoData(htmlContent), [htmlContent])

  const handleSend = () => {
    if (!input.trim() || isGenerating) return
    onSendMessage(input.trim())
    setInput('')
  }

  const handleApplyCode = () => {
    onHtmlChange(codeContent)
    setCodeEditing(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent)
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'index.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSeoAutoOptimize = () => {
    let updated = htmlContent

    // Add meta description if missing
    if (!seoData.description) {
      const title = seoData.title || 'Website'
      const desc = `Welcome to ${title}. Discover our products and services.`
      if (updated.includes('</head>')) {
        updated = updated.replace('</head>', `  <meta name="description" content="${desc}">\n</head>`)
      }
    }

    // Add og tags if missing
    if (!seoData.hasOgTags) {
      const ogTags = `  <meta property="og:title" content="${seoData.title || 'Website'}">\n  <meta property="og:description" content="${seoData.description || 'Welcome to our website'}">\n  <meta property="og:type" content="website">\n`
      if (updated.includes('</head>')) {
        updated = updated.replace('</head>', `${ogTags}</head>`)
      }
    }

    // Add canonical if missing
    if (!seoData.hasCanonical) {
      if (updated.includes('</head>')) {
        updated = updated.replace('</head>', `  <link rel="canonical" href="/">\n</head>`)
      }
    }

    if (updated !== htmlContent) {
      onHtmlChange(updated)
    }
  }

  const handleGsoAutoFix = () => {
    let updated = htmlContent

    // Add schema.org if missing
    if (!gsoData.checks[0].passed) {
      const schema = `\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "${seoData.title || 'Website'}",\n  "description": "${seoData.description || 'Welcome to our website'}"\n}\n</script>\n`
      if (updated.includes('</head>')) {
        updated = updated.replace('</head>', `${schema}</head>`)
      }
    }

    if (updated !== htmlContent) {
      onHtmlChange(updated)
    }
  }

  // Calculate SEO score ring
  const seoCircumference = 2 * Math.PI * 24
  const seoOffset = seoCircumference - (seoData.score / 100) * seoCircumference
  const seoColor = seoData.score >= 70 ? '#10B981' : seoData.score >= 40 ? '#F59E0B' : '#EF4444'

  return (
    <div className="flex w-80 flex-col border-s border-border bg-bg">
      {/* Tab Bar */}
      <div className="flex border-b border-border">
        {(['chat', 'code', 'seo', 'gso'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-muted hover:text-text'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-text mb-1">AI Assistant</p>
                <p className="text-xs text-text-muted mb-4">
                  Describe what you want to change and I will update your site in real time.
                </p>
                <div className="w-full space-y-1.5">
                  {[
                    'Analyze my site and suggest improvements',
                    'Make the design more modern and premium',
                    'Optimize SEO and add Schema.org',
                    'Add a testimonials section',
                    'Switch to dark mode',
                    'Rewrite the headline for better conversions',
                    'שפר את העיצוב של האתר',
                    'הוסף קטע שאלות נפוצות',
                    'שנה את הצבעים לכהים',
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => onSendMessage(s)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-start text-xs text-text-secondary hover:border-primary hover:text-primary transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-ee-sm'
                      : 'bg-bg-tertiary text-text rounded-es-sm'
                  }`}
                >
                  {msg.content}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.toolCalls.map((tool, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${
                            msg.role === 'user' ? 'bg-white/20' : 'bg-bg/30'
                          }`}
                        >
                          {tool.status === 'running' ? (
                            <div className="h-2 w-2 animate-pulse rounded-full bg-warning" />
                          ) : (
                            <svg className="h-3 w-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          <span>{tool.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex justify-start">
                <div className="rounded-xl rounded-es-sm bg-bg-tertiary px-3 py-2">
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" style={{ animationDelay: '0ms' }} />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" style={{ animationDelay: '150ms' }} />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Cards after messages */}
          {messages.length > 0 && !isGenerating && (
            <div className="border-t border-border px-3 py-2">
              <div className="flex flex-wrap gap-1.5">
                {(messages[messages.length - 1]?.suggestions || [
                  'Change colors',
                  'Edit text',
                  'Add section',
                ]).map((s) => (
                  <button
                    key={s}
                    onClick={() => onSendMessage(s)}
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] text-text-secondary hover:border-primary hover:text-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-border p-3">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="תאר שינויים... / Describe changes..."
                className="w-full resize-none rounded-lg border border-border bg-bg-secondary px-3 py-2 pe-20 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                rows={2}
              />
              <div className="absolute bottom-2 end-2 flex items-center gap-1">
                <button
                  className="rounded p-1 text-text-muted hover:text-text transition-colors"
                  title="Voice input"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button
                  className="rounded p-1 text-text-muted hover:text-text transition-colors"
                  title="Upload image"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isGenerating}
                  className="rounded-md bg-primary p-1 text-white disabled:opacity-40 hover:bg-primary-hover transition-colors"
                  title="Send"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-text-muted">
              <span>גרסה / Version {version}</span>
              <span>Shift+Enter לשורה חדשה / for new line</span>
            </div>
          </div>
        </div>
      )}

      {/* CODE TAB */}
      {activeTab === 'code' && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-medium text-text-muted">index.html</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="rounded px-2 py-0.5 text-xs text-text-muted hover:text-primary transition-colors"
              >
                {copyFeedback ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="rounded px-2 py-0.5 text-xs text-text-muted hover:text-primary transition-colors"
              >
                Download
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {codeEditing ? (
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                className="w-full h-full min-h-[400px] rounded-lg bg-bg-tertiary p-3 text-xs font-mono text-text-secondary leading-relaxed resize-none border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                spellCheck={false}
              />
            ) : (
              <pre
                className="rounded-lg bg-bg-tertiary p-3 text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed cursor-text overflow-x-auto"
                onClick={() => setCodeEditing(true)}
              >
                {htmlContent}
              </pre>
            )}
          </div>
          <div className="border-t border-border p-2 flex gap-2">
            {codeEditing ? (
              <>
                <button
                  onClick={handleApplyCode}
                  className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition-colors"
                >
                  Apply Changes
                </button>
                <button
                  onClick={() => {
                    setCodeContent(htmlContent)
                    setCodeEditing(false)
                  }}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setCodeEditing(true)}
                className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                Edit Code
              </button>
            )}
          </div>
        </div>
      )}

      {/* SEO TAB */}
      {activeTab === 'seo' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Score */}
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3" className="text-bg-tertiary" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke={seoColor}
                  strokeWidth="3"
                  strokeDasharray={seoCircumference}
                  strokeDashoffset={seoOffset}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: seoColor }}>
                {seoData.score}
              </span>
            </div>
            <div className="text-xs space-y-1">
              {seoData.title && <p className="text-success">Title tag present</p>}
              {!seoData.title && <p className="text-error">Missing title tag</p>}
              {seoData.description && <p className="text-success">Meta description set</p>}
              {!seoData.description && <p className="text-error">Missing meta description</p>}
              {seoData.h1 && <p className="text-success">H1 heading found</p>}
              {!seoData.h1 && <p className="text-warning">No H1 heading</p>}
              {seoData.missingAlt > 0 && <p className="text-warning">Missing alt on {seoData.missingAlt} image{seoData.missingAlt > 1 ? 's' : ''}</p>}
              {!seoData.hasSchemaOrg && <p className="text-error">No Schema.org markup</p>}
              {seoData.hasSchemaOrg && <p className="text-success">Schema.org present</p>}
              {seoData.hasOgTags && <p className="text-success">Open Graph tags</p>}
              {!seoData.hasOgTags && <p className="text-warning">Missing OG tags</p>}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Title Tag</label>
              <p className="rounded-md bg-bg-tertiary px-2 py-1.5 text-sm text-text-secondary">
                {seoData.title || <span className="text-text-muted italic">Not set</span>}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Meta Description</label>
              <p className="rounded-md bg-bg-tertiary px-2 py-1.5 text-sm text-text-secondary">
                {seoData.description || <span className="text-text-muted italic">Not set</span>}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">H1</label>
              <p className="rounded-md bg-bg-tertiary px-2 py-1.5 text-sm text-text-secondary">
                {seoData.h1 || <span className="text-text-muted italic">Not found</span>}
              </p>
            </div>
            {seoData.h2s.length > 0 && (
              <div>
                <label className="mb-1 block text-xs font-medium text-text-muted">H2 Headings ({seoData.h2s.length})</label>
                <div className="space-y-1">
                  {seoData.h2s.map((h2, i) => (
                    <p key={i} className="rounded-md bg-bg-tertiary px-2 py-1 text-xs text-text-secondary">{h2}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSeoAutoOptimize}
            className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Auto-optimize with AI
          </button>
        </div>
      )}

      {/* GSO TAB */}
      {activeTab === 'gso' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="rounded-lg bg-primary-light p-3">
            <h3 className="text-sm font-medium text-primary mb-1">GSO Score</h3>
            <p className="text-xs text-text-secondary mb-2">
              Generative Search Optimization — how well AI engines understand your site.
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-bg-tertiary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${gsoData.score}%` }}
                />
              </div>
              <span className="text-xs font-bold text-primary">{gsoData.score}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-text-muted">Checklist</h4>
            {gsoData.checks.map((check, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs transition-colors ${
                  check.passed
                    ? 'border-success/30 bg-success/5 text-success'
                    : 'border-border text-text-secondary'
                }`}
              >
                {check.passed ? (
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                )}
                {check.label}
              </div>
            ))}
          </div>

          <button
            onClick={handleGsoAutoFix}
            className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Auto-fix Issues
          </button>
        </div>
      )}
    </div>
  )
}
