(function(){
  const wrCache=new Map();
  let wrPending=false;
  function activeTab(){return document.querySelector('.tab.active')?.dataset?.tab||'analyse';}
  function compareTable(){return document.querySelector('#athleteCompareOutput table');}
  function selectedName(){const row=compareTable()?.querySelector('tbody tr');if(!row)return'';const cells=[...row.children];if(activeTab()==='analyse')return cells[3]?.textContent?.trim()||'';if(activeTab()==='ranking')return cells.find(td=>td.textContent.includes('-Ødegaard')||td.textContent.includes('Hertwig'))?.textContent?.trim()||cells[2]?.textContent?.trim()||'';return document.querySelector('#athleteCompareOutput h3')?.textContent?.trim()||'';}
  async function fillWr(){
    if(activeTab()!=='analyse'||wrPending)return;
    const table=compareTable();if(!table)return;
    const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());
    const wi=heads.indexOf('WR');if(wi<0)return;
    const row=table.querySelector('tbody tr');if(!row)return;
    const name=selectedName();if(!name)return;
    const key=`${typeof currentType==='string'?currentType:'men'}|${name}`;
    const cell=row.children[wi];if(!cell)return;
    if(wrCache.has(key)){cell.textContent=wrCache.get(key)||'—';return;}
    wrPending=true;cell.textContent='…';
    try{const r=await fetch(`/api/athlete-world-rank?type=${encodeURIComponent(typeof currentType==='string'?currentType:'men')}&name=${encodeURIComponent(name)}`,{cache:'no-store'});const data=await r.json();const wr=Number(data?.wr)||null;wrCache.set(key,wr);cell.textContent=wr||'—';}catch(_e){cell.textContent='—';}finally{wrPending=false;}
  }
  function removePbPlace(){
    if(activeTab()!=='ranking')return;
    const table=compareTable();if(!table)return;
    const first=table.querySelector('thead th');if(!first||first.textContent.trim()!=='Plass')return;
    table.querySelectorAll('tr').forEach(tr=>{if(tr.children[0])tr.children[0].remove();});
  }
  function apply(){removePbPlace();fillWr();}
  document.addEventListener('click',ev=>{if(ev.target.closest?.('.tab,#athleteCompareResults button'))setTimeout(apply,30);},true);
  document.addEventListener('change',ev=>{if(ev.target?.id==='eventSelect')setTimeout(apply,0);},true);
  const mo=new MutationObserver(()=>requestAnimationFrame(apply));
  function start(){mo.observe(document.body,{subtree:true,childList:true});apply();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
