import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { tenders, tenderDocuments, tenderSections, tenderActivities } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { HANDOVER_PLAN_SYSTEM, HANDOVER_PLAN_USER, HANDOVER_PRESENTATION_SYSTEM, HANDOVER_PRESENTATION_USER } from '@/lib/ai/prompts'
import { runAnthropicCompletionDetailed, isAgentAvailable } from '@/lib/ai/run'
import { getCompanyContext } from '@/lib/company/context'
import { sanitizeAndWrapHandoverPlanHtml, sanitizeAndWrapHandoverPresentationHtml } from '@/lib/analysis/sanitize-report-html'
import { tenderMetadataJson } from '@/lib/tenders/tender-metadata-json'

export const maxDuration = 120

function visibleTextLength(html: string): number {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim().length
}

function stripHtmlToPlain(html: string, maxChars: number): string {
  const plain = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (plain.length <= maxChars) return plain
  return plain.slice(0, maxChars) + ' […]'
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    if (!isAgentAvailable('handover_report')) {
      return NextResponse.json(
        { error: 'AI-provider voor Overdracht niet geconfigureerd (ANTHROPIC_API_KEY)' },
        { status: 503 }
      )
    }

    const { id } = await params

    const [tender] = await db.select().from(tenders).where(eq(tenders.id, id))
    if (!tender) return NextResponse.json({ error: 'Tender niet gevonden' }, { status: 404 })

    if (tender.status !== 'won') {
      return NextResponse.json(
        {
          error:
            'Overdracht is alleen beschikbaar voor gewonnen tenders. Zet de pipeline op “Gewonnen” en probeer opnieuw.',
        },
        { status: 400 }
      )
    }

    const sections = await db
      .select()
      .from(tenderSections)
      .where(eq(tenderSections.tenderId, id))
      .orderBy(asc(tenderSections.orderIndex))

    /** Alle secties met minstens enige inhoud; één korte sectie is voldoende, meerdere secties gaan allemaal mee. */
    const sectionsWithContent = sections.filter((s) => (s.content || '').trim().length > 0)
    if (sectionsWithContent.length === 0) {
      return NextResponse.json(
        {
          error:
            'Geen secties met inhoud. Vul minstens één sectie op het tabblad Aanbieding (ook een korte tekst volstaat).',
        },
        { status: 400 }
      )
    }

    await db
      .update(tenders)
      .set({ handoverReportStatus: 'processing', updatedAt: new Date() })
      .where(eq(tenders.id, id))

    let sectionsPayload = sectionsWithContent
      .map((s) =>
        JSON.stringify(
          {
            titel: s.title,
            type: s.sectionType,
            status: s.status,
            woorden: s.wordCount,
            inhoud: s.content,
          },
          null,
          2
        )
      )
      .join('\n\n---\n\n')

    const maxSectionChars = 200_000
    if (sectionsPayload.length > maxSectionChars) {
      sectionsPayload =
        sectionsPayload.slice(0, maxSectionChars) +
        '\n\n[... sectieteksten ingekort ...]'
    }

    const docs = await db.select().from(tenderDocuments).where(eq(tenderDocuments.tenderId, id))
    const analyzed = docs.filter((d) => d.analysisStatus === 'done' && d.analysisJson)

    let criteriaAndDocumentsPayload = analyzed
      .map((d) =>
        JSON.stringify(
          {
            bestand: d.fileName,
            type: d.documentType,
            samenvatting: d.analysisSummary,
            award_criteria: (d.analysisJson as { award_criteria?: unknown })?.award_criteria,
            key_requirements: (d.analysisJson as { key_requirements?: unknown })?.key_requirements,
            risks: (d.analysisJson as { risks?: unknown })?.risks,
          },
          null,
          2
        )
      )
      .join('\n\n---\n\n')

    if (!criteriaAndDocumentsPayload.trim()) {
      criteriaAndDocumentsPayload =
        '(Geen geanalyseerde documenten beschikbaar. Werk met de sectieteksten en algemene infra-praktijk; vermeld expliciet waar brondata ontbreken.)'
    } else {
      const maxCrit = 120_000
      if (criteriaAndDocumentsPayload.length > maxCrit) {
        criteriaAndDocumentsPayload =
          criteriaAndDocumentsPayload.slice(0, maxCrit) + '\n\n[... documentcontext ingekort ...]'
      }
    }

    const analysisReportExcerpt = tender.analysisReportHtml
      ? stripHtmlToPlain(tender.analysisReportHtml, 14_000)
      : undefined
    const reviewReportExcerpt = tender.reviewReportHtml
      ? stripHtmlToPlain(tender.reviewReportHtml, 12_000)
      : undefined

    const companyContext = await getCompanyContext()
    const tenderJson = tenderMetadataJson(tender)

    // Call 1: implementatieplan (plain HTML — geen JSON-wrapper)
    const { text: rawPlan, stopReason: planStopReason } = await runAnthropicCompletionDetailed(
      'handover_report',
      HANDOVER_PLAN_SYSTEM,
      HANDOVER_PLAN_USER({
        tenderJson,
        sectionsPayload,
        criteriaAndDocumentsPayload,
        analysisReportExcerpt,
        reviewReportExcerpt,
        companyContext: companyContext || undefined,
      }),
      { maxTokens: 8192 }
    )

    if (planStopReason === 'max_tokens' || planStopReason === 'refusal') {
      await db
        .update(tenders)
        .set({ handoverReportStatus: 'failed', updatedAt: new Date() })
        .where(eq(tenders.id, id))
      return NextResponse.json(
        {
          error:
            planStopReason === 'refusal'
              ? 'Het model weigerde het implementatieplan te genereren. Probeer later opnieuw.'
              : 'Het implementatieplan werd afgekapt door de tokenlimiet. Probeer het opnieuw.',
        },
        { status: 500 }
      )
    }

    const planHtml = sanitizeAndWrapHandoverPlanHtml(rawPlan || '')

    if (visibleTextLength(planHtml) < 300) {
      console.error('Handover plan: too short after sanitize', {
        planStopReason,
        rawLength: rawPlan?.length ?? 0,
        rawPreview: (rawPlan || '').slice(0, 400),
      })
      await db
        .update(tenders)
        .set({ handoverReportStatus: 'failed', updatedAt: new Date() })
        .where(eq(tenders.id, id))
      return NextResponse.json(
        { error: 'Het model leverde geen bruikbaar implementatieplan. Probeer opnieuw te genereren.' },
        { status: 500 }
      )
    }

    // Sla het plan alvast op zodat het niet verloren gaat als de presentatie mislukt
    await db
      .update(tenders)
      .set({ handoverPlanHtml: planHtml, updatedAt: new Date() })
      .where(eq(tenders.id, id))

    // Call 2: presentatie-slides (plain HTML — geen JSON-wrapper)
    const planSummary = stripHtmlToPlain(planHtml, 6000)
    const { text: rawPresentation, stopReason: presStopReason } = await runAnthropicCompletionDetailed(
      'handover_report',
      HANDOVER_PRESENTATION_SYSTEM,
      HANDOVER_PRESENTATION_USER({
        tenderJson,
        planSummary,
        companyContext: companyContext || undefined,
      }),
      { maxTokens: 4096 }
    )

    if (presStopReason === 'max_tokens' || presStopReason === 'refusal') {
      await db
        .update(tenders)
        .set({ handoverReportStatus: 'failed', updatedAt: new Date() })
        .where(eq(tenders.id, id))
      return NextResponse.json(
        {
          error:
            presStopReason === 'refusal'
              ? 'Het model weigerde de presentatie te genereren. Probeer later opnieuw.'
              : 'De presentatie werd afgekapt door de tokenlimiet. Probeer het opnieuw.',
        },
        { status: 500 }
      )
    }

    const presentationHtml = sanitizeAndWrapHandoverPresentationHtml(rawPresentation || '')
    const now = new Date()

    if (visibleTextLength(presentationHtml) < 120) {
      console.error('Handover presentation: too short after sanitize', {
        presStopReason,
        rawLength: rawPresentation?.length ?? 0,
        rawPreview: (rawPresentation || '').slice(0, 400),
      })
      await db
        .update(tenders)
        .set({ handoverReportStatus: 'failed', updatedAt: new Date() })
        .where(eq(tenders.id, id))
      return NextResponse.json(
        { error: 'Het model leverde geen bruikbare presentatie. Probeer opnieuw te genereren.' },
        { status: 500 }
      )
    }

    const [updated] = await db
      .update(tenders)
      .set({
        handoverPlanHtml: planHtml,
        handoverPresentationHtml: presentationHtml,
        handoverReportStatus: 'done',
        handoverReportGeneratedAt: now,
        updatedAt: now,
      })
      .where(eq(tenders.id, id))
      .returning()

    await db.insert(tenderActivities).values({
      tenderId: id,
      userId,
      activityType: 'tender_handover_report',
      description: 'Overdracht: implementatieplan en presentatie gegenereerd',
      metadata: { planStopReason: planStopReason ?? undefined, presStopReason: presStopReason ?? undefined },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Handover report error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    const likelyMissingMigration = /handover|42703|column .* does not exist/i.test(msg)
    if (db) {
      try {
        const { id } = await params
        await db
          .update(tenders)
          .set({ handoverReportStatus: 'failed', updatedAt: new Date() })
          .where(eq(tenders.id, id))
      } catch {
        /* ignore */
      }
    }
    return NextResponse.json(
      {
        error: likelyMissingMigration
          ? 'Database mist overdracht-kolommen. Voer migraties uit (npm run db:migrate of drizzle-kit push) en probeer opnieuw.'
          : 'Genereren van overdrachtsrapport mislukt',
      },
      { status: 500 }
    )
  }
}
