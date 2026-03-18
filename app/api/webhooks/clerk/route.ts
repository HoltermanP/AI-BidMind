import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const svix_id = request.headers.get('svix-id')
  const svix_timestamp = request.headers.get('svix-timestamp')
  const svix_signature = request.headers.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await request.text()
  const wh = new Webhook(webhookSecret)

  let event: any
  try {
    event = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const { type, data } = event

  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  if (type === 'user.created' || type === 'user.updated') {
    const { id, first_name, last_name, email_addresses, image_url } = data
    const name = [first_name, last_name].filter(Boolean).join(' ') || null
    const email = email_addresses?.[0]?.email_address || null

    await db.insert(users).values({
      id,
      name,
      email,
      avatarUrl: image_url || null,
      role: 'team_member',
    }).onConflictDoUpdate({
      target: users.id,
      set: { name, email, avatarUrl: image_url || null },
    })
  }

  if (type === 'user.deleted') {
    const { id } = data
    await db.delete(users).where(eq(users.id, id))
  }

  return NextResponse.json({ success: true })
}
