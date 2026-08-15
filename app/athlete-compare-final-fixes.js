(function(){
  const athleteCache=new Map();
  const wrCache=new Map();
  let lastBasisIndex=null;

  function activeType(){return document.querySelector('.event-switch-btn.active')?.dataset?.type||'men';}
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/gi,'ae').replace(/ø/gi,'o').replace(/å/gi,'a').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function fmtPB(ev,v){const n=Number(v);if(!Number.isFinite(n))return '—';if(ev==='1500m'||ev==='800m'){const m=Math.floor(n/60),s=(n-m*60).toFixed(2).padStart(5,'0');return `${m}:${s}`.replace('.',',');}return n.toFixed(2).replace('.',',');}
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

  async function analyseAthlete(name){
    const type=activeType(),key=`analyse|${type}|${norm(name)}`;
    if(athleteCache.has(key))return athleteCache.get(key);
    const p=(async()=>{
      const hit=await findAthlete(name);if(!hit?.id)return null;
      try{
        const r=await fetch(`/api/athlete-search-v2?action=analyse&type=${encodeURIComponent(type)}&id=${encodeURIComponent(hit.id)}&name=${encodeURIComponent(hit.name||name)}`,{cache:'no-store'});
        const d=await r.json();return r.ok?d:null;
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

  async function decorateBasisModal(){
    if(lastBasisIndex==null)return;
    const modal=document.querySelector('#modal'),content=document.querySelector('#modalContent');
    if(!modal?.classList.contains('open')||!content)return;
    const h2=content.querySelector('h2');if(!h2||/Hva hvis/i.test(h2.textContent))return;
    const parts=h2.textContent.split(' – '),name=parts.slice(0,-1).join(' – ').trim();
    const ev=(window.D?.events||[])[lastBasisIndex];if(!name||!ev)return;
    const summary=[...content.querySelectorAll('div')].find(d=>d.querySelector(':scope > small')?.textContent.trim()==='Forventet resultat');
    if(!summary||summary.dataset.pbAdded==='1')return;
    const expected=summary.querySelector(':scope > b')?.textContent.trim()||'—';
    summary.dataset.pbAdded='1';
    summary.style.cssText='margin-top:12px;padding:9px 11px;background:#102a45;border-radius:8px;display:flex;align-items:flex-end;justify-content:space-between;gap:18px';
    summary.innerHTML=`<div><small style="display:block;color:#9fb2c6">Forventet resultat</small><b style="display:block;font-size:21px">${expected}</b></div><div style="text-align:right"><small style="display:block;color:#9fb2c6">PB</small><b class="compare-modal-pb" style="display:block;font-size:21px">…</b></div>`;
    const card=modal.querySelector('.modal-card');if(card){card.style.width='min(760px,calc(100vw - 28px))';card.style.maxWidth='760px';card.style.padding='18px';}
    content.querySelectorAll('table th,table td').forEach(c=>{c.style.padding='8px 10px';});
    const data=await analyseAthlete(name);const pb=data?.pbs?.[ev]?.mark;
    const target=summary.querySelector('.compare-modal-pb');if(target?.isConnected)target.textContent=fmtPB(ev,pb);
  }

  function noteBasisClick(target){
    const btn=target.closest?.('#athleteCompareOutput table[data-compact-compare-row="1"] tbody button');if(!btn)return;
    if(!/^Vis\s+\d+\s+resultat/i.test(btn.title||''))return;
    const td=btn.closest('td'),row=td?.parentElement;if(!td||!row)return;
    const i=[...row.children].indexOf(td)-2;if(i<0)return;
    lastBasisIndex=i;
    setTimeout(decorateBasisModal,0);setTimeout(decorateBasisModal,80);setTimeout(decorateBasisModal,300);
  }

  document.addEventListener('click',ev=>{
    noteBasisClick(ev.target);
    cleanMainRowPB();
    if(ev.target.closest?.('.tab,#athleteCompareResults button,#athleteCompareBtn')){setTimeout(decorateWR,50);setTimeout(decorateWR,500);}
  },true);

  const observer=new MutationObserver(()=>{
    cleanMainRowPB();
    decorateWR();
    if(document.querySelector('#modal')?.classList.contains('open'))decorateBasisModal();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  cleanMainRowPB();
  setTimeout(decorateWR,300);
})();
