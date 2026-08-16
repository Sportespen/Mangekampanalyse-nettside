(function(){
  const css=document.createElement('style');
  css.textContent=`#athleteCompareBtn{display:none!important}.competition-select-wrap{display:inline-flex!important;width:auto!important;max-width:100%!important}#competitionSelect{width:auto;min-width:420px!important;max-width:min(900px,calc(100vw - 90px))!important;text-overflow:clip!important;padding-right:44px!important}@media(max-width:800px){#competitionSelect{min-width:0!important;width:100%!important;max-width:100%!important}.competition-select-wrap{display:flex!important;width:100%!important}}`;
  document.head.appendChild(css);
  const BRAND={nb:'MANGEKAMPANALYSE',en:'COMBINED EVENTS ANALYSIS',de:'MEHRKAMPFANALYSE'};
  const HEAD={
    nb:['Plass nå','Nasjon','Utøver','100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m','POENG NÅ','Poeng diff','Forventet sluttpoeng','Forventet sluttplass','1500 diff'],
    en:['Current rank','Nation','Athlete','100m','Long jump','Shot put','High jump','400m','110m hurdles','Discus','Pole vault','Javelin','1500m','POINTS NOW','Points gap','Expected final score','Expected final rank','1500m gap'],
    de:['Aktueller Platz','Nation','Athlet','100m','Weitsprung','Kugelstoß','Hochsprung','400m','110 m Hürden','Diskuswurf','Stabhochsprung','Speerwurf','1500m','PUNKTE AKTUELL','Punktedifferenz','Erwartete Endpunktzahl','Erwarteter Endplatz','1500-m-Differenz']
  };
  function lang(){return localStorage.getItem('mka-language')||'nb';}
  function statusText(raw,l){
    const text=String(raw||'').replace(/\s+/g,' ').trim();
    const time=(text.match(/(?:oppdatert|updated|aktualisiert)\s+(\d{1,2}:\d{2})/i)||[])[1]||'';
    const athletes=(text.match(/(?:^|·)\s*(\d+)\s*(?:utøvere?|athletes|Athleten)/i)||[])[1]||((text.match(/Birmingham 2026\s*·\s*(\d+)/i)||[])[1]||'25');
    const events=(text.match(/(\d+)\s*(?:øvelser? fullført|events completed|Disziplinen abgeschlossen)/i)||[])[1]||'10';
    if(l==='en')return `EM Birmingham 2026 · ${athletes} athletes · forecast from WA history · ${events} events completed${time?' · updated '+time:''}`;
    if(l==='de')return `EM Birmingham 2026 · ${athletes} Athleten · Prognose aus WA-Historie · ${events} Disziplinen abgeschlossen${time?' · aktualisiert '+time:''}`;
    return `EM Birmingham 2026 · ${athletes} utøvere · prognose fra WA-historikk · ${events} øvelser fullført${time?' · oppdatert '+time:''}`;
  }
  function fixStatus(l){
    document.querySelectorAll('.test-banner,#forecastBanner').forEach(el=>{if(/Birmingham 2026/i.test(el.textContent)&&/(WA|histor|Athlet|utøver|events|Disziplin)/i.test(el.textContent))el.textContent=statusText(el.textContent,l);});
  }
  function fixHead(l){
    const tr=document.querySelector('#liveForecastHead tr'); if(!tr)return;
    const th=[...tr.querySelectorAll('th')], labels=HEAD[l]||HEAD.nb;
    th.forEach((cell,i)=>{if(i<labels.length){const arrow=cell.textContent.includes('↕')?' ↕':'';cell.textContent=labels[i]+arrow;}});
  }
  function sizeCompetition(){const s=document.querySelector('#competitionSelect');if(!s)return;if(innerWidth<=800){s.style.width='100%';return;}const c=sizeCompetition.c||(sizeCompetition.c=document.createElement('canvas')),x=c.getContext('2d'),cs=getComputedStyle(s);x.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;s.style.width=Math.max(420,Math.min(900,Math.ceil(x.measureText(s.options?.[s.selectedIndex]?.textContent||'').width+150)))+'px';}
  function apply(){const l=lang();const h=document.querySelector('.brand h1');if(h)h.textContent=BRAND[l];document.querySelector('#athleteCompareBtn')?.remove();fixStatus(l);fixHead(l);sizeCompetition();}
  let busy=false;
  const obs=new MutationObserver(()=>{if(busy)return;clearTimeout(window.__mkaStableLang);window.__mkaStableLang=setTimeout(()=>{busy=true;try{apply();}finally{setTimeout(()=>busy=false,0);}},50);});
  obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  document.addEventListener('mka:languagechange',()=>{busy=true;setTimeout(()=>{try{apply();}finally{busy=false;}},80);});
  window.addEventListener('resize',sizeCompetition);document.querySelector('#competitionSelect')?.addEventListener('change',sizeCompetition);setTimeout(apply,200);
})();