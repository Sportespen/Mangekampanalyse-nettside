(function(){
  const cache=new Map();
  let timer=0;
  const EVENTS=['100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m','100mh','200m','800m'];
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/gi,'ae').replace(/ø/gi,'o').replace(/å/gi,'a').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function activeType(){return document.querySelector('.event-switch-btn.active')?.dataset?.type||'men';}
  function fmt(ev,v){const n=Number(v);if(!Number.isFinite(n))return '—';if(ev==='1500m'||ev==='800m'){const m=Math.floor(n/60),s=(n-m*60).toFixed(2).padStart(5,'0');return `${m}:${s}`.replace('.',',');}return n.toFixed(2).replace('.',',');}
  function identity(){const c=document.querySelector('#modalContent'),h=c?.querySelector('h2');if(!h||/Hva hvis/i.test(h.textContent))return null;const title=h.textContent.trim();const ev=EVENTS.find(x=>title.endsWith(`– ${x}`)||title.endsWith(`- ${x}`));if(!ev)return null;const name=title.slice(0,title.lastIndexOf(ev)).replace(/[–-]\s*$/,'').trim();return name?{name,ev}:null;}
  async function dataFor(name){const type=activeType(),key=`${type}|${norm(name)}`;if(cache.has(key))return cache.get(key);const p=(async()=>{try{const s=await fetch(`/api/athlete-search-v2?action=search&type=${encodeURIComponent(type)}&q=${encodeURIComponent(name)}`,{cache:'no-store'}),sd=await s.json();if(!s.ok)return null;const list=Array.isArray(sd.athletes)?sd.athletes:[],hit=list.find(x=>norm(x.name)===norm(name))||list[0];if(!hit?.id)return null;const a=await fetch(`/api/athlete-search-v2?action=analyse&type=${encodeURIComponent(type)}&id=${encodeURIComponent(hit.id)}&name=${encodeURIComponent(hit.name||name)}`,{cache:'no-store'}),ad=await a.json();return a.ok?ad:null;}catch(_){return null;}})();cache.set(key,p);return p;}
  function summaryBox(content){const label=[...content.querySelectorAll('small')].find(x=>x.textContent.trim()==='Forventet resultat');return label?.parentElement||null;}
  async function apply(){
    const modal=document.querySelector('#modal'),content=document.querySelector('#modalContent');if(!modal?.classList.contains('open')||!content)return;
    const id=identity();if(!id)return;
    const box=summaryBox(content);if(!box)return;
    const expected=(box.dataset.expectedValue||box.querySelector('.basis-expected-value')?.textContent||box.querySelector('b')?.textContent||'—').trim();box.dataset.expectedValue=expected;
    const card=modal.querySelector('.modal-card');if(card){card.style.width='min(650px,calc(100vw - 24px))';card.style.maxWidth='650px';card.style.padding='14px 16px 16px';card.style.maxHeight='calc(100vh - 24px)';card.style.overflowY='auto';}
    box.style.cssText='margin-top:10px;padding:10px 12px;background:#102a45;border-radius:8px;display:grid!important;grid-template-columns:1fr 1fr!important;align-items:end!important;gap:16px!important';
    if(!box.querySelector('.basis-expected-col')){
      box.innerHTML=`<div class="basis-expected-col"><small style="display:block;color:#9fb2c6;font-size:12px">Forventet resultat</small><b class="basis-expected-value" style="display:block;font-size:23px;line-height:1.15;margin-top:2px">${expected}</b></div><div class="basis-pb-col" style="text-align:right"><small style="display:block;color:#9fb2c6;font-size:12px">PB</small><b class="basis-pb-value" style="display:block;font-size:23px;line-height:1.15;margin-top:2px">…</b></div>`;
    }
    const data=await dataFor(id.name),pb=data?.pbs?.[id.ev]?.mark;
    if(!document.querySelector('#modal')?.classList.contains('open'))return;
    const current=identity();if(!current||norm(current.name)!==norm(id.name)||current.ev!==id.ev)return;
    const target=summaryBox(document.querySelector('#modalContent'))?.querySelector('.basis-pb-value');if(target)target.textContent=fmt(id.ev,pb);
  }
  function cleanRow(){document.querySelectorAll('#athleteCompareOutput .compare-pb,#athleteCompareOutput .compare-pb-total').forEach(x=>x.remove());}
  function schedule(){clearTimeout(timer);timer=setTimeout(apply,20);}
  document.addEventListener('click',()=>{cleanRow();schedule();setTimeout(apply,120);setTimeout(apply,450);setTimeout(apply,1000);},true);
  new MutationObserver(()=>{cleanRow();if(document.querySelector('#modal')?.classList.contains('open'))schedule();}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  cleanRow();
})();
