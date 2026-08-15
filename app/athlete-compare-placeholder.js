(function(){
  const nativeFetch=window.fetch.bind(window);
  let lastAnalysis=null;
  let switchingType=false;
  let suppressResults=false;
  let preservedSelectedBox=null;

  window.fetch=async function(input,init){
    let finalInput=input;
    try{
      const raw=typeof input==='string'?input:(input&&input.url)||'';
      const u=new URL(raw,location.href);
      if(u.pathname==='/api/athlete-search'){
        u.pathname='/api/athlete-search-v2';
        finalInput=typeof input==='string'?u.toString():new Request(u.toString(),input);
      }
    }catch(_e){}
    const r=await nativeFetch(finalInput,init);
    try{
      const raw=typeof finalInput==='string'?finalInput:(finalInput&&finalInput.url)||'';
      const u=new URL(raw,location.href);
      if(u.pathname==='/api/athlete-search-v2'&&u.searchParams.get('action')==='analyse'){
        const data=await r.clone().json();
        if(data?.events)lastAnalysis=data;
      }
    }catch(_e){}
    return r;
  };

  function clearLegacyHistory(){
    try{
      localStorage.removeItem('mangekamp_compare_test_men');
      localStorage.removeItem('mangekamp_compare_test_women');
      localStorage.removeItem('mangekamp_compare_state_men');
      localStorage.removeItem('mangekamp_compare_state_women');
    }catch(_e){}
  }
  function hideSearchResults(){
    const results=document.querySelector('#athleteCompareResults');
    if(results){results.style.display='none';results.innerHTML='';}
  }
  function boxHasSelected(box){return !!box?.querySelector?.('#athleteCompareOutput h3');}
  function ensureStableMount(){
    if(switchingType)return;
    const forecast=document.querySelector('#forecast');
    let box=document.querySelector('#athleteCompareBox');
    if(!forecast)return;

    if(boxHasSelected(box))preservedSelectedBox=box;

    /* A live refresh may create a fresh blank compare box. Never let that blank box
       replace the already selected athlete DOM. Restore the exact old node so its
       event handlers, state and What-if content survive intact. */
    if(preservedSelectedBox&&box&&box!==preservedSelectedBox&&!boxHasSelected(box)){
      box.replaceWith(preservedSelectedBox);
      box=preservedSelectedBox;
    }
    if(!box&&preservedSelectedBox){
      forecast.insertAdjacentElement('afterend',preservedSelectedBox);
      box=preservedSelectedBox;
    }
    if(!box)return;

    /* Keep comparison UI outside #forecast because the live engine rerenders forecast. */
    if(box.parentElement===forecast||box.previousElementSibling!==forecast){
      forecast.insertAdjacentElement('afterend',box);
    }
    box.style.marginTop='22px';box.style.marginBottom='0';
  }
  function updatePlaceholder(){
    const input=document.querySelector('#athleteCompareSearch');
    if(!input)return;
    input.placeholder=(typeof currentType==='string'&&currentType==='women')
      ? 'Skriv navn, f.eks. Miranda Lauvstad'
      : 'Skriv navn, f.eks. Jonathan Hertwig';
  }
  function compactBasisTable(){
    const content=document.querySelector('#modalContent');
    const table=content?.querySelector('table');
    if(!table)return;
    table.style.width='100%';table.style.minWidth='0';table.style.tableLayout='fixed';
    const widths=['7%','15%','15%','12%','15%','36%'];
    table.querySelectorAll('tr').forEach(tr=>[...tr.children].forEach((cell,i)=>{
      if(widths[i])cell.style.width=widths[i];
      cell.style.paddingLeft='8px';cell.style.paddingRight='8px';
      if(i<5)cell.style.whiteSpace='nowrap';
      else{cell.style.whiteSpace='normal';cell.style.overflowWrap='anywhere';}
    }));
    const wrap=table.closest('.table-wrap');
    if(wrap){wrap.style.overflowX='hidden';wrap.style.maxWidth='100%';}
  }
  function updateModalSize(){
    const card=document.querySelector('#modal .modal-card');
    if(!card)return;
    card.style.width='min(940px, calc(100vw - 24px))';card.style.maxWidth='940px';
    card.style.maxHeight='86vh';card.style.overflowY='auto';card.style.overflowX='hidden';card.style.boxSizing='border-box';
    compactBasisTable();
  }
  function addIndoorOutdoorColumn(){
    const content=document.querySelector('#modalContent'),table=content?.querySelector('table'),title=content?.querySelector('h2')?.textContent||'';
    if(!table||!lastAnalysis||!/–/.test(title))return;
    const ev=(title.split('–').pop()||'').trim();
    const entries=Array.isArray(lastAnalysis?.events?.[ev])?lastAnalysis.events[ev]:[];
    if(!entries.length)return;
    const head=table.querySelector('thead tr');if(!head)return;
    if(![...head.children].some(th=>th.textContent.trim()==='Inne / ute')){
      const th=document.createElement('th');th.textContent='Inne / ute';head.insertBefore(th,head.children[4]||null);
      const iso=s=>{const m=String(s||'').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:String(s||'').trim();};
      const mark=s=>String(s||'').trim().replace(',','.');
      table.querySelectorAll('tbody tr').forEach(tr=>{
        const cells=[...tr.children];if(cells.length<5)return;
        const date=iso(cells[1].textContent),result=mark(cells[2].textContent);
        const row=entries.find(r=>String(r?.date||'').startsWith(date)&&mark(r?.display||r?.mark)===result);
        const td=document.createElement('td');td.textContent=row?.indoor===true?'Inne':row?.indoor===false?'Ute':'—';td.style.fontWeight='800';tr.insertBefore(td,cells[4]||null);
      });
    }
    compactBasisTable();
  }
  function selectedName(){return document.querySelector('#athleteCompareOutput h3')?.textContent?.trim()||'';}

  document.addEventListener('click',ev=>{
    const pick=ev.target.closest?.('#athleteCompareResults button[data-name]');
    if(pick){
      suppressResults=true;
      setTimeout(()=>{
        hideSearchResults();ensureStableMount();
        const input=document.querySelector('#athleteCompareSearch');if(input)input.blur();
        const box=document.querySelector('#athleteCompareBox');if(boxHasSelected(box))preservedSelectedBox=box;
      },100);
    }
    if(ev.target.closest?.('#athleteCompareBtn'))suppressResults=false;
    if(ev.target.closest?.('#removeCompareBtn')){suppressResults=false;hideSearchResults();preservedSelectedBox=null;}
    if(ev.target.closest?.('.event-switch-btn')){
      switchingType=true;suppressResults=false;hideSearchResults();preservedSelectedBox=null;
      setTimeout(()=>{switchingType=false;ensureStableMount();updatePlaceholder();},350);
    }
    if(ev.target.closest?.('[data-basis],#whatIfBtn'))setTimeout(()=>{hideSearchResults();updateModalSize();addIndoorOutdoorColumn();},0);
  },true);
  document.addEventListener('input',ev=>{
    if(ev.target?.id==='athleteCompareSearch'){
      suppressResults=false;
      if(!String(ev.target.value||'').trim())hideSearchResults();
    }
  },true);

  let mountQueued=false;
  const mo=new MutationObserver(()=>{
    if(!mountQueued){
      mountQueued=true;
      requestAnimationFrame(()=>{
        mountQueued=false;
        ensureStableMount();
        updatePlaceholder();
        if(suppressResults||selectedName())hideSearchResults();
        if(document.querySelector('#modal.open')){updateModalSize();addIndoorOutdoorColumn();}
      });
    }
  });
  function start(){
    clearLegacyHistory();
    mo.observe(document.body,{subtree:true,childList:true});
    ensureStableMount();updatePlaceholder();hideSearchResults();
    const input=document.querySelector('#athleteCompareSearch');if(input)input.value='';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
