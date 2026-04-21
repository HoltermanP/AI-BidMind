import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

/**
 * Vult `tenderned_fetched_at` voor bestaande tenders waar die nog null is:
 * 1) Eerste activiteit `tender_imported` (exact moment van TenderNed-import).
 * 2) Anders: `created_at` van de tender als bron `tenderned` is en er een publicatie-id is
 *    (import vóór activity-logging, seed, of sync zonder aparte activity).
 */
export async function backfillTenderNedFetchedAt(): Promise<{
  fromActivities: number
  fromCreatedAtFallback: number
}> {
  if (!db) throw new Error('DATABASE_URL ontbreekt')

  const r1 = await db.execute(sql`
    UPDATE tenders AS t
    SET tenderned_fetched_at = s.first_at
    FROM (
      SELECT tender_id, MIN(created_at) AS first_at
      FROM tender_activities
      WHERE activity_type = 'tender_imported'
      GROUP BY tender_id
    ) AS s
    WHERE t.id = s.tender_id
      AND t.tenderned_fetched_at IS NULL
  `)

  const fromActivities = typeof r1.rowCount === 'number' ? r1.rowCount : Number(r1.rowCount ?? 0)

  const r2 = await db.execute(sql`
    UPDATE tenders
    SET tenderned_fetched_at = created_at
    WHERE tenderned_fetched_at IS NULL
      AND source = 'tenderned'
      AND tenderned_publicatie_id IS NOT NULL
  `)

  const fromCreatedAtFallback = typeof r2.rowCount === 'number' ? r2.rowCount : Number(r2.rowCount ?? 0)

  return { fromActivities, fromCreatedAtFallback }
}
