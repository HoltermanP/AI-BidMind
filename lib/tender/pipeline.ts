/**
 * Tender pipeline — fases zoals op het dashboard; sommige fases hebben twee AI-subagents.
 */

export const PIPELINE_STAGES = [
  'new',
  'qualifying',
  'analyzing',
  'inlichtingen',
  'writing',
  'review',
  'submitted',
  'won',
  'lost',
] as const

export type PipelineStageId = (typeof PIPELINE_STAGES)[number]

export interface PipelineSubAgent {
  label: string
  tagline: string
  description: string
}

/** Per fase: één of twee agents (UI toont subagents naast elkaar of gestapeld). */
export const PIPELINE_STAGE_SUB_AGENTS: Record<PipelineStageId, PipelineSubAgent[]> = {
  new: [
    {
      label: 'Intake Agent',
      tagline: 'Bronnen & intake',
      description:
        'Verwerkt tenders uit TenderNed, Negometrix, handmatige invoer en e-mail. Legt bron (source) vast en scant scope, sector, deadlines en contractcontext. Output: eerste inschatting en aanknopingspunten voor kwalificatie.',
    },
  ],
  qualifying: [
    {
      label: 'Screening Agent',
      tagline: 'Go/No-Go op 5 criteria',
      description:
        'Kwalificatie met scoremodel: (1) kerncompetentie match + toelichting, (2) referenties ja/gedeeltelijk/nee, (3) margeschatting realistisch, (4) capaciteit, (5) winkans hoog/middel/laag. Output: go/no-go advies met onderbouwing per criterium.',
    },
  ],
  analyzing: [
    {
      label: 'Analyse Agent',
      tagline: 'Bestek & EMVI-kern',
      description:
        'Documentanalyse: naast het volledige rapport levert gestructureerde kern — bestek-samenvatting, gunningscriteria, EMVI-gewichten, selectie-eisen. Diepgaande tenderuitwerking blijft dezelfde taak.',
    },
    {
      label: 'Risico Agent',
      tagline: 'Contract & aansprakelijkheid',
      description:
        'Detecteert contractvorm (RAW, UAV, UAV-GC). Analyseert aansprakelijkheid, boetes, meer-/minderwerk, onvoorziene omstandigheden. Bij UAV-GC: expliciete waarschuwing dat ontwerprisico bij inschrijver ligt. Vult risico-items.',
    },
  ],
  inlichtingen: [
    {
      label: 'Inlichtingen Agent',
      tagline: 'Vragen & NvI',
      description:
        'Conceptvragen op basis van analyse (onduidelijkheden), verwerking van de Nota van Inlichtingen, markering wat de inschrijving raakt, optioneel concurrentie-inzichten. Workflow: vragen opstellen → ingediend → NvI ontvangen → verwerkt.',
    },
  ],
  writing: [
    {
      label: 'Schrijf Agent',
      tagline: 'EMVI & plannen',
      description:
        'Schrijft EMVI-kwaliteitsplan, plan van aanpak, risicoparagraaf, veiligheidsplan, teamsamenstelling. Instructie: beschrijf wat de OPDRACHTGEVER ermee wint (meerwaarde), niet alleen wat de inschrijver doet.',
    },
    {
      label: 'Prijs Agent',
      tagline: 'Raming & inschrijfprijs',
      description:
        'Kostenraming, gewenste marge (%), inschrijfprijs; waarschuwing bij >25% onder referentie/markt. Bij UAV-GC: aparte ontwerpkostenraming.',
    },
  ],
  review: [
    {
      label: 'Review Agent',
      tagline: 'Indieningscheck',
      description:
        'Volledigheid t.o.v. eisenlijst uit fase 3, EMVI-toets op meerwaarde-argumenten, prijs-kwaliteitsbalans, uren tot sluitingstijd. Blokkeer advies bij ontbrekende verplichte onderdelen.',
    },
  ],
  submitted: [
    {
      label: 'Monitor Agent',
      tagline: 'Besluit & Alcatel',
      description:
        'Volgt status na indiening: ingediend, Alcatel-termijn, voorlopige gunning, definitief. Alcatel-termijndatum en signalering wanneer die nadert of verstreken is.',
    },
  ],
  won: [
    {
      label: 'Overdracht Agent',
      tagline: 'Checklist & project',
      description:
        'Overdrachts-checklist: kick-off, projectleider, mijlpalen, eerste betalingstermijn. Koppelt het tenderdossier logisch aan uitvoering (intern).',
    },
  ],
  lost: [
    {
      label: 'Evaluatie Agent',
      tagline: 'Debriefing & leren',
      description:
        'Debriefing-aanvraag (concept e-mail), scorevergelijking eigen vs. winnaar, bezwaar-check (procedureel/inhoudelijk) met advies, leerpunten gekoppeld aan opdrachttype en opdrachtgever.',
    },
  ],
}

