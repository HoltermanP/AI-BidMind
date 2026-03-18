import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { tenderQuestions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json([])

    const { id } = await params
    const questions = await db.select().from(tenderQuestions)
      .where(eq(tenderQuestions.tenderId, id))
      .orderBy(desc(tenderQuestions.createdAt))

    return NextResponse.json(questions)
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

    const [question] = await db.insert(tenderQuestions).values({
      tenderId: id,
      questionText: body.questionText,
      rationale: body.rationale || null,
      category: body.category || 'Overig',
      priority: body.priority || 'medium',
      status: 'draft',
      aiGenerated: false,
      createdBy: userId,
    }).returning()

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
