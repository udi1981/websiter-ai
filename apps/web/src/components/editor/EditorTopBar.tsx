'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

type PreviewMode = 'desktop' | 'tablet' | 'mobile'

type EditorTopBarProps = {
  siteName: string
  previewMode: PreviewMode
  onPreviewModeChange: (mode: PreviewMode) => void
  onPublish: () => void
  onPreview: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onSiteNameChange: (name: string) => void
  version: number
  onToggleChat: () => void
  chatOpen: boolean
  onToggleSidebar: () => void
  sidebarExpanded: boolean
}

export const EditorTopBar = ({
  siteName,
  previewMode,
  onPreviewModeChange,
  onPublish,
  onPreview,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSiteNameChange,
  version,
  onToggleChat,
  chatOpen,
  onToggleSidebar,
  sidebarExpanded,
}: EditorTopBarProps) => {
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(siteName)

  useEffect(() => {
    setName(siteName)
  }, [siteName])

  const handleNameBlur = () => {
    setEditingName(false)
    if (name.trim() && name !== siteName) {
      onSiteNameChange(name.trim())
    }
  }

  return (
    <header className="flex h-12 items-center justify-between border-b border-white/[0.06] bg-[#0d1117] px-3">
      {/* Left: Logo + Sidebar toggle + Site Name */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-white/90 font-semibold text-sm hover:text-white transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
            </svg>
          </div>
        </Link>

        <button
          onClick={onToggleSidebar}
          className={`rounded-lg p-1.5 transition-all ${
            sidebarExpanded
              ? 'text-white/80 bg-white/[0.06]'
              : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
          }`}
          title={sidebarExpanded ? 'Hide sidebar' : 'Show sidebar'}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
        </button>

        <div className="h-5 w-px bg-white/[0.06]" />

        {editingName ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameBlur()
              if (e.key === 'Escape') {
                setName(siteName)
                setEditingName(false)
              }
            }}
            className="rounded-md border border-violet-500/50 bg-white/[0.06] px-2 py-1 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="group flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            {name}
            <svg className="h-3 w-3 text-white/30 group-hover:text-white/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
            </svg>
          </button>
        )}

        <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/30 font-mono tabular-nums">
          v{version}
        </span>
      </div>

      {/* Center: Undo/Redo + Preview Mode */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5 rounded-lg bg-white/[0.04] p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded-md p-1.5 text-white/50 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="rounded-md p-1.5 text-white/50 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
          </button>
        </div>

        <div className="mx-1.5 h-5 w-px bg-white/[0.06]" />

        {/* Device Preview Toggles */}
        <div className="flex items-center rounded-lg bg-white/[0.04] p-0.5">
          {([
            { mode: 'desktop' as const, label: 'Desktop', icon: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z' },
            { mode: 'tablet' as const, label: 'Tablet', icon: 'M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z' },
            { mode: 'mobile' as const, label: 'Mobile', icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3' },
          ]).map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => onPreviewModeChange(mode)}
              className={`rounded-md p-1.5 transition-all ${
                previewMode === mode
                  ? 'bg-white/[0.1] text-white shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
              title={label}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Right: AI Chat + Preview + Publish */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            chatOpen
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'text-white/60 hover:text-white/80 border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04]'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
          AI
        </button>

        <div className="h-5 w-px bg-white/[0.06]" />

        <button
          onClick={onPreview}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/60 border border-white/[0.08] hover:text-white/80 hover:border-white/[0.15] hover:bg-white/[0.04] transition-all"
        >
          Preview
        </button>
        <button
          onClick={onPublish}
          className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:from-violet-500 hover:to-indigo-500 transition-all"
        >
          Publish
        </button>
      </div>
    </header>
  )
}
