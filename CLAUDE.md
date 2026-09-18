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
