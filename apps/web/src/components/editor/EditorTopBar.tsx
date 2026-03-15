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
    <header className="flex h-12 items-center justify-between border-b border-border bg-bg px-3">
      {/* Left: Logo + Site Name */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-primary font-bold text-sm hover:opacity-80 transition-opacity"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
          </svg>
          <span>UBuilder</span>
        </Link>

        <div className="h-5 w-px bg-border" />

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
            className="rounded border border-primary bg-bg px-2 py-0.5 text-sm font-medium text-text focus:outline-none"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="rounded px-2 py-0.5 text-sm font-medium text-text hover:bg-bg-tertiary transition-colors"
          >
            {name}
          </button>
        )}

        <span className="rounded bg-bg-tertiary px-1.5 py-0.5 text-[10px] text-text-muted font-mono">
          v{version}
        </span>
      </div>

      {/* Center: Undo/Redo + Preview Mode */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="rounded p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </button>

        <div className="mx-2 h-5 w-px bg-border" />

        {/* Device Preview Toggles */}
        <div className="flex items-center rounded-lg bg-bg-tertiary p-0.5">
          <button
            onClick={() => onPreviewModeChange('desktop')}
            className={`rounded-md p-1.5 transition-colors ${
              previewMode === 'desktop'
                ? 'bg-bg text-primary shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
            title="Desktop (1280px)"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
            </svg>
          </button>
          <button
            onClick={() => onPreviewModeChange('tablet')}
            className={`rounded-md p-1.5 transition-colors ${
              previewMode === 'tablet'
                ? 'bg-bg text-primary shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
            title="Tablet (768px)"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </button>
          <button
            onClick={() => onPreviewModeChange('mobile')}
            className={`rounded-md p-1.5 transition-colors ${
              previewMode === 'mobile'
                ? 'bg-bg text-primary shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
            title="Mobile (375px)"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right: Preview + Publish */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPreview}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-bg-secondary transition-colors"
        >
          Preview
        </button>
        <button
          onClick={onPublish}
          className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition-colors"
        >
          Publish
        </button>
      </div>
    </header>
  )
}
