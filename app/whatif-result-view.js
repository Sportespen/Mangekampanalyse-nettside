(function(){
  function storageKey(){return `mangekamp_compare_state_${typeof currentType==='string'?currentType:'men'}`;}
  function clearScenarioFields(){
    try{sessionStorage.removeItem(storageKey());}catch(_e){}
    document.querySelectorAll('#modalContent [data-whatif]').forEach(inp=>{
      inp.disabled=false;
      inp.value='';
      inp.dispatchEvent(new Event('input',{bubbles:true}));
    });
    const total=document.querySelector('#whatIfTotal');
    const diff=document.querySelector('#whatIfDiff');
    const base=[...document.querySelectorAll('#modalContent small')].find(x=>x.textContent.trim()==='Ordinær prognose')?.parentElement?.querySelector('b')?.textContent?.trim();
    if(total&&base)total.textContent=base;
    if(diff)diff.textContent='0';
    document.querySelectorAll('#modalContent [data-whatif]').forEach(inp=>{
      const row=inp.parentElement;
      row.style.background='';row.style.borderLeft='';row.style.paddingLeft='';
    });
    document.querySelector('#whatIfAppliedSummary')?.remove();
  }
  function applied(){
    const modal=document.querySelector('#modal');
    const content=document.querySelector('#modalContent');
    return !!(modal&&content&&content.querySelector('[data-whatif]'));
  }
  function resultView(){
    if(!applied())return;
    const modal=document.querySelector('#modal');
    const content=document.querySelector('#modalContent');
    const total=content.querySelector('#whatIfTotal')?.textContent?.trim()||'—';
    const diff=content.querySelector('#whatIfDiff')?.textContent?.trim()||'—';
    const base=[...content.querySelectorAll('small')].find(x=>x.textContent.trim()==='Ordinær prognose')?.parentElement?.querySelector('b')?.textContent?.trim()||'—';
    content.querySelectorAll('[data-whatif]').forEach(inp=>{
      const row=inp.parentElement;
      if(String(inp.value||'').trim()){
        row.style.background='#152545';
        row.style.borderLeft='3px solid #6f4cff';
        row.style.paddingLeft='10px';
      }
      inp.disabled=true;
    });
    const oldButtons=content.querySelector('#whatIfReset')?.parentElement;
    if(oldButtons)oldButtons.innerHTML=`<button id="whatIfAdjust" type="button" style="padding:10px 14px;border:1px solid #6f4cff;border-radius:8px;background:#6f4cff;color:#fff;font-weight:900;cursor:pointer">Juster scenario</button><button id="whatIfReset2" type="button" style="padding:10px 14px;border:1px solid #456783;border-radius:8px;background:#0d2743;color:#fff;font-weight:800;cursor:pointer">Nullstill</button><button id="whatIfDone" type="button" style="padding:10px 14px;border:1px solid #456783;border-radius:8px;background:#102a45;color:#fff;font-weight:900;cursor:pointer">Ferdig</button>`;
    let summary=content.querySelector('#whatIfAppliedSummary');
    if(!summary){summary=document.createElement('div');summary.id='whatIfAppliedSummary';summary.style.cssText='margin:16px 0 4px;padding:14px 16px;border:1px solid #6f4cff;border-radius:9px;background:#151c3b';const p=oldButtons?.parentElement||content;p.insertBefore(summary,oldButtons||null);}
    summary.innerHTML=`<div style="font-weight:900;font-size:17px;margin-bottom:8px">Scenario klart</div><div style="display:flex;gap:22px;flex-wrap:wrap"><span>Ordinær prognose <b>${base}</b></span><span>Ny prognose <b style="font-size:20px">${total}</b></span><span>Endring <b>${diff}</b></span></div>`;
    modal.classList.add('open');
    content.querySelector('#whatIfAdjust')?.addEventListener('click',()=>{
      content.querySelectorAll('[data-whatif]').forEach(inp=>inp.disabled=false);
      summary.remove();
      const holder=content.querySelector('#whatIfAdjust')?.parentElement;
      if(holder)holder.innerHTML=`<button id="whatIfReset" type="button" style="padding:10px 14px;border:1px solid #456783;border-radius:8px;background:#0d2743;color:#fff;font-weight:800;cursor:pointer">Nullstill</button><button id="whatIfApply" type="button" style="padding:10px 14px;border:0;border-radius:8px;background:#6f4cff;color:#fff;font-weight:900;cursor:pointer">Bruk scenario</button>`;
    });
    content.querySelector('#whatIfReset2')?.addEventListener('click',clearScenarioFields);
    content.querySelector('#whatIfDone')?.addEventListener('click',()=>modal.classList.remove('open'));
  }
  document.addEventListener('click',ev=>{
    const reset=ev.target.closest?.('#whatIfReset');
    if(reset){
      ev.preventDefault();
      ev.stopImmediatePropagation();
      clearScenarioFields();
      return;
    }
    if(ev.target.closest?.('#whatIfApply'))setTimeout(resultView,20);
  },true);
})();
