import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { tenderInlichtingen } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

    const { id: tenderId, itemId } = await params
    const body = await request.json().catch(() => ({}))

    const updates: Record<string, unknown> = {}
    if (typeof body.vraag === 'string') updates.vraag = body.vraag
    if ('ingediendOp' in body) updates.ingediendOp = body.ingediendOp ? new Date(body.ingediendOp) : null
    if (typeof body.antwoord === 'string') updates.antwoord = body.antwoord
    if (typeof body.raaktInschrijving === 'boolean') updates.raaktInschrijving = body.raaktInschrijving
    if (typeof body.concurrentieNota === 'string') updates.concurrentieNota = body.concurrentieNota

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Geen velden om bij te werken' }, { status: 400 })
    }

    const [row] = await db
      .update(tenderInlichtingen)
      .set(updates as any)
      .where(and(eq(tenderInlichtingen.id, itemId), eq(tenderInlichtingen.tenderId, tenderId)))
      .returning()

    if (!row) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
    return NextResponse.json(row)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

    const { id: tenderId, itemId } = await params
    const [gone] = await db
      .delete(tenderInlichtingen)
      .where(and(eq(tenderInlichtingen.id, itemId), eq(tenderInlichtingen.tenderId, tenderId)))
      .returning({ id: tenderInlichtingen.id })
    if (!gone) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
