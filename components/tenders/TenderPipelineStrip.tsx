'use client'

import { useEffect, useRef } from 'react'
import {
  PIPELINE_STAGES,
  PIPELINE_AGENT_LABELS,
  PIPELINE_AGENT_DESCRIPTIONS,
  PIPELINE_AGENT_TAGLINE,
  getTabForPipelineStatus,
  TENDER_DETAIL_TAB_LABELS,
} from '@/lib/tender/pipeline'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils/format'

interface Props {
  status: string
  onStatusChange: (next: string) => void
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function TenderPipelineStrip({ status, onStatusChange }: Props) {
  const withdrawn = status === 'withdrawn'
  const activeRef = useRef<HTMLButtonElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const activeStageLabel =
    status === 'withdrawn' ? STATUS_LABELS.withdrawn : STATUS_LABELS[status] ?? status
  const activeAgentName =
    status === 'withdrawn'
      ? '—'
      : PIPELINE_AGENT_LABELS[status as keyof typeof PIPELINE_AGENT_LABELS] ?? ''

  useEffect(() => {
    if (!activeRef.current || !wrapRef.current) return
    activeRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [status, withdrawn])

  return (
    <section className="tender-pipeline-section" aria-labelledby="tender-pipeline-heading">
      <div className="tender-pipeline-section-head">
        <div className="tender-pipeline-section-head-main">
          <h2 id="tender-pipeline-heading" className="tender-pipeline-section-title">
            Tender pipeline
          </h2>
          <p className="tender-pipeline-section-hint">
            Klik op een stap om de fase op te slaan en het bijbehorende tabblad te openen.
          </p>
          <p className="tender-pipeline-section-active" aria-live="polite">
            <span className="tender-pipeline-section-active-label">Actief</span>
            <span className="tender-pipeline-section-active-phase">{activeStageLabel}</span>
            {activeAgentName && activeAgentName !== '—' && (
              <>
                <span className="tender-pipeline-section-active-sep" aria-hidden>
                  ·
                </span>
                <span className="tender-pipeline-section-active-agent">{activeAgentName}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="tender-pipeline-strip-card">
        <div className="tender-pipeline-strip-wrap" ref={wrapRef}>
          <div className="tender-pipeline-strip-track" role="list" aria-label="Fases en gekoppelde agents">
            {PIPELINE_STAGES.map((stage, i) => {
              const isActive = !withdrawn && status === stage
              const colors = STATUS_COLORS[stage]
              const bg = isActive ? colors?.bg ?? '#E8F0FE' : '#ffffff'
              const accent = colors?.text ?? '#1A56DB'
              const border = isActive ? `1.5px solid ${accent}` : '1px solid var(--border)'
              const tabLabel = TENDER_DETAIL_TAB_LABELS[getTabForPipelineStatus(stage)]
              const title = `${STATUS_LABELS[stage] ?? stage}: ${PIPELINE_AGENT_LABELS[stage]}. ${PIPELINE_AGENT_DESCRIPTIONS[stage] ?? ''} — Opent: ${tabLabel}`
              const tagline = PIPELINE_AGENT_TAGLINE[stage]

              return (
                <div key={stage} className="tender-pipeline-strip-segment" role="listitem">
                  {i > 0 && (
                    <span className="tender-pipeline-strip-chevron" aria-hidden>
                      <ChevronRight />
                    </span>
                  )}
                  <button
                    type="button"
                    ref={isActive ? activeRef : undefined}
                    title={title}
                    aria-current={isActive ? 'step' : undefined}
                    onClick={() => onStatusChange(stage)}
                    className={`tender-pipeline-strip-step ${isActive ? 'tender-pipeline-strip-step--active' : ''} ${withdrawn ? 'tender-pipeline-strip-step--muted' : ''}`}
                    style={
                      {
                        background: withdrawn ? '#f9fafb' : bg,
                        border,
                        '--step-accent': accent,
                      } as React.CSSProperties
                    }
                  >
                    <span className="tender-pipeline-strip-step-phase">{STATUS_LABELS[stage] ?? stage}</span>
                    <span className="tender-pipeline-strip-step-agent">{tagline}</span>
                  </button>
                </div>
              )
            })}

            <span className="tender-pipeline-strip-chevron" aria-hidden>
              <ChevronRight />
            </span>

            <button
              type="button"
              ref={withdrawn ? activeRef : undefined}
              title={
                withdrawn
                  ? `Tender is ingetrokken uit de pipeline. Opent: ${TENDER_DETAIL_TAB_LABELS.overview}`
                  : `Markeer als ingetrokken. Opent: ${TENDER_DETAIL_TAB_LABELS.overview}`
              }
              aria-current={withdrawn ? 'step' : undefined}
              onClick={() => onStatusChange('withdrawn')}
              className={`tender-pipeline-strip-step tender-pipeline-strip-step--withdrawn ${withdrawn ? 'tender-pipeline-strip-step--active-withdrawn' : ''}`}
            >
              <span className="tender-pipeline-strip-step-phase">{STATUS_LABELS.withdrawn}</span>
              <span className="tender-pipeline-strip-step-agent">Geen AI-fase</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
