import { db } from './index'
import { tenders, users, tenderDocuments, tenderQuestions, tenderSections, tenderActivities } from './schema'

/** Tender-rijen voor Van Gelder: wegen, spoor, bruggen, verkeerstechniek, energie, boor/perstechniek, openbare ruimte, telecom – werkgebied heel Nederland */
const TENDER_ROWS = [
  // --- Wegen (Rijkswaterstaat, provincies) ---
  { title: 'Verbreding A27 knooppunt Houten – Hooipolder', referenceNumber: '2024-TN-445821', contractingAuthority: 'Rijkswaterstaat', publicationDate: '2024-09-15', deadlineQuestions: '2024-10-28T12:00:00', deadlineSubmission: '2024-11-22T14:00:00', estimatedValue: '85000000.00', cpvCodes: ['45233100', '45221111'], procedureType: 'Europees niet-openbaar', status: 'writing', goNoGo: 'go', winProbability: 65, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_001', 'user_seed_003'] },
  { title: 'Onderhoud en asfaltering A2 traject Utrecht – Everdingen', referenceNumber: '2024-TN-448102', contractingAuthority: 'Rijkswaterstaat', publicationDate: '2024-10-01', deadlineQuestions: '2024-11-08T12:00:00', deadlineSubmission: '2024-12-02T14:00:00', estimatedValue: '22000000.00', cpvCodes: ['45233100'], procedureType: 'Europees openbaar', status: 'analyzing', goNoGo: 'go', winProbability: 70, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_001'] },
  { title: 'Reconstructie N201 Bloemendaal – Zandvoort', referenceNumber: '2024-TN-451223', contractingAuthority: 'Provincie Noord-Holland', publicationDate: '2024-10-10', deadlineQuestions: '2024-11-20T12:00:00', deadlineSubmission: '2024-12-16T14:00:00', estimatedValue: '18500000.00', cpvCodes: ['45233100', '45221111'], procedureType: 'Europees openbaar', status: 'qualifying', goNoGo: 'pending', winProbability: 50, tenderManagerId: 'user_seed_001', teamMemberIds: ['user_seed_003'] },
  { title: 'Vervanging asfaltdeklaag A9 Haarlem – Alkmaar', referenceNumber: '2024-TN-452887', contractingAuthority: 'Rijkswaterstaat', publicationDate: '2024-10-15', deadlineQuestions: '2024-11-25T12:00:00', deadlineSubmission: '2024-12-20T14:00:00', estimatedValue: '12000000.00', cpvCodes: ['45233100'], procedureType: 'Meervoudig onderhands', status: 'new', goNoGo: 'pending', winProbability: 60, tenderManagerId: 'user_seed_002', teamMemberIds: [] },
  { title: 'Knooppunt Oudenrijn – aanpassing aansluitingen A12/A2', referenceNumber: '2024-TN-453441', contractingAuthority: 'Rijkswaterstaat', publicationDate: '2024-09-20', deadlineQuestions: '2024-10-30T12:00:00', deadlineSubmission: '2024-11-25T14:00:00', estimatedValue: '95000000.00', cpvCodes: ['45233100', '45221111'], procedureType: 'Europees niet-openbaar', status: 'review', goNoGo: 'go', winProbability: 45, tenderManagerId: 'user_seed_001', teamMemberIds: ['user_seed_002', 'user_seed_003'] },
  { title: 'Onderhoud N7 Groningen – Drachten', referenceNumber: '2024-TN-454002', contractingAuthority: 'Provincie Groningen', publicationDate: '2024-11-01', deadlineQuestions: '2024-12-06T12:00:00', deadlineSubmission: '2025-01-10T14:00:00', estimatedValue: '8500000.00', cpvCodes: ['45233100'], procedureType: 'Openbaar', status: 'new', goNoGo: 'pending', winProbability: 65, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_003'] },
  { title: 'Verbreding A15 Papendrecht – Gorinchem', referenceNumber: '2024-TN-455112', contractingAuthority: 'Rijkswaterstaat', publicationDate: '2024-08-15', deadlineQuestions: '2024-09-25T12:00:00', deadlineSubmission: '2024-10-20T14:00:00', estimatedValue: '78000000.00', cpvCodes: ['45233100', '45221111'], procedureType: 'Europees openbaar', status: 'submitted', goNoGo: 'go', winProbability: 55, tenderManagerId: 'user_seed_001', teamMemberIds: ['user_seed_002'] },
  // --- Spoor (ProRail) ---
  { title: 'Spoorvernieuwing en beveiliging traject Alkmaar – Heerhugowaard', referenceNumber: '2024-TN-456201', contractingAuthority: 'ProRail', publicationDate: '2024-10-05', deadlineQuestions: '2024-11-18T12:00:00', deadlineSubmission: '2024-12-09T14:00:00', estimatedValue: '32000000.00', cpvCodes: ['45234100', '45234120'], procedureType: 'Europees openbaar', status: 'writing', goNoGo: 'go', winProbability: 72, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_001', 'user_seed_003'] },
  { title: 'Nieuwe treinbeveiliging ERTMS Randstad Zuid (Rotterdam)', referenceNumber: '2024-TN-457089', contractingAuthority: 'ProRail', publicationDate: '2024-09-12', deadlineQuestions: '2024-10-22T12:00:00', deadlineSubmission: '2024-11-18T14:00:00', estimatedValue: '125000000.00', cpvCodes: ['45234120', '45316000'], procedureType: 'Europees niet-openbaar', status: 'qualifying', goNoGo: 'pending', winProbability: 40, tenderManagerId: 'user_seed_001', teamMemberIds: ['user_seed_002'] },
  { title: 'Perronvernieuwing en overkappingen station Utrecht Centraal', referenceNumber: '2024-TN-458334', contractingAuthority: 'ProRail', publicationDate: '2024-10-20', deadlineQuestions: '2024-12-02T12:00:00', deadlineSubmission: '2024-12-23T14:00:00', estimatedValue: '28000000.00', cpvCodes: ['45234100', '45223300'], procedureType: 'Europees openbaar', status: 'analyzing', goNoGo: 'go', winProbability: 58, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_003'] },
  { title: 'Spooronderhoud en wisselvernieuwing Amsterdam Sloterdijk', referenceNumber: '2024-TN-459001', contractingAuthority: 'ProRail', publicationDate: '2024-11-05', deadlineQuestions: '2024-12-12T12:00:00', deadlineSubmission: '2025-01-15T14:00:00', estimatedValue: '15000000.00', cpvCodes: ['45234100'], procedureType: 'Meervoudig onderhands', status: 'new', goNoGo: 'pending', winProbability: 68, tenderManagerId: 'user_seed_002', teamMemberIds: [] },
  { title: 'Treinbeveiliging en VRI-aanpassingen spoorwegovergangen Noord-Holland', referenceNumber: '2024-TN-459552', contractingAuthority: 'ProRail', publicationDate: '2024-09-28', deadlineQuestions: '2024-11-05T12:00:00', deadlineSubmission: '2024-11-28T14:00:00', estimatedValue: '18500000.00', cpvCodes: ['45234120', '34971000'], procedureType: 'Openbaar', status: 'submitted', goNoGo: 'go', winProbability: 52, tenderManagerId: 'user_seed_001', teamMemberIds: ['user_seed_003'] },
  // --- Bruggen en kunstwerken ---
  { title: 'Renovatie Maastunneltoegang Rotterdam', referenceNumber: '2024-TN-389042', contractingAuthority: 'Gemeente Rotterdam', publicationDate: '2024-09-01', deadlineQuestions: '2024-10-10T12:00:00', deadlineSubmission: '2024-10-31T14:00:00', estimatedValue: '12500000.00', cpvCodes: ['45221111', '45233220'], procedureType: 'Europees openbaar', status: 'qualifying', goNoGo: 'pending', winProbability: 40, tenderManagerId: 'user_seed_001', teamMemberIds: ['user_seed_002'] },
  { title: 'Aanleg fietsbrug Westerdok Amsterdam', referenceNumber: '2024-TN-512334', contractingAuthority: 'Gemeente Amsterdam', publicationDate: '2024-10-01', deadlineQuestions: '2024-11-15T12:00:00', deadlineSubmission: '2024-12-06T14:00:00', estimatedValue: '3200000.00', cpvCodes: ['45221100'], procedureType: 'Meervoudig onderhands', status: 'analyzing', goNoGo: 'go', winProbability: 55, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_003'] },
  { title: 'Vervanging beweegbare brug Leidschendam (N14)', referenceNumber: '2024-TN-460221', contractingAuthority: 'Rijkswaterstaat', publicationDate: '2024-10-12', deadlineQuestions: '2024-11-22T12:00:00', deadlineSubmission: '2024-12-17T14:00:00', estimatedValue: '42000000.00', cpvCodes: ['45221100', '45221111'], procedureType: 'Europees openbaar', status: 'writing', goNoGo: 'go', winProbability: 62, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_001'] },
  { title: 'Onderhoud en schilderwerk IJtunnel Amsterdam', referenceNumber: '2024-TN-461078', contractingAuthority: 'Rijkswaterstaat', publicationDate: '2024-11-08', deadlineQuestions: '2024-12-16T12:00:00', deadlineSubmission: '2025-01-20T14:00:00', estimatedValue: '18500000.00', cpvCodes: ['45221111', '45442100'], procedureType: 'Meervoudig onderhands', status: 'new', goNoGo: 'pending', winProbability: 58, tenderManagerId: 'user_seed_001', teamMemberIds: [] },
  { title: 'Nieuwe fiets- en voetgangersbrug over Noordzeekanaal Zaandam', referenceNumber: '2024-TN-461903', contractingAuthority: 'Provincie Noord-Holland', publicationDate: '2024-09-25', deadlineQuestions: '2024-11-01T12:00:00', deadlineSubmission: '2024-11-26T14:00:00', estimatedValue: '9800000.00', cpvCodes: ['45221100'], procedureType: 'Openbaar', status: 'won', goNoGo: 'go', winProbability: 85, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_003'] },
  // --- Verkeerstechniek ---
  { title: 'Vervanging verkeersregelinstallaties en verlichting N205 (Haarlem–Amsterdam)', referenceNumber: '2024-TN-462445', contractingAuthority: 'Provincie Noord-Holland', publicationDate: '2024-10-18', deadlineQuestions: '2024-11-28T12:00:00', deadlineSubmission: '2024-12-23T14:00:00', estimatedValue: '6200000.00', cpvCodes: ['34971000', '31527200'], procedureType: 'Openbaar', status: 'analyzing', goNoGo: 'go', winProbability: 70, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_003'] },
  { title: 'Slimme verkeersregeling en LED-verlichting ring Rotterdam', referenceNumber: '2024-TN-463112', contractingAuthority: 'Gemeente Rotterdam', publicationDate: '2024-11-01', deadlineQuestions: '2024-12-10T12:00:00', deadlineSubmission: '2025-01-08T14:00:00', estimatedValue: '8400000.00', cpvCodes: ['34971000', '31527200'], procedureType: 'Europees openbaar', status: 'new', goNoGo: 'pending', winProbability: 55, tenderManagerId: 'user_seed_001', teamMemberIds: ['user_seed_002'] },
  { title: 'VRI- en verlichtingsonderhoud provinciale wegen Zuid-Holland', referenceNumber: '2024-TN-463778', contractingAuthority: 'Provincie Zuid-Holland', publicationDate: '2024-09-10', deadlineQuestions: '2024-10-18T12:00:00', deadlineSubmission: '2024-11-12T14:00:00', estimatedValue: '5200000.00', cpvCodes: ['34971000', '31527200'], procedureType: 'Meervoudig onderhands', status: 'lost', goNoGo: 'go', winProbability: 30, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_003'] },
  // --- Energie en ondergronds (geothermie, opslag, kabels) ---
  { title: 'Aanleg geothermie-infrastructuur en boringen regio Beilen', referenceNumber: '2024-TN-464223', contractingAuthority: 'Provincie Drenthe', publicationDate: '2024-10-08', deadlineQuestions: '2024-11-18T12:00:00', deadlineSubmission: '2024-12-12T14:00:00', estimatedValue: '28000000.00', cpvCodes: ['45259000', '45255410'], procedureType: 'Europees openbaar', status: 'writing', goNoGo: 'go', winProbability: 68, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_001', 'user_seed_003'] },
  { title: 'Batterijopslag en netaansluiting energiepark Delfzijl (Giga Leopard-stijl)', referenceNumber: '2024-TN-464891', contractingAuthority: 'Groningen Seaports', publicationDate: '2024-09-18', deadlineQuestions: '2024-10-28T12:00:00', deadlineSubmission: '2024-11-22T14:00:00', estimatedValue: '45000000.00', cpvCodes: ['45259000', '31158000'], procedureType: 'Europees niet-openbaar', status: 'qualifying', goNoGo: 'pending', winProbability: 48, tenderManagerId: 'user_seed_001', teamMemberIds: ['user_seed_002'] },
  { title: 'Ondergrondse kabels en leidingen tracé A7 Groningen – Drachten', referenceNumber: '2024-TN-465334', contractingAuthority: 'Rijkswaterstaat', publicationDate: '2024-11-12', deadlineQuestions: '2024-12-20T12:00:00', deadlineSubmission: '2025-01-27T14:00:00', estimatedValue: '11500000.00', cpvCodes: ['45259000', '45231300'], procedureType: 'Openbaar', status: 'new', goNoGo: 'pending', winProbability: 62, tenderManagerId: 'user_seed_002', teamMemberIds: [] },
  // --- Boor- en perstechniek (Klever) / openbare ruimte ---
  { title: 'Persleidingen en boorwerkzaamheden riolering Amsterdam-Noord', referenceNumber: '2024-TN-465887', contractingAuthority: 'Waternet', publicationDate: '2024-10-22', deadlineQuestions: '2024-12-02T12:00:00', deadlineSubmission: '2024-12-30T14:00:00', estimatedValue: '9200000.00', cpvCodes: ['45259000', '45231340'], procedureType: 'Meervoudig onderhands', status: 'analyzing', goNoGo: 'go', winProbability: 65, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_003'] },
  { title: 'Herinrichting openbare ruimte en riolering Oranje Loper Amsterdam', referenceNumber: '2024-TN-466445', contractingAuthority: 'Gemeente Amsterdam', publicationDate: '2024-09-05', deadlineQuestions: '2024-10-15T12:00:00', deadlineSubmission: '2024-11-08T14:00:00', estimatedValue: '16500000.00', cpvCodes: ['45233141', '45231340'], procedureType: 'Europees openbaar', status: 'submitted', goNoGo: 'go', winProbability: 50, tenderManagerId: 'user_seed_001', teamMemberIds: ['user_seed_002'] },
  { title: 'Straatwerk en ondergrondse voorzieningen winkelgebied Alkmaar centrum', referenceNumber: '2024-TN-467001', contractingAuthority: 'Gemeente Alkmaar', publicationDate: '2024-11-15', deadlineQuestions: '2024-12-23T12:00:00', deadlineSubmission: '2025-01-28T14:00:00', estimatedValue: '4800000.00', cpvCodes: ['45233141', '45231300'], procedureType: 'Openbaar', status: 'new', goNoGo: 'pending', winProbability: 58, tenderManagerId: 'user_seed_002', teamMemberIds: [] },
  // --- Telecom (Van Gelder Telecom) ---
  { title: 'Aanleg glasvezel en ondergrondse infrastructuur regio Utrecht', referenceNumber: '2024-TN-467552', contractingAuthority: 'Provincie Utrecht', publicationDate: '2024-10-25', deadlineQuestions: '2024-12-04T12:00:00', deadlineSubmission: '2025-01-06T14:00:00', estimatedValue: '12800000.00', cpvCodes: ['45231300', '64212000'], procedureType: 'Europees openbaar', status: 'qualifying', goNoGo: 'pending', winProbability: 52, tenderManagerId: 'user_seed_001', teamMemberIds: ['user_seed_003'] },
  { title: 'Ondergrondse kabels en mastfunderingen 5G-netwerk Noord-Holland', referenceNumber: '2024-TN-468109', contractingAuthority: 'Provincie Noord-Holland', publicationDate: '2024-11-06', deadlineQuestions: '2024-12-16T12:00:00', deadlineSubmission: '2025-01-20T14:00:00', estimatedValue: '7600000.00', cpvCodes: ['45231300', '45259000'], procedureType: 'Meervoudig onderhands', status: 'new', goNoGo: 'pending', winProbability: 60, tenderManagerId: 'user_seed_002', teamMemberIds: [] },
  // --- Extra variatie (leefbaarheid, veiligheid, verbindingen) ---
  { title: 'Verlichting en veiligheidsmaatregelen fietspaden N203', referenceNumber: '2024-TN-468665', contractingAuthority: 'Provincie Noord-Holland', publicationDate: '2024-09-30', deadlineQuestions: '2024-11-08T12:00:00', deadlineSubmission: '2024-12-02T14:00:00', estimatedValue: '2900000.00', cpvCodes: ['31527200', '45233141'], procedureType: 'Openbaar', status: 'review', goNoGo: 'go', winProbability: 72, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_001'] },
  { title: 'Onderhoud en renovatie viaduct A1 Muiderberg', referenceNumber: '2024-TN-469221', contractingAuthority: 'Rijkswaterstaat', publicationDate: '2024-10-28', deadlineQuestions: '2024-12-06T12:00:00', deadlineSubmission: '2025-01-10T14:00:00', estimatedValue: '15800000.00', cpvCodes: ['45221111', '45233220'], procedureType: 'Meervoudig onderhands', status: 'new', goNoGo: 'pending', winProbability: 55, tenderManagerId: 'user_seed_001', teamMemberIds: [] },
  { title: 'Integrale aanbesteding onderhoud wegen en kunstwerken N-wegen Zuid-Holland', referenceNumber: '2024-TN-469778', contractingAuthority: 'Provincie Zuid-Holland', publicationDate: '2024-08-22', deadlineQuestions: '2024-09-30T12:00:00', deadlineSubmission: '2024-10-25T14:00:00', estimatedValue: '68000000.00', cpvCodes: ['45233100', '45221111'], procedureType: 'Europees openbaar', status: 'withdrawn', goNoGo: 'no_go', winProbability: 25, tenderManagerId: 'user_seed_002', teamMemberIds: ['user_seed_003'] },
]

const TENDER_STATUSES = ['new', 'qualifying', 'analyzing', 'writing', 'review', 'submitted', 'won', 'lost', 'withdrawn'] as const
type TenderStatus = (typeof TENDER_STATUSES)[number]
const GO_NO_GO = ['pending', 'go', 'no_go'] as const
type GoNoGo = (typeof GO_NO_GO)[number]

function toTenderRow(row: (typeof TENDER_ROWS)[0]) {
  return {
    title: row.title,
    referenceNumber: row.referenceNumber,
    contractingAuthority: row.contractingAuthority,
    publicationDate: new Date(row.publicationDate),
    deadlineQuestions: new Date(row.deadlineQuestions),
    deadlineSubmission: new Date(row.deadlineSubmission),
    estimatedValue: row.estimatedValue,
    cpvCodes: row.cpvCodes,
    procedureType: row.procedureType,
    status: row.status as TenderStatus,
    goNoGo: row.goNoGo as GoNoGo,
    winProbability: row.winProbability,
    tenderManagerId: row.tenderManagerId,
    teamMemberIds: row.teamMemberIds ?? [],
    tendernetUrl: `https://www.tenderned.nl/aankondigingen/overzicht/${row.referenceNumber?.replace(/[^0-9]/g, '') || 'unknown'}`,
  }
}

export async function seed() {
  if (!db) throw new Error('DATABASE_URL is required to run seed')
  // Seed users (Van Gelder)
  await db.insert(users).values([
    { id: 'user_seed_001', name: 'Jan de Vries', email: 'jan@vangelder.com', role: 'admin' },
    { id: 'user_seed_002', name: 'Lisa van den Berg', email: 'lisa@vangelder.com', role: 'tender_manager' },
    { id: 'user_seed_003', name: 'Marco Smits', email: 'marco@vangelder.com', role: 'team_member' },
  ]).onConflictDoNothing()

  // Seed tenders (25+ voor Van Gelder-disciplines en werkgebied)
  const inserted = await db.insert(tenders).values(TENDER_ROWS.map(toTenderRow)).returning()
  const tender1 = inserted[0]       // A27 Houten – Hooipolder
  const tenderSpoor = inserted[7]   // Spoor Alkmaar – Heerhugowaard
  const tenderEnergie = inserted[21] // Geothermie Beilen

  if (tender1) {
    await db.insert(tenderDocuments).values([
      {
        tenderId: tender1.id,
        fileName: 'Aankondiging_A27_2024-445821.pdf',
        fileUrl: 'https://placehold.co/document',
        fileSize: 2048000,
        documentType: 'aankondiging',
        analysisStatus: 'done',
        analysisSummary: 'Europese aanbesteding voor verbreding van de A27 tussen knooppunt Houten en Hooipolder. Contract looptijd 4 jaar inclusief onderhoud. EMVI-criteria gericht op innovatieve oplossingen voor stikstofreductie.',
        analysisJson: {
          key_requirements: ['UAV-GC contract', 'VCA** certificering', 'Minimaal 3 referentieprojecten > €20M'],
          award_criteria: [{ criterion: 'Prijs', weight: '40%' }, { criterion: 'Plan van aanpak', weight: '35%' }, { criterion: 'Innovatie', weight: '25%' }],
          risks: ['Stikstofdepositie omgevingsvergunning', 'Doorlooptijd onteigeningsprocedures', 'Grondwaterproblematiek'],
          important_dates: [{ label: 'NVI deadline', date: '2024-10-28' }, { label: 'Inschrijving deadline', date: '2024-11-22' }],
          suggested_questions: ['Wat zijn de toleranties voor trillingsbelasting op omliggende bebouwing?', 'Is er een voorkeursoplossing voor de stikstofcompensatie?'],
        },
      },
      {
        tenderId: tender1.id,
        fileName: 'Bestek_A27_Rev2.pdf',
        fileUrl: 'https://placehold.co/document',
        fileSize: 8340000,
        documentType: 'bestek',
        analysisStatus: 'done',
        analysisSummary: 'Technisch bestek voor de civieltechnische werken. Bevat specificaties voor het asfaltwerk, constructieve eisen voor kunstwerken en milieu-eisen.',
        analysisJson: {
          key_requirements: ['Asfalt klasse A2', 'Constructieve berekeningen conform NEN 6700', 'Milieuparagraaf verplicht'],
          award_criteria: [],
          risks: ['Bodemverontreiniging zone 3', 'Kabels & leidingen onbekend traject km 12-15'],
          important_dates: [],
          suggested_questions: [],
        },
      },
    ]).onConflictDoNothing()

    await db.insert(tenderQuestions).values([
      {
        tenderId: tender1.id,
        questionText: 'Wat zijn de exacte toleranties voor trillingsbelasting op omliggende bebouwing tijdens de uitvoering?',
        rationale: 'Omliggende bebouwing is deels monumentaal. Zonder duidelijke toleranties lopen we risico op meerwerk en vertragingen.',
        category: 'Technisch',
        priority: 'critical',
        status: 'approved',
        aiGenerated: true,
        createdBy: 'user_seed_002',
      },
      {
        tenderId: tender1.id,
        questionText: 'Is de aanbestedende dienst bereid tot een gefaseerde openstelling van rijstroken tijdens de werkzaamheden?',
        rationale: 'Een gefaseerde aanpak kan de verkeershinder beperken en de uitvoeringsplanning optimaliseren.',
        category: 'Planning',
        priority: 'high',
        status: 'submitted',
        aiGenerated: false,
        createdBy: 'user_seed_001',
      },
    ]).onConflictDoNothing()

    await db.insert(tenderSections).values([
      {
        tenderId: tender1.id,
        sectionType: 'plan_van_aanpak',
        title: 'Plan van Aanpak',
        content: '## Onze aanpak\n\nOp basis van onze uitgebreide ervaring met autosnelwegprojecten stellen wij voor...',
        status: 'draft',
        orderIndex: 1,
        wordCount: 245,
        lastEditedBy: 'user_seed_002',
        lastEditedAt: new Date(),
      },
      {
        tenderId: tender1.id,
        sectionType: 'kwaliteit',
        title: 'Kwaliteitsborging',
        content: '',
        status: 'empty',
        orderIndex: 2,
        wordCount: 0,
      },
      {
        tenderId: tender1.id,
        sectionType: 'team_cv',
        title: 'Team & CV\'s',
        content: '',
        status: 'empty',
        orderIndex: 3,
        wordCount: 0,
      },
    ]).onConflictDoNothing()

    await db.insert(tenderActivities).values([
      {
        tenderId: tender1.id,
        userId: 'user_seed_002',
        activityType: 'status_changed',
        description: 'Status gewijzigd naar Schrijven',
        metadata: { from: 'analyzing', to: 'writing' },
      },
      {
        tenderId: tender1.id,
        userId: 'user_seed_001',
        activityType: 'document_uploaded',
        description: 'Bestek_A27_Rev2.pdf geüpload',
        metadata: { fileName: 'Bestek_A27_Rev2.pdf' },
      },
    ]).onConflictDoNothing()
  }

  // Extra testdata: Spoor Alkmaar – Heerhugowaard (Van Gelder Rail)
  if (tenderSpoor) {
    await db.insert(tenderDocuments).values([{
      tenderId: tenderSpoor.id,
      fileName: 'Aankondiging_ProRail_Alkmaar_456201.pdf',
      fileUrl: 'https://placehold.co/document',
      fileSize: 1520000,
      documentType: 'aankondiging',
      analysisStatus: 'done',
      analysisSummary: 'Spoorvernieuwing en treinbeveiliging traject Alkmaar – Heerhugowaard. Inclusief wisselvernieuwing en aanpassingen VRI spoorwegovergangen. UAV-GC, nachtwerk in baanvakken.',
      analysisJson: {
        key_requirements: ['ProRail kwalificatie', 'VCA**', 'Referenties spoorprojecten > €10M'],
        award_criteria: [{ criterion: 'Prijs', weight: '50%' }, { criterion: 'Uitvoeringsplan', weight: '50%' }],
        risks: ['Beschikbaarheid baanvak', 'Afstemming met NS dienstregeling'],
        important_dates: [],
        suggested_questions: ['Hoe wordt nachtwerk gepland i.r.t. onderhoudsframes?'],
      },
    }]).onConflictDoNothing()
    await db.insert(tenderQuestions).values([
      { tenderId: tenderSpoor.id, questionText: 'Hoe worden de onderhoudsframes afgestemd met de NS-dienstregeling?', rationale: 'Van Gelder Rail heeft ervaring met nachtwerk; we willen duidelijke afspraken over baanvakbeschikbaarheid.', category: 'Planning', priority: 'high', status: 'approved', aiGenerated: true, createdBy: 'user_seed_002' },
    ]).onConflictDoNothing()
    await db.insert(tenderSections).values([
      { tenderId: tenderSpoor.id, sectionType: 'plan_van_aanpak', title: 'Plan van Aanpak', content: '## Spoorvernieuwing Alkmaar – Heerhugowaard\n\nVan Gelder Rail voert vergelijkbare projecten uit in Noord-Holland. Onze aanpak...', status: 'draft', orderIndex: 1, wordCount: 180, lastEditedBy: 'user_seed_002', lastEditedAt: new Date() },
    ]).onConflictDoNothing()
    await db.insert(tenderActivities).values([
      { tenderId: tenderSpoor.id, userId: 'user_seed_002', activityType: 'status_changed', description: 'Status gewijzigd naar Schrijven', metadata: { from: 'analyzing', to: 'writing' } },
    ]).onConflictDoNothing()
  }

  // Extra testdata: Geothermie Beilen (energietransitie / Klever)
  if (tenderEnergie) {
    await db.insert(tenderDocuments).values([{
      tenderId: tenderEnergie.id,
      fileName: 'Bestek_Geothermie_Beilen_464223.pdf',
      fileUrl: 'https://placehold.co/document',
      fileSize: 4100000,
      documentType: 'bestek',
      analysisStatus: 'done',
      analysisSummary: 'Aanleg geothermie-infrastructuur en diepboringen regio Beilen. Eisen voor boortechniek, leidingen en aansluitingen. Duurzaamheidscriteria.',
      analysisJson: {
        key_requirements: ['Ervaring geothermie of vergelijkbare boringen', 'Voldoende boorcapaciteit', 'Milieu- en veiligheidsparagraaf'],
        award_criteria: [{ criterion: 'Technisch', weight: '60%' }, { criterion: 'Prijs', weight: '40%' }],
        risks: ['Grondwaterlagen', 'Vergunningen diepboring'],
        important_dates: [],
        suggested_questions: [],
      },
    }]).onConflictDoNothing()
    await db.insert(tenderQuestions).values([
      { tenderId: tenderEnergie.id, questionText: 'Zijn gegevens van eerdere boringen in de regio beschikbaar voor inschrijvers?', rationale: 'Klever heeft ervaring in de regio; bestaande gegevens verminderen risico.', category: 'Technisch', priority: 'high', status: 'draft', aiGenerated: true, createdBy: 'user_seed_003' },
    ]).onConflictDoNothing()
    await db.insert(tenderActivities).values([
      { tenderId: tenderEnergie.id, userId: 'user_seed_002', activityType: 'document_uploaded', description: 'Bestek_Geothermie_Beilen_464223.pdf geüpload', metadata: { fileName: 'Bestek_Geothermie_Beilen_464223.pdf' } },
    ]).onConflictDoNothing()
  }

  console.log('Seed complete: ' + inserted.length + ' tenders (Van Gelder)')
}
