import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { tenderNotes, tenderActivities, tenders } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json([])

    const { id } = await params
    const notes = await db.select().from(tenderNotes)
      .where(eq(tenderNotes.tenderId, id))
      .orderBy(desc(tenderNotes.createdAt))

    return NextResponse.json(notes)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

    const { id } = await params
    const body = await request.json()

    const [note] = await db.insert(tenderNotes).values({
      tenderId: id,
      authorId: userId,
      content: body.content,
      noteType: body.noteType || 'internal',
    }).returning()

    // Update denormalized counter
    await db.update(tenders)
      .set({ notesCount: sql`${tenders.notesCount} + 1` })
      .where(eq(tenders.id, id))

    await db.insert(tenderActivities).values({
      tenderId: id,
      userId,
      activityType: 'note_added',
      description: `Notitie toegevoegd (${body.noteType || 'intern'})`,
      metadata: { noteId: note.id, noteType: body.noteType },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
