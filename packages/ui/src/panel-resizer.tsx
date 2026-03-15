'use client'

import { useCallback, useRef } from 'react'

type PanelResizerDirection = 'horizontal' | 'vertical'

type PanelResizerProps = {
  onResize: (delta: number) => void
  direction?: PanelResizerDirection
  min?: number
  max?: number
  className?: string
}

/** Draggable divider for resizing adjacent panels */
export const PanelResizer = ({ onResize, direction = 'horizontal', min, max, className = '' }: PanelResizerProps) => {
  const startPosRef = useRef(0)
  const accumulatedRef = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY
      accumulatedRef.current = 0

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const currentPos = direction === 'horizontal' ? moveEvent.clientX : moveEvent.clientY
        let delta = currentPos - startPosRef.current

        if (min !== undefined || max !== undefined) {
          const newAccumulated = accumulatedRef.current + delta
          if (min !== undefined && newAccumulated < min) return
          if (max !== undefined && newAccumulated > max) return
          accumulatedRef.current = newAccumulated
        }

        startPosRef.current = currentPos
        onResize(delta)
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [direction, min, max, onResize]
  )

  const isHorizontal = direction === 'horizontal'

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`${
        isHorizontal
          ? 'w-1.5 cursor-col-resize hover:bg-primary/20 active:bg-primary/30'
          : 'h-1.5 cursor-row-resize hover:bg-primary/20 active:bg-primary/30'
      } shrink-0 bg-border transition-colors ${className}`}
      role="separator"
      aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
    />
  )
}
