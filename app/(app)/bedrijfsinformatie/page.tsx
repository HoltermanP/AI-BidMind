'use client'

import { useState, useEffect, useMemo } from 'react'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import { CPV_DIVISIONS } from '@/lib/cpv/cpv-divisions'

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--border)',
  borderRadius: 4,
  fontSize: 13,
  fontFamily: 'IBM Plex Sans, sans-serif',
  color: 'var(--text-primary)',
  outline: 'none',
} as const

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: 4,
} as const

const sectionStyle = {
  background: 'white',
  border: '1px solid var(--border)',
  borderRadius: 4,
  padding: 24,
} as const

type CompanySettings = {
  id: string
  companyName: string | null
  kvkNumber: string | null
  tendernedNumber: string | null
  defaultTenderManagerId: string | null
  websiteUrl: string | null
  description: string | null
  visionText: string | null
  annualPlanText: string | null
  strengthsText: string | null
  referencesText: string | null
  preferredCpvCodes: string[] | null
  updatedAt: string | null
}

type CompanyDocument = {
  id: string
  documentType: string
  fileName: string
  fileSize: number | null
  uploadedAt: string | null
}

type User = { id: string; name: string | null; email: string | null }

function CpvSelector({
  selected,
  search,
  onSearchChange,
  onToggle,
}: {
  selected: string[]
  search: string
  onSearchChange: (v: string) => void
  onToggle: (code: string) => void
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return CPV_DIVISIONS
    return CPV_DIVISIONS.filter(
      (d) => d.code.includes(q) || d.label.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, padding: 24 }}>
      <h3 style={{ fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>
        Hoofd CPV-codes (werkveld)
      </h3>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
        Selecteer de CPV-divisies die bij jullie werkveld passen. Op de tenders-overzichtspagina wordt standaard op deze codes gefilterd, zodat alleen relevante aanbestedingen zichtbaar zijn.
      </p>
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {selected.map((code) => {
            const div = CPV_DIVISIONS.find((d) => d.code === code)
            return (
              <span
                key={code}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'var(--navy)', color: 'white',
                  borderRadius: 4, padding: '3px 8px', fontSize: 12, fontWeight: 600,
                }}
              >
                {code} — {div?.label ?? code}
                <button
                  type="button"
                  onClick={() => onToggle(code)}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14, opacity: 0.75 }}
                  aria-label={`Verwijder ${code}`}
                >
                  ×
                </button>
              </span>
            )
          })}
        </div>
      )}
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Zoek op code of omschrijving..."
        style={{
          width: '100%', padding: '7px 10px', marginBottom: 10,
          border: '1px solid var(--border)', borderRadius: 4,
          fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif',
          color: 'var(--text-primary)', outline: 'none',
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 6 }}>
        {filtered.map((div) => {
          const active = selected.includes(div.code)
          return (
            <button
              key={div.code}
              type="button"
              onClick={() => onToggle(div.code)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 4, cursor: 'pointer', textAlign: 'left',
                border: active ? '1.5px solid var(--navy)' : '1px solid var(--border)',
                background: active ? '#EFF6FF' : 'var(--off-white)',
                fontFamily: 'IBM Plex Sans, sans-serif',
                transition: 'background 0.1s, border-color 0.1s',
              }}
            >
              <span style={{
                minWidth: 26, fontSize: 11, fontWeight: 700,
                fontFamily: 'IBM Plex Mono, monospace',
                color: active ? 'var(--navy)' : 'var(--text-secondary)',
              }}>
                {div.code}
              </span>
              <span style={{ fontSize: 12, color: active ? 'var(--navy)' : 'var(--text-primary)', fontWeight: active ? 600 : 400 }}>
                {div.label}
              </span>
              {active && (
                <span style={{ marginLeft: 'auto', color: 'var(--navy)', fontSize: 14, lineHeight: 1 }}>✓</span>
              )}
            </button>
          )
        })}
      </div>
      {filtered.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Geen resultaten voor &quot;{search}&quot;</p>
      )}
    </div>
  )
}

