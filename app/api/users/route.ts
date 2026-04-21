import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { eq, sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { getAppUser, isAdmin } from '@/lib/auth/app-user'

const ROLES = ['admin', 'tender_manager', 'team_member'] as const

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!db) return NextResponse.json([])

    const allUsers = await db.select().from(users)
    return NextResponse.json(allUsers)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Teamlid alleen in BidMind (geen Clerk-login); voor demo / interne registratie. */
export async function POST(request: NextRequest) {
  try {
    const me = await getAppUser()
    if (!me) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    if (!isAdmin(me)) return NextResponse.json({ error: 'Geen rechten' }, { status: 403 })
    if (!db) return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 })

    const body = await request.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const jobTitle =
      typeof body.jobTitle === 'string' && body.jobTitle.trim() ? body.jobTitle.trim() : null
    const roleRaw = typeof body.role === 'string' ? body.role : 'team_member'
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Naam en geldig e-mailadres zijn verplicht' }, { status: 400 })
    }
    if (!ROLES.includes(roleRaw as (typeof ROLES)[number])) {
      return NextResponse.json({ error: 'Ongeldige rol' }, { status: 400 })
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`LOWER(${users.email}) = LOWER(${email})`)
      .limit(1)
    if (existing) {
      return NextResponse.json({ error: 'Dit e-mailadres bestaat al' }, { status: 409 })
    }

    const id = `local_${randomUUID().replace(/-/g, '')}`

    await db.insert(users).values({
      id,
      name,
      email,
      jobTitle,
      role: roleRaw as (typeof ROLES)[number],
      customAvatar: false,
    })

    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return NextResponse.json(row ?? {})
  } catch {
    return NextResponse.json({ error: 'Aanmaken mislukt' }, { status: 500 })
  }
}

