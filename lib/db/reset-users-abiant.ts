/**
 * Verwijdert alle gebruikers behalve pholte20@gmail.com en voegt 10 fictieve Abiant-profielen toe.
 * Ruimt eerst foreign-key-achtige verwijzingen naar user-ids op in tenders en gerelateerde tabellen.
 */
import { eq, ne, sql, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  users,
  tenders,
  tenderDocuments,
  tenderSections,
  tenderActivities,
  tenderNotes,
  lessonsLearned,
  companySettings,
} from '@/lib/db/schema'
import { ABIANT_TEAM } from '@/lib/abiant-team-data'

/** Zet in `.env.local`: KEEP_USER_EMAIL=jouw-clerk-email (moet al een rij in `users` hebben, via webhook of seed). */
const KEEP_EMAIL = (process.env.KEEP_USER_EMAIL || 'pholte20@gmail.com').trim()

export async function resetUsersAbiant(): Promise<{ keptUserId: string; deletedCount: number; inserted: number }> {
  if (!db) throw new Error('DATABASE_URL ontbreekt')

  const [keeper] = await db
    .select()
    .from(users)
    .where(sql`LOWER(${users.email}) = LOWER(${KEEP_EMAIL})`)
    .limit(1)

  if (!keeper) {
    const all = await db.select({ email: users.email }).from(users)
    const listed = all.map((u) => u.email || '(geen e-mail)').join(', ')
    throw new Error(
      `Gebruiker met e-mail "${KEEP_EMAIL}" niet gevonden.\n\n` +
        `In deze database staan nu: ${listed || 'geen gebruikers'}\n\n` +
        `Oplossing: (1) Log één keer in met dat Clerk-account zodat /api/webhooks/clerk een user aanmaakt, of ` +
        `(2) zet in .env.local bijvoorbeeld KEEP_USER_EMAIL=jan@infraco.nl als je tijdelijk een bestaande seed-user wilt behouden, daarna opnieuw: npm run db:reset-users-abiant`
    )
  }

  const allOthers = await db.select({ id: users.id }).from(users).where(ne(users.id, keeper.id))

  const deleteIds = new Set(allOthers.map((u) => u.id))
  if (deleteIds.size === 0) {
    // alleen keeper — direct insert team (idempotent)
    await db.insert(users).values(ABIANT_TEAM.map((u) => ({ ...u, customAvatar: false }))).onConflictDoNothing()
    return { keptUserId: keeper.id, deletedCount: 0, inserted: ABIANT_TEAM.length }
  }

  const idList = [...deleteIds]

  // Tenders: manager → keeper; teamledenlijst opschonen
  const allTenders = await db.select().from(tenders)
  for (const t of allTenders) {
    let managerId = t.tenderManagerId
    if (managerId && deleteIds.has(managerId)) {
      managerId = keeper.id
    }
    const team = (t.teamMemberIds || []).filter((uid) => !deleteIds.has(uid))

    await db
      .update(tenders)
      .set({
        tenderManagerId: managerId,
        teamMemberIds: team,
      })
      .where(eq(tenders.id, t.id))
  }

  const [settings] = await db.select().from(companySettings).where(eq(companySettings.id, 'default'))
  if (settings?.defaultTenderManagerId && deleteIds.has(settings.defaultTenderManagerId)) {
    await db.update(companySettings).set({ defaultTenderManagerId: keeper.id }).where(eq(companySettings.id, 'default'))
  }

  // Losse user-id kolommen → null waar verwijzing naar verwijderde user
  await db.update(tenderDocuments).set({ uploadedBy: null }).where(inArray(tenderDocuments.uploadedBy, idList))

  await db.update(tenderSections).set({ lastEditedBy: null }).where(inArray(tenderSections.lastEditedBy, idList))

  await db.update(tenderActivities).set({ userId: null }).where(inArray(tenderActivities.userId, idList))

  await db.update(tenderNotes).set({ authorId: null }).where(inArray(tenderNotes.authorId, idList))

  await db.update(lessonsLearned).set({ createdBy: null }).where(inArray(lessonsLearned.createdBy, idList))

  await db.delete(users).where(inArray(users.id, idList))

  await db.insert(users).values(ABIANT_TEAM.map((u) => ({ ...u, customAvatar: false }))).onConflictDoNothing()

  return { keptUserId: keeper.id, deletedCount: idList.length, inserted: ABIANT_TEAM.length }
}
