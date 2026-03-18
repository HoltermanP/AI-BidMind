import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { tenderSections, tenders, tenderDocuments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import OpenAI from 'openai'
import { SECTION_WRITING_SYSTEM, SECTION_WRITING_USER } from '@/lib/ai/prompts'

const apiKey = process.env.OPENAI_API_KEY
const client = apiKey ? new OpenAI({ apiKey }) : null

const SECTION_TYPE_LABELS: Record<string, string> = {
  plan_van_aanpak: 'Plan van Aanpak',
  kwaliteit: 'Kwaliteitsborging',
  prijs_onderbouwing: 'Prijsonderbouwing',
  team_cv: "Team & CV's",
  referenties: 'Referenties',
  vca_veiligheid: 'VCA & Veiligheid',
  eigen_sectie: 'Eigen sectie',
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 503 })
  }
  if (!client) {
    return new Response(JSON.stringify({ error: 'OpenAI not configured' }), { status: 503 })
  }

  const { id, sId } = await params
  const body = await request.json()

  const [tender] = await db.select().from(tenders).where(eq(tenders.id, id))
  const [section] = await db.select().from(tenderSections).where(eq(tenderSections.id, sId))
  const documents = await db.select().from(tenderDocuments).where(eq(tenderDocuments.tenderId, id))

  const requirements = documents
    .flatMap((d) => (d.analysisJson as any)?.key_requirements || [])
    .slice(0, 8)

  const sectionTypeLabel = SECTION_TYPE_LABELS[section?.sectionType || 'eigen_sectie'] || (body.sectionType || 'sectie')

  const stream = await client!.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SECTION_WRITING_SYSTEM },
      {
        role: 'user',
        content: SECTION_WRITING_USER(
          sectionTypeLabel,
          tender?.title || 'Onbekende tender',
          tender?.contractingAuthority || 'Onbekende aanbesteder',
          requirements,
        ),
      },
    ],
    stream: true,
    max_tokens: 1200,
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = JSON.stringify(chunk)
        controller.enqueue(encoder.encode(`data: ${text}\n\n`))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
