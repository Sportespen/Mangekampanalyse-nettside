(function(){
  if(window.__MKA_TERMINAL_NORMALIZER)return;window.__MKA_TERMINAL_NORMALIZER=true;
  const EVENTS={men:['100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m'],women:['100mh','Høyde','Kule','200m','Lengde','Spyd','800m']};
  const TERMINAL=new Set(['DNS','DNF','DQ','NM','NH']);
  function statusOf(raw){if(!raw||typeof raw!=='object')return null;const s=String(raw.resultStatus||raw.display||raw.status||'').trim().toUpperCase();return TERMINAL.has(s)?s:null;}
  function normalizeSection(type){
    const live=window.MANGEKAMP_LIVE||{},section=live[type];if(!section)return false;
    const events=EVENTS[type],completed=Math.max(0,Math.min(events.length,Number(section.completedEvents)||0));if(!completed)return false;
    const finalState=completed>=events.length||String(live.liveState||'').toLowerCase()==='post_live';
    const results=section.results||(section.results={});let changed=false;
    Object.entries(results).forEach(([name,row])=>{
      if(!row||typeof row!=='object')return;
      for(let i=0;i<completed;i++)if(statusOf(row[events[i]]))return;
      let firstMissing=-1,lastPresent=-1;
      for(let i=0;i<completed;i++){if(row[events[i]]!=null)lastPresent=i;else if(firstMissing<0)firstMissing=i;}
      if(firstMissing<0)return;
      for(let i=firstMissing+1;i<completed;i++)if(row[events[i]]!=null)return;
      if(!finalState&&firstMissing>=completed-1)return;
      const code=lastPresent<0?'DNS':'DNF';
      row[events[firstMissing]]={display:code,resultStatus:code,status:code};changed=true;
    });
    if(finalState&&window.ROOT?.[type]?.athletes){
      const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,' ').trim().toLowerCase();
      const liveNames=new Set(Object.keys(results).map(norm));
      window.ROOT[type].athletes.forEach(a=>{if(!a?.name||liveNames.has(norm(a.name)))return;results[a.name]={nation:a.nation||'',birth:a.birth||'', [events[0]]:{display:'DNS',resultStatus:'DNS',status:'DNS'}};changed=true;});
    }
    return changed;
  }
  function normalizeAll(){return normalizeSection('men')|normalizeSection('women');}
  window.normalizeMangekampTerminalStatuses=normalizeAll;
  normalizeAll();
  let last='';setInterval(()=>{const live=window.MANGEKAMP_LIVE||{},sig=String(live.updatedAt||'')+'|'+String(live.men?.completedEvents||0)+'|'+String(live.women?.completedEvents||0);if(sig===last)return;last=sig;if(normalizeAll()&&typeof window.syncLive==='function')window.syncLive();},500);
})();