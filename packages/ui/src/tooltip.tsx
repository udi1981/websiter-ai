'use client'

import { useState } from 'react'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

type TooltipProps = {
  content: string
  children: React.ReactNode
  position?: TooltipPosition
  className?: string
}

const positionStyles: Record<TooltipPosition, string> = {
  top: 'bottom-full start-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full start-1/2 -translate-x-1/2 mt-2',
  left: 'end-full top-1/2 -translate-y-1/2 me-2',
  right: 'start-full top-1/2 -translate-y-1/2 ms-2',
}

/** Simple tooltip that appears on hover */
export const Tooltip = ({ content, children, position = 'top', className = '' }: TooltipProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`absolute z-50 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-md pointer-events-none ${positionStyles[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  )
}
