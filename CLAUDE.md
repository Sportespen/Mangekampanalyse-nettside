# Notater til Claude for dette repoet

## Live-resultater er hardkodet mot arrangørens API - alt må sjekkes på nytt for neste konkurranse

Alt vi har bygget/fikset for live-dataene under Décastar Talence 2026 er skrevet spesifikt mot
**matsport** sitt API (`api.athle.matsport.com`), i `functions/api/live-decastar.js`. Neste
konkurranse kan ha en helt annen arrangør/leverandør med et helt annet dataformat - INGENTING av
det organisatør-spesifikke under kan tas for gitt at bare "fungerer" igjen. Dette er ikke noe som
skjer automatisk - det krever at vi går gjennom hele denne lista og verifiserer/skriver om hvert
punkt før neste konkurranse går live.

### Sjekkliste før neste konkurranse (annen arrangør)

1. **Finn og test den nye arrangørens live-API først**, før noe kode skrives - se
   "Diagnostikk-mønster" nederst i dette dokumentet. Forstå det faktiske dataformatet empirisk,
   ikke anta at det ligner på matsport sitt.
2. **`COMPETITION_ID`** - matsport sin interne ID for Talence-konkurransen. Den nye arrangøren har
   garantert et helt annet ID-skjema (eller ingen konkurranse-ID i det hele tatt, bare per-øvelse-IDer).
3. **`EVENT_MAP`** - regex-mapping fra matsport sine engelske øvelsesnavn ("Shot Put", "High Jump")
   til våre interne navn ("Kule", "Høyde"). Må skrives om mot den nye kildens egne navn/koder.
   Rekkefølgen i lista er bevisst valgt for at hurdle-varianter matcher før de generiske mønstrene -
   pass på samme type kollisjon i den nye mappingen.
4. **`RESULT_BLOCK`** - hvilket av matsport sine tre resultatblokker (`trackResult`/`horizontalResult`/
   `verticalResult`) som har live-merket for hver øvelse. Den nye kilden har trolig en annen
   struktur (kanskje én flat liste, kanskje en helt annen gruppering).
5. **`current`-feltet → den røde "i aksjon nå"-prikken.** Dette er matsport sin egen indikator for
   hvem som er midt i et forsøk. Sjekk om den nye arrangøren har noe tilsvarende felt overhodet -
   hvis ikke må denne funksjonen deaktiveres eller bygges om, ikke bare kobles til feil felt.
6. **Overgangen "aktiv → ferdig uten resultat" MÅ testes spesifikt** - ikke bare at "aktiv" vises
   riktig når det skjer, men at den også forsvinner riktig når forsøket er ugyldig og utøveren ikke
   har noe merke fra før. En rad skal ALDRI utelates fra svaret bare fordi utøveren mangler resultat
   og ikke er aktiv AKKURAT NÅ - den må sendes med `active:false` likevel, så klienten får ryddet
   opp gammel state. (Denne akkurate bugen - fastlåst rød prikk etter et jekket første forsøk -
   ble funnet og fikset 2026-09-18, se `attempts.length`-sjekken i `live-decastar.js`.)
7. **`attemptsFromHorizontal`/`attemptsFromVertical`** - per-forsøk-listen som vises i
   "forsøk"-nedtrekksmenyen (score-dropdownen) i grensesnittet. Skrevet spesifikt mot matsport sin
   `attemptHorizontal`/`attemptVertical`-struktur (seks runde-objekter med `round_Attempt`, hhv. tre
   høyde-forsøk `ht_Att1`/`ht_Att2`/`ht_Att3` pr. rad). En annen arrangør vil garantert strukturere
   dette annerledes. Test dette spesifikt med en utøver som har flere forsøk i en kast/hoppøvelse -
   det er lett å få sluttresultatet riktig mens forsøkshistorikken er tom eller feil.
8. **`TERMINAL`-statuskoder** (`DNS`/`DNF`/`DQ`/`NM`/`NH`) er matsport sine koder. Sjekk at den nye
   arrangøren bruker de samme kodene, eller map om.
9. **Vind pr. heat** (`heatWind` i `collectDiscipline`) leses fra matsport sin per-payload
   `wind`-verdi og gjelder alle i samme heat. Den nye kilden kan strukturere vind annerledes
   (pr. utøver, ikke pr. heat, f.eks.).
