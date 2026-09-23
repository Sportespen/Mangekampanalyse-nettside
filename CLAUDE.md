# Notater til Claude for dette repoet

**Status:** Både Décastar Talence 2026 og EM Birmingham 2026 er avsluttet **for godt**. Live-pollingen
mot begge er stanset (se punkt 12 i sjekklisten). Resultatene ligger fast med vilje - dette er IKKE
noe som skal "gjenopptas" senere. Selv om Décastar og/eller EM arrangeres igjen et senere år, er det
en HELT NY konkurranse (ny sesong, garantert nye konkurranse-ID-er/kalender hos arrangøren, mulig
endret programoppsett) - ikke en fortsettelse av 2026-utgaven. En slik fremtidig utgave skal
behandles nøyaktig som "neste arrangør" under (ny fil, ny diagnostikk, ny verifisering fra bunnen
av), IKKE ved å bare skru `setInterval`-pollingen på igjen mot de eksisterende
`live.js`/`live-decastar.js`-filene - de er hardkodet mot 2026-utgavens spesifikke ID-er/skjema og
vil sannsynligvis feile eller vise feil data mot en ny utgave uten at det er åpenbart hvorfor. Alt
under er skrevet for å gjøre NESTE konkurranse (uansett om det er en helt ny arrangør, eller en
senere utgave av Décastar/EM) raskest og tryggest mulig å sette i drift.

**Generell regel, gjelder ALLE konkurranser denne siden noensinne dekker, ikke bare disse to:**
Når en konkurranse er ferdigspilt, fryses resultatene og live-pollingen mot den stanses for godt.
Konkurransen "gjenopptas" ALDRI. Dukker samme konkurransenavn opp igjen et senere år (uansett hvilken
konkurranse det er), er det alltid en helt ny, uavhengig konkurranse som skal settes opp fra bunnen
av via "neste arrangør"-oppskriften - aldri ved å skru på igjen pollingen mot en eksisterende,
allerede avsluttet konkurranses live-fil. Anta aldri at neste års utgave deler ID-er, skjema eller
endepunkt med en tidligere utgave uten å verifisere det empirisk på nytt (se diagnostikk-mønsteret).

## Neste arrangør - oppskrift (les dette først)

Live-resultatene er hardkodet mot **matsport** sitt API (`api.athle.matsport.com`), samlet i
ÉN fil: `functions/api/live-decastar.js`. Alt annet i appen - forecast-tabellen, "Frys"-knappen,
uthevingen av siste resultat, forsøk-nedtrekksmenyen, DNF-håndteringen, alt - leser bare den
STANDARDISERTE JSON-kontrakten denne filen produserer. Den har null kjennskap til matsport.
Det betyr: å bytte arrangør er i prinsippet å skrive om ÉN fil riktig, ikke å røre resten av appen.

1. **Skaff arrangørens live-resultat-URL/API** (dette er det ENESTE du som bruker faktisk må gi
   meg - se "Hva du må gi meg" nedenfor).
2. **Test det nye APIet empirisk FØR noe kode skrives** - se "Diagnostikk-mønster" nederst. Ikke
   anta at det ligner på matsport sitt.
3. **Kopiér malen**: `functions/api/_TEMPLATE-live-organizer.js` → `functions/api/live-<navn>.js`
   (fjern understreken foran - Cloudflare Pages ruter automatisk enhver fil i `functions/api/`
   uten understrek som `/api/<filnavn>`). Malen har hele kontrakten dokumentert inline pluss
   `TODO`-markører for alt som må fylles ut. Gå gjennom sjekklisten under mens du fyller den ut.
4. **Valider resultatet** mot kontrakten før klienten pekes dit:
   `python3 scripts/validate_live_contract.py https://mangekampanalyse.no/api/live-<navn>`
   (eller mot en lokal JSON-fil). Dette fanger opp skjemafeil uten at du må åpne nettleseren.
