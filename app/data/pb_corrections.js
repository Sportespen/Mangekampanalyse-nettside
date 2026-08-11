(function(){
  const R=window.MANGEKAMP_DATA||{};
  function patch(type,name,event,patch,summary){
    const section=R[type];
    if(!section)return;
    for(const listName of ['birmingham','gotzis']){
      const list=Array.isArray(section[listName])?section[listName]:[];
      const a=list.find(x=>x.name===name);
      if(!a)continue;
      if(a.bests?.[event])Object.assign(a.bests[event],patch);
      if(summary)Object.assign(a,summary);
    }
  }

  // Verified against World Athletics senior-event data.
  patch('men','Sander Skotheim','Kule',
    {display:'15.00',mark:15.00,points:790,venue:'Tallinn (EST) (i)'},
    {theoretical:9238,utilization:96.4,potential:329,diff_top:-79});

  // Luuk Pelkmans: 16m+ marks in the U20 database use the 6 kg implement.
  // Senior 7.26 kg PB: 15.70, Randal Tyson Indoor Center, Fayetteville, AR (USA), 31 Jan 2026.
  patch('men','Luuk Pelkmans','Kule',
    {display:'15.70',mark:15.70,points:833,venue:'Randal Tyson Indoor Center, Fayetteville, AR (USA) (i)'},
    {theoretical:8591,utilization:96.5,potential:298,diff_top:-726});

  // Leon Krummenacher: 50.08 was with the U20 1.75 kg discus.
  // Senior 2 kg PB: 47.00, Landhaus, Teufen (SUI), 28 Jun 2026.
  patch('men','Leon Krummenacher','Diskos',
    {display:'47.00',mark:47.00,points:808,venue:'Landhaus, Teufen (SUI)'},
    {theoretical:8063,utilization:99.1,potential:75,diff_top:-1254});
})();
