import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { tenderSections, tenderActivities } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

    const { id, sId } = await params
    const body = await request.json()

    // Alleen server bepaalt lastEditedAt; negeer waarde uit body (voorkomt typefouten met ISO-string)
    const allowed = ['title', 'content', 'status', 'wordCount', 'lastEditedBy', 'aiGenerated']
    const updates: Record<string, unknown> = { lastEditedBy: userId, lastEditedAt: new Date() }
    for (const key of allowed) {
      if (key in body && body[key] !== undefined) updates[key] = body[key]
    }

    const [updated] = await db.update(tenderSections)
      .set(updates)
      .where(eq(tenderSections.id, sId))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Sectie niet gevonden' }, { status: 404 })
    }

    if (body.status === 'approved') {
      await db.insert(tenderActivities).values({
        tenderId: id,
        userId,
        activityType: 'section_approved',
        description: `Sectie goedgekeurd: ${updated.title}`,
        metadata: { sectionId: sId },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/tenders/.../sections/[sId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
