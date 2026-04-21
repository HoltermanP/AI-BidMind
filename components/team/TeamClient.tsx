'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  tender_manager: 'Tendermanager',
  team_member: 'Teamlid',
}

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin: { bg: '#F3E8FF', text: '#6B21A8' },
  tender_manager: { bg: '#E0F2FE', text: '#075985' },
  team_member: { bg: '#F3F4F6', text: '#374151' },
}

export type TeamMemberCard = {
  id: string
  name: string | null
  email: string | null
  jobTitle: string | null
  linkedinUrl?: string | null
  role: string | null
  avatarUrl: string | null
  managing: number
  participating: number
}

type Props = {
  members: TeamMemberCard[]
  currentUserId: string | null
  isAdmin: boolean
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  fontSize: 13,
  border: '1px solid #E2E0D8',
  borderRadius: 4,
  fontFamily: 'IBM Plex Sans, sans-serif',
}

export default function TeamClient({ members: initialMembers, currentUserId, isAdmin }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [members, setMembers] = useState(initialMembers)

  useEffect(() => {
    setMembers(initialMembers)
  }, [initialMembers])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteBusy, setInviteBusy] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    jobTitle: '',
    role: 'team_member' as 'admin' | 'tender_manager' | 'team_member',
  })
  const [createBusy, setCreateBusy] = useState(false)

  const [editUser, setEditUser] = useState<TeamMemberCard | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    jobTitle: '',
    role: 'team_member' as 'admin' | 'tender_manager' | 'team_member',
    linkedinUrl: '',
  })
  const [editBusy, setEditBusy] = useState(false)

  const [deleteUser, setDeleteUser] = useState<TeamMemberCard | null>(null)
  const [fallbackId, setFallbackId] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  const fallbackCandidates = useMemo(() => {
    if (!deleteUser) return []
    return members.filter((m) => m.id !== deleteUser.id)
  }, [members, deleteUser])

  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase()
    if (!email) {
      toast('Vul een e-mailadres in', 'warning')
      return
    }
    setInviteBusy(true)
    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast(data.error || 'Uitnodigen mislukt', 'error')
        return
      }
      toast('Uitnodiging verstuurd', 'success')
      setInviteEmail('')
    } finally {
      setInviteBusy(false)
    }
  }

  const handleCreate = async () => {
    setCreateBusy(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name.trim(),
          email: createForm.email.trim().toLowerCase(),
          jobTitle: createForm.jobTitle.trim() || null,
          role: createForm.role,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast(data.error || 'Aanmaken mislukt', 'error')
        return
      }
      toast('Teamlid toegevoegd', 'success')
      setCreateOpen(false)
      setCreateForm({ name: '', email: '', jobTitle: '', role: 'team_member' })
      refresh()
    } finally {
      setCreateBusy(false)
    }
  }

  const openEdit = (u: TeamMemberCard) => {
    setEditUser(u)
    setEditForm({
      name: u.name || '',
      jobTitle: u.jobTitle || '',
      role: (u.role as typeof editForm.role) || 'team_member',
      linkedinUrl: u.linkedinUrl || '',
    })
  }

  const handleSaveEdit = async () => {
    if (!editUser) return
    setEditBusy(true)
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          jobTitle: editForm.jobTitle.trim() || null,
          role: editForm.role,
          linkedinUrl: editForm.linkedinUrl.trim() || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast(data.error || 'Opslaan mislukt', 'error')
        return
      }
      toast('Opgeslagen', 'success')
      setEditUser(null)
      refresh()
    } finally {
      setEditBusy(false)
    }
  }

  const handleAvatar = async (userId: string, file: File | null) => {
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`/api/users/${userId}/avatar`, { method: 'POST', body: fd })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast(data.error || 'Upload mislukt', 'error')
      return
    }
    toast('Profielfoto bijgewerkt', 'success')
    refresh()
  }

  const handleDelete = async () => {
    if (!deleteUser || !fallbackId) {
      toast('Kies een collega voor overdracht van tenders', 'warning')
      return
    }
    setDeleteBusy(true)
    try {
      const res = await fetch(`/api/users/${deleteUser.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fallbackManagerId: fallbackId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast(data.error || 'Verwijderen mislukt', 'error')
        return
      }
      toast('Teamlid verwijderd', 'success')
      setDeleteUser(null)
      setFallbackId('')
      refresh()
    } finally {
      setDeleteBusy(false)
    }
  }

  const openDelete = (u: TeamMemberCard) => {
    setDeleteUser(u)
    const first = members.find((m) => m.id !== u.id && (m.role === 'tender_manager' || m.role === 'admin'))
    setFallbackId(first?.id ?? members.find((m) => m.id !== u.id)?.id ?? '')
  }

  const modalBackdrop: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.45)',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  }

  const modalBox: React.CSSProperties = {
    background: 'white',
    borderRadius: 8,
    padding: 24,
    maxWidth: 440,
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  }

  return (
    <>
      {isAdmin && (
        <div
          style={{
            marginBottom: 20,
            padding: 16,
            background: 'white',
            border: '1px solid #E2E0D8',
            borderRadius: 4,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: '1 1 220px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>Uitnodigen (Clerk)</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                placeholder="e-mail@bedrijf.nl"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                style={inputStyle}
              />
              <Button variant="primary" size="sm" loading={inviteBusy} onClick={handleInvite}>
                Verstuur
              </Button>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setCreateOpen(true)}>
            + Teamlid (alleen BidMind)
          </Button>
        </div>
      )}

      {members.length === 0 && (
        <div
          style={{
            marginBottom: 16,
            padding: '24px',
            textAlign: 'center',
            color: '#9CA3AF',
            background: 'white',
            border: '1px solid #E2E0D8',
            borderRadius: 4,
          }}
        >
          <p style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>Nog geen teamleden</p>
          <p style={{ fontSize: 12 }}>
            {isAdmin ? 'Nodig collega’s uit per e-mail of voeg een profiel toe (alleen in BidMind).' : 'Vraag een admin om teamleden toe te voegen.'}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {members.map((user) => {
          const roleColors = ROLE_COLORS[user.role || 'team_member']
          const isSelf = currentUserId === user.id
          return (
            <div
              key={user.id}
              className="team-card-hover"
              style={{
                background: 'white',
                border: '1px solid #E2E0D8',
                borderRadius: 4,
                padding: 20,
                transition: 'box-shadow 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <Avatar name={user.name || ''} src={user.avatarUrl} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0F1E', marginBottom: 2 }}>
                    {user.name || '—'}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#6B7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 6,
                    }}
                  >
                    {user.email}
                  </div>
                  {user.jobTitle ? (
                    <div style={{ fontSize: 11, color: '#4B5563', lineHeight: 1.35, marginBottom: 8 }}>
                      {user.jobTitle}
                    </div>
                  ) : null}
                  <Badge value={ROLE_LABELS[user.role || 'team_member']} bg={roleColors?.bg} color={roleColors?.text} />
                </div>
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => handleAvatar(user.id, e.target.files?.[0] ?? null)}
                    />
                    <span style={{ fontSize: 12, color: 'var(--slate-blue)', fontWeight: 600 }}>Foto</span>
                  </label>
                  <button type="button" onClick={() => openEdit(user)} style={{ fontSize: 12, fontWeight: 600, color: '#0A0F1E', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Bewerken
                  </button>
                  {!isSelf && (
                    <button type="button" onClick={() => openDelete(user)} style={{ fontSize: 12, fontWeight: 600, color: '#B91C1C', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Verwijderen
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderTop: '1px solid #F3F4F6', paddingTop: 14 }}>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#0A0F1E' }}>
                    {user.managing}
                  </div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>Beheert</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 0', borderLeft: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#0A0F1E' }}>
                    {user.participating}
                  </div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>Deelneemt</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {createOpen && (
        <div style={modalBackdrop} role="presentation" onClick={() => !createBusy && setCreateOpen(false)}>
          <div style={modalBox} role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Teamlid toevoegen</h2>
            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>
              Geen Clerk-account: alleen zichtbaar in BidMind (tenders toewijzen enz.). Voor inloggen gebruik “Uitnodigen”.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Naam</div>
                <input style={inputStyle} value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>E-mail</div>
                <input style={inputStyle} type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Functie</div>
                <input style={inputStyle} value={createForm.jobTitle} onChange={(e) => setCreateForm({ ...createForm, jobTitle: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Rol in app</div>
                <select
                  style={inputStyle}
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as typeof createForm.role })}
                >
                  <option value="team_member">Teamlid</option>
                  <option value="tender_manager">Tendermanager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <Button variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>
                Annuleren
              </Button>
              <Button variant="primary" size="sm" loading={createBusy} onClick={handleCreate}>
                Opslaan
              </Button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div style={modalBackdrop} role="presentation" onClick={() => !editBusy && setEditUser(null)}>
          <div style={modalBox} role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Teamlid bewerken</h2>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>{editUser.email}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Naam</div>
                <input style={inputStyle} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Functie</div>
                <input style={inputStyle} value={editForm.jobTitle} onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Rol in app</div>
                <select
                  style={inputStyle}
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as typeof editForm.role })}
                >
                  <option value="team_member">Teamlid</option>
                  <option value="tender_manager">Tendermanager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>LinkedIn-profiel (optioneel)</div>
                <input
                  style={inputStyle}
                  placeholder="https://www.linkedin.com/in/..."
                  value={editForm.linkedinUrl}
                  onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <Button variant="secondary" size="sm" onClick={() => setEditUser(null)}>
                Annuleren
              </Button>
              <Button variant="primary" size="sm" loading={editBusy} onClick={handleSaveEdit}>
                Opslaan
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteUser && (
        <div style={modalBackdrop} role="presentation" onClick={() => !deleteBusy && setDeleteUser(null)}>
          <div style={modalBox} role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Teamlid verwijderen</h2>
            <p style={{ fontSize: 13, color: '#374151', marginBottom: 16 }}>
              Weet je zeker dat je <strong>{deleteUser.name || deleteUser.email}</strong> wilt verwijderen? Tenders waar deze persoon tendermanager is, worden overgedragen aan de gekozen collega.
            </p>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Tenders overdragen aan</div>
              <select style={inputStyle} value={fallbackId} onChange={(e) => setFallbackId(e.target.value)}>
                <option value="">— Kies collega —</option>
                {fallbackCandidates.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" size="sm" onClick={() => setDeleteUser(null)}>
                Annuleren
              </Button>
              <Button variant="danger" size="sm" loading={deleteBusy} onClick={handleDelete}>
                Verwijderen
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
