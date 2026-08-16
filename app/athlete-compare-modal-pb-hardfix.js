(function(){
  if(window.__compareModalPbSimpleV3)return;window.__compareModalPbSimpleV3=true;
  const cache=new Map();
  const EVENTS=['100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m','100mh','200m','800m'];
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/gi,'ae').replace(/ø/gi,'o').replace(/å/gi,'a').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function activeType(){return document.querySelector('.event-switch-btn.active')?.dataset?.type||'men';}
  function fmt(ev,v){const n=Number(v);if(!Number.isFinite(n))return '—';if(ev==='1500m'||ev==='800m'){const m=Math.floor(n/60),s=(n-m*60).toFixed(2).padStart(5,'0');return `${m}:${s}`.replace('.',',');}return n.toFixed(2).replace('.',',');}
  function identity(){const h=document.querySelector('#modalContent > h2');if(!h||/Hva hvis/i.test(h.textContent))return null;const title=h.textContent.trim();const ev=EVENTS.find(x=>title.endsWith(`– ${x}`)||title.endsWith(`- ${x}`));if(!ev)return null;const name=title.slice(0,title.lastIndexOf(ev)).replace(/[–-]\s*$/,'').trim();return name?{name,ev}:null;}
  async function dataFor(name){const type=activeType(),key=`${type}|${norm(name)}`;if(cache.has(key))return cache.get(key);const p=(async()=>{try{const s=await fetch(`/api/athlete-search-v2?action=search&type=${encodeURIComponent(type)}&q=${encodeURIComponent(name)}`,{cache:'no-store'}),sd=await s.json();if(!s.ok)return null;const list=Array.isArray(sd.athletes)?sd.athletes:[],hit=list.find(x=>norm(x.name)===norm(name))||list[0];if(!hit?.id)return null;const a=await fetch(`/api/athlete-search-v2?action=analyse&type=${encodeURIComponent(type)}&id=${encodeURIComponent(hit.id)}&name=${encodeURIComponent(hit.name||name)}`,{cache:'no-store'}),ad=await a.json();return a.ok?ad:null;}catch(_){return null;}})();cache.set(key,p);return p;}
  function originalSummary(content){return [...content.children].find(el=>el.tagName==='DIV'&&el.querySelector(':scope > small')?.textContent.trim()==='Forventet resultat')||null;}
  async function apply(){
    const modal=document.querySelector('#modal'),content=document.querySelector('#modalContent');if(!modal?.classList.contains('open')||!content)return;
    if(content.dataset.pbPopupDone==='1')return;
    const id=identity();if(!id)return;
    const box=originalSummary(content);if(!box)return;
    content.dataset.pbPopupDone='1';
    const expected=box.querySelector(':scope > b')?.textContent.trim()||'—';
    const card=modal.querySelector('.modal-card');
    if(card){card.style.setProperty('width','min(820px,calc(100vw - 24px))','important');card.style.setProperty('max-width','820px','important');card.style.setProperty('height','auto','important');card.style.setProperty('min-height','0','important');card.style.setProperty('max-height','90vh','important');card.style.setProperty('overflow-y','auto','important');card.style.setProperty('padding','18px 22px 20px','important');}
    box.style.cssText='margin-top:14px!important;padding:14px 18px!important;background:#102a45!important;border-radius:10px!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:0!important;align-items:center!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important';
    box.innerHTML=`<div style="padding-right:18px"><small style="display:block;color:#9fb2c6;font-size:12px">Forventet resultat</small><b style="display:block;font-size:24px;line-height:1.1;margin-top:4px">${expected}</b></div><div style="padding-left:18px;border-left:1px solid #456783"><small style="display:block;color:#9fb2c6;font-size:12px">PB</small><b class="basis-pb-value" style="display:block;font-size:24px;line-height:1.1;margin-top:4px">…</b></div>`;
    const data=await dataFor(id.name),pb=data?.pbs?.[id.ev]?.mark;
    if(!modal.classList.contains('open'))return;
    const target=content.querySelector('.basis-pb-value');if(target)target.textContent=fmt(id.ev,pb);
  }
  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('[data-basis]')){setTimeout(apply,0);setTimeout(apply,80);setTimeout(apply,250);}
  },true);
})();
