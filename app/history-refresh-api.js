(function(){
  function normalizeName(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,' ').trim().toLowerCase();}
  function applyAthleteHistory(payload){
    const list=payload?.athletes||[];
    const athletes=D?.athletes||[];
    for(const item of list){
      if(!item?.events)continue;
      const athlete=athletes.find(a=>normalizeName(a.name)===normalizeName(item.name));
      if(!athlete)continue;
      athlete.recent=athlete.recent||D.events.map(()=>[]);
      athlete.recentDetails=athlete.recentDetails||D.events.map(()=>[]);
      D.events.forEach((eventName,i)=>{
        const rows=Array.isArray(item.events[eventName])?item.events[eventName]:[];
        if(!rows.length)return;
        athlete.recent[i]=rows.map(r=>Number(r.mark)).filter(Number.isFinite).slice(0,4);
        athlete.recentDetails[i]=rows.slice(0,4).map(r=>({mark:Number(r.mark),display:r.display||'',venue:r.venue||'',year:r.year||'',date:r.date||'',competition:r.competition||''})).filter(r=>Number.isFinite(r.mark));
      });
    }
    if(typeof renderLiveForecast==='function')renderLiveForecast();
    if(typeof window.bindLiveForecastBasis==='function')window.bindLiveForecastBasis();
  }
  async function refresh(){
    const type=typeof currentType!=='undefined'&&currentType==='women'?'women':'men';
    try{
      const r=await fetch('/api/history?type='+type+'&t='+Date.now(),{cache:'no-store',headers:{Accept:'application/json'}});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const data=await r.json();
      if(data?.error)throw new Error(data.error);
      applyAthleteHistory(data);
      window.MANGEKAMP_HISTORY_LIVE=data;
    }catch(e){console.warn('WA historikkoppdatering feilet:',e);}
  }
  function start(){
    setTimeout(refresh,800);
    document.querySelectorAll('.event-switch-btn').forEach(btn=>btn.addEventListener('click',()=>setTimeout(refresh,250)));
  }
  window.refreshMangekampHistory=refresh;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();