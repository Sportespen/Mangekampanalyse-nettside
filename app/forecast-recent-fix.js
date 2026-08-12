(function(){
  function recentForecastValues(athlete,eventIndex){
    const details=athlete?.recentDetails?.[eventIndex]||[];
    if(Array.isArray(details)&&details.length){
      const seen=new Set(),vals=[];
      for(const d of details){
        const mark=Number(d?.mark);if(!Number.isFinite(mark))continue;
        const key=[mark,String(d?.venue||''),String(d?.year||'')].join('|');
        if(seen.has(key))continue;seen.add(key);vals.push(mark);if(vals.length===4)break;
      }
      if(vals.length)return vals;
    }
    return (athlete?.recent?.[eventIndex]||[]).map(Number).filter(Number.isFinite).slice(0,4);
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
