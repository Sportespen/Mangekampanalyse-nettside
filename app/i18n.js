(function(){
  if(window.__MKA_I18N_V1)return;
  window.__MKA_I18N_V1=true;

  const LANGS={nb:{label:'Norsk',flag:'🇳🇴',html:'nb'},en:{label:'English',flag:'🇬🇧',html:'en'},de:{label:'Deutsch',flag:'🇩🇪',html:'de'}};
  const D={
    'Analyse • Statistikk • Forventet resultat • Live':['Analysis • Statistics • Expected result • Live','Analyse • Statistik • Erwartetes Ergebnis • Live'],
    'Konkurranse':['Competition','Wettkampf'],
    'EM Birmingham 2026':['European Championships Birmingham 2026','Europameisterschaften Birmingham 2026'],
    'Velg mangekamp':['Select combined event','Mehrkampf auswählen'],
    'Tikamp menn':["Men's decathlon",'Zehnkampf Männer'],
    'Sjukamp kvinner':["Women's heptathlon",'Siebenkampf Frauen'],
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
    'Se beste resultater i hver øvelse':['See the best result in each event','Beste Ergebnisse in jeder Disziplin anzeigen'],
    'FORVENTET':['EXPECTED','ERWARTETES'],
    'RESULTAT':['RESULT','ERGEBNIS'],
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
    'Resultat':['Result','Ergebnis'],
    'Poeng':['Points','Punkte'],
    'År':['Year','Jahr'],
    'Sted':['Venue','Ort'],
    'Forventet sluttresultat':['Expected final result','Erwartetes Endergebnis'],
    'Faktiske resultater brukes i ferdige øvelser. I gjenstående øvelser brukes normalt snittet av de tre beste av de fire siste godkjente seniorresultatene fra 2025–2026. Hvis færre enn fire resultater finnes, brukes snittet av de tilgjengelige resultatene.':['Actual results are used for completed events. For remaining events, the forecast normally uses the average of the three best of the four most recent approved senior results from 2025–2026. If fewer than four results are available, the average of the available results is used.','Für abgeschlossene Disziplinen werden die tatsächlichen Ergebnisse verwendet. Für verbleibende Disziplinen nutzt die Prognose normalerweise den Durchschnitt der drei besten der vier jüngsten gültigen Seniorenergebnisse aus 2025–2026. Sind weniger als vier Ergebnisse vorhanden, wird der Durchschnitt der verfügbaren Ergebnisse verwendet.'],
    'Farger viser antall resultater i prognosegrunnlaget:':['Colours show the number of results in the forecast basis:','Farben zeigen die Anzahl der Ergebnisse in der Prognosegrundlage:'],
    'Grønn = 4 resultater':['Green = 4 results','Grün = 4 Ergebnisse'],
    'Gul = 3 resultater':['Yellow = 3 results','Gelb = 3 Ergebnisse'],
    'Oransje = 2 resultater':['Orange = 2 results','Orange = 2 Ergebnisse'],
    'Rød = 1 resultat':['Red = 1 result','Rot = 1 Ergebnis'],
    'Dobbeltklikk på resultatene for å se grunnlaget.':['Double-click a result to see the forecast basis.','Doppelklicken Sie auf ein Ergebnis, um die Prognosegrundlage zu sehen.'],
    'Sorter:':['Sort:','Sortieren:'],
    'Plass nå':['Current rank','Aktueller Platz'],
    'Forventet sluttplass':['Expected final rank','Erwarteter Endplatz'],
    'Forventet sluttpoeng':['Expected final score','Erwartete Endpunktzahl'],
    'Poeng nå':['Points now','Punkte aktuell'],
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
    'Øvelse':['Event','Disziplin'],
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
    'Hva hvis':['What if','Was wäre wenn'],
    'Endring':['Change','Änderung'],
    'Nullstill':['Reset','Zurücksetzen'],
    'Bruk scenario':['Apply scenario','Szenario anwenden'],
    'Legg inn egne resultater i én eller flere øvelser. Tomme felt bruker den ordinære prognosen.':['Enter your own results in one or more events. Empty fields use the standard forecast.','Geben Sie eigene Ergebnisse in einer oder mehreren Disziplinen ein. Leere Felder verwenden die Standardprognose.'],
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
    'Endring':['Change','Änderung'],
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

  const CODES=['nb','en','de'];
  const reverse=new Map();
  Object.entries(D).forEach(([nb,vals])=>{reverse.set(nb,nb);vals.forEach(v=>reverse.set(v,nb));});
  function language(){return localStorage.getItem('mka-language')||'nb';}
  function value(nb,target){if(target==='nb')return nb;const vals=D[nb];return vals?vals[target==='en'?0:1]:nb;}
  function eventWord(s,target){return value(reverse.get(s)||s,target);}
  function direct(core,target){const nb=reverse.get(core);return nb?value(nb,target):null;}
  function dynamic(core,target){
    let m;
    if((m=core.match(/^(Startanalyse|Start analysis)\s*[–-]\s*(.+)$/i)))return `${target==='en'?'Start analysis':'Startanalyse'} – ${m[2]}`;
    if((m=core.match(/^(\d+)\s+(utøver|utøvere|athlete|athletes|Athlet|Athleten)$/i))){const n=m[1];return target==='en'?`${n} ${n==='1'?'athlete':'athletes'}`:target==='de'?`${n} ${n==='1'?'Athlet':'Athleten'}`:`${n} ${n==='1'?'utøver':'utøvere'}`;}
    if((m=core.match(/^Henter og analyserer (.+)…$/)))return target==='en'?`Fetching and analysing ${m[1]}…`:target==='de'?`${m[1]} wird geladen und analysiert…`:core;
    if((m=core.match(/^Fetching and analysing (.+)…$/)))return target==='de'?`${m[1]} wird geladen und analysiert…`:target==='nb'?`Henter og analyserer ${m[1]}…`:core;
    if((m=core.match(/^(.+) wird geladen und analysiert…$/)))return target==='en'?`Fetching and analysing ${m[1]}…`:target==='nb'?`Henter og analyserer ${m[1]}…`:core;
    if((m=core.match(/^Kunne ikke søke akkurat nå:\s*(.+)$/)))return target==='en'?`Search unavailable right now: ${m[1]}`:target==='de'?`Suche derzeit nicht möglich: ${m[1]}`:core;
    if((m=core.match(/^Kunne ikke analysere utøveren:\s*(.+)$/)))return target==='en'?`Could not analyse the athlete: ${m[1]}`:target==='de'?`Athlet konnte nicht analysiert werden: ${m[1]}`:core;
    if((m=core.match(/^Kunne ikke hente resultatgrunnlaget:\s*(.+)$/)))return target==='en'?`Could not load the forecast basis: ${m[1]}`:target==='de'?`Prognosegrundlage konnte nicht geladen werden: ${m[1]}`:core;
    if((m=core.match(/^(.+)\s+[–-]\s+(Høyde|Lengde|Kule|Diskos|Stav|Spyd|110mh|100mh|High jump|Long jump|Shot put|Discus|Pole vault|Javelin|110m hurdles|100m hurdles|Hochsprung|Weitsprung|Kugelstoß|Diskuswurf|Stabhochsprung|Speerwurf|110 m Hürden|100 m Hürden)$/)))return `${m[1]} – ${eventWord(m[2],target)}`;
    if((m=core.match(/^LIVE\s*[–-]\s*(\d+)\s+(øvelse|øvelser)\s+fullført$/)))return target==='en'?`LIVE – ${m[1]} ${m[1]==='1'?'event':'events'} completed`:target==='de'?`LIVE – ${m[1]} ${m[1]==='1'?'Disziplin':'Disziplinen'} abgeschlossen`:core;
    return null;
  }
  function tr(raw,target=language()){
    if(!raw)return raw;const lead=raw.match(/^\s*/)?.[0]||'',trail=raw.match(/\s*$/)?.[0]||'',core=raw.trim();if(!core)return raw;
    const d=direct(core,target);if(d!=null)return lead+d+trail;const dy=dynamic(core,target);return dy!=null?lead+dy+trail:raw;
  }
  let working=false;
  function walk(node,target){
    if(node.nodeType===3){const p=node.parentElement;if(!p||['SCRIPT','STYLE','TEXTAREA'].includes(p.tagName))return;const n=tr(node.nodeValue,target);if(n!==node.nodeValue)node.nodeValue=n;return;}
    if(node.nodeType!==1)return;['title','aria-label','placeholder'].forEach(a=>{if(node.hasAttribute?.(a)){const raw=node.getAttribute(a),n=tr(raw,target);if(n!==raw)node.setAttribute(a,n);}});node.childNodes.forEach(n=>walk(n,target));
  }
  function updateButtons(){const l=language();document.querySelectorAll('#mkaLanguageSwitcher button').forEach(b=>{const on=b.dataset.lang===l;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false');});}
  function translateAll(){if(working)return;working=true;const l=language();document.documentElement.lang=LANGS[l]?.html||'nb';walk(document.body,l);updateButtons();working=false;}
  function setLanguage(l){if(!LANGS[l])return;localStorage.setItem('mka-language',l);translateAll();document.dispatchEvent(new CustomEvent('mka:languagechange',{detail:{language:l}}));}
  function addSwitcher(){
    if(document.querySelector('#mkaLanguageSwitcher'))return;
    const st=document.createElement('style');st.id='mka-i18n-style';st.textContent='#mkaLanguageSwitcher{margin-left:auto;display:flex;align-items:center;gap:7px;padding-left:14px}#mkaLanguageSwitcher button{width:42px;height:34px;border:1px solid #355b7c;border-radius:8px;background:#0b2038;display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;opacity:.72;transition:.15s}#mkaLanguageSwitcher button:hover{opacity:1;border-color:#6f93b5}#mkaLanguageSwitcher button.active{opacity:1;border-color:#7b5cff;box-shadow:0 0 0 2px #6f4cff33;background:#102d4b}@media(max-width:650px){#mkaLanguageSwitcher{gap:4px;padding-left:6px}#mkaLanguageSwitcher button{width:36px;height:31px;font-size:19px}}';document.head.appendChild(st);
    const w=document.createElement('div');w.id='mkaLanguageSwitcher';w.setAttribute('role','group');w.setAttribute('aria-label','Språk');CODES.forEach(code=>{const b=document.createElement('button');b.type='button';b.dataset.lang=code;b.textContent=LANGS[code].flag;b.title=LANGS[code].label;b.setAttribute('aria-label',LANGS[code].label);b.onclick=()=>setLanguage(code);w.appendChild(b);});(document.querySelector('.topbar')||document.querySelector('header')||document.body).appendChild(w);updateButtons();
  }
  window.MKA_I18N={get language(){return language();},setLanguage,t:tr,translate:translateAll};
  addSwitcher();translateAll();
  const obs=new MutationObserver(()=>{if(!working){clearTimeout(window.__mkaI18nTimer);window.__mkaI18nTimer=setTimeout(translateAll,0);}});obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder']});
})();