5. **Koble den nye funksjonen inn i klienten** i
   `app/live-refresh-api-fix20260918.js`/`app/live-refresh-api.js` (samme mønster som
   `refreshDecastar()`/`fetchFreshDecastarLive()`/`applyDecastar()` bruker i dag for
   `MANGEKAMP_LIVE_DECASTAR` - navnene er historiske fra Décastar-sesongen, men fungerer for
   hvilken som helst konkurranse; du trenger ikke døpe dem om). Husk `window.setInterval(...)` -
   den er bevisst FJERNET nå siden konkurransen er over, og må legges til på nytt for den nye.
6. **Legg til et alternativ i `#competitionSelect`** i `app/index.html` og sørg for at
   `buildRoot()`/roster-datafilene (`app/data/*.js`) har et start-felt for den nye konkurransen -
   dette er separat fra live-pluggen og forventes å være nytt innhold hver gang, ikke kode å skrive om.
7. **Bump cache-bust-versjonen** (se punkt 12 nedenfor) og **skru på polling** igjen
   (`window.setInterval(refresh<Navn>, ...)`, tunet etter faktisk oppdateringstakt - se punkt 10).
8. Gå gjennom hele sjekklisten under, verifiser hvert punkt eksplisitt.

### Hva DU må gi meg

- **Den nye arrangørens live-resultat-nettside eller API-URL.** Det er alt som strengt tatt kreves
  for å komme i gang - jeg tester og reverse-engineerer resten empirisk (se diagnostikk-mønsteret).
- Hvis den nye konkurransen har et ANNET sett øvelser enn tikamp/sjukamp (f.eks. en annen
  mangekamp-variant), eller en helt ny utøverliste/startliste - si ifra, det er innhold jeg ikke
  kan gjette meg til.
- Alt annet (kode, mapping, testing, deploy) er mitt ansvar.

## Sjekkliste før neste konkurranse (annen arrangør)

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
11. **Cloudflare edge cache-TTL og klientens polling-intervall** (`cacheTtl:10` i `getJson()` i
    `live-decastar.js`, samt klientens 10-sekunders `setInterval(refresh...)`/
    `setInterval(refreshDecastar...)` i `live-refresh-api-fix20260918.js`/`live-refresh-api.js`) var
    tilpasset matsport sin oppdateringstakt, empirisk observert under Talence (justert ned fra
    20s/30s til 10s/10s 2026-09-19 etter ønske om raskere oppdatering). Begge
    `setInterval`-kallene er FJERNET nå (2026-09-19, se punkt 12) siden konkurransen er over - de
    må legges tilbake for neste konkurranse, tunet mot DENS faktiske takt (se diagnostikk-mønster),
    ikke bare gjenbruk 10 sekunder blindt.
12. **Live-polling er midlertidig stanset for begge fjorårets konkurranser** (2026-09-19, se
    `install()` i `live-refresh-api-fix20260918.js`/`live-refresh-api.js`) - Talence og Birmingham
    er begge ferdigspilt, og resultatene skal ligge fast. `refresh(false)`/`refreshDecastar()`
    kjører fortsatt ÉN gang ved sideinnlasting (henter siste kjente tall), men de gjentagende
    `window.setInterval(...)`-kallene er borte. Dette MÅ legges til på nytt (steg 7 i oppskriften
    over) når en ny konkurranse faktisk er live.
13. **Ingen reload-logikk i statiske datafiler får lov til å kjøre på nytt ved periodiske
    klient-side oppdateringer.** `app/data/live_birmingham.js` hadde historisk en engangs
    cache-bust-omlasting som ved en feil kjørte på nytt hver gang filen ble satt inn dynamisk igjen,
    og forårsaket full sideomlasting hvert 20. sekund (fikset 2026-09-18). Hvis en ny statisk
    live-datafil for den nye arrangøren får en lignende engangs-oppstartslogikk, må den eksplisitt
    sjekke `document.currentScript?.dataset?.mangekampLiveRefresh` (eller tilsvarende) for å unngå
    samme feil.
