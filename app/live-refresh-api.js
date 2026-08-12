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
    window.MANGEKAMP_LIVE=data;
    lastSuccessful=new Date();
    if(typeof setType==='function'){
      setType(typeof currentType!=='undefined'?currentType:'men');
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
