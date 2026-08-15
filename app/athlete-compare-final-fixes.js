(function(){
  const athleteCache=new Map();
  const wrCache=new Map();

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

  function modalIdentity(){
    const content=document.querySelector('#modalContent'),h2=content?.querySelector('h2');
    if(!h2||/Hva hvis/i.test(h2.textContent))return null;
    const title=h2.textContent.trim();
    const events=window.D?.events||[];
    const ev=events.find(x=>title.endsWith(`– ${x}`)||title.endsWith(`- ${x}`));
    if(!ev)return null;
    const name=title.replace(new RegExp(`\\s*[–-]\\s*${ev.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s*$`),'').trim();
    return name?{name,ev}:null;
  }

  async function decorateBasisModal(){
    const modal=document.querySelector('#modal'),content=document.querySelector('#modalContent');
    if(!modal?.classList.contains('open')||!content)return;
    const ident=modalIdentity();if(!ident)return;
    const {name,ev}=ident;
    const summary=[...content.querySelectorAll('div')].find(d=>d.querySelector(':scope > small')?.textContent.trim()==='Forventet resultat');
    if(!summary)return;

    const card=modal.querySelector('.modal-card');
    if(card){
      card.style.width='min(700px,calc(100vw - 24px))';
      card.style.maxWidth='700px';
      card.style.padding='14px 16px 15px';
      card.style.maxHeight='calc(100vh - 24px)';
      card.style.overflowY='auto';
    }
    const h2=content.querySelector('h2');if(h2)h2.style.cssText+=';margin:0 36px 8px 0;font-size:22px;line-height:1.15';
    const p=h2?.nextElementSibling;if(p)p.style.cssText+=';margin:0 0 10px;font-size:13px;line-height:1.25';
    const wrap=content.querySelector('.table-wrap');if(wrap)wrap.style.marginTop='8px';
    const table=content.querySelector('table');if(table){table.style.fontSize='12px';table.style.width='100%';table.style.tableLayout='fixed';}
    content.querySelectorAll('table th,table td').forEach(c=>{c.style.padding='6px 7px';c.style.lineHeight='1.15';});
    const ths=table?[...table.querySelectorAll('thead th')]:[];
    if(ths.length>=5){ths[0].style.width='6%';ths[1].style.width='16%';ths[2].style.width='15%';ths[3].style.width='10%';ths[4].style.width='53%';}
    if(table){[...table.querySelectorAll('tbody td:nth-child(5)')].forEach(c=>{c.style.whiteSpace='normal';c.style.overflowWrap='anywhere';});}

    const expected=summary.dataset.expectedValue||summary.querySelector(':scope > b')?.textContent.trim()||summary.querySelector('b')?.textContent.trim()||'—';
    summary.dataset.expectedValue=expected;
    summary.style.cssText='margin-top:10px;padding:8px 10px;background:#102a45;border-radius:8px;display:grid;grid-template-columns:1fr 1fr;align-items:end;gap:14px';
    summary.innerHTML=`<div><small style="display:block;color:#9fb2c6;font-size:11px;line-height:1.1">Forventet resultat</small><b style="display:block;font-size:21px;line-height:1.1;margin-top:2px">${expected}</b></div><div style="text-align:right"><small style="display:block;color:#9fb2c6;font-size:11px;line-height:1.1">PB</small><b class="compare-modal-pb" style="display:block;font-size:21px;line-height:1.1;margin-top:2px">…</b></div>`;

    const data=await analyseAthlete(name),pb=data?.pbs?.[ev]?.mark;
    const target=summary.querySelector('.compare-modal-pb');if(target?.isConnected)target.textContent=fmtPB(ev,pb);
  }

  document.addEventListener('click',ev=>{
    cleanMainRowPB();
    if(ev.target.closest?.('#athleteCompareOutput,.tab,#athleteCompareResults button,#athleteCompareBtn')){
      setTimeout(decorateBasisModal,0);setTimeout(decorateBasisModal,80);setTimeout(decorateBasisModal,250);
      setTimeout(decorateWR,50);setTimeout(decorateWR,500);
    }
  },true);

  const observer=new MutationObserver(()=>{
    cleanMainRowPB();decorateWR();
    if(document.querySelector('#modal')?.classList.contains('open'))decorateBasisModal();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  cleanMainRowPB();setTimeout(decorateWR,300);
})();