14. **`completedEvents`-telling (entered/resolved pr. øvelse i `collectSection`/`collectDiscipline`
    i `live-decastar.js`) må ha noe å telle mot.** Logikken - en øvelse teller ikke som fullført før
    ALLE påmeldte i feltet har et resultat eller en terminal-status - er generisk i prinsippet, men
    forutsetter at den nye kilden faktisk oppgir et "hele feltet"-tall pr. øvelse (`stats.entered`)
    å sammenligne mot, ikke bare radene som tilfeldigvis har kommet inn så langt. Uten dette blir
    "X øvelser fullført" upålitelig igjen, akkurat som før dette ble fikset 2026-09-19.
15. **`attempts`-arrayet brukes nå av TO uavhengige ting, ikke bare forsøk-nedtrekksmenyen**: siden
    2026-09-19 leser `rawResultKeyFor()` i `live-engine-fix20260918.js`/`live-engine.js` også
    `athlete.liveAttempts[i]` (populert fra `raw.attempts` i `applyLiveToAthletes()`) for å avgjøre
    hva som er "siste innmeldte resultat" - se punkt 7 over og "Siste innmeldte resultat"-uthevingen
    (den blå ruten) lenger ned. Får den nye arrangørens attempts-struktur (punkt 7) feil skjema,
    bryter altså BÅDE forsøk-modalen OG uthevings-funksjonen, ikke bare den ene.
16. **`current`/`active`-feltet (punkt 5) brukes nå også til å flytte uthevingen til en helt ny
    øvelse** (`rawResultKeyFor()`s `'ACT'`-fallback, lagt til 2026-09-19) - når ingen har et dømt
    forsøk ennå i en øvelse, men noen er markert aktive der, flytter uthevingen seg dit likevel.
    Samme avhengighet som punkt 5, men verifiser den også for DENNE funksjonen spesifikt, ikke bare
    for den røde prikken.
17. **`#forecastBanner`/`#forecastLivePill` har EGEN i18n-reformattering i `app/i18n-final-runtime.js`
    (`forecastHead()`), atskilt fra `live-engine.js` sin egen `tx()`-baserte tekst.** Den kjører på
    hvert fanebytte, konkurransebytte og forecast-re-render, og pleide å sjekke om banneret
    inneholdt den bokstavelige teksten "Birmingham 2026" for å avgjøre om det allerede hadde ekte
    innhold - alt annet (inkludert et helt korrekt Décastar-banner) ble tolket som "ikke lastet enda"
    og tilbakestilt til plassholderteksten "Venter på arrangørens live-resultater." Dette var den
    faktiske årsaken til at Décastar sitt banner flimret tilbake til plassholderen mens Birmingham sitt
    fungerte fint, selv lenge etter at begge konkurransene var over (fikset 2026-09-20). Fikset til å
    hente konkurransenavnet dynamisk fra banneret i stedet for å hardkode et navn - MEN pass på at en
    ny arrangørs konkurransenavn ikke ved et uhell inneholder " · " (skilletegnet denne logikken bruker
    for å avgjøre om banneret har ekte innhold). NB: det finnes flere ELDRE kopier av akkurat denne
    samme logikken (`app/i18n-consolidated.js`, `app/i18n-final-stabilizer.js`, `app/i18n-polish.js`,
    `app/i18n-stability-fix.js`) som IKKE er referert fra `app/index.html` og dermed aldri kjører -
    ikke la deg lure av dem, og ikke koble dem inn igjen uten å fikse samme "Birmingham 2026"-antagelse
    i dem først.
