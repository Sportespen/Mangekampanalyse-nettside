(function(){
  let inFlight=false;
  let lastSuccessful=null;
  const STORAGE_KEY='mka-live-last-known-good-v1';

  function button(){return document.querySelector('button[aria-label="Oppdater live-resultater"]');}
  function statusBox(){return document.querySelector('.status');}
  function setButton(text,disabled){const b=button();if(!b)return;b.disabled=!!disabled;b.textContent=text;}
  function normalizeName(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,' ').trim().toLowerCase();}
  function language(){const v=localStorage.getItem('mka-language');return ['nb','en','de'].includes(v)?v:'nb';}
  function text(){
    const all={
      nb:{fallbackTitle:'LIVE – viser siste gyldige data',fallbackSub:'Live-kilden er midlertidig utilgjengelig. Siste gyldige oppdatering beholdes',restoredTitle:'LIVE – gjenopprettet siste gyldige data',restoredSub:'Viser sist lagrede live-resultater mens ny oppdatering hentes.'},
      en:{fallbackTitle:'LIVE – showing last valid data',fallbackSub:'The live source is temporarily unavailable. The last valid update is retained',restoredTitle:'LIVE – restored last valid data',restoredSub:'Showing the last saved live results while a fresh update is fetched.'},
      de:{fallbackTitle:'LIVE – letzte gültige Daten',fallbackSub:'Die Live-Quelle ist vorübergehend nicht verfügbar. Die letzte gültige Aktualisierung bleibt erhalten',restoredTitle:'LIVE – letzte gültige Daten wiederhergestellt',restoredSub:'Die zuletzt gespeicherten Live-Ergebnisse werden angezeigt, während neue Daten geladen werden.'}
    };
    return all[language()]||all.nb;
  }

  function mergeResults(oldResults={},newResults={}){
    const byKey=new Map();
    for(const [name,value] of Object.entries(oldResults||{}))byKey.set(normalizeName(name),{name,value:{...(value||{})}});
    for(const [name,value] of Object.entries(newResults||{})){
      const key=normalizeName(name),old=byKey.get(key);
      byKey.set(key,{name:old?.name||name,value:{...(old?.value||{}),...(value||{})}});
    }
    const out={};for(const entry of byKey.values())out[entry.name]=entry.value;return out;
  }
  function mergeSection(oldSection={},newSection={}){
    return {...oldSection,...newSection,completedEvents:Math.max(Number(oldSection.completedEvents||0),Number(newSection.completedEvents||0)),results:mergeResults(oldSection.results,newSection.results),eventStatus:{...(oldSection.eventStatus||{}),...(newSection.eventStatus||{})},eventHasMarks:{...(oldSection.eventHasMarks||{}),...(newSection.eventHasMarks||{})}};
  }
  function mergeLive(oldLive={},newLive={}){
    if(!oldLive||typeof oldLive!=='object')return newLive;
    if(!newLive||typeof newLive!=='object')return oldLive;
    return {...oldLive,...newLive,men:mergeSection(oldLive.men||{},newLive.men||{}),women:mergeSection(oldLive.women||{},newLive.women||{})};
  }
  function resultCount(section){return Object.keys(section?.results||{}).length;}
  function looksValid(data){
    if(!data||typeof data!=='object')return false;
    if(!data.men||typeof data.men!=='object')return false;
    const menCount=resultCount(data.men),womenCount=resultCount(data.women);
    const completed=Math.max(Number(data.men?.completedEvents||0),Number(data.women?.completedEvents||0));
    return menCount>0||womenCount>0||completed===0;
  }
  function saveLastKnownGood(data){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({savedAt:new Date().toISOString(),data}));}catch(_err){}
  }
  function loadLastKnownGood(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return null;
      const parsed=JSON.parse(raw);if(!parsed?.data||!looksValid(parsed.data))return null;
      return parsed;
    }catch(_err){return null;}
  }
  function timeLabel(value){
    const d=value?new Date(value):null;if(!d||Number.isNaN(d.getTime()))return '';
    const locale=language()==='en'?'en-GB':language()==='de'?'de-DE':'nb-NO';
    return d.toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit'});
  }
  function showFallbackStatus(kind='fallback',when){
    const box=statusBox();if(!box)return;
    const q=text(),stamp=timeLabel(when),title=kind==='restored'?q.restoredTitle:q.fallbackTitle,sub=kind==='restored'?q.restoredSub:q.fallbackSub;
    box.innerHTML=`<span class="dot"></span><div><b>${title}</b><small>${sub}${stamp?' · '+stamp:''}</small></div>`;
    box.classList.add('live-active');
  }

  let guardedLive=window.MANGEKAMP_LIVE||{};
  try{Object.defineProperty(window,'MANGEKAMP_LIVE',{configurable:true,get(){return guardedLive;},set(next){guardedLive=mergeLive(guardedLive,next||{});}});}catch(_err){}

  async function fetchJson(url,signal){
    const response=await fetch(url,{cache:'no-store',headers:{'Accept':'application/json'},signal});
    if(!response.ok)throw new Error('Live API HTTP '+response.status);
    const data=await response.json();if(!data||data.error)throw new Error(data?.error||'Ugyldige live-data');return data;
  }
  async function fetchFreshLive(){
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
    try{
      const main=await fetchJson('/api/live?t='+Date.now(),controller.signal);
      if(!looksValid(main))throw new Error('Ugyldige live-data');
      try{
        const w800=await fetchJson('/api/live-women-800?t='+Date.now(),controller.signal);
        return looksValid(w800)?mergeLive(main,w800):main;
      }catch(err){
        console.warn('Direkte 800m-feed feilet, bruker hovedfeed:',err);
        return main;
      }
    }finally{clearTimeout(timer);}
  }
  function apply(data){
    const merged=mergeLive(window.MANGEKAMP_LIVE||{},data);
    if(!looksValid(merged))throw new Error('Ugyldige live-data etter sammenslåing');
    window.MANGEKAMP_LIVE=merged;lastSuccessful=new Date(data.updatedAt||Date.now());saveLastKnownGood(merged);
    if(typeof setType==='function')setType(typeof currentType!=='undefined'?currentType:'men');
    if(typeof syncLive==='function'){try{syncLive();}catch(_err){}}
  }
  function restorePersisted(){
    const saved=loadLastKnownGood();if(!saved)return false;
    window.MANGEKAMP_LIVE=mergeLive(window.MANGEKAMP_LIVE||{},saved.data);
    lastSuccessful=new Date(saved.data?.updatedAt||saved.savedAt||Date.now());
    if(typeof setType==='function')setType(typeof currentType!=='undefined'?currentType:'men');
    if(typeof syncLive==='function'){try{syncLive();}catch(_err){}}
    showFallbackStatus('restored',lastSuccessful);
    return true;
  }
  async function refresh(manual=false){
    if(inFlight)return;inFlight=true;if(manual)setButton('↻ Oppdaterer…',true);
    try{
      const data=await fetchFreshLive();apply(data);
      if(manual){const t=new Date(data.updatedAt||Date.now()).toLocaleTimeString('nb-NO',{hour:'2-digit',minute:'2-digit'});setButton('✓ Oppdatert '+t,false);setTimeout(()=>setButton('↻ Oppdater',false),1800);}
    }catch(err){
      console.warn('Direkte live-oppdatering feilet:',err);
      const saved=loadLastKnownGood();
      if(saved){window.MANGEKAMP_LIVE=mergeLive(window.MANGEKAMP_LIVE||{},saved.data);lastSuccessful=new Date(saved.data?.updatedAt||saved.savedAt||Date.now());showFallbackStatus('fallback',lastSuccessful);}
      else if(lastSuccessful){showFallbackStatus('fallback',lastSuccessful);}
      if(manual){setButton(saved?'⚠ Viser siste gyldige data':'⚠ Prøver igjen…',false);setTimeout(()=>setButton('↻ Oppdater',false),2600);}
    }
    finally{inFlight=false;}
  }
  function install(){
    const b=button();if(b)b.onclick=function(e){e.preventDefault();refresh(true);};
    window.refreshMangekampLiveNow=refresh;
    restorePersisted();
    refresh(false);
    window.setInterval(()=>refresh(false),60000);
  }
  document.addEventListener('mka:languagechange',()=>{if(loadLastKnownGood()&&lastSuccessful)showFallbackStatus('restored',lastSuccessful);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
