(function(){
  if(window.__MKA_I18N_STABILITY)return; window.__MKA_I18N_STABILITY=true;
  const T={
    'Plass nå':['Current rank','Aktueller Platz'],'Nasjon':['Nation','Nation'],'Utøver':['Athlete','Athlet'],'Lengde':['Long jump','Weitsprung'],'Kule':['Shot put','Kugelstoß'],'Høyde':['High jump','Hochsprung'],'Diskos':['Discus','Diskuswurf'],'Stav':['Pole vault','Stabhochsprung'],'Spyd':['Javelin','Speerwurf'],'POENG NÅ':['POINTS NOW','PUNKTE AKTUELL'],'Poeng diff':['Points gap','Punktedifferenz'],'Forventet sluttpoeng':['Expected final score','Erwartete Endpunktzahl'],'Forventet sluttplass':['Expected final rank','Erwarteter Endplatz'],'1500 diff':['1500m gap','1500-m-Differenz'],'Forventet:':['Expected:','Erwartet:'],'Oppdater':['Refresh','Aktualisieren'],
    'Dato':['Date','Datum'],'Resultat':['Result','Ergebnis'],'Vind':['Wind','Wind'],'Konkurranse / sted':['Competition / venue','Wettkampf / Ort'],'Forventet resultat':['Expected result','Erwartetes Ergebnis'],'PB (personlig rekord)':['PB (personal best)','PB (persönliche Bestleistung)'],'Forsøk underveis':['Attempts in progress','Laufende Versuche'],'Forsøk':['Attempt','Versuch'],'Poeng':['Points','Punkte']
  };
  const reverse=new Map(); Object.entries(T).forEach(([nb,a])=>{reverse.set(nb,nb);reverse.set(a[0],nb);reverse.set(a[1],nb)});
  const lang=()=>localStorage.getItem('mka-language')||'nb';
  const val=(nb,l)=>l==='nb'?nb:(T[nb]?.[l==='en'?0:1]||nb);
  function exactText(text,l){const lead=(text.match(/^\s*/)||[''])[0],trail=(text.match(/\s*$/)||[''])[0],core=text.trim(),nb=reverse.get(core);return nb?lead+val(nb,l)+trail:text;}
  function status(text,l){
    const clean=String(text||'').replace(/\s+/g,' ').trim();
    const time=(clean.match(/(?:oppdatert|updated|aktualisiert)\s+(\d{1,2}:\d{2})/i)||[])[1]||'';
    const athletes=(clean.match(/Birmingham 2026\s*·\s*(\d+)/i)||[])[1]||'25';
    const events=(clean.match(/(\d+)\s*(?:øvelser? fullført|events? completed|Disziplin(?:en)? abgeschlossen)/i)||[])[1]||'10';
    if(l==='en')return `EM Birmingham 2026 · ${athletes} athletes · forecast from WA history · ${events} events completed${time?' · updated '+time:''}`;
    if(l==='de')return `EM Birmingham 2026 · ${athletes} Athleten · Prognose aus WA-Historie · ${events} Disziplinen abgeschlossen${time?' · aktualisiert '+time:''}`;
    return `EM Birmingham 2026 · ${athletes} utøvere · prognose fra WA-historikk · ${events} øvelser fullført${time?' · oppdatert '+time:''}`;
  }
  function apply(){const l=lang();
    document.querySelector('#athleteCompareBtn')?.remove();
    const input=document.querySelector('#athleteCompareSearch');if(input){input.style.width='100%';input.style.maxWidth='100%';}
    document.querySelectorAll('#liveForecastHead th').forEach(th=>{const txt=th.textContent||'',raw=txt.replace(/[↕↑↓]/g,'').trim(),nb=reverse.get(raw);if(nb){const arrows=(txt.match(/[↕↑↓]+/g)||[]).join('');th.textContent=val(nb,l)+(arrows?' '+arrows:'');}});
    const banner=document.querySelector('#forecastBanner');if(banner&&/Birmingham 2026/i.test(banner.textContent||''))banner.textContent=status(banner.textContent,l);
    document.querySelectorAll('button').forEach(b=>{const core=(b.textContent||'').replace(/^↻\s*/,'').trim(),nb=reverse.get(core);if(nb==='Oppdater')b.textContent='↻ '+val('Oppdater',l);});
    /* IMPORTANT: only exact UI labels inside modals are translated. Data cells, athlete names,
       competition names, venues and results are never modified. */
    document.querySelectorAll('#modalContent th,#modalContent small,#modalContent label').forEach(el=>{if(el.children.length===0&&el.textContent)el.textContent=exactText(el.textContent,l);});
  }
  let timer,busy=false;const obs=new MutationObserver(()=>{if(busy)return;clearTimeout(timer);timer=setTimeout(()=>{busy=true;try{apply();}finally{setTimeout(()=>busy=false,0);}},30)});obs.observe(document.body,{subtree:true,childList:true,characterData:true});
  document.addEventListener('mka:languagechange',()=>setTimeout(apply,30));setTimeout(apply,80);
})();