function joinSubAgentLines(stage: PipelineStageId, sep: string, fn: (a: PipelineSubAgent) => string): string {
  return PIPELINE_STAGE_SUB_AGENTS[stage].map(fn).join(sep)
}

/** Tooltip / beschrijving onder dashboard: alle subagents van de fase. */
export const PIPELINE_AGENT_DESCRIPTIONS: Record<PipelineStageId, string> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s, joinSubAgentLines(s, '\n\n', (a) => `${a.label}: ${a.description}`)])
) as Record<PipelineStageId, string>

/** Eerste regel onder fasenaam in de strip (korte taglines, gescheiden). */
export const PIPELINE_AGENT_TAGLINE: Record<PipelineStageId, string> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s, joinSubAgentLines(s, ' · ', (a) => a.tagline)])
) as Record<PipelineStageId, string>

/** Actieve agentregel in de kop (alle namen). */
export const PIPELINE_AGENT_LABELS: Record<PipelineStageId, string> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s, joinSubAgentLines(s, ' · ', (a) => a.label)])
) as Record<PipelineStageId, string>

/** Tabbladen op de tenderdetailpagina (volgorde staat in de UI). */
export const TENDER_DETAIL_TAB_IDS = [
  'overview',
  'documents',
  'analysis',
  'questions',
  'sections',
  'lessons',
  'timeline',
  'handover',
] as const

export type TenderDetailTabId = (typeof TENDER_DETAIL_TAB_IDS)[number]

export const TENDER_DETAIL_TAB_LABELS: Record<TenderDetailTabId, string> = {
  overview: 'Overzicht',
  handover: 'Overdracht',
  documents: 'Documenten',
  analysis: 'Tenderanalyse',
  questions: 'NVI Vragen',
  sections: 'Aanbieding',
  lessons: 'Leerpunten',
  timeline: 'Tijdlijn',
}

/**
 * Welk tabblad hoort bij een pipeline-fase: klik op de stap opent dit tabblad
 * (samen met het opslaan van de fase in de tender).
 */
export const PIPELINE_STAGE_TO_TAB: Record<PipelineStageId, TenderDetailTabId> = {
  new: 'overview',
  qualifying: 'documents',
  analyzing: 'analysis',
  inlichtingen: 'questions',
  writing: 'sections',
  review: 'sections',
  submitted: 'timeline',
  won: 'handover',
  lost: 'lessons',
}

export const PIPELINE_WITHDRAWN_TAB: TenderDetailTabId = 'overview'

/** Welke pipeline-fases horen bij elk tabblad (meerdere bij 'sections'). */
export const TAB_PHASES: Record<TenderDetailTabId, string[]> = {
  overview:  ['new'],
  documents: ['qualifying'],
  analysis:  ['analyzing'],
  questions: ['inlichtingen'],
  sections:  ['writing', 'review'],
  timeline:  ['submitted'],
  handover:  ['won'],
  lessons:   ['lost'],
}

/** Welk werk er aantoonbaar gedaan is per fase — wordt doorgegeven vanuit de component. */
export interface PhaseEvidence {
  qualifying:   boolean  // goNoGo besloten of screening-score aanwezig
  analyzing:    boolean  // analyse- of risicorapport aanwezig/gedaan
  inlichtingen: boolean  // vragen of inlichtingen-records aanwezig
  writing:      boolean  // secties met inhoud aanwezig
  review:       boolean  // reviewrapport aanwezig/gedaan
}

export type TabState = 'done' | 'skipped' | 'active' | 'next' | 'locked'

/**
 * Bepaalt de visuele staat van een tab.
 * - done:    fase aantoonbaar afgerond
 * - skipped: status is verder maar het werk in deze fase ontbreekt (optioneel of gemist)
 * - active:  huidige fase
 * - next:    eerstvolgende geldige stap
 * - locked:  nog niet bereikbaar
 */
