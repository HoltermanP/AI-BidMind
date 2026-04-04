import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { tenders, tenderDocuments, tenderActivities, tenderRisicoItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TENDER_RISK_REPORT_SYSTEM, TENDER_RISK_REPORT_USER } from '@/lib/ai/prompts'
import { runAnthropicCompletionDetailed, isAgentAvailable } from '@/lib/ai/run'
import { getCompanyContext } from '@/lib/company/context'
import { sanitizeAndWrapTenderRiskReportHtml } from '@/lib/analysis/sanitize-report-html'
import { parseTenderRiskReportResponse } from '@/lib/analysis/parse-tender-risk-report'
import { tenderMetadataJson } from '@/lib/tenders/tender-metadata-json'

export const maxDuration = 120

function visibleTextLength(html: string): number {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim().length
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    if (!isAgentAvailable('tender_risk_report')) {
      return NextResponse.json(
        { error: 'AI-provider voor risicorapport niet geconfigureerd (ANTHROPIC_API_KEY)' },
        { status: 503 }
      )
    }

    const [tender] = await db.select().from(tenders).where(eq(tenders.id, id))
    if (!tender) return NextResponse.json({ error: 'Tender niet gevonden' }, { status: 404 })

    const docs = await db.select().from(tenderDocuments).where(eq(tenderDocuments.tenderId, id))
    const analyzed = docs.filter((d) => d.analysisStatus === 'done' && d.analysisJson)
    if (analyzed.length === 0) {
      return NextResponse.json(
        { error: 'Geen geanalyseerde documenten. Analyseer eerst minstens één document onder Documenten.' },
        { status: 400 }
      )
    }

    await db
      .update(tenders)
      .set({ riskReportStatus: 'processing', updatedAt: new Date() })
      .where(eq(tenders.id, id))

    let documentsPayload = analyzed
      .map((d) =>
        JSON.stringify(
          {
            bestand: d.fileName,
            type: d.documentType,
            samenvatting: d.analysisSummary,
            analyse: d.analysisJson,
          },
          null,
          2
        )
      )
      .join('\n\n---\n\n')

    const maxChars = 180_000
    if (documentsPayload.length > maxChars) {
      documentsPayload =
        documentsPayload.slice(0, maxChars) +
        '\n\n[... brondata ingekort voor rapportage; gebruik de beschikbare fragmenten ...]'
    }

    const companyContext = await getCompanyContext()
    const { text: raw, stopReason } = await runAnthropicCompletionDetailed(
      'tender_risk_report',
      TENDER_RISK_REPORT_SYSTEM,
      TENDER_RISK_REPORT_USER({
        tenderJson: tenderMetadataJson(tender),
        documentsPayload,
        companyContext: companyContext || undefined,
      }),
      { maxTokens: 16384, jsonMode: true }
    )

    if (stopReason === 'max_tokens' || stopReason === 'refusal') {
      await db
        .update(tenders)
        .set({ riskReportStatus: 'failed', updatedAt: new Date() })
        .where(eq(tenders.id, id))
      return NextResponse.json({ error: 'Genereren risicorapport mislukt (modelstop).' }, { status: 500 })
    }

    const { html: htmlFromParse, contractType, items } = parseTenderRiskReportResponse(raw || '')
    const html = sanitizeAndWrapTenderRiskReportHtml(htmlFromParse)
    const now = new Date()

    if (visibleTextLength(html) < 120) {
      await db
        .update(tenders)
        .set({ riskReportStatus: 'failed', updatedAt: new Date() })
        .where(eq(tenders.id, id))
      return NextResponse.json({ error: 'Geen bruikbaar risicorapport ontvangen.' }, { status: 500 })
    }

    await db.delete(tenderRisicoItems).where(eq(tenderRisicoItems.tenderId, id))
    if (items.length > 0) {
      await db.insert(tenderRisicoItems).values(
        items.map((it) => ({
          tenderId: id,
          type: it.type,
          omschrijving: it.omschrijving,
          ernst: it.ernst,
        }))
      )
    }

    const [updated] = await db
      .update(tenders)
      .set({
        riskReportHtml: html,
        riskReportStatus: 'done',
        riskReportGeneratedAt: now,
        contractType,
        updatedAt: now,
      })
      .where(eq(tenders.id, id))
      .returning()

    await db.insert(tenderActivities).values({
      tenderId: id,
      userId,
      activityType: 'tender_risk_report',
      description: 'Risico Agent: contract- en risicorapport gegenereerd',
      metadata: { contractType, risicoItems: items.length },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Tender risk report error:', error)
    if (db) {
      await db
        .update(tenders)
        .set({ riskReportStatus: 'failed', updatedAt: new Date() })
        .where(eq(tenders.id, id))
    }
    return NextResponse.json({ error: 'Genereren van risicorapport mislukt' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

    const { id } = await params
    const [tender] = await db.select().from(tenders).where(eq(tenders.id, id))
    if (!tender) return NextResponse.json({ error: 'Tender niet gevonden' }, { status: 404 })
    if (tender.riskReportStatus === 'processing') {
      return NextResponse.json({ error: 'Even wachten: het risicorapport wordt nog gegenereerd.' }, { status: 409 })
    }

    const now = new Date()
    await db.delete(tenderRisicoItems).where(eq(tenderRisicoItems.tenderId, id))
    const [updated] = await db
      .update(tenders)
      .set({
        riskReportHtml: null,
        riskReportStatus: 'pending',
        riskReportGeneratedAt: null,
        updatedAt: now,
      })
      .where(eq(tenders.id, id))
      .returning()

    await db.insert(tenderActivities).values({
      tenderId: id,
      userId,
      activityType: 'tender_risk_report',
      description: 'Risicorapport verwijderd',
      metadata: { action: 'deleted' },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('DELETE risk-report error:', error)
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 })
  }
}
