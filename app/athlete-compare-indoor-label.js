(function(){
  const nativeFetch=window.fetch.bind(window);
  let lastAnalysis=null;

  window.fetch=async function(input,init){
    const r=await nativeFetch(input,init);
    try{
      const url=typeof input==='string'?input:(input?.url||'');
      if(/\/api\/athlete-search(?:-v2)?\?/.test(url)&&/action=analyse/.test(url)){
        const data=await r.clone().json();
        if(data?.events) lastAnalysis=data;
      }
    }catch(_e){}
    return r;
  };

  function norm(s){return String(s||'').trim().replace(',','.');}
  function dateToIso(s){
    const m=String(s||'').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    return m?`${m[3]}-${m[2]}-${m[1]}`:String(s||'').trim();
  }
  function enhance(){
    const content=document.querySelector('#modalContent');
    const table=content?.querySelector('table');
    if(!table||!lastAnalysis)return;
    const title=content.querySelector('h2')?.textContent||'';
    const ev=(title.split('–').pop()||'').trim();
    const entries=Array.isArray(lastAnalysis?.events?.[ev])?lastAnalysis.events[ev]:[];
    if(!entries.length)return;
    const head=table.querySelector('thead tr');
    if(!head||[...head.children].some(th=>/inne\s*\/\s*ute/i.test(th.textContent)))return;
    const th=document.createElement('th'); th.textContent='Inne / ute';
    head.insertBefore(th,head.children[4]||null);
    table.querySelectorAll('tbody tr').forEach(tr=>{
      const cells=[...tr.children];
      if(cells.length<5)return;
      const date=dateToIso(cells[1].textContent);
      const mark=norm(cells[2].textContent);
      const match=entries.find(r=>String(r?.date||'').startsWith(date)&&norm(r?.display||r?.mark)===mark);
      const td=document.createElement('td');
      td.textContent=match?.indoor===true?'Inne':match?.indoor===false?'Ute':'—';
      td.style.fontWeight='800';
      tr.insertBefore(td,cells[4]||null);
    });
  }
  const obs=new MutationObserver(()=>setTimeout(enhance,0));
  function start(){const m=document.querySelector('#modalContent');if(m)obs.observe(m,{subtree:true,childList:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
