// Production forecast history is provided by generated data/history_web.js.
// Live history refresh stays disabled so verified history is never overwritten after page load.
window.refreshMangekampHistory = async function(){ return window.MANGEKAMP_HISTORY; };

// Priority patch: pin verified Emil Uhlin and Jip de Greef history after the base history file.
(function(){
  var s=document.createElement('script');
  s.src='data/history_priority_patch.js?v=20260813-0915';
  s.onload=function(){
    if(typeof renderLiveForecast==='function') renderLiveForecast();
    if(typeof window.bindLiveForecastBasis==='function') window.bindLiveForecastBasis();
  };
  document.body.appendChild(s);
})();

// Keep the LIVE completed-event label in sync with the actual event statuses.
(function(){
  const eventOrder={
    men:['100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m'],
    women:['100mh','Høyde','Kule','200m','Lengde','Spyd','800m']
  };
  function activeType(){
    return document.querySelector('.event-switch-btn.active')?.dataset?.type==='women'?'women':'men';
  }
  function completedFromStatus(section,type){
    const statuses=section?.eventStatus||{};
    let completed=0;
    for(const event of eventOrder[type]){
      const status=String(statuses[event]||'').trim().toLowerCase();
      if(status==='finished'||status==='official'||status==='complete'||status==='completed') completed++;
      else break;
    }
    return completed;
  }
  function updateDynamicLiveStatus(){
    const live=window.MANGEKAMP_LIVE||{};
    const type=activeType();
    const section=live[type]||{};
    const completed=completedFromStatus(section,type);
    section.completedEvents=completed;
    const box=document.querySelector('.status');
    if(!box)return;
    const started=completed>0||Object.keys(section.results||{}).length>0||Object.values(section.eventStatus||{}).some(v=>['live','running','in progress','finished','official'].includes(String(v||'').toLowerCase()));
    if(!started)return;
    const updated=live.updatedAt?new Date(live.updatedAt):null;
    const when=updated&&!Number.isNaN(updated.getTime())?updated.toLocaleTimeString('nb-NO',{hour:'2-digit',minute:'2-digit'}):'';
    const sourceText=Object.keys(section.results||{}).length?'Live-resultater kobles inn fortløpende.':'Startlisten beholdes til arrangørens live-resultatliste er tilgjengelig.';
    box.innerHTML=`<span class="dot"></span><div><b>LIVE${completed?' – '+completed+' '+(completed===1?'øvelse':'øvelser')+' fullført':''}</b><small>${when?'Sist oppdatert '+when+'. ':''}${sourceText}</small></div>`;
    box.classList.add('live-active');
  }
  window.updateDynamicLiveStatus=updateDynamicLiveStatus;
  document.addEventListener('DOMContentLoaded',updateDynamicLiveStatus);
  setInterval(updateDynamicLiveStatus,1000);
})();
