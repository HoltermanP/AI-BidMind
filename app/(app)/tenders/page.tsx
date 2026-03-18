import { db } from '@/lib/db'
import { tenders, users } from '@/lib/db/schema'
import { desc, ilike, or, eq, and, SQL } from 'drizzle-orm'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { formatDate, formatCurrency, getDaysUntil } from '@/lib/utils/format'
import TendersClient from './TendersClient'

export const dynamic = 'force-dynamic'

async function getTenders(searchParams: Record<string, string>) {
  if (!db) {
    return { tenders: [], userMap: {}, allUsers: [] }
  }
  const allTenders = await db.select().from(tenders).orderBy(desc(tenders.updatedAt))
  const allUsers = await db.select().from(users)
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u]))

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
    filtered = filtered.filter((t) => t.status === searchParams.status)
  }

  if (searchParams.gonogo && searchParams.gonogo !== 'all') {
    filtered = filtered.filter((t) => t.goNoGo === searchParams.gonogo)
  }

  if (searchParams.manager && searchParams.manager !== 'all') {
    filtered = filtered.filter((t) => t.tenderManagerId === searchParams.manager)
  }

  return { tenders: filtered, userMap, allUsers }
}

export default async function TendersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams
  const { tenders: tenderList, userMap, allUsers } = await getTenders(params)

  return (
    <TendersClient
      initialTenders={tenderList}
      userMap={userMap}
      allUsers={allUsers}
      initialSearchParams={params}
    />
  )
}
