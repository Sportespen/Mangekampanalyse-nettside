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
        const live=rows.filter(r=>Number.isFinite(Number(r.mark))).slice(0,4);
        if(!live.length)return;

        // Never replace a richer verified local history with an incomplete live response.
        // Merge live WA rows with the existing basis, deduplicate, and keep up to four.
        const existingDetails=Array.isArray(athlete.recentDetails[i])?athlete.recentDetails[i]:[];
        const existingMarks=Array.isArray(athlete.recent[i])?athlete.recent[i]:[];
        const existing=existingDetails.length
          ? existingDetails.filter(r=>Number.isFinite(Number(r.mark)))
          : existingMarks.filter(v=>Number.isFinite(Number(v))).map(v=>({mark:Number(v),display:'',venue:'',year:'',date:'',competition:''}));
        const merged=[];
        const seen=new Set();
        for(const r of [...live,...existing]){
          const mark=Number(r.mark);
          if(!Number.isFinite(mark))continue;
          const key=[mark,String(r.venue||''),String(r.year||''),String(r.date||''),String(r.competition||'')].join('|');
          if(seen.has(key))continue;
          seen.add(key);
          merged.push({mark,display:r.display||'',venue:r.venue||'',year:r.year||'',date:r.date||'',competition:r.competition||''});
          if(merged.length===4)break;
        }
        athlete.recent[i]=merged.map(r=>r.mark);
        athlete.recentDetails[i]=merged;
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