18. **Live-endepunktenes EGET svar må ha kort edge-cache, ikke `no-store`.** Under selve Décastar
    (18.–19. sep, mens 10-sekunders klient-polling fortsatt kjørte) satte `functions/api/live.js` og
    `functions/api/live-decastar.js` `cache-control: no-store, no-cache, must-revalidate, max-age=0`
    på sitt EGET svar - dvs. at Cloudflares edge aldri fikk lov til å gjenbruke svaret for flere
    samtidige besøkende. Hver eneste poll fra hver eneste åpne fane kjørte derfor HELE
    hente-fra-arrangør-og-bearbeid-pipelinen fra bunnen av, uavhengig av at andre besøkende hadde
    bedt om akkurat det samme sekundet før. Kombinert med at `live.js` i tillegg satte
    `cf:{cacheTtl:0,cacheEverything:false}` på selve kallet mot European Athletics (dvs. dobbelt
    deaktivert caching), sprengte dette Cloudflares CPU-tidsgrense for om lag halvparten av alle
    forespørsler under konkurransen (se Cloudflare Pages → Metrics for 18.–19. sep: 18 205 av
    18 206 feil var "Exceeded CPU Time Limits"). Fikset 2026-09-23: begge filenes EGET svar bruker nå
    `cache-control: public, max-age=8` (rett under datidens 10-sekunders polling-intervall), og
    `live.js` sitt `query()`-kall bruker nå `cf:{cacheTtl:8,cacheEverything:true}` (samme mønster som
    `live-decastar.js` sin `getJson()` allerede hadde med `cacheTtl:10`). Feilresponsen (catch-blokken)
    skal fortsatt ha `no-store` - en midlertidig feil fra arrangøren skal ALDRI mellomlagres og vises
    til nye besøkende i flere sekunder. For neste arrangør: sett samme mønster fra dag én i den nye
    `live-<navn>.js`-filen (kopiér `max-age`-verdien fra malen/dette punktet, ikke fra en gammel
    `no-store`-vane), og vurder om `max-age` bør tunes ned mot det faktiske polling-intervallet du
    velger i punkt 11 - for høy verdi gir utdatert "live"-følelse, for lav gir liten effekt.

Birmingham-integrasjonen (`live-refresh-api-fix20260918.js`/`live-refresh-api.js`, mot `/api/live`)
bruker en helt annen arrangør/kilde (European Athletics) med sitt eget dataformat - de to
pipelinene er separate og deler ikke skjema, men samme sjekkliste gjelder i prinsippet for begge.

## Verktøy for neste arrangør

- **`functions/api/_TEMPLATE-live-organizer.js`** - kopiérbar mal med hele JSON-kontrakten
  dokumentert inline (se toppen av filen), pluss `TODO`-markører for alt organisator-spesifikt.
  Ikke rutet av Cloudflare Pages (understrek-prefiks), trygt å la ligge som referanse.
- **`scripts/validate_live_contract.py <url-eller-fil>`** - validerer at en live-JSON-respons
  faktisk følger kontrakten (riktige felt, riktige typer, gyldige statuskoder) før klienten pekes
  dit. Testet mot både gyldig og ugyldig eksempeldata 2026-09-19.

## Ikke organisatør-spesifikt (skal fungere uendret for neste konkurranse)

Disse er generelle UI/logikk-funksjoner som IKKE er koblet til matsport sitt dataformat, og bør
fungere fint for neste arrangør uten endring, så lenge sjekklisten over er løst (dvs. at den nye
`live-<navn>.js`-filen faktisk produserer riktig kontrakt):

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
- **Siden laster seg selv på nytt automatisk når en ny versjon er deployet** (`<meta name="mka-build">`
  i `app/index.html` + en liten poller som sjekker hvert 60. sekund og gjør `location.reload()` ved
  mismatch, lagt til 2026-09-19). 100 % generisk, ingen arrangør-avhengighet. Husk: dette gjelder
  KODE-fikser - selve live-DATAEN har alltid oppdatert seg av seg selv via polling, uavhengig av
  dette. Viktig: `<meta name="mka-build">`s `content`-verdi MÅ bruke nøyaktig samme
  versjonsstreng som `?v=`-taggene på script-tagene (se cache-bust-punktet nedenfor) - da bumper
  samme `sed`-kommando begge på én gang.
