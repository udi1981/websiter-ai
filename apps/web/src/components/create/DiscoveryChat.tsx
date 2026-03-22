'use client'

import { useState, useRef, useEffect } from 'react'
import { DiscoveryProgress } from './DiscoveryProgress'

export type DiscoveryMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  suggestions?: string[]
}

type DiscoveryChatProps = {
  messages: DiscoveryMessage[]
  onSendMessage: (message: string) => void
  progress: { current: number; total: number }
  readyToGenerate: boolean
  isAiThinking: boolean
  onBuild: () => void
  onBack: () => void
  isBuilding: boolean
  buildStatus: string
  buildProgress: number
  onFileUpload?: (file: { name: string; textContent: string }) => void
  error?: string | null
  onRetry?: () => void
}

/** Extract text from a file (same logic as UnifiedInput) */
const extractTextFromFile = async (file: File): Promise<string> => {
  if (file.type.startsWith('text/')) return file.text()

  if (file.type === 'application/pdf') {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
    const parts: string[] = []
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g
    let match
    while ((match = streamRegex.exec(text)) !== null) {
      const cleaned = match[1].replace(/[\x00-\x1f]/g, ' ').replace(/\s+/g, ' ').trim()
      if (cleaned.length > 10 && /[a-zA-Z\u0590-\u05FF]{3,}/.test(cleaned)) parts.push(cleaned)
    }
    const tjRegex = /\(([^)]+)\)\s*Tj/g
    while ((match = tjRegex.exec(text)) !== null) {
      if (match[1].length > 2) parts.push(match[1])
    }
    return parts.join('\n').slice(0, 10000) || `[PDF: ${file.name}]`
  }

  if (file.type.includes('wordprocessingml') || file.type === 'application/msword') {
    try {
      const buffer = await file.arrayBuffer()
      const text = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(buffer))
      const parts = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g)?.map(t => t.replace(/<[^>]+>/g, '')) || []
      return parts.join(' ').slice(0, 10000) || `[Document: ${file.name}]`
    } catch {
      return `[Document: ${file.name}]`
    }
  }

  return `[File: ${file.name}]`
}

export const DiscoveryChat = ({
  messages,
  onSendMessage,
  progress,
  readyToGenerate,
  isAiThinking,
  onBuild,
  onBack,
  isBuilding,
  buildStatus,
  buildProgress,
  onFileUpload,
  error,
  onRetry,
}: DiscoveryChatProps) => {
  const [input, setInput] = useState('')
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiThinking, readyToGenerate])

  const handleSend = () => {
    if (!input.trim() || isAiThinking || isBuilding) return
    onSendMessage(input.trim())
    setInput('')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onFileUpload) return
    if (file.size > 10 * 1024 * 1024) return // 10MB limit

    setIsUploadingFile(true)
    try {
      const textContent = await extractTextFromFile(file)
      onFileUpload({ name: file.name, textContent })
    } catch (err) {
      console.error('Chat file upload failed:', err)
    } finally {
      setIsUploadingFile(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')
  const userMessageCount = messages.filter(m => m.role === 'user').length

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col" style={{ height: 'calc(100dvh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-3 py-3 sm:px-4">
        <button
          onClick={onBack}
          disabled={isBuilding}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-bg-tertiary transition-colors disabled:opacity-40"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-text truncate">Team 100 Discovery</h2>
          <p className="text-xs text-text-muted truncate">הבנת העסק שלך / Understanding your business</p>
        </div>
        <div className="w-24 sm:w-32 shrink-0">
          <DiscoveryProgress current={progress.current} total={progress.total} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-4 sm:px-4">
        {messages.map((msg) => {
          if (msg.role === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="rounded-lg bg-primary-light px-3 py-1.5 text-xs text-primary max-w-[90%] text-center">
                  {msg.content}
                </div>
              </div>
            )
          }

          return (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white'
                }`}>
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-ee-md'
                    : 'bg-bg-tertiary text-text rounded-es-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}

        {/* Suggestion chips */}
        {lastAssistantMsg?.suggestions && lastAssistantMsg.suggestions.length > 0 && !isAiThinking && !readyToGenerate && (
          <div className="flex flex-wrap gap-2 ps-10">
            {lastAssistantMsg.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSendMessage(suggestion)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* AI Thinking */}
        {isAiThinking && (
          <div className="flex justify-start">
            <div className="flex gap-2.5">
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-xs font-bold text-white">
                AI
              </div>
              <div className="rounded-2xl rounded-es-md bg-bg-tertiary px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" style={{ animationDelay: '0ms' }} />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ready to generate */}
        {readyToGenerate && !isBuilding && (
          <div className="flex justify-center pt-2">
            <div className="rounded-2xl border border-primary/30 bg-primary-light p-5 text-center max-w-sm">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-text mb-1">הגילוי הושלם / Discovery Complete!</p>
              <p className="text-xs text-text-muted mb-4">
                יש לנו מספיק מידע לבנות אתר מדהים / We have enough to build your perfect website.
              </p>
              <button
                onClick={onBuild}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-hover px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-primary/30"
              >
                בנה את האתר שלי / Build My Website
              </button>
            </div>
          </div>
        )}

        {/* Building progress */}
        {isBuilding && (
          <div className="flex justify-center pt-2">
            <div className="rounded-2xl border border-border bg-bg-secondary p-5 text-center max-w-sm w-full">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                <svg className="h-5 w-5 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-text mb-1">{buildStatus || 'Building your website...'}</p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-bg-tertiary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: `${buildProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-text-muted">{buildProgress}%</p>
            </div>
          </div>
        )}

        {/* Error card */}
        {error && !isBuilding && (
          <div className="flex justify-center pt-2">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center max-w-sm w-full">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-red-400 mb-1">הבנייה נכשלה / Generation Failed</p>
              <p className="text-xs text-red-400/80 mb-4">{error}</p>
              <div className="flex gap-2">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex-1 rounded-xl bg-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    נסה שוב / Try Again
                  </button>
                )}
                <button
                  onClick={onBack}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text hover:bg-bg-tertiary transition-colors"
                >
                  השתמש בתבנית / Use Template
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!readyToGenerate && !isBuilding && (
        <div className="border-t border-border px-3 py-3 space-y-2 sm:px-4 pb-[env(safe-area-inset-bottom,12px)]">
          {/* File upload indicator */}
          {isUploadingFile && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 animate-pulse">
              <svg className="h-3.5 w-3.5 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs text-primary">מעלה ומעבד קובץ... / Uploading & processing file...</span>
            </div>
          )}

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
              placeholder="הקלד תשובה... / Type your answer..."
              disabled={isAiThinking}
              className="w-full resize-none rounded-xl border border-border bg-bg-secondary px-4 py-3 pe-24 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              rows={2}
            />
            <div className="absolute bottom-2.5 end-2.5 flex items-center gap-1">
              {/* Attachment button */}
              {onFileUpload && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.csv,.html,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAiThinking || isUploadingFile}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                    title="העלה קובץ / Upload file"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                  </button>
                </>
              )}
              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!input.trim() || isAiThinking}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white disabled:opacity-40 hover:bg-primary-hover transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-text-muted hidden sm:block">Shift+Enter לשורה חדשה / for new line</p>
            {/* Skip to Build button — always visible, prominent */}
            {!isAiThinking && !isBuilding && (
              <button
                onClick={onBuild}
                className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 hover:border-primary/40 transition-all ms-auto"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811V8.69zM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061a1.125 1.125 0 01-1.683-.977V8.69z" />
                </svg>
                דלג ובנה עכשיו / Skip & Build Now
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
