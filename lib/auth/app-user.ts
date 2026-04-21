import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export type AppUser = {
  id: string
  name: string | null
  email: string | null
  role: 'admin' | 'tender_manager' | 'team_member' | null
}

export async function getAppUser(): Promise<AppUser | null> {
  const { userId } = await auth()
  if (!userId || !db) return null

  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!row) return null

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role ?? 'team_member',
  }
}

export function isAdmin(user: AppUser | null): boolean {
  return user?.role === 'admin'
}