- **Selvhelbredende `mergeLive()`** i `live-refresh-api-fix20260918.js`/`live-refresh-api.js` -
  forkaster en forgiftet/ugyldig lokal cache-base i stedet for å slå den sammen med fersk data, så
  en korrupt `localStorage`-verdi ikke kan låse statusboksen fast på "viser siste gyldige data" for
  alltid (kritisk fiks 2026-09-19).
- **Statusboksen respekterer hvilken konkurranse som faktisk er valgt** - `refresh()`s (Birmingham)
  og `refreshDecastar()`s feilhåndtering viser bare fallback-meldingen når DEN konkurransen faktisk
  er den valgte i `#competitionSelect`, så én konkurranses (upålitelige) kilde aldri kan overskrive
  statusboksen mens brukeren ser på den andre, sunne konkurransen (fikset 2026-09-19).
- **"Vis poeng"-vekslingsknappen og stilen på "Sorter"-nedtrekksmenyen** i forecast-panelet.
- **DNF/DNS-forplantning venter på at øvelsen faktisk er ferdig for hele feltet** før den kopierer en
  utøvers terminal-status inn i senere, ikke-startede øvelser (`terminalCodeForCell()` sin
  `stop<completed`-sjekk) - OG ekte deltakelse (et reelt resultat eller "aktiv nå") i en senere celle
  vinner alltid over en arvet DNF/DNS fra en tidligere øvelse (fikset 2026-09-19). Selve mekanismen
  er generisk; den forutsetter bare punkt 14 og 16 over.
- **"Siste innmeldte resultat"-uthevingen (den blå ruten) og selve diff-/lagringsmekanismen bak den**
  (`rawResultKeyFor()`/`updateLatestResultHighlight()`, persistert i `localStorage` under
  `mka-forecast-latest-v3`) er generisk logikk - den følger med på hvert enkelt forsøk (også et
  bomkast/"X", og flytter seg selv til en helt ny øvelse så snart noen blir aktive der), viser
  ALLTID bare én celle om gangen, og overlever sideomlasting. Bygget og herdet gjennom flere runder
  2026-09-19 (se punkt 15 og 16 over for hva som faktisk MÅ sjekkes per arrangør: selve
  `attempts`/`active`-feltene den leser fra).
- **"❄ Frys"-knappen** i forecast-panelet (lar en kommentator fryse visningen på et gitt tidspunkt
  mens ny data fortsetter å hentes i bakgrunnen) er 100 % generisk - den fryser en kopi av
  `window.MANGEKAMP_LIVE`/`MANGEKAMP_LIVE_DECASTAR` og har ingen avhengighet til matsport sitt
  dataformat i det hele tatt (lagt til 2026-09-19).
- **Cache-bust-disiplinen**: `app/index.html` sine `<script src="...fix20260918.js?v=...">`-tagger
  (og `<meta name="mka-build">`, se over) MÅ få en ny versjonsverdi hver gang en referert fil
  endres, ellers kan nettlesere som allerede har lastet siden fortsette å kjøre gammel JS selv
  etter en vellykket deploy (rammet oss gjentatte ganger 2026-09-19, se `20260919-livefix2` t.o.m.
  `livefix15` i git-historikken - auto-reload-polleren over gjør at dette nå løser seg selv innen
  ~60 sekunder i stedet for å kreve en manuell hard-refresh). Gjelder ALLE JS-filer referert med
  `?v=`, ikke bare live-data-filene - bump versjonsstrengen som siste steg i enhver PR som endrer
  en slik fil.

## Første-parts besøksteller (lagt til 2026-09-23)

