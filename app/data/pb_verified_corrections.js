(function(){
  const D=window.MANGEKAMP_DATA||{};
  function athlete(type,name){return (D[type]?.birmingham||[]).find(a=>a.name===name);}
  function setBest(type,name,event,patch){
    const a=athlete(type,name); if(!a||!a.bests||!a.bests[event]) return;
    Object.assign(a.bests[event],patch);
  }
  function setSummary(type,name,patch){const a=athlete(type,name);if(a)Object.assign(a,patch);}

  // Verifisert mot World Athletics seniorresultater.
  setBest('men','Sander Skotheim','Kule',{display:'15.00',mark:15.00,points:790,venue:'Tallinna Kergejõustikuhall, Tallinn (EST) (i)',date:'01 FEB 2025'});
  setSummary('men','Sander Skotheim',{theoretical:9238,utilization:96.4,potential:329});

  // Risto satte 15.81 med seniorredskap i Götzis 30. mai 2026.
  setBest('men','Risto Lillemets','Kule',{display:'15.81',mark:15.81,points:840,venue:'Mösle-Stadium, Götzis (AUT)',date:'30 MAY 2026'});

  // Niklas satte 15.21 med seniorredskap i Götzis 30. mai 2026.
  setBest('men','Niklas Kaul','Kule',{display:'15.21',mark:15.21,points:803,venue:'Mösle-Stadium, Götzis (AUT)',date:'30 MAY 2026'});

  // 17.11 var ikke senior-PB. World Athletics viser 15.79 som senior-PB, Nyíregyháza 22. feb. 2025.
  setBest('men','Zsombor Gálpál','Kule',{display:'15.79',mark:15.79,points:838,venue:'Nyíregyházi Atlétikai Centrum, Nyíregyháza (HUN) (i)',date:'22 FEB 2025'});
  setSummary('men','Zsombor Gálpál',{theoretical:8396,utilization:95.4,potential:390});
})();
