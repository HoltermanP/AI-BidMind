import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, tenders } from '@/lib/db/schema'
import TeamClient from '@/components/team/TeamClient'
import { getAppUser } from '@/lib/auth/app-user'

export const dynamic = 'force-dynamic'

async function getTeamData() {
  if (!db) return []
  const allUsers = await db.select().from(users)
  const allTenders = await db.select().from(tenders)

  const userData = allUsers.map((user) => {
    const managing = allTenders.filter((t) => t.tenderManagerId === user.id).length
    const participating = allTenders.filter((t) => (t.teamMemberIds || []).includes(user.id)).length
    return { ...user, managing, participating }
  })

  return userData
}

export default async function TeamPage() {
  const { userId } = await auth()
  const me = await getAppUser()
  const isAdmin = me?.role === 'admin'
  const teamData = await getTeamData()

  return (
    <div className="app-page-padding">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#0A0F1E', marginBottom: 4 }}>
          Team
        </h1>
        <p style={{ color: '#6B7280', fontSize: 13 }}>
          {teamData.length} teamleden
          {isAdmin ? ' · Als admin kun je teamleden uitnodigen, toevoegen en bewerken.' : ''}
        </p>
      </div>

      <TeamClient members={teamData} currentUserId={userId} isAdmin={!!isAdmin} />
    </div>
  )
}
