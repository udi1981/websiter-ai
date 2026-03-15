'use client'

import { useEffect, useRef } from 'react'

type DialogSize = 'sm' | 'md' | 'lg'

type DialogProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: DialogSize
  className?: string
}

const sizeStyles: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

/** Modal dialog using the native dialog element */
export const Dialog = ({ open, onClose, title, children, size = 'md', className = '' }: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose()
        }
      }}
      className={`w-full ${sizeStyles[size]} rounded-xl border border-border bg-bg p-0 shadow-lg backdrop:bg-black/50 ${className}`}
    >
      <div className="p-6">
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-text-secondary hover:bg-bg-tertiary hover:text-text transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </dialog>
  )
}