`functions/api/track.js` (skriver) og `functions/api/stats.js` (leser) teller besøk og unike
besøkende (anonymisert IP+dato hashet med SHA-256, aldri lagret rått) per dag i en Cloudflare KV-
database. `app/index.html` kaller `/api/track` én gang per faktisk sideinnlasting (via
`navigator.sendBeacon`, ikke ved hvert bakgrunns-live-poll). `app/stats.html` viser tallene.

Bygget fordi Cloudflare Web Analytics (`cloudflareinsights.com`-beacon) og request-tellingen i
Pages sin egen Metrics-fane begge var upålitelige for å svare på "hvor mange besøkte siden": Web
Analytics blokkeres ofte av annonseblokkere/personvernverktøy (kjent tredjeparts-sporings-domene),
og Metrics sin request-telling inkluderer ALL bakgrunnstrafikk (live-polling osv.), ikke bare
faktiske sidevisninger - se punkt 18 over for hvordan akkurat det problemet i tillegg overbelastet
CPU-tidsgrensen. Denne telleren er første-parts (samme domene, `/api/track`) og teller kun faktiske
sideinnlastinger, så den unngår begge problemene.

**To manuelle steg kreves i Cloudflare-dashbordet - koden virker ikke uten dem:**
1. **Opprett en KV-database og bind den til Pages-prosjektet** som miljøvariabelen `VISITS_KV`
   (Workers & Pages → mangekampanalyse-nettside → Settings → Bindings → legg til KV-binding, navn
   `VISITS_KV`). Uten dette svarer `/api/stats` med en tydelig feilmelding i stedet for tall.
2. **Beskytt `/stats*` og `/api/stats*` med Cloudflare Access** (Zero Trust → Access →
   Applications → Self-hosted, path `mangekampanalyse.no/stats*` og et separat program for
   `mangekampanalyse.no/api/stats*`, policy: kun e-post `sportespen@gmail.com`). VIKTIG: IKKE
   beskytt `/api/track` - den må forbli åpen for alle besøkende, ellers telles ingen.

## Diagnostikk-mønster

Denne sandboksen har ikke direkte nettverkstilgang til eksterne live-API-er (organisatørens domene
er blokkert av proxyen her), men GitHub Actions-runnere har det. Mønsteret som er brukt gjentatte
ganger for å feilsøke live-data-problemer, og som bør gjenbrukes for å utforske en ny arrangørs API:

1. Skriv om `.github/workflows/athlete-search-debug.yml` (denne filen gjenbrukes som engangs-rigg,
   innholdet overskrives for hver ny undersøkelse - den er ikke ment å beholde historikk).
   **Pass på innrykk**: en `python3 - <<'PYEOF'`-heredoc inni et YAML `run: |`-blokk MÅ ha alle
   linjene (python-koden og selve `PYEOF`) innrykket like mye som resten av shell-scriptet, ellers
   blir HELE YAML-filen ugyldig og `workflow_dispatch` feiler med en misvisende
   "does not have workflow_dispatch trigger"-feilmelding. Valider alltid med
   `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/athlete-search-debug.yml'))"`
   FØR push.
2. Commit/push til en midlertidig branch, opprett PR, vent på at required status check blir grønn,
   merge (squash).
3. Trigger kjøringen med `mcp__github__actions_run_trigger` (method `run_workflow`, `ref: main`) -
   `workflow_dispatch` krever at filen faktisk ligger på default branch, ikke bare på feature-branchen.
4. Vent og hent loggen med `mcp__github__get_job_logs`.

Dette er både for å teste mot arrangørens API direkte (Python/curl) og for å teste selve
nettsiden i en ekte nettleser (Playwright), siden `mangekampanalyse.no` heller ikke er nåbar direkte
fra denne sandboksen. Bruk **`scripts/validate_live_contract.py`** for å sjekke en ny arrangørs
JSON-skjema i stedet for å bygge en ny diagnostikk-rigg for akkurat det - langt raskere.
