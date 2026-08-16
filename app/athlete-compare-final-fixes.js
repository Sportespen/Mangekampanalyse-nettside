(function(){
  const athleteCache=new Map();
  const wrCache=new Map();

  function activeType(){return document.querySelector('.event-switch-btn.active')?.dataset?.type||'men';}
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/gi,'ae').replace(/ø/gi,'o').replace(/å/gi,'a').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function cleanMainRowPB(){document.querySelectorAll('#athleteCompareOutput .compare-pb,#athleteCompareOutput .compare-pb-total').forEach(el=>el.remove());}

  async function findAthlete(name){
    const type=activeType(),key=`${type}|${norm(name)}`;
    if(athleteCache.has(key))return athleteCache.get(key);
    const p=(async()=>{
      try{
        const r=await fetch(`/api/athlete-search-v2?action=search&type=${encodeURIComponent(type)}&q=${encodeURIComponent(name)}`,{cache:'no-store'});
        const d=await r.json();if(!r.ok)return null;
        const list=Array.isArray(d.athletes)?d.athletes:[];
        return list.find(x=>norm(x.name)===norm(name))||list[0]||null;
      }catch(_){return null;}
    })();
    athleteCache.set(key,p);return p;
  }

  async function getWorldRank(name){
    const type=activeType(),key=`${type}|${norm(name)}`;
    if(wrCache.has(key))return wrCache.get(key);
    const p=(async()=>{
      const hit=await findAthlete(name);if(!hit?.id)return null;
      try{
        const r=await fetch(`/api/athlete-world-rank?id=${encodeURIComponent(hit.id)}&type=${encodeURIComponent(type)}`,{cache:'no-store'});
        const d=await r.json();return r.ok&&Number.isFinite(Number(d.worldRank))?Number(d.worldRank):null;
      }catch(_){return null;}
    })();
    wrCache.set(key,p);return p;
  }

  async function decorateWR(){
    if(document.querySelector('.tab.active')?.dataset?.tab!=='analyse')return;
    const out=document.querySelector('#athleteCompareOutput'),table=out?.querySelector('table');if(!table)return;
    const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());
    const wrI=heads.indexOf('WR'),athI=heads.indexOf('Utøver');if(wrI<0||athI<0)return;
    const row=table.querySelector('tbody tr');if(!row)return;
    const cells=[...row.children],name=cells[athI]?.textContent.trim();if(!name)return;
    const cell=cells[wrI];if(!cell||cell.dataset.wrLoaded==='1')return;
    cell.dataset.wrLoaded='1';cell.textContent='…';
    const wr=await getWorldRank(name);if(!cell.isConnected)return;
    cell.textContent=wr??'—';cell.style.fontWeight='900';
  }

  document.addEventListener('click',ev=>{
    cleanMainRowPB();
    if(ev.target.closest?.('#athleteCompareOutput,.tab,#athleteCompareResults button,#athleteCompareBtn')){
      setTimeout(decorateWR,50);setTimeout(decorateWR,500);
    }
  },true);

  const observer=new MutationObserver(()=>{cleanMainRowPB();decorateWR();});
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  cleanMainRowPB();setTimeout(decorateWR,300);

  if(!window.__athleteNameAutocompleteV3){
    const s=document.createElement('script');
    s.src='athlete-name-autocomplete.js?v=20260816-index-v3';
    s.async=false;
    document.head.appendChild(s);
  }
})();
