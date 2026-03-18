'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { STATUS_COLORS } from '@/lib/utils/format'

export interface PipelineStage {
  stage: string
  count: number
}

interface Props {
  pipeline: PipelineStage[]
  totalTenders: number
  agentLabels: Record<string, string>
  agentDescriptions: Record<string, string>
}

const TOOLTIP_DELAY_MS = 600

export default function PipelineAgentCards({
  pipeline,
  totalTenders,
  agentLabels,
  agentDescriptions,
}: Props) {
  const pipelinePct = (count: number) =>
    totalTenders > 0 ? Math.round((count / totalTenders) * 100) : 0
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)
  const [tooltipRect, setTooltipRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const showTooltip = useCallback((stage: string) => {
    delayRef.current = setTimeout(() => {
      setHoveredStage(stage)
      const el = cardRefs.current[stage]
      if (el && typeof document !== 'undefined') {
        const rect = el.getBoundingClientRect()
        setTooltipRect({
          top: rect.top,
          left: rect.left + rect.width / 2,
          width: Math.min(320, window.innerWidth - 32),
        })
      }
    }, TOOLTIP_DELAY_MS)
  }, [])

  const hideTooltip = useCallback(() => {
    if (delayRef.current) {
      clearTimeout(delayRef.current)
      delayRef.current = null
    }
    setHoveredStage(null)
    setTooltipRect(null)
  }, [])

  useEffect(() => {
    return () => {
      if (delayRef.current) clearTimeout(delayRef.current)
    }
  }, [])

  const description = hoveredStage ? agentDescriptions[hoveredStage] : ''
  const showPortal = typeof document !== 'undefined' && hoveredStage && description && tooltipRect

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
          {description}
        </div>,
        document.body
      )
    : null

  return (
    <>
      {pipeline.map((stage, i) => {
        const colors = STATUS_COLORS[stage.stage]
        const accent = colors?.text ?? 'var(--text-secondary)'
        const pct = pipelinePct(stage.count)
        const agentLabel = agentLabels[stage.stage] ?? stage.stage
        return (
          <div
            key={`agent-${stage.stage}`}
            ref={(el) => {
              cardRefs.current[stage.stage] = el
            }}
            className="dashboard-pipeline-agent dashboard-pipeline-agent-with-tooltip"
            style={{ gridColumn: 2 * i + 1, '--agent-accent': accent } as React.CSSProperties}
            onMouseEnter={() => showTooltip(stage.stage)}
            onMouseLeave={hideTooltip}
          >
            <div className="dashboard-pipeline-agent-inner">
              <div className="dashboard-pipeline-agent-icon" style={{ backgroundColor: accent }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <span className="dashboard-pipeline-agent-name">{agentLabel}</span>
              <span className="dashboard-pipeline-agent-pct">{totalTenders > 0 ? pct : 0}%</span>
            </div>
          </div>
        )
      })}
      {tooltipPortal}
    </>
  )
}
