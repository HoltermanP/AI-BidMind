import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { tenderSections } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json([])

    const { id } = await params
    const sections = await db.select().from(tenderSections)
      .where(eq(tenderSections.tenderId, id))
      .orderBy(tenderSections.orderIndex)

    return NextResponse.json(sections)
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

    const [section] = await db.insert(tenderSections).values({
      tenderId: id,
      sectionType: body.sectionType || 'eigen_sectie',
      title: body.title || 'Nieuwe sectie',
      content: '',
      status: 'empty',
      orderIndex: body.orderIndex || 0,
      wordCount: 0,
    }).returning()

    return NextResponse.json(section, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