10. **Flere samtidig aktive utøvere** (f.eks. to kastringer eller to høyde-stativer) er allerede
    støttet generisk i koden (ingen "bare én aktiv"-antagelse noe sted), men verifiser likevel at
    den nye kildens data faktisk oppfører seg tilsvarende for øvelser med flere samtidige stasjoner.
11. **Cloudflare edge cache-TTL og klientens polling-intervall** (`cacheTtl:20` i `getJson()`, samt
    klientens 20-sekunders `reloadLiveData`-intervall) er tilpasset matsport sin oppdateringstakt,
    empirisk observert under Talence. Den nye arrangøren kan oppdatere mye oftere eller sjeldnere -
    test faktisk takt (se diagnostikk-mønster) og juster begge tall til det som gir mening for den
    nye kilden, ikke bare gjenbruk 20 sekunder blindt.
12. **Ingen reload-logikk i statiske datafiler får lov til å kjøre på nytt ved periodiske
    klient-side oppdateringer.** `app/data/live_birmingham.js` hadde historisk en engangs
    cache-bust-omlasting som ved en feil kjørte på nytt hver gang filen ble satt inn dynamisk igjen,
    og forårsaket full sideomlasting hvert 20. sekund (fikset 2026-09-18). Hvis en ny statisk
    live-datafil for den nye arrangøren får en lignende engangs-oppstartslogikk, må den eksplisitt
    sjekke `document.currentScript?.dataset?.mangekampLiveRefresh` (eller tilsvarende) for å unngå
    samme feil.
13. **`completedEvents`-telling (entered/resolved pr. øvelse i `collectSection`/`collectDiscipline`
    i `live-decastar.js`) må ha noe å telle mot.** Logikken - en øvelse teller ikke som fullført før
    ALLE påmeldte i feltet har et resultat eller en terminal-status - er generisk i prinsippet, men
    forutsetter at den nye kilden faktisk oppgir et "hele feltet"-tall pr. øvelse (`stats.entered`)
    å sammenligne mot, ikke bare radene som tilfeldigvis har kommet inn så langt. Uten dette blir
    "X øvelser fullført" upålitelig igjen, akkurat som før dette ble fikset 2026-09-19.
14. **`attempts`-arrayet brukes nå av TO uavhengige ting, ikke bare forsøk-nedtrekksmenyen**: siden
    2026-09-19 leser `rawResultKeyFor()` i `live-engine-fix20260918.js`/`live-engine.js` også
    `athlete.liveAttempts[i]` (populert fra `raw.attempts` i `applyLiveToAthletes()`) for å avgjøre
    hva som er "siste innmeldte resultat" - se punkt 7 over og "Siste innmeldte resultat"-uthevingen
    (den blå ruten) lenger ned. Får den nye arrangørens attempts-struktur (punkt 7) feil skjema,
    bryter altså BÅDE forsøk-modalen OG uthevings-funksjonen, ikke bare den ene.
15. **`current`/`active`-feltet (punkt 5) brukes nå også til å flytte uthevingen til en helt ny
    øvelse** (`rawResultKeyFor()`s `'ACT'`-fallback, lagt til 2026-09-19) - når ingen har et dømt
    forsøk ennå i en øvelse, men noen er markert aktive der, flytter uthevingen seg dit likevel.
    Samme avhengighet som punkt 5, men verifiser den også for DENNE funksjonen spesifikt, ikke bare
    for den røde prikken.

Birmingham-integrasjonen (`live-refresh-api-fix20260918.js`/`live-refresh-api.js`, mot `/api/live`)
bruker en helt annen arrangør/kilde (European Athletics) med sitt eget dataformat - de to
pipelinene er separate og deler ikke skjema, men samme sjekkliste gjelder i prinsippet for begge.

### Ikke organisatør-spesifikt (skal fungere uendret for neste konkurranse)

Disse er generelle UI/logikk-funksjoner bygget under Talence som IKKE er koblet til matsport sitt
dataformat, og bør fungere fint for neste arrangør uten endring, så lenge punktene over er løst:

- Highlight av valgt utøver i score-dropdownen (sticky navnekolonne + magenta/gul markering).
- Lukk-på-klikk-inni for score-dropdownen.
- Den pulserende røde "live nå"-visuelle stilen selv (CSS/ikon) - bare datakilden bak `active`-feltet
  er organisatør-spesifikk, ikke selve UI-komponenten.
