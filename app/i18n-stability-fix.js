(function(){
  if(window.__MKA_I18N_STABILITY)return; window.__MKA_I18N_STABILITY=true;
  const T={
    'Plass nå':['Current rank','Aktueller Platz'],'Nasjon':['Nation','Nation'],'Utøver':['Athlete','Athlet'],'Lengde':['Long jump','Weitsprung'],'Kule':['Shot put','Kugelstoß'],'Høyde':['High jump','Hochsprung'],'Diskos':['Discus','Diskuswurf'],'Stav':['Pole vault','Stabhochsprung'],'Spyd':['Javelin','Speerwurf'],'POENG NÅ':['POINTS NOW','PUNKTE AKTUELL'],'Poeng diff':['Points gap','Punktedifferenz'],'Forventet sluttpoeng':['Expected final score','Erwartete Endpunktzahl'],'Forventet sluttplass':['Expected final rank','Erwarteter Endplatz'],'1500 diff':['1500m gap','1500-m-Differenz'],'Forventet:':['Expected:','Erwartet:'],'Oppdater':['Refresh','Aktualisieren']
  };
  const reverse=new Map(); Object.entries(T).forEach(([nb,a])=>{reverse.set(nb,nb);reverse.set(a[0],nb);reverse.set(a[1],nb)});
  const lang=()=>localStorage.getItem('mka-language')||'nb';
  const val=(nb,l)=>l==='nb'?nb:(T[nb]?.[l==='en'?0:1]||nb);
  function canonicalReplace(text,l){let out=text; const entries=[...reverse.entries()].sort((a,b)=>b[0].length-a[0].length); for(const [src,nb] of entries){if(out.includes(src))out=out.split(src).join(val(nb,l));} return out;}
  function status(text,l){let s=text;
    s=s.replace(/(\d+)\s+(?:utøver(?:e)?|athletes?|Athlet(?:en)?)/gi,(_,n)=>l==='en'?`${n} ${n==='1'?'athlete':'athletes'}`:l==='de'?`${n} ${n==='1'?'Athlet':'Athleten'}`:`${n} ${n==='1'?'utøver':'utøvere'}`);
    s=s.replace(/(?:prognose fra WA-historikk|forecast from WA history|Prognose aus WA-Historie)/gi,l==='en'?'forecast from WA history':l==='de'?'Prognose aus WA-Historie':'prognose fra WA-historikk');
    s=s.replace(/(\d+)\s+(?:øvelser? fullført|events? completed|Disziplin(?:en)? abgeschlossen)/gi,(_,n)=>l==='en'?`${n} ${n==='1'?'event':'events'} completed`:l==='de'?`${n} ${n==='1'?'Disziplin':'Disziplinen'} abgeschlossen`:`${n} ${n==='1'?'øvelse':'øvelser'} fullført`);
    s=s.replace(/(?:oppdatert|updated|aktualisiert)\s+(\d{1,2}:\d{2})/gi,(_,tm)=>l==='en'?`updated ${tm}`:l==='de'?`aktualisiert ${tm}`:`oppdatert ${tm}`); return s;
  }
  function apply(){const l=lang();
    const btn=document.querySelector('#athleteCompareBtn'); if(btn)btn.remove();
    const input=document.querySelector('#athleteCompareSearch'); if(input){input.style.width='100%';input.style.maxWidth='100%';}
    document.querySelectorAll('#liveForecastHead th').forEach(th=>{const raw=(th.textContent||'').replace(/[↕↑↓]/g,'').trim();const nb=reverse.get(raw);if(nb){const arrows=(th.textContent||'').match(/[↕↑↓]+/g)?.join('')||'';th.textContent=val(nb,l)+(arrows?' '+arrows:'');}});
    const banner=document.querySelector('#forecastBanner'); if(banner)banner.textContent=status(canonicalReplace(banner.textContent||'',l),l);
    document.querySelectorAll('button').forEach(b=>{if((b.textContent||'').trim().match(/^(Oppdater|Refresh|Aktualisieren)$/)){b.textContent=l==='en'?'↻ Refresh':l==='de'?'↻ Aktualisieren':'↻ Oppdater';}});
    document.querySelectorAll('#modalContent *').forEach(el=>{if(el.children.length===0&&el.textContent){el.textContent=canonicalReplace(el.textContent,l);}});
  }
  let timer; const obs=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(apply,20)}); obs.observe(document.body,{subtree:true,childList:true,characterData:true});
  document.addEventListener('mka:languagechange',()=>setTimeout(apply,10)); setInterval(apply,500); setTimeout(apply,50);
})();