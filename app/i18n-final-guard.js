(function(){
  if(window.__MKA_I18N_FINAL_GUARD)return;window.__MKA_I18N_FINAL_GUARD=true;
  const L={
    nb:{flag:'🇳🇴',name:'Norsk',what:'Hva hvis?',desc:'Legg inn egne resultater i én eller flere øvelser. Tomme felt bruker den ordinære prognosen.',expected:'Forventet:',placeholder:'Skriv resultat',standard:'Ordinær prognose',scenario:'Hva hvis',change:'Endring',reset:'Nullstill',apply:'Bruk scenario',events:['100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m']},
    en:{flag:'🇬🇧',name:'English',what:'What if?',desc:'Enter your own results in one or more events. Empty fields use the standard forecast.',expected:'Expected:',placeholder:'Enter result',standard:'Standard forecast',scenario:'What if',change:'Change',reset:'Reset',apply:'Apply scenario',events:['100m','Long jump','Shot put','High jump','400m','110m hurdles','Discus','Pole vault','Javelin','1500m']},
    de:{flag:'🇩🇪',name:'Deutsch',what:'Was wäre wenn?',desc:'Geben Sie eigene Ergebnisse in einer oder mehreren Disziplinen ein. Leere Felder verwenden die Standardprognose.',expected:'Erwartet:',placeholder:'Ergebnis eingeben',standard:'Standardprognose',scenario:'Was wäre wenn',change:'Änderung',reset:'Zurücksetzen',apply:'Szenario anwenden',events:['100m','Weitsprung','Kugelstoß','Hochsprung','400m','110 m Hürden','Diskuswurf','Stabhochsprung','Speerwurf','1500m']}
  };
  const lang=()=>localStorage.getItem('mka-language')||'nb';
  function ensureSwitcher(){
    let w=document.querySelector('#mkaLanguageSwitcher');
    if(!w){
      const st=document.createElement('style');st.id='mka-final-lang-style';st.textContent=`#mkaLanguageSwitcher{margin-left:auto;display:flex;align-items:center;gap:7px;padding-left:14px;z-index:1000}#mkaLanguageSwitcher button{width:42px;height:34px;border:1px solid #355b7c;border-radius:8px;background:#0b2038;display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;opacity:.76}#mkaLanguageSwitcher button.active{opacity:1;border-color:#ff8a19;box-shadow:0 0 0 2px #ff8a1933}@media(max-width:650px){#mkaLanguageSwitcher{gap:4px;padding-left:6px}#mkaLanguageSwitcher button{width:36px;height:31px;font-size:19px}}`;document.head.appendChild(st);
      w=document.createElement('div');w.id='mkaLanguageSwitcher';w.setAttribute('role','group');['nb','en','de'].forEach(code=>{const b=document.createElement('button');b.type='button';b.dataset.lang=code;b.textContent=L[code].flag;b.title=L[code].name;b.setAttribute('aria-label',L[code].name);b.onclick=()=>{localStorage.setItem('mka-language',code);if(window.MKA_I18N?.setLanguage)window.MKA_I18N.setLanguage(code);else document.dispatchEvent(new CustomEvent('mka:languagechange',{detail:{language:code}}));setTimeout(apply,0);};w.appendChild(b)});(document.querySelector('.topbar')||document.querySelector('header')||document.body).appendChild(w);
    }
    const l=lang();w.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.lang===l));
  }
  function fixWhatIf(){
    const rows=[...document.querySelectorAll('#modalContent [data-whatif]')].map(i=>i.closest('div')).filter(Boolean);if(!rows.length)return;
    const x=L[lang()]||L.nb;
    const h=document.querySelector('#modalContent h2');if(h){const s=h.textContent||'',dash=s.lastIndexOf(' – ');h.textContent=(dash>=0?s.slice(0,dash):s)+' – '+x.what;}
    const p=document.querySelector('#modalContent h2 + p');if(p)p.textContent=x.desc;
    rows.forEach((row,i)=>{const b=row.querySelector('b'),sp=row.querySelector('span'),inp=row.querySelector('[data-whatif]');if(b&&x.events[i])b.textContent=x.events[i];if(sp){const value=(sp.textContent||'').replace(/^.*?:\s*/,'');sp.textContent=x.expected+' '+value;}if(inp)inp.placeholder=x.placeholder;});
    const smalls=[...document.querySelectorAll('#modalContent small')];if(smalls[0])smalls[0].textContent=x.standard;if(smalls[1])smalls[1].textContent=x.scenario;if(smalls[2])smalls[2].textContent=x.change;
    const reset=document.querySelector('#whatIfReset');if(reset)reset.textContent=x.reset;const applyBtn=document.querySelector('#whatIfApply');if(applyBtn)applyBtn.textContent=x.apply;
  }
  function apply(){ensureSwitcher();fixWhatIf();}
  let t;const obs=new MutationObserver(()=>{clearTimeout(t);t=setTimeout(apply,20)});obs.observe(document.body,{childList:true,subtree:true});document.addEventListener('mka:languagechange',()=>setTimeout(apply,0));setTimeout(apply,50);
})();