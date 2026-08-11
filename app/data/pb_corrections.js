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

  // Luuk Pelkmans: Birmingham seed data mixed U20 and senior specifications.
  // Senior PBs: decathlon 8079 (11 Jun 2026), shot 15.70 (7.26 kg), 110H 14.20 (106.7 cm), discus 43.53 (2 kg).
  patch('men','Luuk Pelkmans','Kule',
    {display:'15.70',mark:15.70,points:833,venue:'Randal Tyson Indoor Center, Fayetteville, AR (USA) (i)',date:'31 JAN 2026'},
    {pb:8079,theoretical:8487,utilization:95.2,potential:408,diff_top:-830});
  patch('men','Luuk Pelkmans','110mh',
    {display:'14.20',mark:14.20,points:949,date:'08 MAY 2026'},
    {pb:8079,theoretical:8487,utilization:95.2,potential:408,diff_top:-830});
  patch('men','Luuk Pelkmans','Diskos',
    {display:'43.53',mark:43.53,points:737,venue:'Percy Beard Track, Gainesville, FL (USA)',date:'18 APR 2026'},
    {pb:8079,theoretical:8487,utilization:95.2,potential:408,diff_top:-830});

  // Leon Krummenacher: 50.08 was with the U20 1.75 kg discus.
  // Senior 2 kg PB: 47.00, Landhaus, Teufen (SUI), 28 Jun 2026.
  patch('men','Leon Krummenacher','Diskos',
    {display:'47.00',mark:47.00,points:808,venue:'Landhaus, Teufen (SUI)',date:'28 JUN 2026'},
    {theoretical:8063,utilization:99.1,potential:75,diff_top:-1254});

  // Makenson Gletty: senior-event PB corrections/venue verification.
  patch('men','Makenson Gletty','Kule',
    {display:'16.95',mark:16.95,points:910,venue:'Emirates Arena, Glasgow (GBR) (i)',date:'02 MAR 2024'},
    {theoretical:8909,utilization:96.6,potential:303,diff_top:-408});
  patch('men','Makenson Gletty','110mh',
    {display:'13.84',mark:13.84,points:995,venue:'Stadionring, Ratingen (GER)',date:'28 JUN 2026'});
  patch('men','Makenson Gletty','Spyd',
    {display:'62.89',mark:62.89,points:781,venue:'Japan National Stadium, Tokyo (JPN)',date:'21 SEP 2025'});

  // Tomas Järvinen: 8425 was his U20 decathlon (junior implements/hurdles), not a senior decathlon PB.
  // World Athletics lists senior decathlon PB 8400 at Götzis on 31 May 2026.
  // 13.61 was over U20 99.0 cm hurdles; senior 106.7 cm PB is 14.07 (Ostrava, 17 May 2026).
  // 49.18 was with the U20 1.75 kg discus; senior 2 kg PB is 43.76 (Götzis, 31 May 2026).
  patch('men','Tomas Järvinen','110mh',
    {display:'14.07',mark:14.07,points:965,venue:'Mestský Stadion, Ostrava (CZE)',date:'17 MAY 2026'},
    {pb:8400,theoretical:8626,utilization:97.4,potential:226,diff_top:-691});
  patch('men','Tomas Järvinen','Diskos',
    {display:'43.76',mark:43.76,points:741,venue:'Mösle-Stadium, Götzis (AUT)',date:'31 MAY 2026'},
    {pb:8400,theoretical:8626,utilization:97.4,potential:226,diff_top:-691});

  // Dai Keïta: 42.38 was with the U20 1.75 kg discus (Arona 2024).
  // Best verified senior 2 kg mark is 39.43 in Leuven on 4 Jul 2026.
  patch('men','Dai Keïta','Diskos',
    {display:'39.43',mark:39.43,points:653,venue:'Atletiek Arena Gaston Roelants, Leuven (BEL)',date:'04 JUL 2026'},
    {theoretical:8297,utilization:96.6,potential:286,diff_top:-1020});

  // Risto Lillemets: 15.81 is a valid senior (7.26 kg) PB from Götzis 2026, not a junior-implement error.
  patch('men','Risto Lillemets','Kule',
    {display:'15.81',mark:15.81,points:840,venue:'Mösle-Stadium, Götzis (AUT)',date:'30 MAY 2026'});

  // Niklas Kaul: 15.21 is a valid senior (7.26 kg) PB from Götzis 2026.
  patch('men','Niklas Kaul','Kule',
    {display:'15.21',mark:15.21,points:803,venue:'Mösle-Stadium, Götzis (AUT)',date:'30 MAY 2026'});

  // Zsombor Gálpál: 17.11 was not a senior 7.26 kg result. Verified senior PB is 15.79.
  patch('men','Zsombor Gálpál','Kule',
    {display:'15.79',mark:15.79,points:838,venue:'Nyíregyházi Atlétikai Centrum, Nyíregyháza (HUN) (i)',date:'22 FEB 2025'},
    {theoretical:8396,utilization:95.4,potential:390,diff_top:-921});
})();