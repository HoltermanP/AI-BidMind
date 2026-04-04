/**
 * Heuristiek: inschrijfprijs >25% lager dan geraamde opdrachtwaarde → mogelijk abnormaal laag.
 */
export function computePrijsAbnormaalLaag(
  prijsInschrijving: string | number | null | undefined,
  referentieWaarde: string | number | null | undefined
): boolean {
  const p = typeof prijsInschrijving === 'number' ? prijsInschrijving : parseFloat(String(prijsInschrijving ?? ''))
  const ref = typeof referentieWaarde === 'number' ? referentieWaarde : parseFloat(String(referentieWaarde ?? ''))
  if (!Number.isFinite(p) || !Number.isFinite(ref) || ref <= 0) return false
  return p < ref * 0.75
}
