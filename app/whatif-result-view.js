(function(){
  function isWhatIf(){return !!document.querySelector('#modalContent [data-whatif]');}
  function baseTotal(){const c=document.querySelector('#modalContent');return [...(c?.querySelectorAll('small')||[])].find(x=>x.textContent.trim()==='Ordinær prognose')?.parentElement?.querySelector('b')?.textContent?.trim()||'—';}
  function resetCurrent(){
    const content=document.querySelector('#modalContent');if(!content)return;
    content.querySelectorAll('[data-whatif]').forEach(inp=>{inp.value='';inp.dispatchEvent(new Event('input',{bubbles:true}));});
    const total=content.querySelector('#whatIfTotal');if(total)total.textContent=baseTotal();
    const diff=content.querySelector('#whatIfDiff');if(diff)diff.textContent='0';
  }
  function simplifyModal(){
    if(!isWhatIf())return;
    const content=document.querySelector('#modalContent');
    const apply=content.querySelector('#whatIfApply');
    if(apply){apply.textContent='Ferdig';apply.title='Lukk vinduet og behold scenarioet';}
    const reset=content.querySelector('#whatIfReset');if(reset)reset.textContent='Nullstill';
  }
  function enhanceScenarioLine(){
    const out=document.querySelector('#athleteCompareOutput');if(!out)return;
    const note=[...out.querySelectorAll('div')].find(d=>d.firstElementChild?.tagName==='B'&&d.firstElementChild.textContent.trim()==='Hva hvis-scenario:');
    if(!note||note.dataset.enhanced==='1')return;
    note.dataset.enhanced='1';
    const txt=note.textContent;
    const total=(txt.match(/Hva hvis-scenario:\s*(\d+)/)||[])[1]||'—';
    const diff=(txt.match(/\(([+-]?\d+)\)/)||[])[1]||'—';
    const reset=note.querySelector('#scenarioReset');
    if(reset){reset.textContent='Nullstill';reset.style.marginLeft='8px';}
    const edit=document.createElement('button');edit.type='button';edit.id='scenarioEdit';edit.textContent='Endre scenario';edit.style.cssText='margin-left:10px;padding:6px 10px;border:1px solid #6f4cff;border-radius:6px;background:#6f4cff;color:#fff;font-weight:800;cursor:pointer';
    edit.onclick=()=>document.querySelector('#whatIfBtn')?.click();
    if(reset)note.insertBefore(edit,reset);else note.appendChild(edit);
    const b=note.querySelector('b');if(b)b.textContent='Aktivt scenario ·';
    const span=note.querySelector('span');if(span)span.textContent=`${diff==='—'?'':(Number(diff)>=0?'+':'')+Number(diff)} mot ordinær prognose`;
    [...note.childNodes].forEach(n=>{if(n.nodeType===Node.TEXT_NODE&&n.textContent.includes('poeng'))n.textContent=` ${total} poeng · `;});
  }
  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('#whatIfReset'))setTimeout(resetCurrent,0);
    if(ev.target.closest?.('#whatIfApply'))setTimeout(enhanceScenarioLine,30);
    if(ev.target.closest?.('#scenarioReset'))setTimeout(()=>{document.querySelector('#athleteCompareOutput div[data-enhanced="1"]')?.remove();},20);
    if(ev.target.closest?.('#whatIfBtn'))setTimeout(simplifyModal,0);
  },true);
  const mo=new MutationObserver(()=>{simplifyModal();enhanceScenarioLine();});
  function start(){mo.observe(document.body,{subtree:true,childList:true});simplifyModal();enhanceScenarioLine();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
