import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { ABIANT_TEAM } from '@/lib/abiant-team-data'

/** Werkt bestaande Abiant-demo-rijen bij naar de actuele functietitels (zonder volledige reset). */
export async function syncAbiantJobTitles(): Promise<{ updated: number }> {
  if (!db) throw new Error('DATABASE_URL ontbreekt')

  let updated = 0
  for (const row of ABIANT_TEAM) {
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.id, row.id)).limit(1)
    if (!u) continue

    await db
      .update(users)
      .set({
        jobTitle: row.jobTitle,
        name: row.name,
        email: row.email,
        role: row.role,
      })
      .where(eq(users.id, row.id))
    updated += 1
  }

  return { updated }
}
