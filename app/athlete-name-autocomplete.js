(function(){
  if(window.__athleteNameAutocompleteV5)return;
  window.__athleteNameAutocompleteV5=true;
  let timer=0,seq=0,indexPromise=null;
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function type(){return document.querySelector('.event-switch-btn.active')?.dataset?.type||'men';}
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/gi,'ae').replace(/ø/gi,'o').replace(/å/gi,'a').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function tokens(s){return norm(s).split(' ').filter(Boolean);}
  function rank(name,q){const n=norm(name),qt=tokens(q),nt=tokens(name);if(n===norm(q))return 0;if(qt.length===1&&nt.includes(qt[0]))return 1;if(qt.every(x=>nt.some(y=>y===x)))return 2;if(qt.every(x=>nt.some(y=>y.startsWith(x))))return 3;if(qt.every(x=>nt.some(y=>y.includes(x))))return 4;return 9;}
  function matches(name,q){const nt=tokens(name),qt=tokens(q);return qt.length&&qt.every(x=>nt.some(y=>y===x||y.startsWith(x)||y.includes(x)));}
  function loadIndex(){
    if(!indexPromise) indexPromise=fetch('/app/data/athlete-name-index.json',{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('index');return r.json();});
    return indexPromise;
  }
  async function choose(a,input,btn,results){
    input.value=a.name;results.style.display='none';
    btn.click();
    const wanted=norm(a.name),started=Date.now();
    const wait=setInterval(()=>{
      const hit=[...document.querySelectorAll('#athleteCompareResults button')].find(b=>norm(b.dataset.name||b.textContent)===wanted);
      if(hit){clearInterval(wait);hit.click();}
      else if(Date.now()-started>5000)clearInterval(wait);
    },60);
  }
  function render(list,input,btn,results,status){
    if(!list.length){results.style.display='none';if(status)status.textContent='Ingen relevante mangekamputøvere funnet.';return;}
    if(status)status.textContent=`${list.length} treff – velg utøver:`;
    results.innerHTML=list.map(a=>`<button type="button" data-suggest-id="${esc(a.id)}" style="display:block;width:100%;text-align:left;padding:11px 14px;border:0;border-bottom:1px solid #1f405d;background:#0c243d;color:#fff;cursor:pointer"><b>${esc(a.name)}</b><span style="display:block;color:#9fb2c6;font-size:13px;margin-top:2px">${esc(a.nation||'')}${a.birth?' • '+esc(a.birth):''}${(a.nation||a.birth)?' • ':''}${esc(a.discipline||'')}</span></button>`).join('');
    results.style.display='block';
    [...results.querySelectorAll('[data-suggest-id]')].forEach((b,i)=>b.onclick=()=>choose(list[i],input,btn,results));
  }
  async function suggest(input,btn,results,status){
    const q=input.value.trim(),my=++seq,currentType=type();
    if(q.length<2){results.style.display='none';return;}
    try{
      const idx=await loadIndex();if(my!==seq||type()!==currentType)return;
      const source=Array.isArray(idx?.[currentType])?idx[currentType]:[];
      const list=source.filter(a=>a?.name&&matches(a.name,q)).sort((a,b)=>rank(a.name,q)-rank(b.name,q)||a.name.localeCompare(b.name,'nb')).slice(0,40);
      if(list.length){render(list,input,btn,results,status);return;}
    }catch(_){/* ordinary search remains available */}
  }
  function bind(){
    const input=document.querySelector('#athleteCompareSearch'),btn=document.querySelector('#athleteCompareBtn'),results=document.querySelector('#athleteCompareResults'),status=document.querySelector('#athleteCompareStatus');
    if(!input||!btn||!results||input.dataset.autocompleteV5==='1')return;
    input.dataset.autocompleteV5='1';results.style.maxHeight='390px';results.style.overflowY='auto';
    loadIndex().catch(()=>{});
    input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>suggest(input,btn,results,status),70);});
    input.addEventListener('focus',()=>{if(results.children.length&&input.value.trim().length>=2)results.style.display='block';});
  }
  document.addEventListener('click',e=>{
    if(!e.target.closest?.('.event-switch-btn'))return;
    seq++;
    clearTimeout(timer);
    const results=document.querySelector('#athleteCompareResults'),input=document.querySelector('#athleteCompareSearch'),status=document.querySelector('#athleteCompareStatus');
    if(results){results.innerHTML='';results.style.display='none';}
    if(status)status.textContent='';
    setTimeout(()=>{bind();const btn=document.querySelector('#athleteCompareBtn'),r=document.querySelector('#athleteCompareResults'),s=document.querySelector('#athleteCompareStatus');if(input&&btn&&r&&input.value.trim().length>=2)suggest(input,btn,r,s);},40);
  },true);
  new MutationObserver(bind).observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  loadIndex().catch(()=>{});
})();
