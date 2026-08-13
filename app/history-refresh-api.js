(function(){
  function normalizeName(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,' ').trim().toLowerCase();}
  function applyAthleteHistory(payload,type){
    const list=payload?.athletes||[];
    const section=ROOT?.[type];
    const athletes=section?.athletes||[];
    const events=section?.events||[];
    for(const item of list){
      if(!item?.events)continue;
      const athlete=athletes.find(a=>normalizeName(a.name)===normalizeName(item.name));
      if(!athlete)continue;
      athlete.recent=athlete.recent||events.map(()=>[]);
      athlete.recentDetails=athlete.recentDetails||events.map(()=>[]);
      events.forEach((eventName,i)=>{
        const rows=Array.isArray(item.events[eventName])?item.events[eventName]:[];
        const seenMarks=new Set();
        const clean=rows
          .filter(r=>Number.isFinite(Number(r.mark)))
          .filter(r=>['2025','2026'].includes(String(r.year||'')))
          .sort((a,b)=>Date.parse(String(b.date||''))-Date.parse(String(a.date||''))||String(b.venue||'').length-String(a.venue||'').length)
          .filter(r=>{const k=Number(r.mark).toFixed(3);if(seenMarks.has(k))return false;seenMarks.add(k);return true;})
          .slice(0,4)
          .map(r=>({mark:Number(r.mark),display:r.display||'',venue:r.venue||'',year:r.year||'',date:r.date||'',competition:r.competition||''}));

        // The cleaned WA API is the source of truth. Do not merge old local rows back in.
        // Deduplicate by mark here too, so cached/legacy duplicate WA rows can never reach the forecast UI.
        athlete.recent[i]=clean.map(r=>r.mark);
        athlete.recentDetails[i]=clean;
      });
    }
  }
  async function fetchType(type){
    const r=await fetch('/api/history?type='+type+'&t='+Date.now(),{cache:'no-store',headers:{Accept:'application/json'}});
    if(!r.ok)throw new Error(type+': HTTP '+r.status);
    const data=await r.json();
    if(data?.error)throw new Error(type+': '+data.error);
    applyAthleteHistory(data,type);
    return data;
  }
  async function refresh(){
    const results=await Promise.allSettled([fetchType('men'),fetchType('women')]);
    window.MANGEKAMP_HISTORY_LIVE={men:results[0].status==='fulfilled'?results[0].value:null,women:results[1].status==='fulfilled'?results[1].value:null,updatedAt:new Date().toISOString()};
    results.forEach((r,i)=>{if(r.status==='rejected')console.warn('WA historikkoppdatering feilet for '+(i===0?'menn':'kvinner')+':',r.reason);});
    if(typeof renderLiveForecast==='function')renderLiveForecast();
    if(typeof window.bindLiveForecastBasis==='function')window.bindLiveForecastBasis();
  }
  window.refreshMangekampHistory=refresh;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,250),{once:true});else setTimeout(refresh,250);
})();
