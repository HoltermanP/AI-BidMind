'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { formatCurrency } from '@/lib/utils/format'
import { useToast } from '@/components/ui/Toast'

interface Props {
  tender: any
  onUpdate: (updates: Record<string, any>) => void
  allUsers: any[]
  userMap: Record<string, any>
}

function toInputDate(d: string | Date | null | undefined): string {
  if (!d) return ''
  const x = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(x.getTime())) return ''
  return x.toISOString().slice(0, 16)
}

function ScreeningCard({ score }: { score: Record<string, unknown> }) {
  const fmt = (v: unknown) => (v == null || v === '') ? '—' : String(v)
  const boolBadge = (v: unknown) => v === true
    ? { label: 'Ja', bg: '#D1FAE5', color: '#065F46' }
    : v === false
      ? { label: 'Nee', bg: '#FEE2E2', color: '#991B1B' }
      : { label: fmt(v), bg: '#F3F4F6', color: 'var(--text-secondary)' }

  const refColor: Record<string, { bg: string; color: string }> = {
    ja:          { bg: '#D1FAE5', color: '#065F46' },
    gedeeltelijk:{ bg: '#FEF3C7', color: '#92400E' },
    nee:         { bg: '#FEE2E2', color: '#991B1B' },
  }
  const posColor: Record<string, { bg: string; color: string }> = {
    sterk:     { bg: '#D1FAE5', color: '#065F46' },
    gemiddeld: { bg: '#FEF3C7', color: '#92400E' },
    zwak:      { bg: '#FEE2E2', color: '#991B1B' },
  }
  const prijsColor: Record<string, { bg: string; color: string }> = {
    laag:   { bg: '#D1FAE5', color: '#065F46' },
    middel: { bg: '#FEF3C7', color: '#92400E' },
    hoog:   { bg: '#FEE2E2', color: '#991B1B' },
  }

  const kern = score.kerncompetentie as Record<string, unknown> | undefined
  const ref  = String(score.referenties ?? '').toLowerCase()
  const concurrentie = score.concurrentie as Record<string, unknown> | undefined
  const winkans = typeof score.winkans === 'number' ? score.winkans : null

  const Badge = ({ label, bg, color }: { label: string; bg: string; color: string }) => (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: bg, color }}>
      {label}
    </span>
  )

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingBottom: 10, borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, minWidth: 160, flexShrink: 0, paddingTop: 2 }}>{label}</span>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>{children}</div>
    </div>
  )

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', fontSize: 12 }}>
      <div style={{ padding: '10px 14px', background: '#F9FAFB', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--navy)' }}>Screeningsresultaat</span>
        {winkans != null && (
          <span style={{ fontSize: 13, fontWeight: 700, color: winkans >= 50 ? '#065F46' : winkans >= 30 ? '#92400E' : '#991B1B', marginLeft: 'auto' }}>
            Winskans {winkans}%
          </span>
        )}
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {kern && (
          <Row label="Kerncompetentie">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              {(() => { const b = boolBadge(kern.match); return <Badge label={b.label} bg={b.bg} color={b.color} /> })()}
            </div>
            {!!kern.toelichting && <span>{fmt(kern.toelichting)}</span>}
          </Row>
        )}
        {ref && (
          <Row label="Referenties">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: score.referenties_toelichting ? 4 : 0 }}>
              {(() => { const c = refColor[ref] ?? { bg: '#F3F4F6', color: 'var(--text-secondary)' }; return <Badge label={ref.charAt(0).toUpperCase() + ref.slice(1)} bg={c.bg} color={c.color} /> })()}
            </div>
            {!!score.referenties_toelichting && <span>{fmt(score.referenties_toelichting)}</span>}
          </Row>
        )}
        <Row label="Margeschatting realistisch">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: score.margeschatting_toelichting ? 4 : 0 }}>
            {(() => { const b = boolBadge(score.margeschatting_realistisch); return <Badge label={b.label} bg={b.bg} color={b.color} /> })()}
          </div>
          {!!score.margeschatting_toelichting && <span>{fmt(score.margeschatting_toelichting)}</span>}
        </Row>
        <Row label="Capaciteit beschikbaar">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: score.capaciteit_toelichting ? 4 : 0 }}>
            {(() => { const b = boolBadge(score.capaciteit_beschikbaar); return <Badge label={b.label} bg={b.bg} color={b.color} /> })()}
          </div>
          {!!score.capaciteit_toelichting && <span>{fmt(score.capaciteit_toelichting)}</span>}
        </Row>

        {concurrentie && (
          <Row label="Concurrentie">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 6, alignItems: 'center' }}>
              {concurrentie.verwacht_aantal_inschrijvers != null && (
                <span style={{ fontSize: 11, background: '#EEF2FF', color: '#4338CA', fontWeight: 600, padding: '2px 10px', borderRadius: 20 }}>
                  ~{fmt(concurrentie.verwacht_aantal_inschrijvers)} inschrijvers
                </span>
              )}
              {!!concurrentie.eigen_positie && (
                (() => { const c = posColor[String(concurrentie.eigen_positie).toLowerCase()] ?? { bg: '#F3F4F6', color: 'var(--text-secondary)' }; return <Badge label={`Positie: ${fmt(concurrentie.eigen_positie)}`} bg={c.bg} color={c.color} /> })()
              )}
              {!!concurrentie.prijsdruk && (
                (() => { const c = prijsColor[String(concurrentie.prijsdruk).toLowerCase()] ?? { bg: '#F3F4F6', color: 'var(--text-secondary)' }; return <Badge label={`Prijsdruk: ${fmt(concurrentie.prijsdruk)}`} bg={c.bg} color={c.color} /> })()
              )}
            </div>
            {!!concurrentie.concurrentieprofiel && (
              <p style={{ margin: '0 0 4px' }}><strong style={{ color: 'var(--navy)' }}>Concurrentieprofiel:</strong> {fmt(concurrentie.concurrentieprofiel)}</p>
            )}
            {!!concurrentie.eigen_positie_toelichting && (
              <p style={{ margin: '0 0 4px' }}><strong style={{ color: 'var(--navy)' }}>Eigen positie:</strong> {fmt(concurrentie.eigen_positie_toelichting)}</p>
            )}
            {!!concurrentie.prijsdruk_toelichting && (
              <p style={{ margin: 0 }}><strong style={{ color: 'var(--navy)' }}>Prijsdruk:</strong> {fmt(concurrentie.prijsdruk_toelichting)}</p>
            )}
          </Row>
        )}

        {!!score.winkans_onderbouwing && (
          <Row label="Winskans onderbouwing">
            {fmt(score.winkans_onderbouwing)}
          </Row>
        )}
      </div>
    </div>
  )
}

