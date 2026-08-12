(function(){
  function normalizeEntry(raw){
    if(raw==null)return null;
    if(Array.isArray(raw)){const mark=Number(raw[0]);if(!Number.isFinite(mark))return null;return{mark,venue:String(raw[2]||''),year:String(raw[3]||'')};}
    if(typeof raw==='number')return Number.isFinite(raw)?{mark:raw,venue:'',year:''}:null;
    const mark=Number(raw.mark??raw.value??raw.result??raw.result_mark);if(!Number.isFinite(mark))return null;
    return{mark,venue:String(raw.venue??raw.place??raw.location??''),year:String(raw.year??'')};
  }
  function recentForecastValues(athlete,eventIndex){
    const eventName=D.events[eventIndex];
    const globalRows=window.MANGEKAMP_HISTORY?.[athlete?.name]?.[eventName]||[];
    const details=athlete?.recentDetails?.[eventIndex]||[];
    const simple=athlete?.recent?.[eventIndex]||[];
    const source=[...(Array.isArray(globalRows)?globalRows:[]),...(Array.isArray(details)?details:[]),...(Array.isArray(simple)?simple:[])];
    const seen=new Set(),vals=[];
    for(const raw of source){
      const r=normalizeEntry(raw);if(!r)continue;
      if(r.year && r.year!=='2026' && r.year!=='2025')continue;
      const key=[r.mark,r.venue,r.year].join('|');
      if(seen.has(key))continue;
      seen.add(key);vals.push(r.mark);if(vals.length===4)break;
    }
    return vals;
  }
  predictionInputs=function(athlete,eventIndex){
    const vals=recentForecastValues(athlete,eventIndex);if(!vals.length)return[];
    if(vals.length<4)return vals;
    const lower=['100m','400m','110mh','1500m','100mh','200m','800m'].includes(D.events[eventIndex]);
    return [...vals].sort((a,b)=>lower?a-b:b-a).slice(0,3);
  };
  predict=function(athlete,eventIndex){const used=predictionInputs(athlete,eventIndex);return used.length?used.reduce((s,v)=>s+v,0)/used.length:null;};
  window.mangekampRecentForecastValues=recentForecastValues;
})();
