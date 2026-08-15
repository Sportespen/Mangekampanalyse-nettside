(function(){
  const cache=new Map();
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/gi,'ae').replace(/ø/gi,'o').replace(/å/gi,'a').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function activeType(){return document.querySelector('.event-switch-btn.active')?.dataset?.type||'men';}
  function fmt(ev,v){const n=Number(v);if(!Number.isFinite(n))return '—';if(ev==='1500m'||ev==='800m'){const m=Math.floor(n/60),s=(n-m*60).toFixed(2).padStart(5,'0');return `${m}:${s}`.replace('.',',');}return n.toFixed(2).replace('.',',');}
  function identity(){const c=document.querySelector('#modalContent'),h=c?.querySelector('h2');if(!h||/Hva hvis/i.test(h.textContent))return null;const title=h.textContent.trim(),events=window.D?.events||[];const ev=events.find(x=>title.endsWith(`– ${x}`)||title.endsWith(`- ${x}`));if(!ev)return null;const name=title.slice(0,title.lastIndexOf(ev)).replace(/[–-]\s*$/,'').trim();return name?{name,ev}:null;}
  async function dataFor(name){const type=activeType(),key=`${type}|${norm(name)}`;if(cache.has(key))return cache.get(key);const p=(async()=>{try{const s=await fetch(`/api/athlete-search-v2?action=search&type=${encodeURIComponent(type)}&q=${encodeURIComponent(name)}`,{cache:'no-store'}),sd=await s.json();if(!s.ok)return null;const list=Array.isArray(sd.athletes)?sd.athletes:[],hit=list.find(x=>norm(x.name)===norm(name))||list[0];if(!hit?.id)return null;const a=await fetch(`/api/athlete-search-v2?action=analyse&type=${encodeURIComponent(type)}&id=${encodeURIComponent(hit.id)}&name=${encodeURIComponent(hit.name||name)}`,{cache:'no-store'}),ad=await a.json();return a.ok?ad:null;}catch(_){return null;}})();cache.set(key,p);return p;}
  async function apply(){
    const modal=document.querySelector('#modal'),content=document.querySelector('#modalContent');if(!modal?.classList.contains('open')||!content)return;
    const id=identity();if(!id)return;
    const label=[...content.querySelectorAll('small')].find(x=>x.textContent.trim()==='Forventet resultat');if(!label)return;
    const box=label.parentElement;if(!box)return;
    const expected=(box.dataset.expectedValue||box.querySelector('b')?.textContent||'—').trim();box.dataset.expectedValue=expected;
    box.style.cssText+=';display:grid!important;grid-template-columns:1fr 1fr!important;align-items:end!important;gap:16px!important';
    let left=box.querySelector('.basis-expected-col'),right=box.querySelector('.basis-pb-col');
    if(!left){box.innerHTML='';left=document.createElement('div');left.className='basis-expected-col';left.innerHTML=`<small style="display:block;color:#9fb2c6">Forventet resultat</small><b style="display:block;font-size:22px">${expected}</b>`;right=document.createElement('div');right.className='basis-pb-col';right.style.textAlign='right';right.innerHTML='<small style="display:block;color:#9fb2c6">PB</small><b class="basis-pb-value" style="display:block;font-size:22px">…</b>';box.append(left,right);}
    const data=await dataFor(id.name),pb=data?.pbs?.[id.ev]?.mark,target=box.querySelector('.basis-pb-value');if(target?.isConnected)target.textContent=fmt(id.ev,pb);
    const card=modal.querySelector('.modal-card');if(card){card.style.width='min(720px,calc(100vw - 24px))';card.style.maxWidth='720px';}
  }
  function cleanRow(){document.querySelectorAll('#athleteCompareOutput .compare-pb,#athleteCompareOutput .compare-pb-total').forEach(x=>x.remove());}
  document.addEventListener('click',()=>{cleanRow();setTimeout(apply,0);setTimeout(apply,80);setTimeout(apply,250);},true);
  new MutationObserver(()=>{cleanRow();if(document.querySelector('#modal')?.classList.contains('open'))apply();}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  cleanRow();
})();
