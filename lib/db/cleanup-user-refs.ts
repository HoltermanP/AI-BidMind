import { eq, ne } from 'drizzle-orm'
import type { DB } from './index'
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

/** Verwijdert alle verwijzingen naar `removeId` en wijst tendermanager naar `fallbackManagerId`. */
export async function cleanupUserReferencesBeforeDelete(
  db: DB,
  removeId: string,
  fallbackManagerId: string
): Promise<void> {
  if (removeId === fallbackManagerId) {
    throw new Error('removeId en fallbackManagerId mogen niet gelijk zijn')
  }

  const allTenders = await db.select().from(tenders)
  for (const t of allTenders) {
    let managerId = t.tenderManagerId
    if (managerId === removeId) {
      managerId = fallbackManagerId
    }
    const team = (t.teamMemberIds || []).filter((uid) => uid !== removeId)

    await db
      .update(tenders)
      .set({
        tenderManagerId: managerId,
        teamMemberIds: team,
      })
      .where(eq(tenders.id, t.id))
  }

  const [settings] = await db.select().from(companySettings).where(eq(companySettings.id, 'default'))
  if (settings?.defaultTenderManagerId === removeId) {
    await db.update(companySettings).set({ defaultTenderManagerId: fallbackManagerId }).where(eq(companySettings.id, 'default'))
  }

  await db.update(tenderDocuments).set({ uploadedBy: null }).where(eq(tenderDocuments.uploadedBy, removeId))

  await db.update(tenderSections).set({ lastEditedBy: null }).where(eq(tenderSections.lastEditedBy, removeId))

  await db.update(tenderActivities).set({ userId: null }).where(eq(tenderActivities.userId, removeId))

  await db.update(tenderNotes).set({ authorId: null }).where(eq(tenderNotes.authorId, removeId))

  await db.update(lessonsLearned).set({ createdBy: null }).where(eq(lessonsLearned.createdBy, removeId))
}

/** Eerste beschikbare gebruiker als nieuwe tendermanager (admin/tendermanager voorkeur). */
export async function pickFallbackManagerId(
  db: DB,
  excludeId: string
): Promise<string | null> {
  const rows = await db.select().from(users).where(ne(users.id, excludeId))
  if (rows.length === 0) return null
  const preferred = rows.find((r) => r.role === 'admin' || r.role === 'tender_manager')
  return preferred?.id ?? rows[0]?.id ?? null
}
