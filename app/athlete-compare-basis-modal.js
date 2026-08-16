(function(){
  if(window.__athleteCompareBasisModalV1)return;
  window.__athleteCompareBasisModalV1=true;

  const cache=new Map();
  const EVENTS_MEN=['100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m'];
  const EVENTS_WOMEN=['100mh','Høyde','Kule','200m','Lengde','Spyd','800m'];

  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/gi,'ae').replace(/ø/gi,'o').replace(/å/gi,'a').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function type(){return document.querySelector('.event-switch-btn.active')?.dataset?.type||'men';}
  function events(){return type()==='women'?EVENTS_WOMEN:EVENTS_MEN;}
  function isTime(ev){return ['100m','400m','110mh','1500m','100mh','200m','800m'].includes(ev);}
  function fmt(ev,v){
    const n=Number(v);if(!Number.isFinite(n))return '—';
    if(ev==='1500m'||ev==='800m'){
      const m=Math.floor(n/60),s=(n-m*60).toFixed(2).padStart(5,'0');
      return `${m}:${s}`.replace('.',',');
    }
    return n.toFixed(2).replace('.',',');
  }
  function dateFmt(v){const s=String(v||'').trim(),m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);return m?`${m[3]}.${m[2]}.${m[1]}`:(s||'—');}
  function markFmt(ev,r){return r?.display?String(r.display).replace('.',','):fmt(ev,r?.mark);}
  function predicted(entries,ev){
    const vals=(Array.isArray(entries)?entries:[]).map(r=>Number(r.mark)).filter(Number.isFinite).sort((a,b)=>isTime(ev)?a-b:b-a);
    const used=vals.length>=4?vals.slice(0,3):vals;
    return used.length?used.reduce((s,v)=>s+v,0)/used.length:null;
  }
  function athleteName(){
    const out=document.querySelector('#athleteCompareOutput');
    return out?.querySelector('tbody .name')?.textContent.trim()||out?.querySelector('h3')?.textContent.trim()||'';
  }
  async function analyse(name){
    const key=`${type()}|${norm(name)}`;
    if(cache.has(key))return cache.get(key);
    const p=(async()=>{
      const sr=await fetch(`/api/athlete-search-v2?action=search&type=${encodeURIComponent(type())}&q=${encodeURIComponent(name)}`,{cache:'no-store'});
      const sd=await sr.json();if(!sr.ok)throw new Error(sd.error||'Søk feilet');
      const list=Array.isArray(sd.athletes)?sd.athletes:[];
      const hit=list.find(x=>norm(x.name)===norm(name))||list[0];
      if(!hit?.id)throw new Error('Fant ikke utøver');
      const ar=await fetch(`/api/athlete-search-v2?action=analyse&type=${encodeURIComponent(type())}&id=${encodeURIComponent(hit.id)}&name=${encodeURIComponent(hit.name||name)}`,{cache:'no-store'});
      const ad=await ar.json();if(!ar.ok)throw new Error(ad.error||'Analyse feilet');
      return ad;
    })();
    cache.set(key,p);return p;
  }
  function basisIndexFromClick(target){
    const direct=target.closest?.('[data-basis]');
    if(direct&&direct.closest('#athleteCompareOutput'))return Number(direct.dataset.basis);
    const compact=target.closest?.('table[data-compact-compare-row="1"]');
    const btn=target.closest?.('button');
    if(compact&&btn){
      const td=btn.closest('td');
      if(!td)return null;
      const idx=[...td.parentElement.children].indexOf(td)-2;
      return idx>=0&&idx<events().length?idx:null;
    }
    return null;
  }
  function setCardSize(){
    const card=document.querySelector('#modal .modal-card');if(!card)return;
    card.style.cssText='width:min(920px,calc(100vw - 36px));max-width:920px;height:auto;min-height:0;max-height:90vh;overflow:auto;background:#0b2038;border:1px solid #3c6c94;padding:22px 28px;position:relative;border-radius:10px;';
  }
  function renderLoading(name,ev){
    setCardSize();
    document.querySelector('#modalContent').innerHTML=`<h2 style="margin:4px 38px 10px 0">${esc(name)} – ${esc(ev)}</h2><p style="color:#aebed0">Henter resultatgrunnlag…</p>`;
    document.querySelector('#modal').classList.add('open');
  }
  function renderModal(a,ev){
    const entries=Array.isArray(a?.events?.[ev])?a.events[ev]:[];
    const expected=predicted(entries,ev);
    const pb=a?.pbs?.[ev]?.mark;
    const explanation=entries.length>=4?'Prognosen bruker de 3 beste av disse 4 resultatene.':'Det finnes færre enn 4 gyldige resultater i perioden, så alle viste resultater brukes.';
    const rows=entries.map((r,idx)=>`<tr><td class="basis-rank">${idx+1}</td><td>${esc(dateFmt(r.date))}</td><td class="basis-mark">${esc(markFmt(ev,r))}</td><td>${esc(r.wind||'—')}</td><td class="basis-place">${esc(r.competition||r.venue||'—')}</td></tr>`).join('')||'<tr><td colspan="5">Ingen gyldige resultater funnet.</td></tr>';
    setCardSize();
    document.querySelector('#modalContent').innerHTML=`
      <style>
        #modalContent .basis-new-title{margin:4px 38px 12px 0;font-size:24px;line-height:1.2}
        #modalContent .basis-new-note{margin:0 0 16px;color:#f4f7fb;font-size:15px}
        #modalContent .basis-new-wrap{overflow:hidden;border-radius:0}
        #modalContent .basis-new-table{width:100%;min-width:0!important;table-layout:fixed;border-collapse:collapse}
        #modalContent .basis-new-table th{position:static;background:#143f66;padding:10px 8px;font-size:13px;text-align:center}
        #modalContent .basis-new-table td{padding:11px 8px;border-bottom:1px solid #17314b;font-size:14px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        #modalContent .basis-new-table th:nth-child(1){width:7%}
        #modalContent .basis-new-table th:nth-child(2){width:18%}
        #modalContent .basis-new-table th:nth-child(3){width:16%}
        #modalContent .basis-new-table th:nth-child(4){width:11%}
        #modalContent .basis-new-table th:nth-child(5){width:48%}
        #modalContent .basis-rank{color:#ff8a19;font-weight:900}
        #modalContent .basis-mark{font-weight:900}
        #modalContent .basis-place{text-align:left!important}
        #modalContent .basis-summary{margin-top:18px;background:#102f50;border-radius:10px;display:grid;grid-template-columns:1fr 1fr;min-height:94px;overflow:hidden}
        #modalContent .basis-summary>div{padding:16px 20px;display:flex;flex-direction:column;justify-content:center}
        #modalContent .basis-summary>div+div{border-left:1px solid #456783}
        #modalContent .basis-summary small{color:#9fb2c6;font-size:13px;margin-bottom:5px}
        #modalContent .basis-summary b{font-size:26px;line-height:1.05}
        @media(max-width:700px){#modalContent .basis-new-table th,#modalContent .basis-new-table td{font-size:11px;padding:8px 4px}#modalContent .basis-summary>div{padding:12px}.modal-card{padding:16px 12px!important}}
      </style>
      <h2 class="basis-new-title">${esc(a.name||athleteName())} – ${esc(ev)}</h2>
      <p class="basis-new-note">${esc(explanation)}</p>
      <div class="basis-new-wrap"><table class="basis-new-table"><thead><tr><th>#</th><th>Dato</th><th>Resultat</th><th>Vind</th><th>Konkurranse / sted</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="basis-summary"><div><small>Forventet resultat</small><b>${fmt(ev,expected)}</b></div><div><small>PB (personlig rekord)</small><b>${fmt(ev,pb)}</b></div></div>`;
    document.querySelector('#modal').classList.add('open');
  }
  async function openNew(i){
    const ev=events()[i],name=athleteName();if(!ev||!name)return;
    renderLoading(name,ev);
    try{renderModal(await analyse(name),ev);}catch(err){setCardSize();document.querySelector('#modalContent').innerHTML=`<h2>${esc(name)} – ${esc(ev)}</h2><p>Kunne ikke hente resultatgrunnlaget: ${esc(err.message||err)}</p>`;}
  }

  document.addEventListener('click',ev=>{
    const i=basisIndexFromClick(ev.target);if(i==null)return;
    ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
    openNew(i);
  },true);
})();
