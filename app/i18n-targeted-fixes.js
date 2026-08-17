(function(){
  if(window.__MKA_I18N_TARGETED_FIXES)return;window.__MKA_I18N_TARGETED_FIXES=true;

  const lang=()=>localStorage.getItem('mka-language')||'nb';
  const sex=()=>document.querySelector('.event-switch-btn.active')?.dataset?.type||'men';

  const CARD_TEXT={
    nb:[['STARTANALYSE','Kjør full analyse av denne konkurransen'],['PERSONLIG BESTE PR. ØVELSE','Se beste resultater i hver øvelse'],['FORVENTET RESULTAT','Prognose for gjenværende øvelser og sluttpoeng']],
    en:[['START ANALYSIS','Run a full analysis of this competition'],['PERSONAL BEST BY EVENT','View the best result in each event'],['EXPECTED RESULT','Forecast for remaining events and final score']],
    de:[['STARTANALYSE','Vollständige Analyse dieses Wettkampfs'],['PERSÖNLICHE BESTLEISTUNG PRO DISZIPLIN','Beste Leistung in jeder Disziplin anzeigen'],['ERWARTETES ERGEBNIS','Prognose für verbleibende Disziplinen und Endpunktzahl']]
  };

  const EVENTS={
    nb:{'100m':'100m','Lengde':'Lengde','Kule':'Kule','Høyde':'Høyde','400m':'400m','110mh':'110mh','Diskos':'Diskos','Stav':'Stav','Spyd':'Spyd','1500m':'1500m','100mh':'100mh','200m':'200m','800m':'800m'},
    en:{'100m':'100m','Lengde':'Long jump','Kule':'Shot put','Høyde':'High jump','400m':'400m','110mh':'110m hurdles','Diskos':'Discus','Stav':'Pole vault','Spyd':'Javelin','1500m':'1500m','100mh':'100m hurdles','200m':'200m','800m':'800m'},
    de:{'100m':'100m','Lengde':'Weitsprung','Kule':'Kugelstoß','Høyde':'Hochsprung','400m':'400m','110mh':'110 m Hürden','Diskos':'Diskuswurf','Stav':'Stabhochsprung','Spyd':'Speerwurf','1500m':'1500m','100mh':'100 m Hürden','200m':'200m','800m':'800m'}
  };

  const WOMEN_ORDER=['100mh','Høyde','Kule','200m','Lengde','Spyd','800m'];
  const MEN_ORDER=['100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m'];

  const COMMON={
    nb:{rank:'Plass nå',nation:'Nasjon',athlete:'Utøver',points:'POENG NÅ',gap:'Poeng diff',score:'Forventet sluttpoeng',finalRank:'Forventet sluttplass',endGap:'800 diff'},
    en:{rank:'Current rank',nation:'Nation',athlete:'Athlete',points:'POINTS NOW',gap:'Points gap',score:'Expected final score',finalRank:'Expected final rank',endGap:'800m gap'},
    de:{rank:'Aktueller Platz',nation:'Nation',athlete:'Athlet',points:'PUNKTE AKTUELL',gap:'Punktedifferenz',score:'Erwartete Endpunktzahl',finalRank:'Erwarteter Endplatz',endGap:'800-m-Differenz'}
  };

  function applyCards(){
    const l=lang(), data=CARD_TEXT[l]||CARD_TEXT.nb;
    const cards=[...document.querySelectorAll('.feature-card')];
    cards.forEach((card,i)=>{
      if(!data[i])return;
      const strong=card.querySelector('strong'), small=card.querySelector('small');
      if(strong)strong.textContent=data[i][0];
      if(small)small.textContent=data[i][1];
    });
  }

  function findEventKey(text){
    const s=String(text||'').trim();
    for(const key of Object.keys(EVENTS.nb)){
      if(EVENTS.nb[key]===s||EVENTS.en[key]===s||EVENTS.de[key]===s)return key;
    }
    return null;
  }

  function applyEventSelect(){
    const l=lang(), map=EVENTS[l]||EVENTS.nb;
    document.querySelectorAll('#eventSelect option').forEach(o=>{
      const key=o.dataset.mkaEvent||findEventKey(o.textContent);
      if(key){o.dataset.mkaEvent=key;o.textContent=map[key];}
    });
  }

  function applyForecastHead(){
    const l=lang(), map=EVENTS[l]||EVENTS.nb, c=COMMON[l]||COMMON.nb;
    const evs=sex()==='women'?WOMEN_ORDER:MEN_ORDER;
    const labels=[c.rank,c.nation,c.athlete,...evs.map(k=>map[k]),c.points,c.gap,c.score,c.finalRank,sex()==='women'?c.endGap:(l==='en'?'1500m gap':l==='de'?'1500-m-Differenz':'1500 diff')];
    const th=[...document.querySelectorAll('#liveForecastHead th')];
    th.forEach((cell,i)=>{
      if(!labels[i])return;
      const arrows=(cell.textContent.match(/[↕↑↓]+/g)||[]).join('');
      cell.textContent=labels[i]+(arrows?' '+arrows:'');
    });
  }

  function applyAll(){applyCards();applyEventSelect();applyForecastHead();}

  let queued=false;
  function schedule(ms=0){if(queued)return;queued=true;setTimeout(()=>{queued=false;applyAll();},ms);}

  document.addEventListener('mka:languagechange',()=>schedule(0));
  document.addEventListener('click',e=>{if(e.target.closest?.('.event-switch-btn,#mkaLanguageSwitcher button,.feature-card'))schedule(10);},true);
  document.addEventListener('change',e=>{if(e.target.matches?.('#eventSelect'))schedule(0);},true);

  ['.feature-tabs','#eventSelect','#liveForecastHead'].forEach(sel=>{
    const el=document.querySelector(sel);if(!el)return;
    new MutationObserver(()=>schedule(5)).observe(el,{childList:true,subtree:true,characterData:true});
  });

  schedule(0);
})();