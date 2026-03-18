/** Types voor TenderNed Publicatie Webservice (TNS) v2 - open data, geen login vereist voor lijst. */

export interface TenderNedPublicatie {
  publicatieId: string
  publicatieDatum: string
  typePublicatie: { code: string; omschrijving: string }
  aanbestedingNaam: string
  opdrachtgeverNaam: string
  sluitingsDatum?: string | null
  aantalDagenTotSluitingsDatum?: number | null
  procedure?: { code: string; omschrijving: string } | null
  typeOpdracht?: { code: string; omschrijving: string } | null
  publicatiecode?: { code: string; omschrijving: string } | null
  opdrachtBeschrijving?: string | null
  digitaal?: boolean | null
  europees?: boolean | null
  kenmerk?: number | null
  link?: { href: string; title: string } | null
}

export interface TenderNedPublicatiesResponse {
  content: TenderNedPublicatie[]
  first: boolean
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  numberOfElements: number
  number: number
}

/** Vorm voor in de app: gekoppeld aan ons tender-schema waar mogelijk. */
export interface TenderNedPublicatieMapped {
  publicatieId: string
  title: string
  referenceNumber: string | null
  contractingAuthority: string | null
  publicationDate: string | null
  deadlineSubmission: string | null
  procedureType: string | null
  typeOpdracht: string | null
  description: string | null
  tendernetUrl: string | null
}

/** Detail van één publicatie (GET /publicaties/{id}). */
export interface TenderNedPublicatieDetail {
  publicatieId: number
  kenmerk: number
  aanbestedingNaam: string
  opdrachtgeverNaam: string
  opdrachtBeschrijving?: string | null
  publicatieDatum?: string | null
  sluitingsDatum?: string | null
  aanvangOpdrachtDatum?: string | null
  voltooiingOpdrachtDatum?: string | null
  typePublicatie?: string | null
  publicatieCode?: string | null
  referentieNummer?: string | null
  cpvCodes?: Array<{ code: string; omschrijving: string; isHoofdOpdracht?: boolean }> | null
  links?: { pdf?: { href: string; title: string } } | null
}

/** Document in lijst (GET /publicaties/{id}/documenten). */
export interface TenderNedDocument {
  documentId: string
  documentNaam: string
  typeDocument: { code: string; omschrijving: string }
  datumPublicatie?: string | null
  publicatieCategorie?: { code: string; omschrijving: string } | null
  grootte?: number | null
  links?: { download?: { href: string; title: string } } | null
}

export interface TenderNedDocumentenResponse {
  documenten: TenderNedDocument[]
  links?: { downloadZip?: { href: string; title: string } } | null
}
