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
  isOpen: boolean
  onClose: () => void
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
  isOpen,
  onClose,
}: AIChatPanelProps) => {
  const [input, setInput] = useState('')
  const [codeContent, setCodeContent] = useState('')
  const [codeEditing, setCodeEditing] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!codeEditing) {
      setCodeContent(htmlContent)
    }
  }, [htmlContent, codeEditing])

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
    if (!seoData.description) {
      const title = seoData.title || 'Website'
      const desc = `Welcome to ${title}. Discover our products and services.`
      if (updated.includes('</head>')) {
        updated = updated.replace('</head>', `  <meta name="description" content="${desc}">\n</head>`)
      }
    }
    if (!seoData.hasOgTags) {
      const ogTags = `  <meta property="og:title" content="${seoData.title || 'Website'}">\n  <meta property="og:description" content="${seoData.description || 'Welcome to our website'}">\n  <meta property="og:type" content="website">\n`
      if (updated.includes('</head>')) {
        updated = updated.replace('</head>', `${ogTags}</head>`)
      }
    }
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

  const seoCircumference = 2 * Math.PI * 24
  const seoOffset = seoCircumference - (seoData.score / 100) * seoCircumference
  const seoColor = seoData.score >= 70 ? '#10B981' : seoData.score >= 40 ? '#F59E0B' : '#EF4444'

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
        onClick={onClose}
      />

      {/* Floating Panel */}
      <div className="fixed top-0 end-0 z-50 h-full w-full max-w-[420px] flex flex-col bg-[#0d1117] border-s border-white/[0.06] shadow-2xl shadow-black/50 animate-slide-in-right">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-1">
            {(['chat', 'code', 'seo', 'gso'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-violet-500/15 text-violet-300'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
                }`}
              >
                {tab === 'chat' && (
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    AI Chat
                  </span>
                )}
                {tab === 'code' && 'Code'}
                {tab === 'seo' && 'SEO'}
                {tab === 'gso' && 'GSO'}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mb-4 border border-violet-500/10">
                    <svg className="h-7 w-7 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-white/80 mb-1">AI Design Assistant</h3>
                  <p className="text-xs text-white/30 mb-5 max-w-[280px]">
                    Describe changes in natural language. I will modify your site in real time.
                  </p>
                  <div className="w-full space-y-1.5">
                    {[
                      { text: 'Analyze and suggest improvements', icon: '🔍' },
                      { text: 'Make design more modern & premium', icon: '✨' },
                      { text: 'Optimize SEO and Schema.org', icon: '📈' },
                      { text: 'Add a testimonials section', icon: '💬' },
                      { text: 'Switch to dark mode', icon: '🌙' },
                      { text: 'Rewrite headline for conversions', icon: '✍️' },
                      { text: 'שפר את העיצוב של האתר', icon: '🎨' },
                      { text: 'הוסף קטע שאלות נפוצות', icon: '❓' },
                      { text: 'שנה את הצבעים', icon: '🎯' },
                    ].map(({ text, icon }) => (
                      <button
                        key={text}
                        onClick={() => onSendMessage(text)}
                        className="flex w-full items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-start text-[13px] text-white/50 hover:text-white/70 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
                      >
                        <span className="text-sm opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>
                        <span>{text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-ee-md shadow-lg shadow-violet-500/10'
                        : 'bg-white/[0.06] text-white/70 rounded-es-md border border-white/[0.04]'
                    }`}
                  >
                    {msg.content}
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.toolCalls.map((tool, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] ${
                              msg.role === 'user' ? 'bg-white/20' : 'bg-white/[0.04]'
                            }`}
                          >
                            {tool.status === 'running' ? (
                              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                            ) : (
                              <svg className="h-3 w-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            <span className="text-white/50">{tool.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Suggestions after last message */}
              {messages.length > 0 && !isGenerating && messages[messages.length - 1]?.suggestions && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {messages[messages.length - 1].suggestions!.map((s) => (
                    <button
                      key={s}
                      onClick={() => onSendMessage(s)}
                      className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[11px] text-white/40 hover:text-violet-300 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {isGenerating && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-es-md bg-white/[0.06] border border-white/[0.04] px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-violet-400/60" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-violet-400/60" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-violet-400/60" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/[0.06] p-4">
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
                  placeholder="Describe what to change..."
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pe-14 text-sm text-white/80 placeholder:text-white/20 focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all"
                  rows={2}
                />
                <div className="absolute bottom-2.5 end-2.5 flex items-center gap-1">
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isGenerating}
                    className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 p-2 text-white disabled:opacity-30 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
                    title="Send"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-white/20">
                <span>v{version}</span>
                <span>Shift+Enter for new line</span>
              </div>
            </div>
          </div>
        )}

        {/* CODE TAB */}
        {activeTab === 'code' && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
              <span className="text-xs font-medium text-white/30 font-mono">index.html</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="rounded-md px-2 py-1 text-xs text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                >
                  {copyFeedback ? '✓ Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="rounded-md px-2 py-1 text-xs text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                >
                  Download
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {codeEditing ? (
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  className="w-full h-full min-h-[400px] rounded-xl bg-white/[0.03] p-4 text-xs font-mono text-white/50 leading-relaxed resize-none border border-white/[0.06] focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                  spellCheck={false}
                />
              ) : (
                <pre
                  className="rounded-xl bg-white/[0.03] p-4 text-xs font-mono text-white/40 whitespace-pre-wrap leading-relaxed cursor-text overflow-x-auto border border-white/[0.04]"
                  onClick={() => setCodeEditing(true)}
                >
                  {htmlContent}
                </pre>
              )}
            </div>
            <div className="border-t border-white/[0.06] p-3 flex gap-2">
              {codeEditing ? (
                <>
                  <button
                    onClick={handleApplyCode}
                    className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-medium text-white hover:from-violet-500 hover:to-indigo-500 transition-all"
                  >
                    Apply Changes
                  </button>
                  <button
                    onClick={() => {
                      setCodeContent(htmlContent)
                      setCodeEditing(false)
                    }}
                    className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-medium text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setCodeEditing(true)}
                  className="flex-1 rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-medium text-white/40 hover:text-white/60 hover:border-white/[0.15] hover:bg-white/[0.04] transition-all"
                >
                  Edit Code
                </button>
              )}
            </div>
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div className="flex items-center gap-4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <div className="relative h-16 w-16 shrink-0">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/[0.06]" />
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
                {seoData.title && <p className="text-emerald-400">✓ Title tag present</p>}
                {!seoData.title && <p className="text-red-400">✗ Missing title tag</p>}
                {seoData.description && <p className="text-emerald-400">✓ Meta description set</p>}
                {!seoData.description && <p className="text-red-400">✗ Missing meta description</p>}
                {seoData.h1 && <p className="text-emerald-400">✓ H1 heading found</p>}
                {!seoData.h1 && <p className="text-amber-400">⚠ No H1 heading</p>}
                {seoData.missingAlt > 0 && <p className="text-amber-400">⚠ {seoData.missingAlt} images missing alt</p>}
                {seoData.hasSchemaOrg && <p className="text-emerald-400">✓ Schema.org present</p>}
                {!seoData.hasSchemaOrg && <p className="text-red-400">✗ No Schema.org</p>}
                {seoData.hasOgTags && <p className="text-emerald-400">✓ Open Graph tags</p>}
                {!seoData.hasOgTags && <p className="text-amber-400">⚠ Missing OG tags</p>}
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Title Tag', value: seoData.title },
                { label: 'Meta Description', value: seoData.description },
                { label: 'H1', value: seoData.h1 },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="mb-1.5 block text-[11px] font-semibold text-white/30 uppercase tracking-widest">{label}</label>
                  <p className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm text-white/50">
                    {value || <span className="text-white/20 italic">Not set</span>}
                  </p>
                </div>
              ))}
              {seoData.h2s.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-white/30 uppercase tracking-widest">H2 Headings ({seoData.h2s.length})</label>
                  <div className="space-y-1">
                    {seoData.h2s.map((h2, i) => (
                      <p key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.04] px-3 py-1.5 text-xs text-white/40">{h2}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSeoAutoOptimize}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all"
            >
              Auto-optimize SEO
            </button>
          </div>
        )}

        {/* GSO TAB */}
        {activeTab === 'gso' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/10 p-4">
              <h3 className="text-sm font-semibold text-violet-300 mb-1">GSO Score</h3>
              <p className="text-xs text-white/30 mb-3">
                Generative Search Optimization — how well AI engines understand your site.
              </p>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${gsoData.score}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-violet-300 tabular-nums">{gsoData.score}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">Checklist</h4>
              {gsoData.checks.map((check, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs transition-all ${
                    check.passed
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                      : 'border-white/[0.06] bg-white/[0.02] text-white/40'
                  }`}
                >
                  {check.passed ? (
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5 shrink-0 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                  {check.label}
                </div>
              ))}
            </div>

            <button
              onClick={handleGsoAutoFix}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all"
            >
              Auto-fix Issues
            </button>
          </div>
        )}
      </div>
    </>
  )
}
