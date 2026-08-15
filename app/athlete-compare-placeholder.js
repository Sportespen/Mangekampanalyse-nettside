(function(){
  const nativeFetch=window.fetch.bind(window);
  let lastAnalysis=null;
  let preservedBox=null;
  let switchingType=false;
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

  const key=()=>`mangekamp_compare_test_${typeof currentType==='string'?currentType:'men'}`;
  let restoring=false;

  function keepCompareBoxMounted(){
    const current=document.querySelector('#athleteCompareBox');
    if(current){preservedBox=current;return;}
    if(switchingType||!preservedBox)return;
    const panel=document.querySelector('#forecast');
    if(panel&&!preservedBox.isConnected)panel.appendChild(preservedBox);
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
    table.style.width='100%';
    table.style.minWidth='0';
    table.style.tableLayout='fixed';
    const widths=['7%','15%','15%','12%','15%','36%'];
    table.querySelectorAll('tr').forEach(tr=>{
      [...tr.children].forEach((cell,i)=>{
        if(widths[i])cell.style.width=widths[i];
        cell.style.paddingLeft='8px';
        cell.style.paddingRight='8px';
        if(i<5){cell.style.whiteSpace='nowrap';}
        else{cell.style.whiteSpace='normal';cell.style.overflowWrap='anywhere';}
      });
    });
    const wrap=table.closest('.table-wrap');
    if(wrap){wrap.style.overflowX='hidden';wrap.style.maxWidth='100%';}
  }
  function updateModalSize(){
    const modal=document.querySelector('#modal');
    const card=modal?.querySelector('.modal-card');
    if(!card)return;
    card.style.width='min(940px, calc(100vw - 24px))';
    card.style.maxWidth='940px';
    card.style.maxHeight='86vh';
    card.style.overflowY='auto';
    card.style.overflowX='hidden';
    card.style.boxSizing='border-box';
    compactBasisTable();
  }
  function addIndoorOutdoorColumn(){
    const content=document.querySelector('#modalContent');
    const table=content?.querySelector('table');
    const title=content?.querySelector('h2')?.textContent||'';
    if(!table||!lastAnalysis||!/–/.test(title))return;
    const ev=(title.split('–').pop()||'').trim();
    const entries=Array.isArray(lastAnalysis?.events?.[ev])?lastAnalysis.events[ev]:[];
    if(!entries.length)return;
    const head=table.querySelector('thead tr');
    if(!head)return;
    if(![...head.children].some(th=>th.textContent.trim()==='Inne / ute')){
      const th=document.createElement('th');th.textContent='Inne / ute';
      head.insertBefore(th,head.children[4]||null);
      const iso=s=>{const m=String(s||'').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:String(s||'').trim();};
      const mark=s=>String(s||'').trim().replace(',','.');
      table.querySelectorAll('tbody tr').forEach(tr=>{
        const cells=[...tr.children];
        if(cells.length<5)return;
        const date=iso(cells[1].textContent),result=mark(cells[2].textContent);
        const row=entries.find(r=>String(r?.date||'').startsWith(date)&&mark(r?.display||r?.mark)===result);
        const td=document.createElement('td');
        td.textContent=row?.indoor===true?'Inne':row?.indoor===false?'Ute':'—';
        td.style.fontWeight='800';
        tr.insertBefore(td,cells[4]||null);
      });
    }
    compactBasisTable();
  }
  function read(){try{return JSON.parse(localStorage.getItem(key())||'null');}catch(_e){return null;}}
  function write(name){try{if(name)localStorage.setItem(key(),JSON.stringify({name}));}catch(_e){}}
  function clear(){try{localStorage.removeItem(key());}catch(_e){}}
  function selectedName(){return document.querySelector('#athleteCompareOutput h3')?.textContent?.trim()||'';}
  function capture(){const name=selectedName();if(name)write(name);}
  function restore(){
    keepCompareBoxMounted();
    const saved=read();
    const input=document.querySelector('#athleteCompareSearch');
    const btn=document.querySelector('#athleteCompareBtn');
    if(!saved?.name||!input||!btn||restoring||selectedName()===saved.name)return;
    restoring=true;
    input.value=saved.name;
    btn.click();
    setTimeout(()=>{
      const target=[...document.querySelectorAll('#athleteCompareResults button[data-name]')].find(b=>b.dataset.name===saved.name);
      if(target)target.click();
      setTimeout(()=>{restoring=false;capture();},650);
    },450);
  }
  function refresh(){keepCompareBoxMounted();updatePlaceholder();updateModalSize();addIndoorOutdoorColumn();capture();}

  document.addEventListener('click',ev=>{
    const pick=ev.target.closest?.('#athleteCompareResults button[data-name]');
    if(pick)write(pick.dataset.name);
    if(ev.target.closest?.('#removeCompareBtn'))clear();
    if(ev.target.closest?.('.event-switch-btn')){
      switchingType=true;
      preservedBox=null;
      setTimeout(()=>{switchingType=false;keepCompareBoxMounted();updatePlaceholder();restore();},300);
    }
    if(ev.target.closest?.('[data-basis],#whatIfBtn'))setTimeout(()=>{updateModalSize();addIndoorOutdoorColumn();},0);
  },true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)capture();else setTimeout(restore,150);});
  window.addEventListener('pagehide',capture);
  window.addEventListener('pageshow',()=>setTimeout(restore,180));

  const mo=new MutationObserver(refresh);
  function start(){mo.observe(document.body,{subtree:true,childList:true});refresh();setTimeout(restore,250);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
