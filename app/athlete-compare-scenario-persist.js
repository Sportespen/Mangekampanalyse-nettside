(function(){
  const type=()=>typeof currentType==='string'?currentType:'men';
  const key=()=>`mangekamp_compare_state_${type()}`;
  let suppressCapture=false;

  function read(){try{return JSON.parse(sessionStorage.getItem(key())||'null');}catch(_e){return null;}}
  function write(v){try{sessionStorage.setItem(key(),JSON.stringify(v));}catch(_e){}}
  function clear(){try{sessionStorage.removeItem(key());}catch(_e){}}
  function selectedName(){return document.querySelector('#athleteCompareOutput h3')?.textContent?.trim()||'';}
  function hideSearch(){const results=document.querySelector('#athleteCompareResults');if(results){results.style.display='none';results.innerHTML='';}}
  function scenarioValues(){const values={};document.querySelectorAll('[data-whatif]').forEach(inp=>{const v=String(inp.value||'').trim();if(v)values[String(inp.dataset.whatif)]=v;});return values;}
  function capture(){
    if(suppressCapture)return;
    const name=selectedName();if(!name)return;
    const old=read()||{},values=scenarioValues();
    write({name,values:Object.keys(values).length?values:(old.values||{}),updatedAt:Date.now()});
  }
  function clearScenarioKeepAthlete(){
    const name=selectedName()||read()?.name||'';
    suppressCapture=true;
    clear();
    document.querySelectorAll('[data-whatif]').forEach(inp=>{inp.value='';});
    if(name)write({name,values:{},updatedAt:Date.now()});
    setTimeout(()=>{suppressCapture=false;},250);
  }

  document.addEventListener('input',ev=>{if(ev.target?.matches?.('[data-whatif]'))capture();},true);
  document.addEventListener('click',ev=>{
    const pick=ev.target.closest?.('#athleteCompareResults button[data-name]');
    if(pick){write({name:pick.dataset.name,values:{},updatedAt:Date.now()});setTimeout(hideSearch,0);}
    if(ev.target.closest?.('#whatIfBtn,[data-basis]'))hideSearch();
    if(ev.target.closest?.('#whatIfApply,#whatIfDone'))setTimeout(()=>{capture();hideSearch();},0);
    if(ev.target.closest?.('#scenarioReset,#whatIfReset'))clearScenarioKeepAthlete();
    if(ev.target.closest?.('#removeCompareBtn')){suppressCapture=true;clear();setTimeout(()=>{suppressCapture=false;},250);}
  },true);

  const mo=new MutationObserver(()=>{if(selectedName()){capture();hideSearch();}});
  function start(){try{localStorage.removeItem('mangekamp_compare_state_men');localStorage.removeItem('mangekamp_compare_state_women');}catch(_e){}mo.observe(document.body,{subtree:true,childList:true});hideSearch();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
