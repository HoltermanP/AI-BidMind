const MAX_INPUT_CHARS = 400_000

function decodeBasicEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function stripTagsToPlain(block: string): string {
  return decodeBasicEntities(block)
    .replace(/<[^>]+>/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

/**
 * Zet de gesanitized handover-presentatie-HTML om naar platte tekst voor Gamma `inputText`.
 */
export function handoverPresentationHtmlToGammaInput(
  html: string,
  tenderTitle?: string | null
): string {
  const intro = tenderTitle?.trim()
    ? `Onderwerp: implementatieplan en overdracht na gunning — ${tenderTitle.trim()}.\nTaal: Nederlands, zakelijk. Doel: interne pitch / overdracht naar uitvoering.\n\n`
    : `Onderwerp: implementatieplan en overdracht na gunning.\nTaal: Nederlands, zakelijk.\n\n`

  const sections: string[] = []
  const re = /<section[^>]*class="[^"]*handover-slide[^"]*"[^>]*>([\s\S]*?)<\/section>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const chunk = stripTagsToPlain(m[1])
    if (chunk) sections.push(chunk)
  }

  let body: string
  if (sections.length > 0) {
    body = sections.map((s, i) => `--- Slide ${i + 1} ---\n${s}`).join('\n\n')
  } else {
    body = stripTagsToPlain(html)
  }

  const out = intro + body
  if (out.length <= MAX_INPUT_CHARS) return out
  return out.slice(0, MAX_INPUT_CHARS) + '\n\n[… ingekort tot maximale invoerlengte …]'
}
