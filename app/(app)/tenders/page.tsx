import { db } from '@/lib/db'
import { tenders, users, companySettings } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import TendersClient from './TendersClient'

export const dynamic = 'force-dynamic'

async function getTenders(searchParams: Record<string, string>) {
  if (!db) {
    return { tenders: [], userMap: {}, allUsers: [], preferredCpvCodes: [] }
  }
  const allTenders = await db.select().from(tenders).orderBy(desc(tenders.updatedAt))
  const allUsers = await db.select().from(users)
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u]))
  const [settings] = await db.select({ preferredCpvCodes: companySettings.preferredCpvCodes }).from(companySettings).where(eq(companySettings.id, 'default'))

  let filtered = allTenders

  if (searchParams.q) {
    const q = searchParams.q.toLowerCase()
    filtered = filtered.filter((t) =>
      t.title?.toLowerCase().includes(q) ||
      t.referenceNumber?.toLowerCase().includes(q) ||
      t.contractingAuthority?.toLowerCase().includes(q)
    )
  }

  if (searchParams.status && searchParams.status !== 'all') {
    if (searchParams.status === 'active') {
      filtered = filtered.filter((t) => !['submitted', 'won', 'lost', 'withdrawn'].includes(t.status || ''))
    } else {
      filtered = filtered.filter((t) => t.status === searchParams.status)
    }
  }

  if (searchParams.gonogo && searchParams.gonogo !== 'all') {
    filtered = filtered.filter((t) => t.goNoGo === searchParams.gonogo)
  }

  if (searchParams.manager && searchParams.manager !== 'all') {
    filtered = filtered.filter((t) => t.tenderManagerId === searchParams.manager)
  }

  const INTAKE_SCORE_HIGH_MIN = 70
  const g = searchParams.geschiktheid
  if (g && g !== 'all') {
    if (g === 'none') {
      filtered = filtered.filter((t) =>
        t.intakeSuitabilityStatus === 'pending' ||
        t.intakeSuitabilityStatus === 'processing' ||
        t.intakeSuitabilityStatus === 'failed'
      )
    } else if (g === 'low' || g === 'medium' || g === 'high') {
      filtered = filtered.filter((t) => t.intakeSuitabilityTier === g)
    } else if (g === 'minscore70') {
      filtered = filtered.filter(
        (t) =>
          t.intakeSuitabilityStatus === 'done' &&
          t.intakeSuitabilityScore != null &&
          t.intakeSuitabilityScore >= INTAKE_SCORE_HIGH_MIN
      )
    }
  }

  return { tenders: filtered, userMap, allUsers, preferredCpvCodes: settings?.preferredCpvCodes ?? [] }
}

export default async function TendersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams
  const { tenders: tenderList, userMap, allUsers, preferredCpvCodes } = await getTenders(params)

  return (
    <TendersClient
      initialTenders={tenderList}
      userMap={userMap}
      allUsers={allUsers}
      initialSearchParams={params}
      preferredCpvCodes={preferredCpvCodes ?? []}
    />
  )
}
