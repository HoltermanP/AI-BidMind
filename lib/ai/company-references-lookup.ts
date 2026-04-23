/**
 * Zoekt publieke referenties van een bedrijf op via de Anthropic web search tool.
 * Anthropic voert de zoekopdracht server-side uit — geen externe search API key nodig.
 *
 * Claude extraheert uitsluitend aantoonbare feiten uit de zoekresultaten.
 * Retourneert null als Anthropic niet beschikbaar is of niets bruikbaars gevonden wordt.
 */
import { anthropic } from '@/lib/ai/client'

export async function lookupCompanyReferences(companyName: string): Promise<string | null> {
  if (!anthropic) return null
  if (!companyName.trim()) return null

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        } as const,
      ],
      system: `Je extraheert uitsluitend feitelijke informatie over referentieprojecten van een bedrijf uit zoekresultaten.
Regels:
- Noteer alleen wat letterlijk in de zoekresultaten staat. Verzin NIETS.
- Geen aannames, geen interpretaties, geen aanvullingen op basis van algemene kennis.
- Als iets onduidelijk of onzeker is in de bron: weglaten.
- Geen superlatieven of waardeoordelen — alleen feiten.
- Als er geen bruikbare referentiefeiten gevonden zijn: antwoord uitsluitend met GEEN FEITEN GEVONDEN.`,
      messages: [
        {
          role: 'user',
          content: `Zoek naar publieke referentieprojecten en opdrachtgevers van het Nederlandse bedrijf "${companyName}".

Zoek naar: projecten, opdrachten, klanten, portfolio, aanbestedingen van dit bedrijf.

Extraheer per gevonden referentie (alleen wat letterlijk in de bronnen staat):
- Projectnaam of -omschrijving
- Opdrachtgever (naam organisatie of bedrijf)
- Jaar of periode (alleen als expliciet vermeld in de bron)
- Aard van de werkzaamheden (korte feitelijke omschrijving)
- Bron-URL

Verzin NIETS. Alleen aantoonbare feiten uit de zoekresultaten.`,
        },
      ],
    })

    // Extraheer alleen tekst-blokken (WebSearchToolResultBlocks zijn intern verwerkt)
    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim()

    if (!text || text.toUpperCase().includes('GEEN FEITEN GEVONDEN')) return null

    return (
      `--- Publieke referenties gevonden via Anthropic web search (alleen aantoonbare feiten uit bronnen) ---\n` +
      `${text}\n` +
      `--- Einde gevonden referenties ---`
    )
  } catch (err) {
    console.warn('[company-references-lookup] Web search mislukt:', err)
    return null
  }
}
