(function(){
  const R=window.MANGEKAMP_DATA||{};
  const verified={
    men:{
      "Sander Skotheim":{
        "100m":{venue:"Mösle-Stadium, Götzis (AUT)",date:"31 MAY 2025"},
        "Lengde":{venue:"Tallinna Kergejõustikuhall, Tallinn (EST) (i)",date:"01 FEB 2025"},
        "Kule":{venue:"Tallinna Kergejõustikuhall, Tallinn (EST) (i)",date:"01 FEB 2025"},
        "Høyde":{venue:"Eva Lisa Holtz Arena, Karlstad (SWE) (i)",date:"12 FEB 2023"},
        "400m":{venue:"Stade de France, Paris (FRA)",date:"02 AUG 2024"},
        "110mh":{venue:"Friidrettsstadion, Jessheim (NOR)",date:"JUL 2023"},
        "Diskos":{venue:"Mösle-Stadium, Götzis (AUT)",date:"01 JUN 2025"},
        "Stav":{venue:"Bislett Stadion, Oslo (NOR)",date:"28 JUN 2023"},
        "Spyd":{venue:"Friidrettsstadion, Jessheim (NOR)",date:"23 AUG 2025"},
        "1500m":{venue:"Leppävaaran Stadion, Espoo (FIN)",date:"JUL 2023"}
      },
      "Johannes Erm":{
        "100m":{venue:"Stadio Olimpico, Roma (ITA)",date:"10 JUN 2024"},
        "Lengde":{venue:"Hayward Field, Eugene, OR (USA)",date:"06 JUN 2018"},
        "Kule":{venue:"Emirates Arena, Glasgow (GBR) (i)",date:"02 MAR 2024"},
        "Høyde":{venue:"Stade de France, Paris (FRA)",date:"02 AUG 2024"},
        "400m":{venue:"Stadio Olimpico, Roma (ITA)",date:"10 JUN 2024"},
        "110mh":{venue:"Athens, GA (USA)",date:"05 APR 2019"},
        "Diskos":{venue:"Kadrioru staadion, Tallinn (EST)",date:"09 AUG 2020"},
        "Stav":{venue:"Stade Pierre Paul Bernard, Talence (FRA)",date:"15 SEP 2024"},
        "Spyd":{venue:"Stadio Olimpico, Roma (ITA)",date:"11 JUN 2024"},
        "1500m":{venue:"Stade de France, Paris (FRA)",date:"03 AUG 2024"}
      }
    },
    women:{}
  };
  for(const type of ['men','women']){
    const section=R[type]; if(!section) continue;
    const athletes=[...(section.birmingham||[]),...(section.athletes||[])];
    for(const athlete of athletes){
      const rows=verified[type]?.[athlete.name]; if(!rows||!athlete.bests) continue;
      for(const [event,meta] of Object.entries(rows)){
        if(athlete.bests[event]) Object.assign(athlete.bests[event],meta);
      }
    }
  }
})();
