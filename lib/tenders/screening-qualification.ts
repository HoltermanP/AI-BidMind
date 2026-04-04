import { db } from '@/lib/db'
import { tenders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCompanyContext } from '@/lib/company/context'
import { runCompletion, isAgentAvailable } from '@/lib/ai/run'
import { parseAiJsonObject } from '@/lib/ai/parse-ai-json'
import { SCREENING_QUALIFICATION_SYSTEM, SCREENING_QUALIFICATION_USER } from '@/lib/ai/prompts'
import { tenderMetadataJson } from '@/lib/tenders/tender-metadata-json'

/**
 * Voert de Screening Agent uit en schrijft goNoGoScore + goNoGo + goNoGoReasoning.
 */
export async function runScreeningQualificationForTenderId(tenderId: string): Promise<void> {
  if (!db) return
  if (!isAgentAvailable('screening_qualification')) {
    throw new Error('AI-provider voor screening niet geconfigureerd (OPENAI_API_KEY)')
  }

  const [row] = await db.select().from(tenders).where(eq(tenders.id, tenderId))
  if (!row) throw new Error('Tender niet gevonden')

  const companyContext = await getCompanyContext()
  const intakeSummary =
    row.intakeSuitabilitySummary ||
    (row.intakeSuitabilityTier
      ? `Geschiktheid: ${row.intakeSuitabilityTier}, score ${row.intakeSuitabilityScore ?? '—'}`
      : null)

  const user = SCREENING_QUALIFICATION_USER({
    tenderJson: tenderMetadataJson(row),
    companyContext: companyContext || undefined,
    intakeSummary,
  })

  const raw = await runCompletion('screening_qualification', SCREENING_QUALIFICATION_SYSTEM, user, { jsonMode: true })
  const obj = parseAiJsonObject(raw)

  const advies = String(obj.advies ?? '')
    .toLowerCase()
    .trim()
  const goNoGo = advies === 'no_go' || advies === 'nogo' ? 'no_go' : 'go'
  const reasoning =
    typeof obj.advies_samenvatting === 'string' && obj.advies_samenvatting.trim()
      ? obj.advies_samenvatting.trim().slice(0, 8000)
      : 'Screening uitgevoerd; geen samenvatting ontvangen.'

  const goNoGoScore = { ...obj, advies: goNoGo === 'no_go' ? 'no_go' : 'go' }

  await db
    .update(tenders)
    .set({
      goNoGoScore: goNoGoScore as Record<string, unknown>,
      goNoGo,
      goNoGoReasoning: reasoning,
      updatedAt: new Date(),
    })
    .where(eq(tenders.id, tenderId))
}
