(function(){
  function normalizeEntry(raw){
    if(raw==null)return null;
    if(Array.isArray(raw)){const mark=Number(raw[0]);if(!Number.isFinite(mark))return null;return{mark,venue:String(raw[2]||''),year:String(raw[3]||'')};}
    const mark=Number(raw.mark??raw.value??raw.result??raw.result_mark);if(!Number.isFinite(mark))return null;
    return{mark,venue:String(raw.venue??raw.place??raw.location??''),year:String(raw.year??'')};
  }
  function normName(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,' ').trim().toLowerCase();}
  function historyForAthlete(name){
    const history=window.MANGEKAMP_HISTORY||{};
    if(history[name])return history[name];
    const target=normName(name);
    for(const [key,value] of Object.entries(history)){if(normName(key)===target)return value;}
    const tt=target.split(' ').filter(Boolean);
    for(const [key,value] of Object.entries(history)){
      const kk=normName(key),kt=kk.split(' ').filter(Boolean);
      if(kk.includes(target)||target.includes(kk))return value;
      if(tt.length>=2&&kt.length>=2&&tt[0]===kt[0]&&tt.some(t=>t.length>=4&&kt.includes(t)))return value;
    }
    return null;
  }
  function recentForecastValues(athlete,eventIndex){
    const eventName=D.events[eventIndex];
    const source=historyForAthlete(athlete?.name)?.[eventName]||[];
    const seen=new Set(),vals=[];
    for(const raw of (Array.isArray(source)?source:[])){
      const r=normalizeEntry(raw);if(!r)continue;
      if(r.year!=='2026'&&r.year!=='2025')continue;
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
