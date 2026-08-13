(function(){
  function normalizeName(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,' ').trim().toLowerCase();}
  function normVenue(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\([^)]*\)/g,'').replace(/\b(stadium|stadion|field|arena)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim();}
  function samePerformance(a,b){if(Number(a.mark).toFixed(3)!==Number(b.mark).toFixed(3))return false;if(a.date&&b.date)return String(a.date)===String(b.date);return String(a.year||'')===String(b.year||'')&&normVenue(a.venue)===normVenue(b.venue);}
  function applyAthleteHistory(payload,type){
    const list=payload?.athletes||[],section=ROOT?.[type],athletes=section?.athletes||[],events=section?.events||[];
    window.MANGEKAMP_HISTORY=window.MANGEKAMP_HISTORY||{};
    for(const item of list){
      if(!item?.events)continue;const athlete=athletes.find(a=>normalizeName(a.name)===normalizeName(item.name));if(!athlete)continue;
      athlete.recent=athlete.recent||events.map(()=>[]);athlete.recentDetails=athlete.recentDetails||events.map(()=>[]);window.MANGEKAMP_HISTORY[athlete.name]=window.MANGEKAMP_HISTORY[athlete.name]||{};
      events.forEach((eventName,i)=>{
        const rows=(Array.isArray(item.events[eventName])?item.events[eventName]:[]).filter(r=>Number.isFinite(Number(r.mark))).filter(r=>['2025','2026'].includes(String(r.year||''))).sort((a,b)=>Date.parse(String(b.date||''))-Date.parse(String(a.date||''))||String(b.venue||'').length-String(a.venue||'').length);
        const clean=[];for(const r of rows){if(clean.some(x=>samePerformance(x,r)))continue;clean.push({mark:Number(r.mark),display:r.display||'',venue:r.venue||'',year:r.year||'',date:r.date||'',competition:r.competition||''});if(clean.length===4)break;}
        athlete.recent[i]=clean.map(r=>r.mark);athlete.recentDetails[i]=clean;
        // Replace legacy/local rows with the verified live WA rows so the popup and forecast use the same dataset.
        window.MANGEKAMP_HISTORY[athlete.name][eventName]=clean.map(r=>[r.mark,r.display,r.venue,String(r.year||''),r.date,r.competition]);
      });
    }
  }
  async function fetchType(type){const r=await fetch('/api/history?type='+type+'&t='+Date.now(),{cache:'no-store',headers:{Accept:'application/json'}});if(!r.ok)throw new Error(type+': HTTP '+r.status);const data=await r.json();if(data?.error)throw new Error(type+': '+data.error);applyAthleteHistory(data,type);return data;}
  async function refresh(){const results=await Promise.allSettled([fetchType('men'),fetchType('women')]);window.MANGEKAMP_HISTORY_LIVE={men:results[0].status==='fulfilled'?results[0].value:null,women:results[1].status==='fulfilled'?results[1].value:null,updatedAt:new Date().toISOString()};results.forEach((r,i)=>{if(r.status==='rejected')console.warn('WA historikkoppdatering feilet for '+(i===0?'menn':'kvinner')+':',r.reason);});if(typeof renderLiveForecast==='function')renderLiveForecast();if(typeof window.bindLiveForecastBasis==='function')window.bindLiveForecastBasis();}
  window.refreshMangekampHistory=refresh;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,250),{once:true});else setTimeout(refresh,250);
})();
