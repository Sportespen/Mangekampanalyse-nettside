(function(){
  if(window.__athleteNameAutocompleteV2)return;
  window.__athleteNameAutocompleteV2=true;
  let timer=0,seq=0;
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function type(){return document.querySelector('.event-switch-btn.active')?.dataset?.type||'men';}
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/gi,'ae').replace(/ø/gi,'o').replace(/å/gi,'a').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  async function choose(a,input,btn,results){
    input.value=a.name;results.style.display='none';btn.click();
    const wanted=norm(a.name),started=Date.now();
    const wait=setInterval(()=>{
      const hit=[...document.querySelectorAll('#athleteCompareResults button')].find(b=>norm(b.dataset.name||b.textContent)===wanted);
      if(hit){clearInterval(wait);hit.click();}
      else if(Date.now()-started>7000)clearInterval(wait);
    },100);
  }
  async function suggest(input,btn,results,status){
    const q=input.value.trim(),my=++seq;if(q.length<2){results.style.display='none';return;}
    if(status)status.textContent='Søker etter navn…';
    try{
      const r=await fetch(`/api/athlete-name-search?type=${encodeURIComponent(type())}&q=${encodeURIComponent(q)}`,{cache:'no-store'}),d=await r.json();
      if(my!==seq)return;
      const list=Array.isArray(d.athletes)?d.athletes:[];
      if(!list.length){results.style.display='none';if(status)status.textContent='Ingen relevante mangekamputøvere funnet.';return;}
      if(status)status.textContent=`${list.length} treff – velg utøver:`;
      results.innerHTML=list.map(a=>`<button type="button" data-suggest-id="${esc(a.id)}" style="display:block;width:100%;text-align:left;padding:11px 14px;border:0;border-bottom:1px solid #1f405d;background:#0c243d;color:#fff;cursor:pointer"><b>${esc(a.name)}</b><span style="display:block;color:#9fb2c6;font-size:13px;margin-top:2px">${esc(a.nation||'')}${a.birth?' • '+esc(a.birth):''} • ${esc(a.discipline||'')}</span></button>`).join('');
      results.style.display='block';
      [...results.querySelectorAll('[data-suggest-id]')].forEach((b,i)=>b.onclick=()=>choose(list[i],input,btn,results));
    }catch(_){if(my===seq){results.style.display='none';btn.click();}}
  }
  function bind(){
    const input=document.querySelector('#athleteCompareSearch'),btn=document.querySelector('#athleteCompareBtn'),results=document.querySelector('#athleteCompareResults'),status=document.querySelector('#athleteCompareStatus');
    if(!input||!btn||!results||input.dataset.autocompleteV2==='1')return;
    input.dataset.autocompleteV2='1';results.style.maxHeight='390px';results.style.overflowY='auto';
    input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>suggest(input,btn,results,status),250);});
    input.addEventListener('focus',()=>{if(results.children.length&&input.value.trim().length>=2)results.style.display='block';});
  }
  new MutationObserver(bind).observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
