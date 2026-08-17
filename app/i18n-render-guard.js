(function(){
  if(window.__MKA_I18N_RENDER_GUARD)return;window.__MKA_I18N_RENDER_GUARD=true;
  const lang=()=>localStorage.getItem('mka-language')||'nb';
  const HEAD={
    men:{
      nb:['Plass nå','Nasjon','Utøver','100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m','POENG NÅ','Poeng diff','Forventet sluttpoeng','Forventet sluttplass','1500 diff'],
      en:['Current rank','Nation','Athlete','100m','Long jump','Shot put','High jump','400m','110m hurdles','Discus','Pole vault','Javelin','1500m','POINTS NOW','Points gap','Expected final score','Expected final rank','1500m gap'],
      de:['Aktueller Platz','Nation','Athlet','100m','Weitsprung','Kugelstoß','Hochsprung','400m','110 m Hürden','Diskuswurf','Stabhochsprung','Speerwurf','1500m','PUNKTE AKTUELL','Punktedifferenz','Erwartete Endpunktzahl','Erwarteter Endplatz','1500-m-Differenz']
    },
    women:{
      nb:['Plass nå','Nasjon','Utøver','100mh','Høyde','Kule','200m','Lengde','Spyd','800m','POENG NÅ','Poeng diff','Forventet sluttpoeng','Forventet sluttplass','800 diff'],
      en:['Current rank','Nation','Athlete','100m hurdles','High jump','Shot put','200m','Long jump','Javelin','800m','POINTS NOW','Points gap','Expected final score','Expected final rank','800m gap'],
      de:['Aktueller Platz','Nation','Athlet','100 m Hürden','Hochsprung','Kugelstoß','200m','Weitsprung','Speerwurf','800m','PUNKTE AKTUELL','Punktedifferenz','Erwartete Endpunktzahl','Erwarteter Endplatz','800-m-Differenz']
    }
  };
  function type(){const a=document.querySelector('.event-switch-btn.active');return a?.dataset?.type==='women'?'women':'men';}
  function forceHead(){const th=[...document.querySelectorAll('#liveForecastHead th')];if(!th.length)return;const labels=HEAD[type()][lang()]||HEAD[type()].nb;if(th.length!==labels.length)return;th.forEach((el,i)=>{const arrows=(el.textContent.match(/[↕↑↓]+/g)||[]).join('');const wanted=labels[i]+(arrows?' '+arrows:'');if(el.textContent.trim()!==wanted.trim())el.textContent=wanted;});}
  function forceWhatIf(){const l=lang(),h=document.querySelector('#modalContent h2');if(!h)return;const t=h.textContent.trim();const m=t.match(/^(.*?)(?:\s*[–-]\s*)(Hva hvis\?|What if\?|Was wäre wenn\?)$/i);if(!m)return;const suffix=l==='en'?'What if?':l==='de'?'Was wäre wenn?':'Hva hvis?';const wanted=m[1].trim()+' – '+suffix;if(h.textContent!==wanted)h.textContent=wanted;}
  function run(){forceHead();forceWhatIf();}
  let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;run();});}
  const obs=new MutationObserver(schedule);obs.observe(document.body,{subtree:true,childList:true,characterData:true});
  document.addEventListener('mka:languagechange',()=>{run();setTimeout(run,0);setTimeout(run,60);});
  document.addEventListener('click',e=>{if(e.target.closest?.('.event-switch-btn,#mkaLanguageSwitcher button')){setTimeout(run,0);setTimeout(run,50);setTimeout(run,150);}},true);
  run();
})();