export default function BedrijfsinformatiePage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [documents, setDocuments] = useState<CompanyDocument[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [cpvSearch, setCpvSearch] = useState('')

  const [form, setForm] = useState({
    companyName: '',
    kvkNumber: '',
    tendernedNumber: '',
    defaultTenderManagerId: '',
    websiteUrl: '',
    description: '',
    visionText: '',
    annualPlanText: '',
    strengthsText: '',
    referencesText: '',
    preferredCpvCodes: [] as string[],
  })

  useEffect(() => {
    async function load() {
      try {
        const [res, usersRes] = await Promise.all([
          fetch('/api/settings/company'),
          fetch('/api/users'),
        ])
        if (!res.ok || !usersRes.ok) throw new Error('Laden mislukt')
        const data = await res.json()
        const usersData = await usersRes.json()
        setSettings(data.settings)
        setDocuments(data.documents || [])
        setUsers(Array.isArray(usersData) ? usersData : [])
        if (data.settings) {
          setForm({
            companyName: data.settings.companyName ?? '',
            kvkNumber: data.settings.kvkNumber ?? '',
            tendernedNumber: data.settings.tendernedNumber ?? '',
            defaultTenderManagerId: data.settings.defaultTenderManagerId ?? '',
            websiteUrl: data.settings.websiteUrl ?? '',
            description: data.settings.description ?? '',
            visionText: data.settings.visionText ?? '',
            annualPlanText: data.settings.annualPlanText ?? '',
            strengthsText: data.settings.strengthsText ?? '',
            referencesText: data.settings.referencesText ?? '',
            preferredCpvCodes: data.settings.preferredCpvCodes ?? [],
          })
        }
      } catch {
        toast('Kon gegevens niet laden', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast('Bedrijfsgegevens zijn bijgewerkt', 'success')
    } catch {
      toast('Opslaan mislukt', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (documentType: 'vision' | 'year_plan', file: File) => {
    setUploading(documentType)
    try {
      const fd = new FormData()
      fd.set('file', file)
      fd.set('documentType', documentType)
      const res = await fetch('/api/settings/company/documents', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const doc = await res.json()
      setDocuments((prev) => [doc, ...prev])
      toast(`Geüpload: ${file.name}`, 'success')
    } catch {
      toast('Upload mislukt', 'error')
    } finally {
      setUploading(null)
    }
  }

  const handleDeleteDoc = async (docId: string) => {
    try {
      const res = await fetch(`/api/settings/company/documents/${docId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
      toast('Document verwijderd', 'success')
    } catch {
      toast('Verwijderen mislukt', 'error')
    }
  }

  if (loading) {
    return (
      <div className="app-page-padding" style={{ maxWidth: 800 }}>
        <p style={{ color: 'var(--text-secondary)' }}>Laden...</p>
      </div>
    )
  }

  return (
    <div className="app-page-padding" style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
          Bedrijfsinformatie
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Vul hier alle beschikbare bedrijfsgegevens in. Deze worden door de AI gebruikt om aanbestedingen te analyseren en maatwerk aanbiedingen te schrijven.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Basisgegevens */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 18 }}>
            Basisgegevens
          </h3>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={labelStyle}>Bedrijfsnaam</label>
              <input
                style={inputStyle}
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                placeholder="Infraco B.V."
              />
            </div>
            <div>
              <label style={labelStyle}>KvK-nummer</label>
              <input
                style={inputStyle}
                value={form.kvkNumber}
                onChange={(e) => setForm((f) => ({ ...f, kvkNumber: e.target.value }))}
                placeholder="12345678"
              />
            </div>
            <div>
              <label style={labelStyle}>Inschrijfnummer TenderNed</label>
              <input
                style={inputStyle}
                value={form.tendernedNumber}
                onChange={(e) => setForm((f) => ({ ...f, tendernedNumber: e.target.value }))}
                placeholder="TN-..."
              />
            </div>
            <div>
              <label style={labelStyle}>Website</label>
              <input
                style={inputStyle}
                type="url"
                value={form.websiteUrl}
                onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))}
                placeholder="https://www.voorbeeld.nl"
              />
            </div>
            <div>
              <label style={labelStyle}>Standaard tendermanager</label>
              <select
                style={inputStyle}
                value={form.defaultTenderManagerId}
                onChange={(e) => setForm((f) => ({ ...f, defaultTenderManagerId: e.target.value }))}
              >
                <option value="">— Geen standaard —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name || u.email || u.id}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Visiedocumenten */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
            Visiedocumenten (Word of PDF)
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Upload visiedocumenten; de tekst wordt gebruikt door de AI voor analyse en aanbiedingsteksten.
          </p>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload('vision', file)
              e.target.value = ''
            }}
            disabled={!!uploading}
            style={{ marginBottom: 12 }}
          />
          {documents.filter((d) => d.documentType === 'vision').length > 0 && (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {documents.filter((d) => d.documentType === 'vision').map((d) => (
                <li key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.fileName}</span>
                  <button type="button" onClick={() => handleDeleteDoc(d.id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 12 }}>Verwijderen</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Jaarplannen */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
            Jaarplannen (Word of PDF)
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Upload jaarplannen of strategiedocumenten.
          </p>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload('year_plan', file)
              e.target.value = ''
            }}
            disabled={!!uploading}
            style={{ marginBottom: 12 }}
          />
          {documents.filter((d) => d.documentType === 'year_plan').length > 0 && (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {documents.filter((d) => d.documentType === 'year_plan').map((d) => (
                <li key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.fileName}</span>
                  <button type="button" onClick={() => handleDeleteDoc(d.id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 12 }}>Verwijderen</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tekstvelden */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 18 }}>
            Tekstvelden (vrij invullen)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Korte bedrijfsomschrijving</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Wat doet het bedrijf? Voor wie? Welke markt?"
              />
            </div>
            <div>
              <label style={labelStyle}>Visie / missie</label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                value={form.visionText}
                onChange={(e) => setForm((f) => ({ ...f, visionText: e.target.value }))}
                placeholder="Kern van de visie of missie van het bedrijf"
              />
            </div>
            <div>
              <label style={labelStyle}>Jaarplan / strategie (samenvatting)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                value={form.annualPlanText}
                onChange={(e) => setForm((f) => ({ ...f, annualPlanText: e.target.value }))}
                placeholder="Belangrijkste doelen, thema's of prioriteiten"
              />
            </div>
            <div>
              <label style={labelStyle}>Sterke punten</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                value={form.strengthsText}
                onChange={(e) => setForm((f) => ({ ...f, strengthsText: e.target.value }))}
                placeholder="Waarin onderscheidt het bedrijf zich? Kwaliteit, ervaring, certificeringen..."
              />
            </div>
            <div>
              <label style={labelStyle}>Referenties / ervaring</label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                value={form.referencesText}
                onChange={(e) => setForm((f) => ({ ...f, referencesText: e.target.value }))}
                placeholder="Belangrijke projecten, opdrachtgevers, resultaten"
              />
            </div>
          </div>
        </div>

        {/* Hoofd CPV-codes */}
        <CpvSelector
          selected={form.preferredCpvCodes}
          search={cpvSearch}
          onSearchChange={setCpvSearch}
          onToggle={(code) =>
            setForm((f) => ({
              ...f,
              preferredCpvCodes: f.preferredCpvCodes.includes(code)
                ? f.preferredCpvCodes.filter((c) => c !== code)
                : [...f.preferredCpvCodes, code],
            }))
          }
        />

        <div style={{ background: '#E0F2FE', border: '1px solid #7DD3FC', borderRadius: 4, padding: 16 }}>
          <p style={{ fontSize: 12, color: '#0C4A6E', margin: 0, lineHeight: 1.5 }}>
            <strong>Gebruik door de AI</strong>: De ingevulde gegevens en geüploade documenten worden meegenomen bij het analyseren van aanbestedingsdocumenten, het genereren van NVI-vragen en het schrijven van sectieteksten (plan van aanpak, referenties, enz.). Zo sluiten aanbiedingen beter aan bij jullie bedrijfsachtergrond.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Opslaan...' : 'Wijzigingen opslaan'}
        </Button>
      </div>
    </div>
  )
}
