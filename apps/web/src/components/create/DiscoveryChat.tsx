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
}: DiscoveryChatProps) => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiThinking])

  const handleSend = () => {
    if (!input.trim() || isAiThinking || isBuilding) return
    onSendMessage(input.trim())
    setInput('')
  }

  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          onClick={onBack}
          disabled={isBuilding}
          className="rounded-lg p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary transition-colors disabled:opacity-40"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-text">Team 100 Discovery</h2>
          <p className="text-xs text-text-muted">Understanding your business to build the perfect site</p>
        </div>
        <div className="w-32">
          <DiscoveryProgress current={progress.current} total={progress.total} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => {
          if (msg.role === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="rounded-lg bg-primary-light px-3 py-1.5 text-xs text-primary">
                  {msg.content}
                </div>
              </div>
            )
          }

          return (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white'
                }`}>
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>
                {/* Bubble */}
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
              <p className="text-sm font-semibold text-text mb-1">Discovery Complete!</p>
              <p className="text-xs text-text-muted mb-4">
                We have enough context to build your perfect website.
              </p>
              <button
                onClick={onBuild}
                className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-hover"
              >
                Build My Website
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
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${buildProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-text-muted">{buildProgress}%</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!readyToGenerate && !isBuilding && (
        <div className="border-t border-border px-4 py-3">
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
              placeholder="Type your answer..."
              disabled={isAiThinking}
              className="w-full resize-none rounded-xl border border-border bg-bg-secondary px-4 py-3 pe-12 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isAiThinking}
              className="absolute bottom-3 end-3 rounded-lg bg-primary p-1.5 text-white disabled:opacity-40 hover:bg-primary-hover transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-text-muted">Shift+Enter for new line</p>
        </div>
      )}
    </div>
  )
}
