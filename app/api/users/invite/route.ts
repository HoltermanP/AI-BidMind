import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { getAppUser, isAdmin } from '@/lib/auth/app-user'

export const runtime = 'nodejs'

function appOrigin(request: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  if (env) return env
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'http'
  return host ? `${proto}://${host}` : 'http://localhost:3000'
}

export async function POST(request: NextRequest) {
  try {
    const me = await getAppUser()
    if (!me) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    if (!isAdmin(me)) return NextResponse.json({ error: 'Geen rechten' }, { status: 403 })

    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 })
    }

    const origin = appOrigin(request)
    const redirectUrl = `${origin}/sign-up`

    const client = await clerkClient()
    const invitation = await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl,
      notify: true,
      ignoreExisting: false,
    })

    return NextResponse.json({ invitationId: invitation.id, email: invitation.emailAddress })
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'errors' in e ? JSON.stringify((e as { errors: unknown }).errors) : String(e)
    console.error('[invite]', msg)
    return NextResponse.json({ error: 'Uitnodigen mislukt. Staat deze e-mail al geregistreerd of is Clerk niet geconfigureerd?' }, { status: 400 })
  }
}
