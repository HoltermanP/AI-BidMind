/**
 * Verwijdert seed-gebruiker Jan de Vries (jan@infraco.nl / user_seed_001) als die nog bestaat.
 * Promoveert pholte20@gmail.com naar admin zodat CRUD-rechten behouden blijven na verwijderen van Jan.
 */
import { eq, ilike, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { cleanupUserReferencesBeforeDelete } from '@/lib/db/cleanup-user-refs'

const JAN_EMAIL = 'jan@infraco.nl'
const JAN_ID = 'user_seed_001'
const FALLBACK_MANAGER = 'abiant_001'
const PHOLTE_EMAIL = 'pholte20@gmail.com'

export async function removeJanDeVries(): Promise<{ removed: boolean; reason?: string }> {
  if (!db) throw new Error('DATABASE_URL ontbreekt')

  await db
    .update(users)
    .set({ role: 'admin' })
    .where(sql`LOWER(${users.email}) = LOWER(${PHOLTE_EMAIL})`)

  const [jan] = await db
    .select()
    .from(users)
    .where(or(eq(users.id, JAN_ID), ilike(users.email, JAN_EMAIL)))
    .limit(1)

  if (!jan) {
    return { removed: false, reason: 'Jan de Vries staat niet meer in de database' }
  }

  const [fallback] = await db.select().from(users).where(eq(users.id, FALLBACK_MANAGER)).limit(1)
  if (!fallback) {
    throw new Error(`Fallback tendermanager ${FALLBACK_MANAGER} ontbreekt; voer eerst db:reset-users-abiant uit.`)
  }

  await cleanupUserReferencesBeforeDelete(db, jan.id, fallback.id)

  await db.delete(users).where(eq(users.id, jan.id))

  return { removed: true }
}
