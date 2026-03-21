import Link from 'next/link'
import styles from './handleiding.module.css'

export const metadata = {
  title: 'Handleiding | BidMind',
  description: 'Uitgebreide handleiding voor BidMind: tenderbeheer, documenten, NVI, aanbieding en meer.',
}

const toc = [
  { id: 'intro', num: '01', label: 'Wat is BidMind?' },
  { id: 'start', num: '02', label: 'Aan de slag' },
  { id: 'dashboard', num: '03', label: 'Dashboard' },
  { id: 'tenders', num: '04', label: 'Tenders' },
  { id: 'documenten', num: '05', label: 'Documenten & analyse' },
  { id: 'nvi', num: '06', label: 'NVI-vragen' },
  { id: 'aanbieding', num: '07', label: 'Aanbieding (secties)' },
  { id: 'kalender-team', num: '08', label: 'Kalender & team' },
  { id: 'bedrijf', num: '09', label: 'Bedrijfsinformatie' },
  { id: 'instellingen', num: '10', label: 'Instellingen' },
  { id: 'tips', num: '11', label: 'Tips & best practices' },
]

export default function HandleidingPage() {
  return (
    <div className={styles.wrap}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroBadge}>Documentatie</span>
          <h1>Handleiding BidMind</h1>
          <p className={styles.heroLead}>
            BidMind ondersteunt je team bij aanbestedingen: van documentanalyse en NVI-vragen tot een volledige
            aanbieding met AI-ondersteunde teksten. Deze handleiding helpt je snel de juiste functies te vinden en
            ermee te werken.
          </p>
        </div>
      </header>

      <nav className={styles.toc} aria-label="Inhoudsopgave">
        <h2 className={styles.tocTitle}>Inhoudsopgave</h2>
        <ul className={styles.tocList}>
          {toc.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>
                <span className={styles.tocNum}>{item.num}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="intro" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>1</span>
          <div>
            <h2>Wat is BidMind?</h2>
            <p className={styles.sectionSub}>
              Eén plek voor je tenderdossier: inzicht, samenwerking en AI die rekening houdt met jullie bedrijf.
            </p>
          </div>
        </div>
        <div className={styles.card}>
          <h3>Doel</h3>
          <p>
            BidMind helpt tendermanagers en inschrijfteams om aanbestedingen <strong>sneller en consistenter</strong> uit
            te werken. De applicatie combineert een gestructureerd dossier per tender met <strong>AI-functies</strong> die
            documenten samenvatten, vragen voorstellen en secties van je aanbieding helpen schrijven — altijd in de context
            van de tender en, waar je dat invult, jullie <strong>bedrijfsinformatie</strong>.
          </p>
        </div>
        <div className={styles.card}>
          <h3>Belangrijkste bouwstenen</h3>
          <ul>
            <li>
              <strong>Tender</strong> — het centrale project met titel, aanbesteder, deadlines en status in de pipeline.
            </li>
            <li>
              <strong>Documenten</strong> — geüploade bestanden met AI-analyse (samenvatting, eisen, criteria, risico’s).
            </li>
            <li>
              <strong>NVI</strong> — gegenereerde en beheerde vragen voor de Nota van Inlichtingen.
            </li>
            <li>
              <strong>Aanbieding</strong> — secties (plan van aanpak, kwaliteit, enz.) met bewerking, AI-generatie en export
              naar Word.
            </li>
            <li>
              <strong>Activiteiten & notities</strong> — tijdlijn en context rondom de tender.
            </li>
          </ul>
        </div>
      </section>

      <section id="start" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>2</span>
          <div>
            <h2>Aan de slag</h2>
            <p className={styles.sectionSub}>Inloggen, overzicht en je eerste tender.</p>
          </div>
        </div>
        <div className={styles.card}>
          <h3>Inloggen</h3>
          <p>
            Je logt in via <strong>Clerk</strong> (e-mail of de methode die je organisatie heeft ingesteld). Zonder geldige
            sessie heb je geen toegang tot tenders en instellingen.
          </p>
        </div>
        <div className={styles.card}>
          <h3>Volgorde die we aanraden</h3>
          <ol className={styles.steps}>
            <li>Vul onder <Link href="/bedrijfsinformatie">Bedrijfsinformatie</Link> de basisgegevens en eventuele documenten in — de AI gebruikt dit bij analyse en schrijftaken.</li>
            <li>Maak een tender aan via <Link href="/tenders/new">Nieuwe tender</Link> of open een bestaande tender in <Link href="/tenders">Tenders</Link>.</li>
            <li>Upload aanbestedingsdocumenten en wacht op de analyse (of start deze handmatig, afhankelijk van je workflow).</li>
            <li>Werk NVI-vragen en aanbiedingsecties stap voor stap af.</li>
          </ol>
        </div>
        <div className={styles.callout}>
          <p>
            <strong>Tip:</strong> Hoe completer de bedrijfscontext, hoe beter AI-teksten aansluiten op jullie tone-of-voice
            en sterke punten.
          </p>
        </div>
      </section>

      <section id="dashboard" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>3</span>
          <div>
            <h2>Dashboard</h2>
            <p className={styles.sectionSub}>KPI’s, pipeline en recente activiteit.</p>
          </div>
        </div>
        <div className={styles.card}>
          <p>
            Op het <Link href="/dashboard">Dashboard</Link> zie je een overzicht van actieve tenders, naderende deadlines,
            tenders waarvoor een go/no-go nog openstaat, en indicatoren zoals ingediend dit kwartaal. De{' '}
            <strong>pipeline</strong> toont hoeveel tenders per fase zitten (intake t/m evaluatie).
          </p>
          <p>
            Onderaan staan vaak <strong>agentkaarten</strong> met uitleg per fase — handig om nieuwe gebruikers te laten
            zien welke rol AI en proces in jullie workflow spelen.
          </p>
        </div>
      </section>

      <section id="tenders" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>4</span>
          <div>
            <h2>Tenders</h2>
            <p className={styles.sectionSub}>Aanmaken, lijst en tenderdetail.</p>
          </div>
        </div>
        <div className={styles.grid2}>
          <div className={styles.card}>
            <h3>Nieuwe tender</h3>
            <p>
              Via <Link href="/tenders/new">Nieuwe tender</Link> vul je titel, aanbesteder, referentie en deadlines in. Je
              kunt de tender koppelen aan een tender-eigenaar en een initiële status/pipeline-fase kiezen.
            </p>
          </div>
          <div className={styles.card}>
            <h3>Tenderlijst</h3>
            <p>
              Op <Link href="/tenders">Tenders</Link> filter en sorteer je op status en deadline. Open een tender om naar
              het volledige dossier te gaan.
            </p>
          </div>
        </div>
        <div className={styles.card}>
          <h3>Tenderdetail — tabbladen</h3>
          <ul>
            <li>
              <strong>Overzicht</strong> — kerngegevens, deadlines en team.
            </li>
            <li>
              <strong>Documenten</strong> — bestanden en analyse (zie volgende sectie).
            </li>
            <li>
              <strong>NVI-vragen</strong> — vragenlijst en generatie.
            </li>
            <li>
              <strong>Aanbieding</strong> — secties van je inschrijving.
            </li>
            <li>
              <strong>Tijdlijn</strong> — activiteiten en notities rondom de tender.
            </li>
          </ul>
        </div>
      </section>

      <section id="documenten" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>5</span>
          <div>
            <h2>Documenten & analyse</h2>
            <p className={styles.sectionSub}>Uploaden en AI-inzicht uit je aanbestedingsstukken.</p>
          </div>
        </div>
        <div className={styles.card}>
          <h3>Upload</h3>
          <p>
            In het tabblad Documenten sleep je bestanden naar het uploadveld of kies je ze handmatig. Per document wordt een
            record bijgehouden (naam, type, datum).
          </p>
        </div>
        <div className={styles.card}>
          <h3>Documentanalyse (AI)</h3>
          <p>
            De AI leest de inhoud (waar ondersteund: PDF, Word, enz.) en levert o.a. een <strong>samenvatting</strong>,{' '}
            <strong>kritieke eisen</strong>, <strong>gunningscriteria</strong>, <strong>risico’s</strong> en suggesties
            voor NVI-vragen. Deze output wordt gebruikt in NVI-generatie en bij het schrijven van aanbiedingsecties.
          </p>
        </div>
        <div className={styles.callout}>
          <p>
            <strong>Let op:</strong> Documentanalyse vereist een geconfigureerde AI-provider (zoals Anthropic) en een
            werkende database. Zonder analyse blijven de velden leeg of beperkt.
          </p>
        </div>
      </section>

      <section id="nvi" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>6</span>
          <div>
            <h2>NVI-vragen</h2>
            <p className={styles.sectionSub}>Nota van Inlichtingen — strategische vragen genereren en beheren.</p>
          </div>
        </div>
        <div className={styles.card}>
          <p>
            Op basis van de (geanalyseerde) documenten kun je een reeks <strong>NVI-vragen</strong> laten genereren. De
            vragen zijn bedoeld om onduidelijkheden weg te nemen die je inschrijving kunnen raken: technisch, contractueel,
            planning, financieel of juridisch.
          </p>
          <p>
            Je beheert vragen in de lijst (prioriteit, status) en gebruikt ze als input voor je communicatie met de
            aanbestedende dienst.
          </p>
        </div>
      </section>

      <section id="aanbieding" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>7</span>
          <div>
            <h2>Aanbieding (secties)</h2>
            <p className={styles.sectionSub}>Secties schrijven, AI gebruiken en exporteren.</p>
          </div>
        </div>
        <div className={styles.card}>
          <h3>Sectietypes</h3>
          <p>Je kunt o.a. deze secties toevoegen en vullen:</p>
          <ul>
            <li>Plan van Aanpak</li>
            <li>Kwaliteitsborging</li>
            <li>Prijsonderbouwing</li>
            <li>Team & CV’s</li>
            <li>Referenties</li>
            <li>VCA & Veiligheid</li>
            <li>Eigen sectie (vrije titel)</li>
          </ul>
        </div>
        <div className={styles.card}>
          <h3>Werkwijze</h3>
          <ol className={styles.steps}>
            <li>Voeg secties toe en open een sectie om de editor te zien.</li>
            <li>
              Gebruik <strong>Genereer met AI</strong> om op basis van tenderdocumenten en bedrijfscontext een uitgebreide
              Markdown-tekst te laten schrijven. De output verschijnt in de weergave; sla op om te bewaren.
            </li>
            <li>Zet de status van leeg → concept → review → goedgekeurd wanneer je team akkoord is.</li>
            <li>
              Download de volledige aanbieding als <strong>Word</strong> via de knop op het tabblad Aanbieding.
            </li>
          </ol>
        </div>
        <div className={styles.callout}>
          <p>
            <strong>AI-schrijven</strong> gebruikt doorgaans hetzelfde AI-platform als je zware schrijftaken in de app;
            controleer altijd inhoud, getallen en juridische claims vóór definitieve inschrijving.
          </p>
        </div>
      </section>

      <section id="kalender-team" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>8</span>
          <div>
            <h2>Kalender & team</h2>
            <p className={styles.sectionSub}>Planning en collega’s.</p>
          </div>
        </div>
        <div className={styles.grid2}>
          <div className={styles.card}>
            <h3>Kalender</h3>
            <p>
              Op de <Link href="/kalender">Kalender</Link> zie je NVI- en inschrijfdeadlines (en andere relevante data) in
              tijd om conflicten en haast te vermijden.
            </p>
          </div>
          <div className={styles.card}>
            <h3>Team</h3>
            <p>
              Onder <Link href="/team">Team</Link> vind je collega’s en rollen, zodat duidelijk is wie waarvoor
              verantwoordelijk is binnen tenders.
            </p>
          </div>
        </div>
      </section>

      <section id="bedrijf" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>9</span>
          <div>
            <h2>Bedrijfsinformatie</h2>
            <p className={styles.sectionSub}>Context die de AI meeneemt.</p>
          </div>
        </div>
        <div className={styles.card}>
          <p>
            Op <Link href="/bedrijfsinformatie">Bedrijfsinformatie</Link> stel je bedrijfsnaam, KvK, TenderNed-nummer,
            beschrijving, visie, sterke punten, referenties en meer in. Geüploade bedrijfsdocumenten kunnen eveneens worden
            gebruikt als bron voor AI.
          </p>
          <p>
            Hoe specifieker en actueler deze gegevens, hoe beter gegenereerde teksten en analyses aansluiten op jullie
            echte positionering.
          </p>
        </div>
      </section>

      <section id="instellingen" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>10</span>
          <div>
            <h2>Instellingen</h2>
            <p className={styles.sectionSub}>Voorkeuren en meldingen.</p>
          </div>
        </div>
        <div className={styles.card}>
          <p>
            Onder <Link href="/instellingen">Instellingen</Link> beheer je gebruikersgebonden opties, zoals
            e-mailvoorkeuren bij documentuploads door teamleden. Exacte opties kunnen per omgeving verschillen.
          </p>
        </div>
      </section>

      <section id="tips" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>11</span>
          <div>
            <h2>Tips & best practices</h2>
            <p className={styles.sectionSub}>Effectiever werken met BidMind.</p>
          </div>
        </div>
        <div className={styles.card}>
          <ul>
            <li>
              <strong>Documenten eerst</strong> — Laat analyse lopen voordat je grote hoeveelheden NVI-vragen of
              aanbiedingsecties genereert.
            </li>
            <li>
              <strong>Itereren</strong> — Gebruik AI-output als concept; scherp aan met je vakkennis en tenderstrategie.
            </li>
            <li>
              <strong>Status & review</strong> — Hanteer vaste reviewmomenten voordat je secties op “goedgekeurd” zet.
            </li>
            <li>
              <strong>Export</strong> — Controleer het Word-document op opmaak en tabellen voordat je extern deelt.
            </li>
            <li>
              <strong>Beveiliging</strong> — Deel API-keys en productiedata niet buiten je team; gebruik teamafspraken
              voor gevoelige tenderinformatie.
            </li>
          </ul>
        </div>
      </section>

      <p className={styles.footerNote}>
        Vragen of suggesties voor deze handleiding? Neem contact op met je beheerder of het BidMind-team binnen je
        organisatie.
      </p>
    </div>
  )
}
