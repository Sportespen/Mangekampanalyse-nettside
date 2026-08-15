(function(){
  const type=()=>typeof currentType==='string'?currentType:'men';
  const key=()=>`mangekamp_compare_state_${type()}`;
  let restoring=false;
  let timer=null;

  function read(){try{return JSON.parse(localStorage.getItem(key())||'null');}catch(_e){return null;}}
  function write(v){try{localStorage.setItem(key(),JSON.stringify(v));}catch(_e){}}
  function clear(){try{localStorage.removeItem(key());}catch(_e){}}
  function selectedName(){return document.querySelector('#athleteCompareOutput h3')?.textContent?.trim()||'';}
  function hideSearch(){
    const input=document.querySelector('#athleteCompareSearch');
    const results=document.querySelector('#athleteCompareResults');
    if(input)input.value='';
    if(results)results.style.display='none';
  }
  function scenarioValues(){const values={};document.querySelectorAll('[data-whatif]').forEach(inp=>{const v=String(inp.value||'').trim();if(v)values[String(inp.dataset.whatif)]=v;});return values;}
  function capture(){
    const name=selectedName();
    if(!name)return;
    const old=read()||{};
    const values=scenarioValues();
    write({name,values:Object.keys(values).length?values:(old.values||{}),updatedAt:Date.now()});
  }
  function restoreSelection(saved){
    const input=document.querySelector('#athleteCompareSearch');
    const btn=document.querySelector('#athleteCompareBtn');
    if(!saved?.name||!input||!btn)return false;
    if(selectedName()===saved.name){hideSearch();return true;}
    input.value=saved.name;
    btn.click();
    setTimeout(()=>{
      const target=[...document.querySelectorAll('#athleteCompareResults button[data-name]')].find(b=>b.dataset.name===saved.name);
      if(target)target.click();
      setTimeout(hideSearch,50);
      schedule(700);
    },500);
    return false;
  }
  function restoreScenario(saved){
    if(!saved?.values||!Object.keys(saved.values).length)return;
    if(document.querySelector('#athleteCompareOutput')?.textContent?.includes('Hva hvis-scenario:'))return;
    const whatIf=document.querySelector('#whatIfBtn');
    if(!whatIf)return;
    hideSearch();
    whatIf.click();
    setTimeout(()=>{
      Object.entries(saved.values).forEach(([i,v])=>{
        const inp=document.querySelector(`[data-whatif="${i}"]`);
        if(!inp)return;
        inp.value=v;
        inp.dispatchEvent(new Event('input',{bubbles:true}));
      });
      document.querySelector('#whatIfApply')?.click();
    },100);
  }
  function restore(){
    if(restoring)return;
    const saved=read();
    if(!saved?.name)return;
    restoring=true;
    const ready=restoreSelection(saved);
    if(ready)restoreScenario(saved);
    setTimeout(()=>{restoring=false;hideSearch();},900);
  }
  function schedule(delay=150){clearTimeout(timer);timer=setTimeout(restore,delay);}

  document.addEventListener('input',ev=>{if(ev.target?.matches?.('[data-whatif]'))capture();},true);
  document.addEventListener('click',ev=>{
    const pick=ev.target.closest?.('#athleteCompareResults button[data-name]');
    if(pick){write({name:pick.dataset.name,values:{},updatedAt:Date.now()});setTimeout(hideSearch,0);}
    if(ev.target.closest?.('#whatIfBtn,[data-basis]'))hideSearch();
    if(ev.target.closest?.('#whatIfApply'))setTimeout(()=>{capture();hideSearch();},0);
    if(ev.target.closest?.('#scenarioReset')){const s=read();if(s?.name)write({name:s.name,values:{},updatedAt:Date.now()});}
    if(ev.target.closest?.('#removeCompareBtn'))clear();
  },true);

  document.addEventListener('visibilitychange',()=>{if(document.hidden)capture();else schedule(180);});
  window.addEventListener('pagehide',capture);
  window.addEventListener('pageshow',()=>schedule(200));

  const mo=new MutationObserver(()=>{
    if(selectedName())capture();
    if(!document.querySelector('#athleteCompareBox')||!selectedName())schedule(120);
  });
  function start(){mo.observe(document.body,{subtree:true,childList:true});hideSearch();schedule(300);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