export default function OverviewTab({ tender, onUpdate, allUsers, userMap }: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    contractingAuthority: tender.contractingAuthority || '',
    procedureType: tender.procedureType || '',
    estimatedValue: tender.estimatedValue || '',
    tendernetUrl: tender.tendernetUrl || '',
    goNoGoReasoning: tender.goNoGoReasoning || '',
    cpvCodes: (tender.cpvCodes || []).join(', '),
    kostenRaming: tender.kostenRaming || '',
    margePercentage: tender.margePercentage || '',
    prijsInschrijving: tender.prijsInschrijving || '',
    ontwerpKostenRaming: tender.ontwerpKostenRaming || '',
    alcatelTermijnDatum: toInputDate(tender.alcatelTermijnDatum),
    handoverKickoffDate: toInputDate(tender.handoverKickoffDate),
    handoverProjectLeader: tender.handoverProjectLeader || '',
    handoverMilestones: tender.handoverMilestones || '',
    handoverFirstPaymentDue: toInputDate(tender.handoverFirstPaymentDue),
  })
  const [saving, setSaving] = useState(false)
  const [screenBusy, setScreenBusy] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onUpdate({
      ...form,
      estimatedValue: form.estimatedValue || null,
      cpvCodes: form.cpvCodes.split(',').map((s: string) => s.trim()).filter(Boolean),
      kostenRaming: form.kostenRaming || null,
      margePercentage: form.margePercentage || null,
      prijsInschrijving: form.prijsInschrijving || null,
      ontwerpKostenRaming: form.ontwerpKostenRaming || null,
      alcatelTermijnDatum: form.alcatelTermijnDatum ? new Date(form.alcatelTermijnDatum).toISOString() : null,
      handoverKickoffDate: form.handoverKickoffDate ? new Date(form.handoverKickoffDate).toISOString() : null,
      handoverProjectLeader: form.handoverProjectLeader || null,
      handoverMilestones: form.handoverMilestones || null,
      handoverFirstPaymentDue: form.handoverFirstPaymentDue ? new Date(form.handoverFirstPaymentDue).toISOString() : null,
    })
    setSaving(false)
  }

  const runScreening = async () => {
    setScreenBusy(true)
    try {
      const res = await fetch(`/api/tenders/${tender.id}/screening`, { method: 'POST' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast(body.error || 'Screening mislukt', 'error')
        return
      }
      onUpdate(body)
      toast('Screening uitgevoerd', 'success')
    } catch {
      toast('Screening mislukt', 'error')
    } finally {
      setScreenBusy(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '7px 10px',
    border: '1px solid var(--border)',
    borderRadius: 4,
    fontSize: 13,
    fontFamily: 'IBM Plex Sans, sans-serif',
    color: 'var(--text-primary)',
    outline: 'none',
    background: 'white',
  }

  const labelStyle = {
    display: 'block' as const,
    fontSize: 12,
    fontWeight: 600 as const,
    color: 'var(--text-primary)',
    marginBottom: 4,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0, maxWidth: 700 }}>
      {/* Actiebalk –zelfde opmaak als andere tabs */}
      <div
        className="tender-tab-actions"
        style={{
          padding: '14px 0',
          marginBottom: 4,
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--navy)' }}>Overzicht</span>
      </div>
      {/* Tender info card */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 18 }}>
          Tendergegevens
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Aanbestedende dienst</label>
            <input
              value={form.contractingAuthority}
              onChange={(e) => setForm({ ...form, contractingAuthority: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Procedure type</label>
            <select
              value={form.procedureType}
              onChange={(e) => setForm({ ...form, procedureType: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option>Europees openbaar</option>
              <option>Europees niet-openbaar</option>
              <option>Meervoudig onderhands</option>
              <option>Enkelvoudig onderhands</option>
              <option>Concurrentiegerichte dialoog</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Geraamde waarde (€)</label>
            <input
              type="number"
              value={form.estimatedValue}
              onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>CPV-codes (komma gescheiden)</label>
            <input
              value={form.cpvCodes}
              onChange={(e) => setForm({ ...form, cpvCodes: e.target.value })}
              placeholder="bijv. 45233100, 45221111"
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>TenderNed URL</label>
            <input
              type="url"
              value={form.tendernetUrl}
              onChange={(e) => setForm({ ...form, tendernetUrl: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Bron (signalering)</label>
            <select
              value={tender.source || 'handmatig'}
              onChange={(e) => onUpdate({ source: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="tenderned">TenderNed</option>
              <option value="negometrix">Negometrix</option>
              <option value="handmatig">Handmatig</option>
              <option value="overig">Overig</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Contractvorm</label>
            <select
              value={tender.contractType || 'onbekend'}
              onChange={(e) => onUpdate({ contractType: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="onbekend">Onbekend</option>
              <option value="RAW">RAW</option>
              <option value="UAV">UAV</option>
              <option value="UAV_GC">UAV-GC</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 18 }}>
          Kwalificatie, prijs & monitor
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <Button type="button" variant="secondary" loading={screenBusy} onClick={runScreening}>
              Screening &amp; concurrentie uitvoeren
            </Button>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Beoordeelt 6 criteria (competentie, referenties, marge, capaciteit, concurrentie, winskans) en schrijft go/no-go + winskans.
            </span>
          </div>
          {tender.goNoGoScore && typeof tender.goNoGoScore === 'object' && (
            <ScreeningCard score={tender.goNoGoScore as Record<string, unknown>} />
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Kostenraming (€)</label>
              <input
                type="number"
                value={form.kostenRaming}
                onChange={(e) => setForm({ ...form, kostenRaming: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Marge (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.margePercentage}
                onChange={(e) => setForm({ ...form, margePercentage: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Inschrijfprijs (€)</label>
              <input
                type="number"
                value={form.prijsInschrijving}
                onChange={(e) => setForm({ ...form, prijsInschrijving: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Ontwerpkostenraming UAV-GC (€)</label>
              <input
                type="number"
                value={form.ontwerpKostenRaming}
                onChange={(e) => setForm({ ...form, ontwerpKostenRaming: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
          {tender.prijsAbnormaalLaag && (
            <p style={{ fontSize: 12, color: '#b45309', margin: 0 }}>
              Waarschuwing: inschrijfprijs ligt ruim onder de geraamde opdrachtwaarde (&gt;25%) — controleer op abnormaal lage prijs.
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Inlichtingen-fase</label>
              <select
                value={tender.inlichtingenFaseStatus || 'vragen_opstellen'}
                onChange={(e) => onUpdate({ inlichtingenFaseStatus: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="vragen_opstellen">Vragen opstellen</option>
                <option value="ingediend">Ingediend</option>
                <option value="nvi_ontvangen">NvI ontvangen</option>
                <option value="verwerkt">Verwerkt</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Monitorstatus (na indiening)</label>
              <select
                value={tender.monitorStatus || 'ingediend'}
                onChange={(e) => onUpdate({ monitorStatus: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="ingediend">Ingediend</option>
                <option value="alcatel_loopt">Alcatel loopt</option>
                <option value="voorlopige_gunning">Voorlopige gunning</option>
                <option value="definitief">Definitief</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Alcatel-termijn</label>
              <input
                type="datetime-local"
                value={form.alcatelTermijnDatum}
                onChange={(e) => setForm({ ...form, alcatelTermijnDatum: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(tender.nviVerwerkt)}
                  onChange={(e) => onUpdate({ nviVerwerkt: e.target.checked })}
                />
                NvI verwerkt
              </label>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 18 }}>
          Overdracht (na gunning)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Kick-off (datum/tijd)</label>
            <input
              type="datetime-local"
              value={form.handoverKickoffDate}
              onChange={(e) => setForm({ ...form, handoverKickoffDate: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Projectleider</label>
            <input
              value={form.handoverProjectLeader}
              onChange={(e) => setForm({ ...form, handoverProjectLeader: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Mijlpalen (vrije tekst)</label>
            <textarea
              value={form.handoverMilestones}
              onChange={(e) => setForm({ ...form, handoverMilestones: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
          <div>
            <label style={labelStyle}>Eerste betalingstermijn</label>
            <input
              type="datetime-local"
              value={form.handoverFirstPaymentDue}
              onChange={(e) => setForm({ ...form, handoverFirstPaymentDue: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Team assignment */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 18 }}>
          Tenderteam
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Tendermanager</label>
            <select
              value={tender.tenderManagerId || ''}
              onChange={(e) => onUpdate({ tenderManagerId: e.target.value || null })}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">— Niet toegewezen —</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name || u.email}</option>
              ))}
            </select>
          </div>
        </div>
        <label style={labelStyle}>Teamleden</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {allUsers.map((u) => {
            const isSelected = (tender.teamMemberIds || []).includes(u.id)
            return (
              <button
                key={u.id}
                onClick={() => {
                  const current = tender.teamMemberIds || []
                  const updated = isSelected ? current.filter((id: string) => id !== u.id) : [...current, u.id]
                  onUpdate({ teamMemberIds: updated })
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px 4px 6px',
                  border: `1px solid ${isSelected ? 'var(--slate-blue)' : 'var(--border)'}`,
                  borderRadius: 20,
                  background: isSelected ? '#E0F2FE' : 'white',
                  cursor: 'pointer',
                  fontSize: 12, fontFamily: 'IBM Plex Sans, sans-serif',
                  color: isSelected ? 'var(--slate-blue)' : 'var(--text-primary)',
                  transition: 'all 0.15s',
                }}
              >
                <Avatar name={u.name || ''} size={18} />
                {u.name || u.email}
              </button>
            )
          })}
        </div>
      </div>

      {/* Go/No-Go reasoning */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 18 }}>
          Go/No-Go motivering
        </h3>
        <textarea
          value={form.goNoGoReasoning}
          onChange={(e) => setForm({ ...form, goNoGoReasoning: e.target.value })}
          placeholder="Documenteer hier de overwegingen voor de Go/No-Go beslissing..."
          rows={5}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
        />
      </div>

      <div>
        <Button variant="amber" loading={saving} onClick={handleSave}>
          Wijzigingen opslaan
        </Button>
      </div>
    </div>
  )
}
