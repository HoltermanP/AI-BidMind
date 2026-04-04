import { extractTenderAnalysisHtml } from '@/lib/analysis/extract-html'

const CONTRACT = new Set(['RAW', 'UAV', 'UAV_GC', 'onbekend'])
const ERNST = new Set(['hoog', 'middel', 'laag'])

function normalizeContract(raw: unknown): 'RAW' | 'UAV' | 'UAV_GC' | 'onbekend' {
  const s = String(raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_')
  if (s === 'UAVGC' || s === 'UAV_GC') return 'UAV_GC'
  if (CONTRACT.has(s)) return s as 'RAW' | 'UAV' | 'UAV_GC' | 'onbekend'
  return 'onbekend'
}

function normalizeErnst(raw: unknown): 'hoog' | 'middel' | 'laag' {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase()
  if (s === 'high' || s === 'hoog') return 'hoog'
  if (s === 'medium' || s === 'middel' || s === 'gemiddeld') return 'middel'
  if (s === 'low' || s === 'laag') return 'laag'
  if (ERNST.has(s)) return s as 'hoog' | 'middel' | 'laag'
  return 'middel'
}

export function parseTenderRiskReportResponse(raw: string): {
  html: string
  contractType: 'RAW' | 'UAV' | 'UAV_GC' | 'onbekend'
  items: Array<{ type: string; omschrijving: string; ernst: 'hoog' | 'middel' | 'laag' }>
} {
  const trimmed = raw.trim()
  const tryParse = (obj: unknown) => {
    if (!obj || typeof obj !== 'object') return null
    const rec = obj as Record<string, unknown>
    const htmlField = rec.html
    if (typeof htmlField !== 'string' || !htmlField.includes('<')) return null
    const contractType = normalizeContract(rec.contract_type ?? rec.contractType)
    const rawItems = rec.risico_items ?? rec.risicoItems
    const items: Array<{ type: string; omschrijving: string; ernst: 'hoog' | 'middel' | 'laag' }> = []
    if (Array.isArray(rawItems)) {
      for (const it of rawItems.slice(0, 40)) {
        if (!it || typeof it !== 'object') continue
        const o = it as Record<string, unknown>
        const type = String(o.type ?? '').trim().slice(0, 120)
        const omschrijving = String(o.omschrijving ?? o.description ?? '').trim().slice(0, 4000)
        if (!type || !omschrijving) continue
        items.push({ type, omschrijving, ernst: normalizeErnst(o.ernst) })
      }
    }
    return { html: htmlField, contractType, items }
  }

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      const out = tryParse(parsed)
      if (out) return out
    } catch {
      /* fall through */
    }
  }

  const jsonMatch = trimmed.match(/\{[\s\S]*"html"\s*:[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as unknown
      const out = tryParse(parsed)
      if (out) return out
    } catch {
      /* ignore */
    }
  }

  return {
    html: extractTenderAnalysisHtml(trimmed),
    contractType: 'onbekend',
    items: [],
  }
}
