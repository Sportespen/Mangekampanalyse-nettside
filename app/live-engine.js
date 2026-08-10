(function(){
  const TIME_EVENTS=new Set(['100m','400m','110mh','1500m','100mh','200m','800m']);

  function liveForType(){
    const live=window.MANGEKAMP_LIVE||{};
    return currentType==='women'?(live.women||{}):(live.men||{});
  }

  function statusBox(){return document.querySelector('.status');}

  function normalizeName(value){
    return String(value||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^A-Za-z0-9]+/g,' ')
      .trim().toLowerCase();
  }

  function liveResultsByNormalizedName(){
    const out=new Map();
    const results=liveForType().results||{};
    Object.entries(results).forEach(([name,value])=>out.set(normalizeName(name),value||{}));
    return out;
  }

  function updateStatus(){
    const box=statusBox(); if(!box)return;
    const live=window.MANGEKAMP_LIVE||{};
    const section=liveForType();
    const completed=Number(section.completedEvents||0);
    const updated=live.updatedAt?new Date(live.updatedAt):null;
    const when=updated&&!Number.isNaN(updated.getTime())?updated.toLocaleTimeString('nb-NO',{hour:'2-digit',minute:'2-digit'}):'';
    if(completed>0){
      box.innerHTML=`<span class="dot"></span><div><b>LIVE – ${completed} ${completed===1?'øvelse':'øvelser'} fullført</b><small>${when?'Sist oppdatert '+when+'. ':''}Faktiske resultater brukes i prognosen.</small></div>`;
      box.classList.add('live-active');
    }else{
      box.innerHTML='<span class="dot"></span><div><b>Før konkurransestart</b><small>Live-resultater kobles inn når European Athletics publiserer dem.</small></div>';
      box.classList.remove('live-active');
    }
  }

  function applyLiveToAthletes(){
    const results=liveResultsByNormalizedName();
    (D.athletes||[]).forEach(a=>{
      const byName=results.get(normalizeName(a.name));
      a.actual=a.actual||[];
      a.liveActual=a.liveActual||[];
      D.events.forEach((eventName,i)=>{
        const raw=byName?.[eventName];
        if(raw==null)return;
        const mark=typeof raw==='object'?Number(raw.mark):Number(raw);
        if(Number.isFinite(mark)){
          a.actual[i]=mark;
          a.liveActual[i]=mark;
        }
      });
    });
  }

  function predictedMark(athlete,eventIndex){
    return predict(athlete,eventIndex);
  }

  function hasActual(athlete,eventIndex){
    return Number.isFinite(Number(athlete.liveActual?.[eventIndex]));
  }

  function actualMark(athlete,eventIndex){
    const v=Number(athlete.liveActual?.[eventIndex]);
    return Number.isFinite(v)?v:null;
  }

  function eventIsCompleted(eventName){
    const s=String(liveForType().eventStatus?.[eventName]||'').toLowerCase();
    return s==='finished'||s==='official';
  }

  function renderLiveForecast(){
    const head=document.querySelector('#liveForecastHead');
    const body=document.querySelector('#liveForecastBody');
    const banner=document.querySelector('#forecastBanner');
    const pill=document.querySelector('#forecastLivePill');
    if(!head||!body)return;

    const section=liveForType();
    const completed=Number(section.completedEvents||0);
    const live=window.MANGEKAMP_LIVE||{};
    head.innerHTML='<tr><th>Plass nå</th><th>Nasjon</th><th>Utøver</th>'+D.events.map(e=>`<th>${esc(e)}</th>`).join('')+'<th>POENG NÅ</th><th>Forventet sluttpoeng</th><th>Forventet sluttplass</th><th>Endring</th></tr>';

    if(completed===0){
      const blanks=D.events.map(()=>'<td></td>').join('');
      body.innerHTML=(D.athletes||[]).map(a=>`<tr><td></td><td>${esc(a.nation||'')}</td><td class="name">${esc(a.name||'')}</td>${blanks}<td></td><td></td><td></td><td></td></tr>`).join('');
      if(banner)banner.textContent=`EM Birmingham 2026 · før start · ${D.athletes.length} utøvere · prognosen aktiveres automatisk etter første fullførte øvelse`;
      if(pill){pill.textContent='LIVE KLAR';pill.classList.add('muted');}
      return;
    }

    const rows=(D.athletes||[]).map(athlete=>{
      const vals=D.events.map((eventName,i)=>hasActual(athlete,i)?actualMark(athlete,i):predictedMark(athlete,i));
      const actualPts=D.events.reduce((sum,eventName,i)=>{
        const v=actualMark(athlete,i);
        return sum+(eventIsCompleted(eventName)&&v!=null?scoreEvent(i,v):0);
      },0);
      const total=vals.reduce((sum,v,i)=>sum+(v==null?0:scoreEvent(i,v)),0);
      const completedMarks=D.events.reduce((n,eventName,i)=>n+(eventIsCompleted(eventName)&&hasActual(athlete,i)?1:0),0);
      return {athlete,vals,actualPts,total,completedMarks};
    });

    const currentRows=[...rows].sort((a,b)=>b.actualPts-a.actualPts||b.completedMarks-a.completedMarks||b.total-a.total);
    const forecastRows=[...rows].sort((a,b)=>b.total-a.total);
    const currentRank=new Map(currentRows.map((r,i)=>[r.athlete.name,i+1]));
    const forecastRank=new Map(forecastRows.map((r,i)=>[r.athlete.name,i+1]));

    body.innerHTML=currentRows.map(r=>{
      const cr=currentRank.get(r.athlete.name);
      const fr=forecastRank.get(r.athlete.name);
      const change=cr-fr;
      const cells=r.vals.map((v,i)=>{
        const actual=hasActual(r.athlete,i);
        const cls=actual?'actual':'pred';
        const title=actual?'Faktisk resultat fra European Athletics':'Prognose: snitt av de tre beste av de fire siste resultatene';
        return `<td class="${cls}" title="${title}">${v==null?'—':displayMark(D.events[i],v)}</td>`;
      }).join('');
      return `<tr><td>${cr}</td><td>${esc(r.athlete.nation||'')}</td><td class="name">${esc(r.athlete.name||'')}</td>${cells}<td class="points">${r.actualPts}</td><td><b>${r.total}</b></td><td><b>${fr}</b></td><td class="${change>0?'up':change<0?'down':''}">${change>0?'▲ '+change:change<0?'▼ '+Math.abs(change):'–'}</td></tr>`;
    }).join('');

    const updated=live.updatedAt?new Date(live.updatedAt):null;
    const when=updated&&!Number.isNaN(updated.getTime())?updated.toLocaleTimeString('nb-NO',{hour:'2-digit',minute:'2-digit'}):'';
    if(banner)banner.textContent=`EM Birmingham 2026 · ${completed} ${completed===1?'øvelse':'øvelser'} fullført · faktisk resultat + prognose for resten${when?' · oppdatert '+when:''}`;
    if(pill){pill.textContent='LIVE';pill.classList.remove('muted');}
  }

  function syncLive(){
    applyLiveToAthletes();
    updateStatus();
    renderLiveForecast();
  }

  function reloadLiveData(){
    const old=document.querySelector('script[data-mangekamp-live-refresh]');
    if(old)old.remove();
    const script=document.createElement('script');
    script.src='data/live_birmingham.js?t='+Date.now();
    script.dataset.mangekampLiveRefresh='1';
    script.onload=syncLive;
    document.head.appendChild(script);
  }

  const originalSetType=setType;
  setType=function(type){originalSetType(type);syncLive();};

  window.refreshMangekampLive=reloadLiveData;
  syncLive();
  setInterval(reloadLiveData,60000);
})();
