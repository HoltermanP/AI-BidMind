# BidMind – AI voor winnende aanbestedingen

Professioneel tendermanagementsysteem voor infrastructuuraannemers. Ondersteunt de volledige tenderprocedure van TenderNed-aankondiging tot definitieve inschrijving.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Neon** (Postgres via `@neondatabase/serverless`)
- **Clerk** (authenticatie + webhook user sync)
- **AI**: OpenAI en Anthropic Claude — per taak gekozen (zware analyse/schrijven → Claude; vraagengeneratie → OpenAI)
- **Drizzle ORM** (schema, migraties, queries)
- **Framer Motion** (animaties)
- Custom UI — geen componentbibliotheek

## Opzetten

### 1. Omgevingsvariabelen

Vul de placeholders in `.env.local` aan:

```env
# Clerk — https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Neon — https://console.neon.tech
DATABASE_URL=postgresql://username:password@ep-....neon.tech/neondb?sslmode=require

# OpenAI — https://platform.openai.com (o.a. vraagengeneratie)
OPENAI_API_KEY=sk-...

# Anthropic — https://console.anthropic.com (documentanalyse, sectieteksten)
ANTHROPIC_API_KEY=sk-ant-...

# UploadThing (optioneel voor echte file uploads)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
NEXT_PUBLIC_UPLOADTHING_APP_ID=...
```

### 2. Database migreren

```bash
# Push schema naar Neon (aanbevolen voor development)
npm run db:push

# Of: genereer SQL migraties en pas toe
npm run db:generate
npm run db:migrate
```

### 3. Seed data laden

```bash
npm run db:seed
```

Laadt 3 demo-tenders (A27 verbreding, Maastunneltoegang, Fietsbrug Amsterdam) met documenten, vragen en secties.

### 4. Clerk webhook configureren

In Clerk dashboard → Webhooks → Add endpoint:
- URL: `https://jouwdomein.com/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`
- Kopieer de Signing Secret naar `CLERK_WEBHOOK_SECRET`

### 5. Applicatie starten

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Alleen de UI bekijken (zonder keys)

Zet in `.env.local`:

```env
NEXT_PUBLIC_UI_ONLY=true
```

Start de app met `npm run dev`. Je kunt dan alle pagina’s bekijken zonder Clerk-, database- of OpenAI-keys. Inloggen is uitgeschakeld, data is leeg. Handig om de interface te bekijken voordat je alles configureert. Zet `NEXT_PUBLIC_UI_ONLY` weer uit (of verwijder de regel) om normaal te gebruiken.

---

## Features

| Feature | Status |
|---------|--------|
| Dashboard met KPI's en pipeline | ✅ |
| Tenders overzicht + filters + zoeken | ✅ |
| Tender detail (5 tabbladen) | ✅ |
| Document upload + AI analyse (GPT-4o) | ✅ |
| NVI vraagengeneratie (AI) | ✅ |
| Aanbiedingssecties + AI streaming | ✅ |
| Tijdlijn + notities | ✅ |
| Kalender (lijst + maandweergave) | ✅ |
| Team overzicht | ✅ |
| Clerk authenticatie + webhook sync | ✅ |
| Drizzle ORM + Neon Postgres | ✅ |

## API Routes

```
GET/POST  /api/tenders
GET/PATCH/DELETE  /api/tenders/[id]
POST  /api/tenders/[id]/documents/upload
POST  /api/tenders/[id]/documents/[docId]/analyze
GET/POST  /api/tenders/[id]/questions
POST  /api/tenders/[id]/questions/generate
PATCH/DELETE  /api/tenders/[id]/questions/[qId]
GET/POST  /api/tenders/[id]/sections
PATCH  /api/tenders/[id]/sections/[sId]
POST  /api/tenders/[id]/sections/[sId]/generate  (streaming SSE)
GET/POST  /api/tenders/[id]/activities
GET/POST  /api/tenders/[id]/notes
POST  /api/webhooks/clerk
GET  /api/users
```

## Projectstructuur

```
app/
  (app)/
    dashboard/      KPI's, activiteit, deadlines, pipeline
    tenders/        Overzicht + nieuwe tender
      [id]/         Detail + 5 tabbladen
        tabs/       OverviewTab DocumentsTab QuestionsTab SectionsTab TimelineTab
    kalender/       Deadline kalender (lijst + maand)
    team/           Teamoverzicht
    instellingen/   Configuratie
  (auth)/           Sign-in / sign-up
  api/              API routes
components/
  layout/           Sidebar TopBar
  ui/               Button Badge Avatar Toast Skeleton
lib/
  db/               Drizzle schema queries seed migrate
  ai/               OpenAI client prompts
  utils/            Formatters
drizzle/            SQL migraties
```
