import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { tenderDocuments, tenderActivities } from '@/lib/db/schema'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // In production, upload to UploadThing or S3. For now, create a DB record.
    // The file URL would normally come from the storage service.
    const fileUrl = `https://placeholder.uploadthing.com/${Date.now()}_${file.name}`

    const [doc] = await db.insert(tenderDocuments).values({
      tenderId: id,
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      documentType: 'eigen_upload',
      analysisStatus: 'pending',
      uploadedBy: userId,
    }).returning()

    await db.insert(tenderActivities).values({
      tenderId: id,
      userId,
      activityType: 'document_uploaded',
      description: `Document geüpload: ${file.name}`,
      metadata: { fileName: file.name, docId: doc.id },
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
