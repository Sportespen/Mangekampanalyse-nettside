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
        if(!rows.length)return;
        const valid=rows.filter(r=>Number.isFinite(Number(r.mark))).slice(0,4);
        if(!valid.length)return;
        athlete.recent[i]=valid.map(r=>Number(r.mark));
        athlete.recentDetails[i]=valid.map(r=>({mark:Number(r.mark),display:r.display||'',venue:r.venue||'',year:r.year||'',date:r.date||'',competition:r.competition||''}));
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
