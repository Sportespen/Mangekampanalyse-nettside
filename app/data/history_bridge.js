(function(){
  const H=window.MANGEKAMP_HISTORY||{};
  const R=window.MANGEKAMP_DATA||{};
  for(const type of ['men','women']){
    const section=R[type];
    if(!section) continue;
    const events=section.events||[];
    for(const listName of ['birmingham','gotzis']){
      const list=Array.isArray(section[listName])?section[listName]:[];
      for(const athlete of list){
        const hist=H[athlete.name];
        if(!hist) continue;
        athlete.recent=events.map(e=>(hist[e]||[]).map(r=>Number(r[0])));
        athlete.recentDetails=events.map(e=>(hist[e]||[]).map(r=>({mark:Number(r[0]),display:r[1]||'',venue:r[2]||'',year:r[3]||''})));
      }
    }
  }
})();