'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils/format'
import type { PipelineStage } from '@/components/dashboard/PipelineAgentCards'

interface Props {
  pipeline: PipelineStage[]
  totalTenders: number
  agentLabels: Record<string, string>
  agentDescriptions: Record<string, string>
}

const TOOLTIP_DELAY_MS = 600

export default function PipelineMobileStack({
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
      <div className="dashboard-pipeline-mobile-stack">
        {pipeline.map((stage, i) => {
          const colors = STATUS_COLORS[stage.stage]
          const bg = colors?.bg ?? '#F3F4F6'
          const accent = colors?.text ?? 'var(--text-secondary)'
          const pct = pipelinePct(stage.count)
          const agentLabel = agentLabels[stage.stage] ?? stage.stage

          return (
            <div key={stage.stage} className="dashboard-pipeline-mobile-step">
              <Link
                href={`/tenders?status=${stage.stage}`}
                className="dashboard-pipeline-stage dashboard-pipeline-stage--mobile"
                style={{ '--stage-bg': bg, '--stage-accent': accent } as React.CSSProperties}
              >
                <div className="dashboard-pipeline-stage-mobile-main">
                  <span className="dashboard-pipeline-count">{stage.count}</span>
                  <span className="dashboard-pipeline-label">{STATUS_LABELS[stage.stage] ?? stage.stage}</span>
                </div>
                <svg
                  className="dashboard-pipeline-stage-mobile-chevron"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <div
                ref={(el) => {
                  cardRefs.current[stage.stage] = el
                }}
                className="dashboard-pipeline-agent dashboard-pipeline-agent--mobile dashboard-pipeline-agent-with-tooltip"
                style={{ '--agent-accent': accent } as React.CSSProperties}
                onMouseEnter={() => showTooltip(stage.stage)}
                onMouseLeave={hideTooltip}
              >
                <div className="dashboard-pipeline-agent-inner dashboard-pipeline-agent-inner--mobile">
                  <div className="dashboard-pipeline-agent-icon" style={{ backgroundColor: accent }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div className="dashboard-pipeline-agent-mobile-text">
                    <span className="dashboard-pipeline-agent-name">{agentLabel}</span>
                    <span className="dashboard-pipeline-agent-pct">{totalTenders > 0 ? pct : 0}%</span>
                  </div>
                </div>
              </div>

              {i < pipeline.length - 1 && (
                <div className="dashboard-pipeline-mobile-flow" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {tooltipPortal}
    </>
  )
}
