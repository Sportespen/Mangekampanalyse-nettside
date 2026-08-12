(function(){
  let inFlight=false;
  let lastSuccessful=null;

  function button(){
    return document.querySelector('button[aria-label="Oppdater live-resultater"]');
  }

  function setButton(text,disabled){
    const b=button();
    if(!b)return;
    b.disabled=!!disabled;
    b.textContent=text;
  }

  function normalizeName(value){
    return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,' ').trim().toLowerCase();
  }

  function mergeResults(oldResults={},newResults={}){
    const byKey=new Map();
    for(const [name,value] of Object.entries(oldResults||{})){
      byKey.set(normalizeName(name),{name,value:{...(value||{})}});
    }
    for(const [name,value] of Object.entries(newResults||{})){
      const key=normalizeName(name);
      const old=byKey.get(key);
      // New fields overwrite old fields, but absent fields NEVER delete an
      // already observed result. This protects against partial EA snapshots.
      byKey.set(key,{
        name:old?.name||name,
        value:{...(old?.value||{}),...(value||{})}
      });
    }
    const out={};
    for(const entry of byKey.values())out[entry.name]=entry.value;
    return out;
  }

  function mergeSection(oldSection={},newSection={}){
    return {
      ...oldSection,
      ...newSection,
      completedEvents:Math.max(Number(oldSection.completedEvents||0),Number(newSection.completedEvents||0)),
      results:mergeResults(oldSection.results,newSection.results),
      eventStatus:{...(oldSection.eventStatus||{}),...(newSection.eventStatus||{})},
      eventHasMarks:{...(oldSection.eventHasMarks||{}),...(newSection.eventHasMarks||{})}
    };
  }

  function mergeLive(oldLive={},newLive={}){
    if(!oldLive||typeof oldLive!=='object')return newLive;
    if(!newLive||typeof newLive!=='object')return oldLive;
    return {
      ...oldLive,
      ...newLive,
      men:mergeSection(oldLive.men||{},newLive.men||{}),
      women:mergeSection(oldLive.women||{},newLive.women||{})
    };
  }

  // Guard the global live object. Any later assignment, whether it comes from
  // the API or a fallback/static script, is merged rather than replacing a
  // more complete snapshot.
  let guardedLive=window.MANGEKAMP_LIVE||{};
  try{
    Object.defineProperty(window,'MANGEKAMP_LIVE',{
      configurable:true,
      get(){return guardedLive;},
      set(next){guardedLive=mergeLive(guardedLive,next||{});}
    });
  }catch(_err){
    // Older browsers: apply() still performs the same merge explicitly.
  }

  async function fetchFreshLive(){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),25000);
    try{
      const response=await fetch('/api/live?t='+Date.now(),{
        cache:'no-store',
        headers:{'Accept':'application/json'},
        signal:controller.signal
      });
      if(!response.ok)throw new Error('Live API HTTP '+response.status);
      const data=await response.json();
      if(!data||data.error||!data.men||!data.men.results)throw new Error(data?.error||'Ugyldige live-data');
      return data;
    }finally{
      clearTimeout(timer);
    }
  }

  function apply(data){
    const merged=mergeLive(window.MANGEKAMP_LIVE||{},data);
    window.MANGEKAMP_LIVE=merged;
    lastSuccessful=new Date();
    if(typeof setType==='function'){
      setType(typeof currentType!=='undefined'?currentType:'men');
    }
    if(typeof syncLive==='function'){
      try{syncLive();}catch(_err){}
    }
  }

  async function refresh(manual=false){
    if(inFlight)return;
    inFlight=true;
    if(manual)setButton('↻ Oppdaterer…',true);
    try{
      const data=await fetchFreshLive();
      apply(data);
      if(manual){
        const t=new Date(data.updatedAt||Date.now()).toLocaleTimeString('nb-NO',{hour:'2-digit',minute:'2-digit'});
        setButton('✓ Oppdatert '+t,false);
        setTimeout(()=>setButton('↻ Oppdater',false),1800);
      }
    }catch(err){
      console.warn('Direkte live-oppdatering feilet:',err);
      if(manual){
        setButton('⚠ Prøver igjen…',false);
        setTimeout(()=>setButton('↻ Oppdater',false),2200);
      }
    }finally{
      inFlight=false;
    }
  }

  function install(){
    const b=button();
    if(b)b.onclick=function(e){e.preventDefault();refresh(true);};
    window.refreshMangekampLiveNow=refresh;
    refresh(false);
    window.setInterval(()=>refresh(false),60000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
