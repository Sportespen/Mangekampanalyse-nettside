(function(){
  function liveForType(){
    const live=window.MANGEKAMP_LIVE||{};
    return currentType==='women'?(live.women||{}):(live.men||{});
  }

  function statusBox(){return document.querySelector('.status');}

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
    const section=liveForType();
    const results=section.results||{};
    (D.athletes||[]).forEach(a=>{
      const byName=results[a.name];
      if(!byName)return;
      a.actual=a.actual||[];
      D.events.forEach((eventName,i)=>{
        const raw=byName[eventName];
        if(raw==null)return;
        const mark=typeof raw==='object'?Number(raw.mark):Number(raw);
        if(Number.isFinite(mark))a.actual[i]=mark;
      });
    });
  }

  function syncLive(){
    applyLiveToAthletes();
    updateStatus();
  }

  const originalSetType=setType;
  setType=function(type){originalSetType(type);syncLive();};

  window.refreshMangekampLive=function(){syncLive();};
  syncLive();
})();
