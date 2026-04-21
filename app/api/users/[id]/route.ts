import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { getAppUser, isAdmin } from '@/lib/auth/app-user'
import { cleanupUserReferencesBeforeDelete, pickFallbackManagerId } from '@/lib/db/cleanup-user-refs'

export const runtime = 'nodejs'

const ROLES = ['admin', 'tender_manager', 'team_member'] as const

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getAppUser()
    if (!me) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    if (!isAdmin(me)) return NextResponse.json({ error: 'Geen rechten' }, { status: 403 })
    if (!db) return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 })

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    if (body.resetAvatarToClerk === true) {
      const client = await clerkClient()
      let clerkImage: string | null = null
      try {
        const clerkUser = await client.users.getUser(id)
        clerkImage = clerkUser.imageUrl || null
      } catch {
        clerkImage = null
      }

      await db
        .update(users)
        .set({
          customAvatar: false,
          avatarUrl: clerkImage,
        })
        .where(eq(users.id, id))

      const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1)
      return NextResponse.json(row ?? {})
    }

    type Patch = {
      role?: (typeof ROLES)[number]
      linkedinUrl?: string | null
      name?: string | null
      jobTitle?: string | null
    }
    const patch: Patch = {}

    if (body.role !== undefined) {
      if (typeof body.role !== 'string' || !ROLES.includes(body.role as (typeof ROLES)[number])) {
        return NextResponse.json({ error: 'Ongeldige rol' }, { status: 400 })
      }
      patch.role = body.role as (typeof ROLES)[number]
    }

    if (body.linkedinUrl !== undefined) {
      if (body.linkedinUrl === null || body.linkedinUrl === '') {
        patch.linkedinUrl = null
      } else if (typeof body.linkedinUrl === 'string') {
        patch.linkedinUrl = body.linkedinUrl.trim()
      } else {
        return NextResponse.json({ error: 'Ongeldige LinkedIn-URL' }, { status: 400 })
      }
    }

    if (body.name !== undefined) {
      patch.name = typeof body.name === 'string' ? body.name.trim() || null : null
    }

    if (body.jobTitle !== undefined) {
      patch.jobTitle =
        body.jobTitle === null || body.jobTitle === ''
          ? null
          : typeof body.jobTitle === 'string'
            ? body.jobTitle.trim()
            : null
    }

    if (Object.keys(patch).length === 0) {
      const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1)
      return NextResponse.json(row ?? {})
    }

    await db.update(users).set(patch).where(eq(users.id, id))

    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return NextResponse.json(row ?? {})
  } catch {
    return NextResponse.json({ error: 'Interne fout' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    const me = await getAppUser()
    if (!userId || !me) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    if (!isAdmin(me)) return NextResponse.json({ error: 'Geen rechten' }, { status: 403 })
    if (!db) return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 })

    const { id } = await params
    if (id === userId) {
      return NextResponse.json({ error: 'Je kunt jezelf niet verwijderen' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    let fallbackId =
      typeof body.fallbackManagerId === 'string' && body.fallbackManagerId.trim()
        ? body.fallbackManagerId.trim()
        : null

    if (!fallbackId) {
      fallbackId = await pickFallbackManagerId(db, id)
    }

    if (!fallbackId || fallbackId === id) {
      return NextResponse.json(
        { error: 'Geen andere gebruiker beschikbaar om tenders aan over te dragen.' },
        { status: 400 }
      )
    }

    await cleanupUserReferencesBeforeDelete(db, id, fallbackId)

    try {
      const client = await clerkClient()
      await client.users.deleteUser(id)
    } catch {
      /* geen Clerk-account (seed / lokale demo-user): alleen DB verwijderen */
    }

    await db.delete(users).where(eq(users.id, id))

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[DELETE user]', e)
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 400 })
  }
}
