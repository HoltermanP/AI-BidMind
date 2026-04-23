/**
 * Zoekt publieke referenties van een bedrijf op via Brave Search en laat Claude
 * alleen aantoonbare feiten extraheren uit de zoekresultaten.
 *
 * Vereist: BRAVE_SEARCH_API_KEY in .env.local
 * Zonder key: retourneert null (geen lookup, geen fout).
 */
import { anthropic } from '@/lib/ai/client'
import { collectAnthropicTextFromMessage } from '@/lib/ai/run'

const BRAVE_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search'
const BRAVE_KEY = process.env.BRAVE_SEARCH_API_KEY

interface BraveSearchResult {
  title: string
  url: string
  description: string
}

interface BraveSearchResponse {
  web?: {
    results?: Array<{
      title?: string
      url?: string
      description?: string
    }>
  }
}

async function searchBrave(query: string, count = 10): Promise<BraveSearchResult[]> {
  if (!BRAVE_KEY) return []

  const url = new URL(BRAVE_ENDPOINT)
  url.searchParams.set('q', query)
  url.searchParams.set('count', String(count))
  url.searchParams.set('country', 'NL')
  url.searchParams.set('search_lang', 'nl')
  url.searchParams.set('text_decorations', 'false')

  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': BRAVE_KEY,
    },
    // Niet cachen — altijd actuele resultaten
    cache: 'no-store',
  })

  if (!res.ok) {
    console.warn('[company-references-lookup] Brave Search fout:', res.status, await res.text().catch(() => ''))
    return []
  }

  const data = await res.json() as BraveSearchResponse
  return (data.web?.results ?? []).map((r) => ({
    title: r.title ?? '',
    url: r.url ?? '',
    description: r.description ?? '',
  }))
}

function buildSnippetsBlock(results: BraveSearchResult[]): string {
  return results
    .filter((r) => r.title || r.description)
    .map((r, i) =>
      `[${i + 1}] ${r.title}\n${r.url}\n${r.description}`
    )
    .join('\n\n')
}

/**
 * Zoekt referenties voor het opgegeven bedrijf en retourneert een feitelijke
 * tekst die direct als context in de sectie-schrijfprompt kan worden gebruikt.
 *
 * Retourneert null als:
 * - BRAVE_SEARCH_API_KEY niet is ingesteld
 * - Er geen bruikbare resultaten zijn
 * - Anthropic niet beschikbaar is
 */
export async function lookupCompanyReferences(companyName: string): Promise<string | null> {
  if (!BRAVE_KEY) return null
  if (!anthropic) return null
  if (!companyName.trim()) return null

  // Twee zoekopdrachten: algemeen portfolio + aanbestedingen/referenties
  const queries = [
    `"${companyName}" referenties projecten opdrachten`,
    `"${companyName}" portfolio klanten werkzaamheden`,
  ]

  const allResults: BraveSearchResult[] = []
  for (const q of queries) {
    const results = await searchBrave(q, 8)
    allResults.push(...results)
  }

  // Dedupliceer op URL
  const seen = new Set<string>()
  const unique = allResults.filter((r) => {
    if (seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })

  if (unique.length === 0) return null

  const snippets = buildSnippetsBlock(unique.slice(0, 15))

  // Claude: extraheer alleen aantoonbare feiten
  const extractPrompt = `Je taak is uitsluitend het extraheren van FEITELIJKE informatie over referentieprojecten en opdrachtgevers van het bedrijf "${companyName}" uit de onderstaande zoekresultaten van het internet.

Strikte regels:
1. Noteer alleen wat letterlijk in de zoekresultaten staat. Verzin NIETS.
2. Geen aannames, geen interpretaties, geen aanvullingen op basis van algemene kennis.
3. Als iets onduidelijk of onzeker is in de bron, laat het dan weg.
4. Geen superlatieven of waardeoordelen — alleen feiten.
5. Als er geen bruikbare referentiefeitenen gevonden zijn, antwoord dan uitsluitend met: GEEN FEITEN GEVONDEN.

Extraheer per gevonden referentie (indien aanwezig):
- Projectnaam of -omschrijving
- Opdrachtgever (organisatie of bedrijf)
- Jaar of periode (alleen als expliciet vermeld in de bron)
- Aard van de werkzaamheden (korte feitelijke omschrijving)
- Bron-URL

--- Zoekresultaten ---
${snippets}
`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system: 'Je extraheert uitsluitend feitelijke informatie uit aangeleverde tekst. Je verzint niets.',
      messages: [{ role: 'user', content: extractPrompt }],
    })

    const text = collectAnthropicTextFromMessage(response).trim()
    if (!text || text.startsWith('GEEN FEITEN GEVONDEN')) return null
    return `--- Publieke referenties gevonden via internet (uitsluitend uit bronnen, niet aangevuld) ---\n${text}\n--- Einde gevonden referenties ---`
  } catch (err) {
    console.warn('[company-references-lookup] Extractie mislukt:', err)
    return null
  }
}
