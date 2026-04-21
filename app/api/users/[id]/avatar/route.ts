import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { getAppUser, isAdmin } from '@/lib/auth/app-user'

export const runtime = 'nodejs'

const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getAppUser()
    if (!me) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    if (!isAdmin(me)) return NextResponse.json({ error: 'Geen rechten' }, { status: 403 })
    if (!db) return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 })

    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Geen bestand' }, { status: 400 })

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: 'Alleen JPEG, PNG of WebP' }, { status: 400 })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    if (buf.length > MAX_BYTES) {
      return NextResponse.json({ error: 'Maximaal 2 MB' }, { status: 400 })
    }

    const ext = file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg'
    const relativeUrl = `/uploads/avatars/${id}${ext}`
    const absDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    const absFile = path.join(absDir, `${id}${ext}`)

    await mkdir(absDir, { recursive: true })
    await writeFile(absFile, buf)

    await db
      .update(users)
      .set({
        avatarUrl: relativeUrl,
        customAvatar: true,
      })
      .where(eq(users.id, id))

    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return NextResponse.json(row ?? {})
  } catch (e) {
    console.error('[avatar upload]', e)
    return NextResponse.json({ error: 'Upload mislukt' }, { status: 500 })
  }
}
