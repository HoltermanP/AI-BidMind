import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { tenders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { runScreeningQualificationForTenderId } from '@/lib/tenders/screening-qualification'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/tenders/[id]/screening — Screening Agent (5 criteria → goNoGoScore, goNoGo, motivering).
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

    const { id } = await params
    const [existing] = await db.select().from(tenders).where(eq(tenders.id, id))
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await runScreeningQualificationForTenderId(id)

    const [updated] = await db.select().from(tenders).where(eq(tenders.id, id))
    return NextResponse.json(updated)
  } catch (error) {
    console.error('POST screening error:', error)
    const msg = error instanceof Error ? error.message : 'Internal server error'
    const status = msg.includes('niet geconfigureerd') ? 503 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
