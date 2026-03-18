import { db } from '@/lib/db'
import { tenders } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import KalenderClient from './KalenderClient'

export const dynamic = 'force-dynamic'

export default async function KalenderPage() {
  const allTenders = db
    ? await db.select().from(tenders).orderBy(desc(tenders.deadlineSubmission))
    : []
  return <KalenderClient tenders={allTenders} />
}
