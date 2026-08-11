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
    {display:'15.00',mark:15.00,points:790,venue:'Tallinna Kergejõustikuhall, Tallinn (EST) (i)',date:'01 FEB 2025'},
    {theoretical:9238,utilization:96.4,potential:329,diff_top:-79});

  // Luuk Pelkmans: 16m+ marks in the U20 database use the 6 kg implement.
  // Senior 7.26 kg PB: 15.70, Randal Tyson Indoor Center, Fayetteville, AR (USA), 31 Jan 2026.
  patch('men','Luuk Pelkmans','Kule',
    {display:'15.70',mark:15.70,points:833,venue:'Randal Tyson Indoor Center, Fayetteville, AR (USA) (i)',date:'31 JAN 2026'},
    {theoretical:8591,utilization:96.5,potential:298,diff_top:-726});

  // Leon Krummenacher: 50.08 was with the U20 1.75 kg discus.
  // Senior 2 kg PB: 47.00, Landhaus, Teufen (SUI), 28 Jun 2026.
  patch('men','Leon Krummenacher','Diskos',
    {display:'47.00',mark:47.00,points:808,venue:'Landhaus, Teufen (SUI)',date:'28 JUN 2026'},
    {theoretical:8063,utilization:99.1,potential:75,diff_top:-1254});

  // Makenson Gletty: 17.07 is not the senior 7.26 kg PB. World Athletics lists 16.95 as the PB,
  // achieved at the 2024 World Indoor Championships in Glasgow.
  patch('men','Makenson Gletty','Kule',
    {display:'16.95',mark:16.95,points:910,venue:'Emirates Arena, Glasgow (GBR) (i)',date:'02 MAR 2024'},
    {theoretical:8909,utilization:96.6,potential:303,diff_top:-408});
})();
