import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { fetchPublicaties, mapPublicatieToTender } from '@/lib/tenderned/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/tenderned/publicaties
 * Haalt aankondigingen/aanbestedingen op van TenderNed (open data TNS v2).
 * Alleen voor ingelogde gebruikers.
 * Query: page (default 0), size (default 20).
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10))
    const size = Math.min(50, Math.max(1, parseInt(searchParams.get('size') ?? '20', 10)))

    const data = await fetchPublicaties({ page, size })
    const mapped = data.content.map(mapPublicatieToTender)

    return NextResponse.json({
      content: mapped,
      first: data.first,
      last: data.last,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      size: data.size,
      numberOfElements: data.numberOfElements,
      number: data.number,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'TenderNed ophalen mislukt'
    const detail = error instanceof Error ? error.stack : String(error)
    console.error('GET /api/tenderned/publicaties error:', message, detail)
    return NextResponse.json(
      { error: message },
      { status: 502 }
    )
  }
}
