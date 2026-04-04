'use client'

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/** Zelfde vertraging als bij pipeline-agent tooltips */
const TOOLTIP_DELAY_MS = 600

type Props = {
  content: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function DashboardPipelinePortalTooltip({ content, children, className, style }: Props) {
  const [open, setOpen] = useState(false)
  const [tooltipRect, setTooltipRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const showTooltip = useCallback(() => {
    delayRef.current = setTimeout(() => {
      const el = triggerRef.current
      if (el && typeof document !== 'undefined') {
        const rect = el.getBoundingClientRect()
        setTooltipRect({
          top: rect.top,
          left: rect.left + rect.width / 2,
          width: Math.min(320, window.innerWidth - 32),
        })
        setOpen(true)
      }
    }, TOOLTIP_DELAY_MS)
  }, [])

  const hideTooltip = useCallback(() => {
    if (delayRef.current) {
      clearTimeout(delayRef.current)
      delayRef.current = null
    }
    setOpen(false)
    setTooltipRect(null)
  }, [])

  useEffect(() => {
    return () => {
      if (delayRef.current) clearTimeout(delayRef.current)
    }
  }, [])

  const trimmed = content.trim()
  const showPortal = typeof document !== 'undefined' && open && trimmed && tooltipRect

  const tooltipPortal = showPortal
    ? createPortal(
        <div
          className="dashboard-pipeline-agent-tooltip-portal"
          role="tooltip"
          style={{
            position: 'fixed',
            left: tooltipRect.left,
            top: tooltipRect.top,
            transform: 'translate(-50%, -100%) translateY(-12px)',
            width: tooltipRect.width,
            maxWidth: 'min(320px, calc(100vw - 32px))',
            boxSizing: 'border-box',
          }}
        >
          {trimmed}
        </div>,
        document.body
      )
    : null

  return (
    <>
      <div
        ref={triggerRef}
        className={className}
        style={style}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>
      {tooltipPortal}
    </>
  )
}
