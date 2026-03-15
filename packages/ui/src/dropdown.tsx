'use client'

import { useState, useRef, useEffect } from 'react'

type DropdownItem = {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  danger?: boolean
}

type DropdownProps = {
  trigger: React.ReactNode
  items: DropdownItem[]
  className?: string
}

/** Dropdown menu triggered by a custom element */
export const Dropdown = ({ trigger, items, className = '' }: DropdownProps) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className="absolute end-0 z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-bg p-1 shadow-lg">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick()
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                item.danger
                  ? 'text-error hover:bg-red-50'
                  : 'text-text hover:bg-bg-secondary'
              }`}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
