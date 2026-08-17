(function(){
  if(window.__MKA_I18N_UNIFIED)return; window.__MKA_I18N_UNIFIED=true;

  const LANGS={nb:{label:'Norsk',html:'nb'},en:{label:'English',html:'en'},de:{label:'Deutsch',html:'de'}};
  const CODES=['nb','en','de'];
  const D={
    'MANGEKAMPANALYSE':['COMBINED EVENTS ANALYSIS','MEHRKAMPFANALYSE'],
    'Analyse • Statistikk • Forventet resultat • Live':['Analysis • Statistics • Expected result • Live','Analyse • Statistik • Erwartetes Ergebnis • Live'],
    'Konkurranse':['Competition','Wettkampf'],
    'EM Birmingham 2026':['European Championships Birmingham 2026','Europameisterschaften Birmingham 2026'],
    'Velg mangekamp':['Select combined event','Mehrkampf auswählen'],
    'Tikamp menn':["Men’s decathlon",'Zehnkampf Männer'],
    'Sjukamp kvinner':["Women’s heptathlon",'Siebenkampf Frauen'],
    'Tikamp':['Decathlon','Zehnkampf'],
    'Sjukamp':['Heptathlon','Siebenkampf'],
    'Analyse- og prognosemotor fra Mangekampanalyse Pro.':['Analysis and forecasting engine from Mangekampanalyse Pro.','Analyse- und Prognosemodul von Mangekampanalyse Pro.'],
    'Før konkurransestart':['Before the competition','Vor Wettkampfbeginn'],
    'Live-resultater kobles inn når arrangøren publiserer dem.':['Live results will appear when published by the organiser.','Live-Ergebnisse werden angezeigt, sobald der Veranstalter sie veröffentlicht.'],
    'Live-resultater kobles inn fortløpende.':['Live results are updated continuously.','Live-Ergebnisse werden fortlaufend aktualisiert.'],
    'Startlisten beholdes til arrangørens live-resultatliste er tilgjengelig.':['The start list remains until the organiser’s live results are available.','Die Startliste bleibt bestehen, bis die Live-Ergebnisse des Veranstalters verfügbar sind.'],
    'Oppdater':['Refresh','Aktualisieren'],
    'Oppdater live-resultater':['Refresh live results','Live-Ergebnisse aktualisieren'],
    'STARTANALYSE':['START ANALYSIS','STARTANALYSE'],
    'Kjør full analyse av denne konkurransen':['Run a full analysis of this competition','Vollständige Analyse dieses Wettkampfs starten'],
    'PERSONLIG BESTE':['PERSONAL BEST','PERSÖNLICHE BESTLEISTUNG'],
    'PR. ØVELSE':['BY EVENT','PRO DISZIPLIN'],
    'PERSONLIG BESTE\nPR. ØVELSE':['PERSONAL BEST\nBY EVENT','PERSÖNLICHE BESTLEISTUNG\nPRO DISZIPLIN'],
    'Se beste resultater i hver øvelse':['See the best result in each event','Beste Ergebnisse in jeder Disziplin anzeigen'],
    'FORVENTET':['EXPECTED','ERWARTETES'],
    'RESULTAT':['RESULT','ERGEBNIS'],
    'FORVENTET\nRESULTAT':['EXPECTED\nRESULT','ERWARTETES\nERGEBNIS'],
    'Prognose for gjenværende øvelser og sluttpoeng':['Forecast for remaining events and final score','Prognose für verbleibende Disziplinen und Endpunktzahl'],
    'Startanalyse':['Start analysis','Startanalyse'],
    'PB, teoretisk PB, utnyttelse og uutnyttet potensial.':['PB, theoretical PB, utilisation and unused potential.','PB, theoretische PB, Ausnutzung und ungenutztes Potenzial.'],
    'Utøvere':['Athletes','Athleten'],
    'Nasjon':['Nation','Nation'],
    'Utøver':['Athlete','Athlet'],
    'Født':['Born','Geboren'],
    'Mangekamp-PB':['Combined-events PB','Mehrkampf-PB'],
    'Tikamp-PB':['Decathlon PB','Zehnkampf-PB'],
    'Sjukamp-PB':['Heptathlon PB','Siebenkampf-PB'],
    'Teoretisk PB':['Theoretical PB','Theoretische PB'],
    'Utnyttelse':['Utilisation','Ausnutzung'],
    'Uutnyttet potensial':['Unused potential','Ungenutztes Potenzial'],
    'Diff. topp':['Gap to top','Diff. Spitze'],
    'Personlig beste pr. øvelse':['Personal best by event','Persönliche Bestleistung pro Disziplin'],
    'Rangerer valgt konkurranse etter beste registrerte enkeltresultat.':['Ranks the selected competition by the best recorded individual result.','Rangiert den ausgewählten Wettkampf nach der besten registrierten Einzelleistung.'],
    'Plass':['Rank','Platz'],
    'Plass nå':['Current rank','Aktueller Platz'],
    'Resultat':['Result','Ergebnis'],
    'Poeng':['Points','Punkte'],
    'Poeng nå':['Points now','Punkte aktuell'],
    'POENG NÅ':['POINTS NOW','PUNKTE AKTUELL'],
    'Poeng diff':['Points gap','Punktedifferenz'],
    'År':['Year','Jahr'],
    'Sted':['Venue','Ort'],
    'Forventet sluttresultat':['Expected final result','Erwartetes Endergebnis'],
    'Forventet sluttpoeng':['Expected final score','Erwartete Endpunktzahl'],
    'Forventet sluttplass':['Expected final rank','Erwarteter Endplatz'],
    'Faktiske resultater brukes i ferdige øvelser. I gjenstående øvelser brukes normalt snittet av de tre beste av de fire siste godkjente seniorresultatene fra 2025–2026. Hvis færre enn fire resultater finnes, brukes snittet av de tilgjengelige resultatene.':['Actual results are used for completed events. For remaining events, the forecast normally uses the average of the three best of the four most recent approved senior results from 2025–2026. If fewer than four results are available, the average of the available results is used.','Für abgeschlossene Disziplinen werden die tatsächlichen Ergebnisse verwendet. Für verbleibende Disziplinen nutzt die Prognose normalerweise den Durchschnitt der drei besten der vier jüngsten gültigen Seniorenergebnisse aus 2025–2026. Sind weniger als vier Ergebnisse vorhanden, wird der Durchschnitt der verfügbaren Ergebnisse verwendet.'],
    'Farger viser antall resultater i prognosegrunnlaget:':['Colours show the number of results in the forecast basis:','Farben zeigen die Anzahl der Ergebnisse in der Prognosegrundlage:'],
    'Grønn = 4 resultater':['Green = 4 results','Grün = 4 Ergebnisse'],
    'Gul = 3 resultater':['Yellow = 3 results','Gelb = 3 Ergebnisse'],
    'Oransje = 2 resultater':['Orange = 2 results','Orange = 2 Ergebnisse'],
    'Rød = 1 resultat':['Red = 1 result','Rot = 1 Ergebnis'],
    'Dobbeltklikk på resultatene for å se grunnlaget.':['Double-click a result to see the forecast basis.','Doppelklicken Sie auf ein Ergebnis, um die Prognosegrundlage zu sehen.'],
    'Sorter:':['Sort:','Sortieren:'],
    'LIVE KLAR':['LIVE READY','LIVE BEREIT'],
    'Venter på arrangørens live-resultater.':['Waiting for the organiser’s live results.','Warten auf die Live-Ergebnisse des Veranstalters.'],
    'Alle rettigheter forbeholdt.':['All rights reserved.','Alle Rechte vorbehalten.'],
    'Analyse og prognoser er basert på offentlig tilgjengelige resultatdata. Mangekampanalyse Pro er et uavhengig analyseverktøy og er ikke tilknyttet World Athletics, European Athletics eller arrangørene.':['Analyses and forecasts are based on publicly available results data. Mangekampanalyse Pro is an independent analysis tool and is not affiliated with World Athletics, European Athletics or the organisers.','Analysen und Prognosen basieren auf öffentlich verfügbaren Ergebnisdaten. Mangekampanalyse Pro ist ein unabhängiges Analysetool und nicht mit World Athletics, European Athletics oder den Veranstaltern verbunden.'],
    'Kontakt:':['Contact:','Kontakt:'],
    'Sammenlign med en annen utøver':['Compare with another athlete','Mit einem anderen Athleten vergleichen'],
    'Søk på navn. Bare utøvere med tikampresultater vises.':['Search by name. Only athletes with decathlon results are shown.','Nach Namen suchen. Es werden nur Athleten mit Zehnkampfergebnissen angezeigt.'],
    'Søk på navn. Bare utøvere med sjukampresultater vises.':['Search by name. Only athletes with heptathlon results are shown.','Nach Namen suchen. Es werden nur Athletinnen mit Siebenkampfergebnissen angezeigt.'],
    'Søk':['Search','Suchen'],
    'Søker etter utøver…':['Searching for athlete…','Suche nach Athlet…'],
    'Velg riktig utøver:':['Select the correct athlete:','Richtigen Athleten auswählen:'],
    'Ingen relevante mangekamputøvere funnet.':['No relevant combined-events athletes found.','Keine relevanten Mehrkampfathleten gefunden.'],
    'Fjern':['Remove','Entfernen'],
    'Hva hvis?':['What if?','Was wäre wenn?'],
    'Hva hvis':['What if','Was wäre wenn'],
    'Øvelse':['Event','Disziplin'],
    'Forventet:':['Expected:','Erwartet:'],
    'Forventet resultat':['Expected result','Erwartetes Ergebnis'],
    'Resultater i grunnlaget':['Results in forecast basis','Ergebnisse der Prognosegrundlage'],
    'Trykk på tallet i «Resultater i grunnlaget» for å se hvilke WA-resultater prognosen bygger på.':['Click the number under “Results in forecast basis” to see which WA results the forecast uses.','Klicken Sie auf die Zahl unter „Ergebnisse der Prognosegrundlage“, um die verwendeten WA-Ergebnisse zu sehen.'],
    'Vis resultatgrunnlag':['Show forecast basis','Prognosegrundlage anzeigen'],
    'Prognosen bruker de 3 beste av disse 4 resultatene.':['The forecast uses the best 3 of these 4 results.','Die Prognose verwendet die besten 3 dieser 4 Ergebnisse.'],
    'Det finnes færre enn 4 gyldige resultater i perioden, så alle viste resultater brukes.':['Fewer than 4 valid results are available in the period, so all shown results are used.','Im Zeitraum liegen weniger als 4 gültige Ergebnisse vor, daher werden alle angezeigten Ergebnisse verwendet.'],
    'Henter resultatgrunnlag…':['Loading forecast basis…','Prognosegrundlage wird geladen…'],
    'Ingen gyldige resultater funnet.':['No valid results found.','Keine gültigen Ergebnisse gefunden.'],
    'Dato':['Date','Datum'],
    'Vind':['Wind','Wind'],
    'Konkurranse / sted':['Competition / venue','Wettkampf / Ort'],
    'PB (personlig rekord)':['PB (personal best)','PB (persönliche Bestleistung)'],
    'Ordinær prognose':['Standard forecast','Standardprognose'],
    'Endring':['Change','Änderung'],
    'Nullstill':['Reset','Zurücksetzen'],
    'Bruk scenario':['Apply scenario','Szenario anwenden'],
    'Legg inn egne resultater i én eller flere øvelser. Tomme felt bruker den ordinære prognosen.':['Enter your own results in one or more events. Empty fields use the standard forecast.','Geben Sie eigene Ergebnisse in einer oder mehreren Disziplinen ein. Leere Felder verwenden die Standardprognose.'],
    'Skriv resultat':['Enter result','Ergebnis eingeben'],
    'Høyde':['High jump','Hochsprung'],
    'Lengde':['Long jump','Weitsprung'],
    'Kule':['Shot put','Kugelstoß'],
    'Diskos':['Discus','Diskuswurf'],
    'Stav':['Pole vault','Stabhochsprung'],
    'Spyd':['Javelin','Speerwurf'],
    '110mh':['110m hurdles','110 m Hürden'],
    '100mh':['100m hurdles','100 m Hürden'],
    'Forventet sluttpoeng nå':['Expected final score now','Erwartete Endpunktzahl aktuell'],
    'Opprinnelig forventet sluttpoeng før start':['Original expected final score before start','Ursprünglich erwartete Endpunktzahl vor dem Start'],
    'Kode':['Code','Code'],
    'Betydning':['Meaning','Bedeutung'],
    'Forklaring':['Explanation','Erklärung'],
    'Startet ikke i øvelsen / konkurransen.':['Did not start the event / competition.','Nicht zur Disziplin / zum Wettkampf angetreten.'],
    'Startet, men fullførte ikke konkurransen.':['Started but did not finish the competition.','Gestartet, aber den Wettkampf nicht beendet.'],
    'Diskvalifisert.':['Disqualified.','Disqualifiziert.'],
    'Ingen gyldig resultat / notering.':['No valid result / mark.','Kein gültiges Ergebnis / keine gültige Leistung.'],
    'Ingen gyldig høyde i høyde eller stav.':['No valid height in high jump or pole vault.','Keine gültige Höhe im Hoch- oder Stabhochsprung.'],
    'Når en utøver ikke fortsetter konkurransen, vises samme statuskode også i de etterfølgende øvelsene som ikke blir startet.':['When an athlete does not continue the competition, the same status code is also shown in subsequent events that are not started.','Wenn ein Athlet den Wettkampf nicht fortsetzt, wird derselbe Statuscode auch in den folgenden, nicht begonnenen Disziplinen angezeigt.'],
    'Klikk for å sortere':['Click to sort','Zum Sortieren klicken'],
    'Valgt konkurranse':['Selected competition','Ausgewählter Wettkampf'],
    'Ingen utøverdata funnet.':['No athlete data found.','Keine Athletendaten gefunden.']
  };

  const reverse=new Map();Object.entries(D).forEach(([nb,v])=>{reverse.set(nb,nb);v.forEach(x=>reverse.set(x,nb));});
  const language=()=>localStorage.getItem('mka-language')||'nb';
  const value=(nb,l)=>l==='nb'?nb:(D[nb]?.[l==='en'?0:1]||nb);
  function exact(s,l){const nb=reverse.get(s);return nb?value(nb,l):s;}
  function dynamic(s,l){
    let m;
    if((m=s.match(/^(\d+)\s+(utøver|utøvere|athlete|athletes|Athlet|Athleten)$/i))){const n=m[1];return l==='en'?`${n} ${n==='1'?'athlete':'athletes'}`:l==='de'?`${n} ${n==='1'?'Athlet':'Athleten'}`:`${n} ${n==='1'?'utøver':'utøvere'}`;}
    if((m=s.match(/^Forventet:\s*(.+)$/i))|| (m=s.match(/^Expected:\s*(.+)$/i)) || (m=s.match(/^Erwartet:\s*(.+)$/i)))return `${value('Forventet:',l)} ${m[1]}`;
    if((m=s.match(/^Henter og analyserer (.+)…$/)))return l==='en'?`Fetching and analysing ${m[1]}…`:l==='de'?`${m[1]} wird geladen und analysiert…`:s;
    if((m=s.match(/^Fetching and analysing (.+)…$/)))return l==='nb'?`Henter og analyserer ${m[1]}…`:l==='de'?`${m[1]} wird geladen und analysiert…`:s;
    if((m=s.match(/^(.+) wird geladen und analysiert…$/)))return l==='nb'?`Henter og analyserer ${m[1]}…`:l==='en'?`Fetching and analysing ${m[1]}…`:s;
    return s;
  }
  function translateText(raw,l){if(!raw||!raw.trim())return raw;const lead=raw.match(/^\s*/)?.[0]||'',trail=raw.match(/\s*$/)?.[0]||'',core=raw.trim();return lead+dynamic(exact(core,l),l)+trail;}
  function walk(node,l){
    if(node.nodeType===3){const p=node.parentElement;if(!p||['SCRIPT','STYLE','TEXTAREA'].includes(p.tagName))return;const n=translateText(node.nodeValue,l);if(n!==node.nodeValue)node.nodeValue=n;return;}
    if(node.nodeType!==1)return;
    ['title','aria-label','placeholder'].forEach(a=>{if(node.hasAttribute?.(a)){const r=node.getAttribute(a),n=translateText(r,l);if(n!==r)node.setAttribute(a,n);}});
    node.childNodes.forEach(n=>walk(n,l));
  }
  function fixStatus(l){
    document.querySelectorAll('#forecastBanner,.test-banner').forEach(el=>{const t=(el.textContent||'').replace(/\s+/g,' ').trim();if(!/Birmingham 2026/i.test(t))return;const ath=(t.match(/Birmingham 2026\s*·\s*(\d+)/i)||[])[1]||'25';const ev=(t.match(/(\d+)\s*(?:øvelser? fullført|events completed|Disziplinen abgeschlossen)/i)||[])[1]||'10';const tm=(t.match(/(?:oppdatert|updated|aktualisiert)\s+(\d{1,2}:\d{2})/i)||[])[1]||'';el.textContent=l==='en'?`European Championships Birmingham 2026 · ${ath} athletes · forecast from WA history · ${ev} events completed${tm?' · updated '+tm:''}`:l==='de'?`Europameisterschaften Birmingham 2026 · ${ath} Athleten · Prognose aus WA-Historie · ${ev} Disziplinen abgeschlossen${tm?' · aktualisiert '+tm:''}`:`EM Birmingham 2026 · ${ath} utøvere · prognose fra WA-historikk · ${ev} øvelser fullført${tm?' · oppdatert '+tm:''}`;});
  }
  function fixStats(l){const el=document.querySelector('#stats');if(!el)return;const t=(el.textContent||'').replace(/\s+/g,' ').trim();const n=(t.match(/(?:Utøvere|Athletes|Athleten):\s*(\d+)/i)||[])[1];if(!n)return;const nums=t.match(/\d+[\d.,]*\s*%?/g)||[];const pb=nums[1]||'',util=nums[2]||'',pot=nums[3]||'';el.textContent=l==='en'?`Athletes: ${n} · Average decathlon PB: ${pb} · Average utilisation: ${util} · Largest unused potential: ${pot}`:l==='de'?`Athleten: ${n} · Durchschnitt Zehnkampf-PB: ${pb} · Durchschnittliche Ausnutzung: ${util} · Größtes ungenutztes Potenzial: ${pot}`:`Utøvere: ${n} · Snitt tikamp-PB: ${pb} · Snitt utnyttelse: ${util} · Størst uutnyttet potensial: ${pot}`;}
  function ensureSwitcher(){
    let w=document.querySelector('#mkaLanguageSwitcher');if(!w){w=document.createElement('div');w.id='mkaLanguageSwitcher';w.setAttribute('role','group');CODES.forEach(code=>{const b=document.createElement('button');b.type='button';b.dataset.lang=code;b.className=code;b.title=LANGS[code].label;b.setAttribute('aria-label',LANGS[code].label);b.innerHTML='<span class="flag"></span><i class="v"></i><i class="h"></i>';b.onclick=()=>setLanguage(code);w.appendChild(b)});(document.querySelector('.topbar')||document.querySelector('header')||document.body).appendChild(w);}
    const l=language();w.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.lang===l));
  }
  function setLanguage(l){if(!LANGS[l])return;localStorage.setItem('mka-language',l);apply(l);document.dispatchEvent(new CustomEvent('mka:languagechange',{detail:{language:l}}));}
  let working=false;
  function apply(l=language()){if(working)return;working=true;document.documentElement.lang=LANGS[l]?.html||'nb';ensureSwitcher();walk(document.body,l);fixStatus(l);fixStats(l);document.querySelector('#athleteCompareBtn')?.remove();working=false;}

  const st=document.createElement('style');st.id='mka-unified-style';st.textContent=`#athleteCompareBtn{display:none!important}.competition-select-wrap{display:inline-flex!important;width:auto!important;max-width:100%!important}#competitionSelect{width:auto;min-width:420px!important;max-width:min(900px,calc(100vw - 90px))!important;padding-right:44px!important}#mkaLanguageSwitcher{margin-left:auto;display:flex;align-items:center;gap:8px;padding-left:14px}#mkaLanguageSwitcher button{position:relative;width:42px;height:30px;padding:0;border:1px solid #355b7c;border-radius:6px;background:#0b2038;overflow:hidden;cursor:pointer;opacity:.8}#mkaLanguageSwitcher button.active{opacity:1;border-color:#7b5cff;box-shadow:0 0 0 2px #6f4cff33}#mkaLanguageSwitcher .flag{position:absolute;inset:3px;border-radius:2px;overflow:hidden}#mkaLanguageSwitcher .nb .flag{background:#ba0c2f}#mkaLanguageSwitcher .nb .flag:before{content:'';position:absolute;left:28%;top:0;width:18%;height:100%;background:#fff}#mkaLanguageSwitcher .nb .flag:after{content:'';position:absolute;left:0;top:39%;width:100%;height:22%;background:#fff}#mkaLanguageSwitcher .nb i{position:absolute;z-index:2;background:#00205b}#mkaLanguageSwitcher .nb i.v{left:33%;top:3px;width:8%;height:24px}#mkaLanguageSwitcher .nb i.h{left:3px;top:45%;width:36px;height:10%}#mkaLanguageSwitcher .en .flag{background:#012169}#mkaLanguageSwitcher .en .flag:before{content:'';position:absolute;inset:0;background:linear-gradient(33deg,transparent 42%,#fff 43% 49%,#c8102e 50% 53%,#fff 54% 60%,transparent 61%),linear-gradient(-33deg,transparent 42%,#fff 43% 49%,#c8102e 50% 53%,#fff 54% 60%,transparent 61%)}#mkaLanguageSwitcher .en i.v{position:absolute;z-index:2;left:46%;top:3px;width:8%;height:24px;background:#c8102e}#mkaLanguageSwitcher .en i.h{position:absolute;z-index:2;left:3px;top:42%;width:36px;height:16%;background:#fff}#mkaLanguageSwitcher .en i.h:after{content:'';position:absolute;left:0;top:25%;width:100%;height:50%;background:#c8102e}#mkaLanguageSwitcher .de .flag{background:linear-gradient(to bottom,#000 0 33.33%,#dd0000 33.33% 66.66%,#ffce00 66.66% 100%)}@media(max-width:800px){#competitionSelect{min-width:0!important;width:100%!important;max-width:100%!important}.competition-select-wrap{display:flex!important;width:100%!important}}`;
  document.head.appendChild(st);
  window.MKA_I18N={get language(){return language();},setLanguage,t:(s)=>translateText(s,language()),translate:apply};
  apply();
  let timer;new MutationObserver(()=>{if(working)return;clearTimeout(timer);timer=setTimeout(()=>apply(),25)}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder']});
})();