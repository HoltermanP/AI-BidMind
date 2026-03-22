const GAMMA_API_BASE = 'https://public-api.gamma.app'

export type GammaGenerationStatus = 'pending' | 'completed' | 'failed'

export interface GammaCreateGenerationResult {
  generationId: string
  warnings?: string
}

export interface GammaGetGenerationResult {
  generationId: string
  status: GammaGenerationStatus
  gammaUrl?: string
  exportUrl?: string
  error?: { message?: string; statusCode?: number }
}

async function parseJsonBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text) as unknown
  } catch {
    return { raw: text }
  }
}

/**
 * Start een asynchrone Gamma-generatie (presentatie + optioneel auto-export).
 * Vereist `GAMMA_API_KEY` (header `X-API-KEY`).
 */
export async function gammaCreateGeneration(opts: {
  apiKey: string
  inputText: string
  additionalInstructions?: string
}): Promise<GammaCreateGenerationResult> {
  const { apiKey, inputText, additionalInstructions } = opts
  const res = await fetch(`${GAMMA_API_BASE}/v1.0/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({
      inputText,
      textMode: 'preserve',
      format: 'presentation',
      exportAs: 'pptx',
      numCards: 12,
      additionalInstructions:
        additionalInstructions ??
        'Professionele presentatie voor een Nederlandse infraproject-aannemer: duidelijke structuur, visueel aantrekkelijk, geschikt voor interne stakeholders.',
      textOptions: {
        amount: 'medium',
        tone: 'zakelijk, helder',
        audience: 'interne stakeholders (project, uitvoering, directie)',
        language: 'nl',
      },
      imageOptions: {
        source: 'webFreeToUseCommercially',
      },
      cardOptions: {
        dimensions: '16x9',
      },
    }),
  })

  const data = (await parseJsonBody(res)) as Record<string, unknown>
  if (!res.ok) {
    const msg =
      typeof data.message === 'string'
        ? data.message
        : typeof data.raw === 'string'
          ? data.raw
          : JSON.stringify(data)
    throw new Error(`Gamma API ${res.status}: ${msg}`)
  }

  const generationId = data.generationId
  if (typeof generationId !== 'string' || !generationId) {
    throw new Error('Gamma API: ontbrekende generationId in antwoord')
  }

  return {
    generationId,
    warnings: typeof data.warnings === 'string' ? data.warnings : undefined,
  }
}

export async function gammaGetGeneration(
  apiKey: string,
  generationId: string
): Promise<GammaGetGenerationResult> {
  const res = await fetch(
    `${GAMMA_API_BASE}/v1.0/generations/${encodeURIComponent(generationId)}`,
    {
      headers: { 'X-API-KEY': apiKey },
    }
  )

  const data = (await parseJsonBody(res)) as Record<string, unknown>
  if (!res.ok) {
    const msg =
      typeof data.message === 'string'
        ? data.message
        : typeof data.raw === 'string'
          ? data.raw
          : JSON.stringify(data)
    throw new Error(`Gamma API ${res.status}: ${msg}`)
  }

  const status = data.status
  if (status !== 'pending' && status !== 'completed' && status !== 'failed') {
    throw new Error('Gamma API: onbekende status in antwoord')
  }

  return {
    generationId: typeof data.generationId === 'string' ? data.generationId : generationId,
    status,
    gammaUrl: typeof data.gammaUrl === 'string' ? data.gammaUrl : undefined,
    exportUrl: typeof data.exportUrl === 'string' ? data.exportUrl : undefined,
    error:
      data.error && typeof data.error === 'object'
        ? (data.error as { message?: string; statusCode?: number })
        : undefined,
  }
}