export function getTabState(
  tabId: TenderDetailTabId,
  currentStatus: string,
  evidence?: PhaseEvidence,
): TabState {
  if (currentStatus === 'withdrawn') {
    if (tabId === 'overview') return 'active'
    if (tabId === 'handover' || tabId === 'lessons') return 'locked'
    return 'done'
  }

  const phases = TAB_PHASES[tabId] ?? []
  if (phases.includes(currentStatus)) return 'active'

  if ((currentStatus === 'won'  && tabId === 'lessons') ||
      (currentStatus === 'lost' && tabId === 'handover')) return 'locked'

  const stages = PIPELINE_STAGES as readonly string[]
  const currentIdx = stages.indexOf(currentStatus as PipelineStageId)

  const allBefore = phases.every(p => stages.indexOf(p as PipelineStageId) < currentIdx)
  if (allBefore) {
    if (!evidence) return 'done'
    return tabHasEvidence(tabId, evidence) ? 'done' : 'skipped'
  }

  return isValidTransition(currentStatus, phases[0]).valid ? 'next' : 'locked'
}

function tabHasEvidence(tabId: TenderDetailTabId, e: PhaseEvidence): boolean {
  switch (tabId) {
    case 'overview':  return true               // startpunt, altijd gepasseerd
    case 'documents': return e.qualifying
    case 'analysis':  return e.analyzing
    case 'questions': return e.inlichtingen     // optioneel — skipped is normaal
    case 'sections':  return e.writing || e.review
    case 'timeline':  return true               // submitted is altijd expliciet gezet
    case 'handover':  return true
    case 'lessons':   return true
    default:          return true
  }
}

/**
 * Toegestane voorwaartse overgangen per fase.
 * Achterwaarts (corrigeren) en naar 'withdrawn' zijn altijd toegestaan.
 * 'inlichtingen' is optioneel: vanuit 'analyzing' mag je ook direct naar 'writing'.
 */
export const VALID_FORWARD_TRANSITIONS: Partial<Record<string, string[]>> = {
  new:          ['qualifying'],
  qualifying:   ['analyzing'],
  analyzing:    ['inlichtingen', 'writing'],
  inlichtingen: ['writing'],
  writing:      ['review'],
  review:       ['submitted'],
  submitted:    ['won', 'lost'],
}

export function isValidTransition(from: string, to: string): { valid: boolean; message?: string } {
  if (to === from)        return { valid: true }
  if (to === 'withdrawn') return { valid: true }

  const stages = PIPELINE_STAGES as readonly string[]
  const fromIdx = stages.indexOf(from as PipelineStageId)
  const toIdx   = stages.indexOf(to   as PipelineStageId)

  if (fromIdx === -1 || toIdx === -1) return { valid: true }

  // Achterwaartse correctie altijd toegestaan
  if (toIdx < fromIdx) return { valid: true }

  const allowed = VALID_FORWARD_TRANSITIONS[from] ?? []
  if (allowed.includes(to)) return { valid: true }

  return {
    valid: false,
    message: `Vorige fase nog niet afgerond — verplaats de tender eerst naar de juiste tussenstap.`,
  }
}

export function getTabForPipelineStatus(status: string): TenderDetailTabId {
  if (status === 'withdrawn') return PIPELINE_WITHDRAWN_TAB
  if ((PIPELINE_STAGES as readonly string[]).includes(status)) {
    return PIPELINE_STAGE_TO_TAB[status as PipelineStageId]
  }
  return 'overview'
}

/** Korte hint op tabknoppen: welke pipeline-fases hier logisch bij horen. */
export const TENDER_TAB_PIPELINE_HINT: Record<TenderDetailTabId, string> = {
  overview: 'Past bij pipeline: Signalering (nieuw), Ingetrokken',
  handover: 'Hoort bij pipeline: Gewonnen — Overdracht Agent. Tabblad actief na gunning.',
  documents: 'Past bij pipeline: Kwalificatie — Screening Agent',
  analysis: 'Past bij pipeline: Documentanalyse & risico — Analyse + Risico Agent',
  questions: 'Past bij pipeline: Inlichtingen — Inlichtingen Agent',
  sections: 'Past bij pipeline: Inschrijving samenstellen (Schrijf + Prijs) en Review',
  lessons: 'Past bij pipeline: Verloren — Evaluatie Agent',
  timeline: 'Past bij pipeline: Ingediend / wacht op beslissing — Monitor Agent',
}
