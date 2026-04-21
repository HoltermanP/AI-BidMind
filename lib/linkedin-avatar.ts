/**
 * LinkedIn publiceert geen officiële publieke API voor profielfoto's zonder OAuth.
 * We gebruiken Unavatar (Microlink) als bemiddelaar: werkt voor veel publieke profielen,
 * kan falen bij strikte privacy-instellingen of als de dienst rate-limit.
 * @see https://unavatar.io/docs
 */

const LINKEDIN_IN = /linkedin\.com\/in\/([^/?#]+)/i

export function parseLinkedInVanityName(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed)
      const m = url.pathname.match(/^\/in\/([^/]+)/i)
      return m?.[1]?.replace(/\/$/, '') ?? null
    }
  } catch {
    return null
  }

  const slug = trimmed.replace(/^\/+|\/+$/g, '')
  if (/^[a-zA-Z0-9_-]+$/.test(slug) && slug.length <= 100) {
    return slug
  }

  return null
}

export function buildUnavatarLinkedInUrl(vanity: string): string {
  const v = vanity.trim()
  return `https://unavatar.io/linkedin/user:${encodeURIComponent(v)}?fallback=false`
}

