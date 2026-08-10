(function(){
  function liveForType(){const live=window.MANGEKAMP_LIVE||{};return currentType==='women'?(live.women||{}):(live.men||{});}
  function statusBox(){return document.querySelector('.status');}
  function normalizeName(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,' ').trim().toLowerCase();}
  function competitionLabel(){const live=window.MANGEKAMP_LIVE||{};const selected=document.querySelector('#competitionSelect');return live.competition||selected?.options?.[selected.selectedIndex]?.textContent?.trim()||'Valgt konkurranse';}
  function liveResultsByNormalizedName(){const out=new Map();const results=liveForType().results||{};Object.entries(results).forEach(([name,value])=>out.set(normalizeName(name),{name,value:value||{}}));return out;}
  function liveListAvailable(){return liveResultsByNormalizedName().size>0;}
  function competitionStarted(){const section=liveForType();if(Number(section.completedEvents||0)>0)return true;if(liveListAvailable())return true;return Object.values(section.eventStatus||{}).some(v=>['live','running','in progress','finished','official'].includes(String(v||'').toLowerCase()));}
  function baseAthletes(){return ROOT[currentType]?.athletes||[];}
  function authoritativeAthletes(){
    if(!liveListAvailable())return baseAthletes();
    const liveMap=liveResultsByNormalizedName(),baseMap=new Map(baseAthletes().map(a=>[normalizeName(a.name),a])),list=[];
    liveMap.forEach((entry,key)=>{const base=baseMap.get(key);if(base)list.push(base);else list.push({name:entry.name,nation:entry.value.nation||'',birth:'',qp:'',wr:'',combinedPB:0,theoreticalPB:0,potential:0,utilization:0,best:D.events.map(()=>null),recent:D.events.map(()=>[]),actual:[],liveActual:[]});});
    return list;
  }
  function applyAuthoritativeField(){const next=authoritativeAthletes();D.athletes=next;const count=document.querySelector('#athleteCount');if(count)count.textContent=next.length+' '+(next.length===1?'utøver':'utøvere');}
  function updateStatus(){
    const box=statusBox();if(!box)return;const live=window.MANGEKAMP_LIVE||{},section=liveForType(),completed=Number(section.completedEvents||0),updated=live.updatedAt?new Date(live.updatedAt):null,when=updated&&!Number.isNaN(updated.getTime())?updated.toLocaleTimeString('nb-NO',{hour:'2-digit',minute:'2-digit'}):'';
    if(competitionStarted()){
      const sourceText=liveListAvailable()?'Live-resultatlisten styrer nå alle analyser.':'Startlisten beholdes til arrangørens live-resultatliste er tilgjengelig.';
      box.innerHTML=`<span class="dot"></span><div><b>LIVE${completed?' – '+completed+' '+(completed===1?'øvelse':'øvelser')+' fullført':''}</b><small>${when?'Sist oppdatert '+when+'. ':''}${sourceText}</small></div>`;box.classList.add('live-active');
    }else{box.innerHTML='<span class="dot"></span><div><b>Før konkurransestart</b><small>Live-resultater kobles inn når arrangøren publiserer dem.</small></div>';box.classList.remove('live-active');}
  }
  function applyLiveToAthletes(){const results=liveResultsByNormalizedName();(D.athletes||[]).forEach(a=>{const byName=results.get(normalizeName(a.name))?.value;a.actual=a.actual||[];a.liveActual=a.liveActual||[];D.events.forEach((eventName,i)=>{const raw=byName?.[eventName];if(raw==null)return;const mark=typeof raw==='object'?Number(raw.mark):Number(raw);if(Number.isFinite(mark)){a.actual[i]=mark;a.liveActual[i]=mark;}});});}
  function predictedMark(a,i){return predict(a,i);}
  function hasActual(a,i){return Number.isFinite(Number(a.liveActual?.[i]));}
  function actualMark(a,i){const v=Number(a.liveActual?.[i]);return Number.isFinite(v)?v:null;}
  function eventIsCompleted(e){const s=String(liveForType().eventStatus?.[e]||'').toLowerCase();return s==='finished'||s==='official';}
  function renderAllAnalyses(){renderAnalyse();renderRanking();renderLiveForecast();}
  function renderLiveForecast(){
    const head=document.querySelector('#liveForecastHead'),body=document.querySelector('#liveForecastBody'),banner=document.querySelector('#forecastBanner'),pill=document.querySelector('#forecastLivePill');if(!head||!body)return;
    const section=liveForType(),completed=Number(section.completedEvents||0),live=window.MANGEKAMP_LIVE||{},name=competitionLabel();
    head.innerHTML='<tr><th>Plass nå</th><th>Nasjon</th><th>Utøver</th>'+D.events.map(e=>`<th>${esc(e)}</th>`).join('')+'<th>POENG NÅ</th><th>Forventet sluttpoeng</th><th>Forventet sluttplass</th><th>Endring</th></tr>';
    if(!liveListAvailable()){
      const blanks=D.events.map(()=>'<td></td>').join('');body.innerHTML=(D.athletes||[]).map(a=>`<tr><td></td><td>${esc(a.nation||'')}</td><td class="name">${esc(a.name||'')}</td>${blanks}<td></td><td></td><td></td><td></td></tr>`).join('');
      if(banner)banner.textContent=`${name} · ${competitionStarted()?'konkurransen er i gang, men startlisten brukes til live-resultatlisten er tilgjengelig':'før start'} · ${D.athletes.length} utøvere`;
      if(pill){pill.textContent=competitionStarted()?'VENTER LIVE-LISTE':'LIVE KLAR';pill.classList.add('muted');}return;
    }
    const rows=(D.athletes||[]).map(athlete=>{const vals=D.events.map((e,i)=>hasActual(athlete,i)?actualMark(athlete,i):predictedMark(athlete,i));const actualPts=D.events.reduce((s,e,i)=>{const v=actualMark(athlete,i);return s+(eventIsCompleted(e)&&v!=null?scoreEvent(i,v):0);},0);const total=vals.reduce((s,v,i)=>s+(v==null?0:scoreEvent(i,v)),0);const completedMarks=D.events.reduce((n,e,i)=>n+(eventIsCompleted(e)&&hasActual(athlete,i)?1:0),0);return{athlete,vals,actualPts,total,completedMarks};});
    const currentRows=[...rows].sort((a,b)=>b.actualPts-a.actualPts||b.completedMarks-a.completedMarks||b.total-a.total),forecastRows=[...rows].sort((a,b)=>b.total-a.total),currentRank=new Map(currentRows.map((r,i)=>[r.athlete.name,i+1])),forecastRank=new Map(forecastRows.map((r,i)=>[r.athlete.name,i+1]));
    body.innerHTML=currentRows.map(r=>{const cr=currentRank.get(r.athlete.name),fr=forecastRank.get(r.athlete.name),change=cr-fr,cells=r.vals.map((v,i)=>`<td class="${hasActual(r.athlete,i)?'actual':'pred'}">${v==null?'—':displayMark(D.events[i],v)}</td>`).join('');return `<tr><td>${cr}</td><td>${esc(r.athlete.nation||'')}</td><td class="name">${esc(r.athlete.name||'')}</td>${cells}<td class="points">${r.actualPts}</td><td><b>${r.total}</b></td><td><b>${fr}</b></td><td class="${change>0?'up':change<0?'down':''}">${change>0?'▲ '+change:change<0?'▼ '+Math.abs(change):'–'}</td></tr>`;}).join('');
    const updated=live.updatedAt?new Date(live.updatedAt):null,when=updated&&!Number.isNaN(updated.getTime())?updated.toLocaleTimeString('nb-NO',{hour:'2-digit',minute:'2-digit'}):'';
    if(banner)banner.textContent=`${name} · ${D.athletes.length} aktive utøvere · ${completed} ${completed===1?'øvelse':'øvelser'} fullført${when?' · oppdatert '+when:''}`;
    if(pill){pill.textContent='LIVE';pill.classList.remove('muted');}
    if(typeof window.bindLiveForecastBasis==='function')window.bindLiveForecastBasis();
  }
  function syncLive(){applyAuthoritativeField();applyLiveToAthletes();updateStatus();const title=document.querySelector('#analyseTitle');if(title)title.textContent='Startanalyse – '+competitionLabel();renderAllAnalyses();}
  function reloadLiveData(){const old=document.querySelector('script[data-mangekamp-live-refresh]');if(old)old.remove();const script=document.createElement('script');script.src='data/live_birmingham.js?t='+Date.now();script.dataset.mangekampLiveRefresh='1';script.onload=syncLive;document.head.appendChild(script);}
  const originalSetType=setType;setType=function(type){originalSetType(type);syncLive();};window.refreshMangekampLive=reloadLiveData;syncLive();setInterval(reloadLiveData,60000);
})();