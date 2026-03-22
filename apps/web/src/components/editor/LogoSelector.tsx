'use client'

import { useState, useEffect } from 'react'

type Logo = {
  id: string
  name: string
  style: string
  svg: string
}

type LogoSelectorProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (logo: Logo) => void
  businessName: string
  primaryColor?: string
  industry?: string
  currentLogoSvg?: string
}

export const LogoSelector = ({
  isOpen,
  onClose,
  onSelect,
  businessName,
  primaryColor = '#7C3AED',
  industry,
  currentLogoSvg,
}: LogoSelectorProps) => {
  const [logos, setLogos] = useState<Logo[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const generateLogos = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/generate-logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          industry,
          primaryColor,
        }),
      })

      if (!res.ok) throw new Error('Failed to generate logos')

      const data = await res.json()
      if (data.ok && data.data) {
        setLogos(data.data)
        setSelectedId(null)
      } else {
        throw new Error(data.error || 'Failed')
      }
    } catch (err) {
      console.error('[LogoSelector] Error:', err)
      setError('Failed to generate logos. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && logos.length === 0 && businessName) {
      generateLogos()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, businessName])

  const handleConfirm = () => {
    const logo = logos.find(l => l.id === selectedId)
    if (logo) {
      onSelect(logo)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-semibold text-white">Choose Your Logo</h2>
              <p className="text-xs text-white/30 mt-0.5">
                Select a logo style for &ldquo;{businessName}&rdquo; — AI generated, fully customizable
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
              aria-label="Close logo selector"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Logo Grid */}
          <div className="p-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 animate-pulse" />
                  <div className="absolute inset-0 h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 animate-ping opacity-20" />
                </div>
                <p className="text-sm text-white/40">Generating logo options...</p>
                <p className="text-xs text-white/20 mt-1">AI is crafting 6 unique designs</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-sm text-red-400 mb-3">{error}</p>
                <button
                  onClick={generateLogos}
                  className="rounded-lg bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-xs text-white/60 hover:text-white/80 transition-all"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && logos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {logos.map((logo) => (
                  <button
                    key={logo.id}
                    onClick={() => setSelectedId(logo.id)}
                    className={`group relative flex flex-col items-center rounded-xl border-2 p-5 transition-all ${
                      selectedId === logo.id
                        ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'
                    }`}
                    aria-label={`Select logo: ${logo.name} (${logo.style})`}
                    aria-pressed={selectedId === logo.id}
                  >
                    {/* Selection indicator */}
                    {selectedId === logo.id && (
                      <div className="absolute top-2 end-2 h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    {/* Logo Preview */}
                    <div
                      className="w-full h-16 flex items-center justify-center mb-3"
                      dangerouslySetInnerHTML={{ __html: logo.svg }}
                    />

                    {/* Label */}
                    <span className="text-[11px] font-medium text-white/40 group-hover:text-white/60 transition-colors">
                      {logo.name}
                    </span>
                    <span className="text-[9px] text-white/20 mt-0.5 capitalize">{logo.style}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Current logo if exists */}
            {currentLogoSvg && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-2">Current Logo</p>
                <div
                  className="h-12 w-auto inline-block"
                  dangerouslySetInnerHTML={{ __html: currentLogoSvg }}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
            <button
              onClick={generateLogos}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-4 py-2 text-xs font-medium text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all disabled:opacity-30"
              aria-label="Regenerate logo options"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Regenerate
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-white/[0.08] px-4 py-2 text-xs font-medium text-white/40 hover:text-white/60 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedId}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Use This Logo
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
