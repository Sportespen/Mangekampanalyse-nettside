# Notater til Claude for dette repoet

## Live-resultater er hardkodet mot arrangørens API - må justeres for neste konkurranse

Live-integrasjonen for Décastar Talence 2026 (`functions/api/live-decastar.js`) er skrevet
spesifikt mot **matsport** sitt API (`api.athle.matsport.com`), og har flere organisatør-spesifikke
antagelser hardkodet inn:

- `COMPETITION_ID` - matsport sin interne ID for denne konkurransen.
- `EVENT_MAP` - regex-mapping fra matsport sine engelske øvelsesnavn ("Shot Put", "High Jump" osv.)
  til våre interne øvelsesnavn ("Kule", "Høyde" osv.). Rekkefølgen i lista er bevisst valgt for at
  hurdle-varianter skal matche før de generiske mønstrene.
- `RESULT_BLOCK` - hvilket av matsport sine tre resultatblokker (`trackResult`/`horizontalResult`/
  `verticalResult`) som faktisk inneholder live-merket for hver øvelse.
- Feltet `current` på hver utøver-rad er matsport sin egen "utøver er i aksjon nå"-indikator
  (bekreftet live: holder attempt-utfallet, f.eks. `"X"`, midlertidig, går tilbake til `""` når
  forsøket er dømt). Dette er kilden til den røde pulserende prikken i UI.
- `attemptHorizontal`/`attemptVertical` - matsport sin struktur for enkeltforsøk pr. runde/høyde.
- `TERMINAL`-koder (`DNS`/`DNF`/`DQ`/`NM`/`NH`) er matsport sine statuskoder.

Birmingham-integrasjonen (`live-refresh-api-fix20260918.js`/`live-refresh-api.js`, mot `/api/live`)
bruker en helt annen arrangør/kilde (European Athletics) med sitt eget dataformat - de to
pipelinene er separate og deler ikke skjema.

### Når vi går til neste konkurranse med en annen arrangør

1. Finn ut hvilket live-API den nye arrangøren faktisk bruker (URL, evt. autentisering, dataformat).
   Test det direkte (f.eks. via `.github/workflows/athlete-search-debug.yml` - se mønsteret under)
   for å forstå skjemaet før noe kode skrives.
2. Skriv en ny/justert Cloudflare Function etter samme mønster som `live-decastar.js`, men mappet mot
   den nye arrangørens faktiske felt- og statuskoder. Ikke anta at `current`, `attemptHorizontal` osv.
   heter det samme eller virker likt hos en annen leverandør.
3. Verifiser eksplisitt hvordan den nye kilden signalerer "utøver er i aksjon nå" (finnes det i det
   hele tatt et sånt felt?), og test overgangen "aktiv → ferdig uten resultat" spesifikt - det var
   nettopp denne overgangen som forårsaket den fastlåste røde prikken i Décastar-integrasjonen
   (se historikk: PR som fikset "stuck live-active flag", løst 2026-09-18). En rad må ALDRI bli
   utelatt fra svaret bare fordi utøveren mangler resultat og ikke er aktiv AKKURAT NÅ - den må
   fortsatt sendes med `active:false` så klienten får ryddet opp gammel state.
4. Dobbeltsjekk at ev. cache-busting/reload-logikk i statiske datafiler (som historisk fantes i
   `app/data/live_birmingham.js`) aldri kjører på nytt ved periodiske klient-side oppdateringer -
   det forårsaket en full sideomlasting hvert 20. sekund tidligere (se historikk: PR som fikset
   "reload loop", løst 2026-09-18).
5. Oppdater `COMPETITION_ID`/`EVENT_MAP`/`RESULT_BLOCK` (eller de nye tilsvarende konstantene) og
   test grundig mot den ferske arrangørens live-data før konkurransen starter, ikke under den.
6. Verifiser eksplisitt at ALLE enkeltforsøk i de tekniske øvelsene (hopp/kast) kommer med, ikke bare
   siste/beste forsøk. `attemptsFromHorizontal`/`attemptsFromVertical` i `live-decastar.js` er skrevet
   spesifikt mot matsport sin `attemptHorizontal`/`attemptVertical`-struktur (seks runde-objekter med
   `round_Attempt`, hhv. tre høyde-forsøk `ht_Att1`/`ht_Att2`/`ht_Att3` pr. `attemptVertical`-rad). En
   annen arrangør vil garantert ha en annen struktur for dette. Denne per-forsøk-lista er det som vises
   i "forsøk"-nedtrekksmenyen i grensesnittet (jf. score-dropdownen), så mangler den, eller er den feil
   mappet, ser det ut som noe fungerer (mark/poeng vises riktig) mens forsøkshistorikken faktisk er tom
   eller feil for den nye arrangøren. Test denne biten spesifikt med minst én utøver som har flere
   forsøk i en kast- eller hoppøvelse, ikke bare at sluttresultatet stemmer.

### Diagnostikk-mønster brukt i denne sesjonen

Denne sandboksen har ikke direkte nettverkstilgang til eksterne live-API-er (organisatørens domene
er blokkert av proxyen her), men GitHub Actions-runnere har det. Mønsteret som er brukt gjentatte
ganger for å feilsøke live-data-problemer:

1. Skriv om `.github/workflows/athlete-search-debug.yml` (denne filen gjenbrukes som engangs-rigg,
   innholdet overskrives for hver ny undersøkelse - den er ikke ment å beholde historikk).
2. Commit/push til en midlertidig branch.
3. Trigger kjøringen med `mcp__github__actions_run_trigger` (method `run_workflow`).
4. Vent og hent loggen med `mcp__github__get_job_logs`.

Dette er både for å teste mot arrangørens API direkte (Python/curl) og for å teste selve
nettsiden i en ekte nettleser (Playwright), siden `mangekampanalyse.no` heller ikke er nåbar direkte
fra denne sandboksen.
