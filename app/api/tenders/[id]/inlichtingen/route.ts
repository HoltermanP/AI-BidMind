import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { tenderInlichtingen } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json([])

    const { id: tenderId } = await params
    const rows = await db
      .select()
      .from(tenderInlichtingen)
      .where(eq(tenderInlichtingen.tenderId, tenderId))
      .orderBy(desc(tenderInlichtingen.createdAt))
    return NextResponse.json(rows)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

    const { id: tenderId } = await params
    const body = await request.json().catch(() => ({}))
    const vraag = typeof body.vraag === 'string' ? body.vraag.trim() : ''
    if (!vraag) return NextResponse.json({ error: 'vraag is verplicht' }, { status: 400 })

    const ingediendOp = body.ingediendOp ? new Date(body.ingediendOp) : null
    const [row] = await db
      .insert(tenderInlichtingen)
      .values({
        tenderId,
        vraag,
        ingediendOp,
        antwoord: typeof body.antwoord === 'string' ? body.antwoord : null,
        raaktInschrijving: Boolean(body.raaktInschrijving),
        concurrentieNota: typeof body.concurrentieNota === 'string' ? body.concurrentieNota : null,
      })
      .returning()
    return NextResponse.json(row, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
