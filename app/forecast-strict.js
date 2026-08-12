(function(){
  function isTimeEvent(eventName){return ['100m','400m','110mh','1500m','100mh','200m','800m'].includes(eventName);}
  window.mangekampForecastFromFour=function(athlete,eventIndex){
    const vals=(athlete?.recent?.[eventIndex]||[]).map(Number).filter(Number.isFinite).slice(0,4);
    if(vals.length!==4)return null;
    const lower=isTimeEvent(D.events[eventIndex]);
    const sorted=[...vals].sort((a,b)=>lower?a-b:b-a);
    const best3=sorted.slice(0,3);
    return best3.reduce((sum,v)=>sum+v,0)/3;
  };
  try{
    predict=function(athlete,eventIndex){return window.mangekampForecastFromFour(athlete,eventIndex);};
  }catch(_err){}
})();
