(function(){
  function isWhatIf(){return !!document.querySelector('#modalContent [data-whatif]');}
  function resetCurrent(){
    const content=document.querySelector('#modalContent');
    if(!content)return;
    try{sessionStorage.removeItem(`mangekamp_compare_state_${typeof currentType==='string'?currentType:'men'}`);}catch(_e){}
    content.querySelectorAll('[data-whatif]').forEach(inp=>{
      inp.disabled=false;
      inp.value='';
      inp.dispatchEvent(new Event('input',{bubbles:true}));
    });
    const base=[...content.querySelectorAll('small')].find(x=>x.textContent.trim()==='Ordinær prognose')?.parentElement?.querySelector('b')?.textContent?.trim()||'—';
    const total=content.querySelector('#whatIfTotal');if(total)total.textContent=base;
    const diff=content.querySelector('#whatIfDiff');if(diff)diff.textContent='0';
  }
  function keepOpenAfterApply(){
    if(!isWhatIf())return;
    const modal=document.querySelector('#modal');
    const content=document.querySelector('#modalContent');
    content.querySelector('#whatIfAppliedSummary')?.remove();
    content.querySelectorAll('[data-whatif]').forEach(inp=>inp.disabled=false);
    const apply=content.querySelector('#whatIfApply');
    const reset=content.querySelector('#whatIfReset');
    const holder=apply?.parentElement||reset?.parentElement;
    if(holder){
      holder.innerHTML=`<button id="whatIfReset" type="button" style="padding:10px 14px;border:1px solid #456783;border-radius:8px;background:#0d2743;color:#fff;font-weight:800;cursor:pointer">Nullstill</button><button id="whatIfDone" type="button" style="padding:10px 14px;border:1px solid #456783;border-radius:8px;background:#102a45;color:#fff;font-weight:900;cursor:pointer">Ferdig</button>`;
      holder.querySelector('#whatIfReset').onclick=resetCurrent;
      holder.querySelector('#whatIfDone').onclick=()=>modal.classList.remove('open');
    }
    modal.classList.add('open');
  }
  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('#whatIfApply'))setTimeout(keepOpenAfterApply,20);
    if(ev.target.closest?.('#whatIfReset'))setTimeout(resetCurrent,0);
  },true);
})();
