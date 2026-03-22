import { marked } from 'marked'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})
turndown.use(gfm)

/** Markdown → HTML voor de TipTap-editor (inhoud blijft Markdown in de API). */
export function markdownToHtml(md: string): string {
  const src = md ?? ''
  if (!src.trim()) return '<p></p>'
  const html = marked.parse(src, { async: false, gfm: true, breaks: true })
  if (typeof html !== 'string' || !html.trim()) return '<p></p>'
  return html
}

/** HTML uit TipTap → Markdown voor opslag en export. */
export function htmlToMarkdown(html: string): string {
  const md = turndown.turndown(html || '').trim()
  return md || ''
}
