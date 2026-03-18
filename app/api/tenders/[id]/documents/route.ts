import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { tenderDocuments, tenderActivities } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json([])

    const { id } = await params
    const docs = await db.select().from(tenderDocuments)
      .where(eq(tenderDocuments.tenderId, id))
      .orderBy(desc(tenderDocuments.uploadedAt))

    return NextResponse.json(docs)
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

    const [doc] = await db.insert(tenderDocuments).values({
      tenderId: id,
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      fileSize: body.fileSize || null,
      documentType: body.documentType || 'eigen_upload',
      analysisStatus: 'pending',
      uploadedBy: userId,
    }).returning()

    await db.insert(tenderActivities).values({
      tenderId: id,
      userId,
      activityType: 'document_uploaded',
      description: `Document geüpload: ${body.fileName}`,
      metadata: { fileName: body.fileName, docId: doc.id },
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