- **Fanebytte (Tikamp menn / Sjukamp kvinner) kaller `syncLive()` selv** (`setType()`-wrapperen i
  `app.js`/`app-fix20260918.js`) - uten dette henger live-status og forecast-tabellen igjen på
  forrige faneskjønns data i opptil 30 sekunder etter bytte (fikset 2026-09-19).
- **"Oppdater"-knappen gjør en full `location.reload()`** i stedet for bare å hente nye data - sikrer
  at en fane som har vært åpen over en deploy også henter ny JS, ikke bare nye tall (fikset
  2026-09-19).
- **Selvhelbredende `mergeLive()`** i `live-refresh-api-fix20260918.js`/`live-refresh-api.js` -
  forkaster en forgiftet/ugyldig lokal cache-base i stedet for å slå den sammen med fersk data, så
  en korrupt `localStorage`-verdi ikke kan låse statusboksen fast på "viser siste gyldige data" for
  alltid (kritisk fiks 2026-09-19).
- **"Vis poeng"-vekslingsknappen og stilen på "Sorter"-nedtrekksmenyen** i forecast-panelet.
- **DNF/DNS-forplantning venter på at øvelsen faktisk er ferdig for hele feltet** før den kopierer en
  utøvers terminal-status inn i senere, ikke-startede øvelser (`terminalCodeForCell()` sin
  `stop<completed`-sjekk) - OG ekte deltakelse (et reelt resultat eller "aktiv nå") i en senere celle
  vinner alltid over en arvet DNF/DNS fra en tidligere øvelse (fikset 2026-09-19). Selve mekanismen
  er generisk; den forutsetter bare punkt 13 og 15 over.
- **"Siste innmeldte resultat"-uthevingen (den blå ruten) og selve diff-/lagringsmekanismen bak den**
  (`rawResultKeyFor()`/`updateLatestResultHighlight()`, persistert i `localStorage` under
  `mka-forecast-latest-v3`) er generisk logikk - den følger med på hvert enkelt forsøk (også et
  bomkast/"X", og flytter seg selv til en helt ny øvelse så snart noen blir aktive der), viser
  ALLTID bare én celle om gangen, og overlever sideomlasting. Bygget og herdet gjennom flere runder
  2026-09-19 (se punkt 14 og 15 over for hva som faktisk MÅ sjekkes per arrangør: selve
  `attempts`/`active`-feltene den leser fra).
- **"❄ Frys"-knappen** i forecast-panelet (lar en kommentator fryse visningen på et gitt tidspunkt
  mens ny data fortsetter å hentes i bakgrunnen) er 100 % generisk - den fryser en kopi av
  `window.MANGEKAMP_LIVE`/`MANGEKAMP_LIVE_DECASTAR` og har ingen avhengighet til matsport sitt
  dataformat i det hele tatt (lagt til 2026-09-19).
- **Cache-bust-disiplinen**: `app/index.html` sine `<script src="...fix20260918.js?v=...">`-tagger
  MÅ få en ny `?v=`-verdi hver gang den refererte filen endres, ellers kan nettlesere som allerede
  har lastet siden fortsette å kjøre gammel JS på ubestemt tid selv etter en vellykket deploy (rammet
  oss flere ganger 2026-09-19, se `20260919-livefix2` t.o.m. `livefix9` i git-historikken). Dette
  gjelder generelt for ALLE JS-filer, ikke bare live-data-filene - husk å bumpe versjonsstrengen som
  siste steg i enhver PR som endrer en fil referert med `?v=`.

### Diagnostikk-mønster brukt i denne sesjonen

Denne sandboksen har ikke direkte nettverkstilgang til eksterne live-API-er (organisatørens domene
er blokkert av proxyen her), men GitHub Actions-runnere har det. Mønsteret som er brukt gjentatte
ganger for å feilsøke live-data-problemer, og som bør gjenbrukes for å utforske en ny arrangørs API:

1. Skriv om `.github/workflows/athlete-search-debug.yml` (denne filen gjenbrukes som engangs-rigg,
   innholdet overskrives for hver ny undersøkelse - den er ikke ment å beholde historikk).
2. Commit/push til en midlertidig branch.
3. Trigger kjøringen med `mcp__github__actions_run_trigger` (method `run_workflow`).
4. Vent og hent loggen med `mcp__github__get_job_logs`.

Dette er både for å teste mot arrangørens API direkte (Python/curl) og for å teste selve
nettsiden i en ekte nettleser (Playwright), siden `mangekampanalyse.no` heller ikke er nåbar direkte
fra denne sandboksen.
