import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { tenders, tenderActivities } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { computePrijsAbnormaalLaag } from '@/lib/tenders/compute-prijs-flag'
import { isValidTransition } from '@/lib/tender/pipeline'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { id } = await params
    const [tender] = await db.select().from(tenders).where(eq(tenders.id, id))
    if (!tender) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(tender)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

    const { id } = await params
    const body = await request.json()

    const [existing] = await db.select().from(tenders).where(eq(tenders.id, id))
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const allowedFields = [
      'title',
      'referenceNumber',
      'contractingAuthority',
      'procedureType',
      'estimatedValue',
      'deadlineQuestions',
      'deadlineSubmission',
      'tendernetUrl',
      'status',
      'goNoGo',
      'winProbability',
      'tenderManagerId',
      'teamMemberIds',
      'goNoGoReasoning',
      'cpvCodes',
      'publicationDate',
      'source',
      'contractType',
      'goNoGoScore',
      'analysisCoreJson',
      'inlichtingenFaseStatus',
      'monitorStatus',
      'alcatelTermijnDatum',
      'nviVerwerkt',
      'kostenRaming',
      'margePercentage',
      'prijsInschrijving',
      'ontwerpKostenRaming',
      'handoverKickoffDate',
      'handoverProjectLeader',
      'handoverMilestones',
      'handoverFirstPaymentDue',
      'evaluatieDebriefingDraft',
      'evaluatieScoreVergelijkingJson',
      'evaluatieBezwaarCheckJson',
    ] as const

    const dateFields = new Set([
      'deadlineQuestions',
      'deadlineSubmission',
      'publicationDate',
      'alcatelTermijnDatum',
      'handoverKickoffDate',
      'handoverFirstPaymentDue',
    ])

    const decimalFields = new Set([
      'estimatedValue',
      'kostenRaming',
      'margePercentage',
      'prijsInschrijving',
      'ontwerpKostenRaming',
    ])

    const jsonFields = new Set(['goNoGoScore', 'analysisCoreJson', 'evaluatieScoreVergelijkingJson', 'evaluatieBezwaarCheckJson'])

    const updates: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (!(key in body)) continue
      const v = body[key]
      if (v === undefined) continue
      if (dateFields.has(key)) {
        updates[key] = v && v !== '' ? new Date(String(v)) : null
        continue
      }
      if (decimalFields.has(key)) {
        if (v === null || v === '') updates[key] = null
        else updates[key] = typeof v === 'number' ? String(v) : String(v)
        continue
      }
      if (jsonFields.has(key)) {
        updates[key] = v
        continue
      }
      if (key === 'nviVerwerkt') {
        updates[key] = Boolean(v)
        continue
      }
      updates[key] = v
    }

    // Validate status transition
    if ('status' in body && body.status !== existing.status) {
      const { valid, message } = isValidTransition(existing.status ?? '', body.status)
      if (!valid) {
        return NextResponse.json({ error: message }, { status: 422 })
      }
    }

    // Apply sub-phase initialization rules when status changes
    if ('status' in body && body.status !== existing.status) {
      const newStatus = body.status as string

      if (newStatus === 'inlichtingen' && !('inlichtingenFaseStatus' in body)) {
        updates.inlichtingenFaseStatus = 'vragen_opstellen'
      }

      if (newStatus === 'submitted' && !('monitorStatus' in body)) {
        updates.monitorStatus = 'ingediend'
      }

      if ((newStatus === 'won' || newStatus === 'lost') && !('monitorStatus' in body)) {
        updates.monitorStatus = 'definitief'
      }
    }

    const merged = { ...existing, ...updates } as typeof existing
    updates.prijsAbnormaalLaag = computePrijsAbnormaalLaag(merged.prijsInschrijving, merged.estimatedValue)

    updates.updatedAt = new Date()

    const [updated] = await db.update(tenders).set(updates as any).where(eq(tenders.id, id)).returning()

    // Log status changes
    if ('status' in body && body.status !== existing.status) {
      await db.insert(tenderActivities).values({
        tenderId: id,
        userId,
        activityType: 'status_changed',
        description: `Status gewijzigd naar ${body.status}`,
        metadata: { status: body.status, previousStatus: existing.status },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/tenders/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

    const { id } = await params
    const [existing] = await db.select().from(tenders).where(eq(tenders.id, id))
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Verwijder tender; door ON DELETE CASCADE worden automatisch verwijderd:
    // tender_activities, tender_documents, tender_notes, tender_questions, tender_sections
    await db.delete(tenders).where(eq(tenders.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/tenders/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
