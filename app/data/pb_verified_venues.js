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
      },
      "Leo Neugebauer":{
        "100m":{venue:"Mike A. Myers Stadium, Austin, TX (USA)",date:"07 JUN 2023"},
        "Lengde":{venue:"Nemzeti Atlétikai Központ, Budapest (HUN)",date:"25 AUG 2023"},
        "Kule":{venue:"Hayward Field, Eugene, OR (USA)",date:"05 JUN 2024"},
        "Høyde":{venue:"The Track at New Balance, Boston, MA (USA) (i)",date:"08 MAR 2024"},
        "400m":{venue:"Mike A. Myers Stadium, Austin, TX (USA)",date:"07 JUN 2023"},
        "110mh":{venue:"Mike A. Myers Stadium, Austin, TX (USA)",date:"30 MAR 2023"},
        "Diskos":{venue:"Hilmer Lodge Stadium, Walnut, CA (USA)",date:"19 APR 2024"},
        "Stav":{venue:"Enwag-Stadion, Wetzlar (GER)",date:"21 JUL 2024"},
        "Spyd":{venue:"Japan National Stadium, Tokyo (JPN)",date:"21 SEP 2025"},
        "1500m":{venue:"Japan National Stadium, Tokyo (JPN)",date:"21 SEP 2025"}
      },
      "Niklas Kaul":{
        "100m":{venue:"Mösle-Stadium, Götzis (AUT)",date:"31 MAY 2025"},
        "Lengde":{venue:"Stadio Olimpico, Roma (ITA)",date:"10 JUN 2024"},
        "Kule":{venue:"Mösle-Stadium, Götzis (AUT)",date:"30 MAY 2026"},
        "Høyde":{venue:"Olympic Stadium, Tokyo (JPN)",date:"04 AUG 2021"},
        "400m":{venue:"Olympiastadion, München (GER)",date:"15 AUG 2022"},
        "110mh":{venue:"Michael-Hoffmann-Stadion, Mannheim (GER)",date:"20 MAY 2024"},
        "Diskos":{venue:"Stadio Olimpico, Roma (ITA)",date:"11 JUN 2024"},
        "Stav":{venue:"Khalifa International Stadium, Doha (QAT)",date:"03 OCT 2019"},
        "Spyd":{venue:"Khalifa International Stadium, Doha (QAT)",date:"03 OCT 2019"},
        "1500m":{venue:"Olympiastadion, München (GER)",date:"16 AUG 2022"}
      },
      "Sven Roosen":{
        "100m":{venue:"Mösle-Stadium, Götzis (AUT)",date:"18 MAY 2024"},
        "Lengde":{venue:"Stade de France, Paris (FRA)",date:"02 AUG 2024"},
        "Kule":{venue:"Stade de France, Paris (FRA)",date:"02 AUG 2024"},
        "Høyde":{venue:"Mösle-Stadium, Götzis (AUT)",date:"18 MAY 2024"},
        "400m":{venue:"Stade de France, Paris (FRA)",date:"02 AUG 2024"},
        "110mh":{venue:"Atletiekbaan Breda, Breda (NED)",date:"20 JUL 2024"},
        "Diskos":{venue:"AtletiekArena Gaston Roelants Kessel-Lo / Hal 5, Leuven (BEL)",date:"16 AUG 2025"},
        "Stav":{venue:"AtletiekArena Gaston Roelants Kessel-Lo / Hal 5, Leuven (BEL)",date:"16 AUG 2025"},
        "Spyd":{venue:"Mösle-Stadium, Götzis (AUT)",date:"31 MAY 2026"},
        "1500m":{venue:"Olympiastadion, München (GER)",date:"16 AUG 2022"}
      },
      "Karel Tilga":{
        "100m":{venue:"Nemzeti Atlétikai Központ, Budapest (HUN)",date:"25 AUG 2023"},
        "Lengde":{venue:"Spec Towns Track, Athens, GA (USA)",date:"09 APR 2021"},
        "Kule":{venue:"Stadionring, Ratingen (GER)",date:"22 JUN 2024"},
        "Høyde":{venue:"Tartu (EST) (i)",date:"19 JAN 2018"},
        "400m":{venue:"Nemzeti Atlétikai Központ, Budapest (HUN)",date:"25 AUG 2023"},
        "110mh":{venue:"Mösle-Stadium, Götzis (AUT)",date:"31 MAY 2026"},
        "Diskos":{venue:"Mösle-Stadium, Götzis (AUT)",date:"01 JUN 2025"},
        "Stav":{venue:"Randal Tyson Indoor Center, Fayetteville, AR (USA) (i)",date:"12 MAR 2021"},
        "Spyd":{venue:"Olympic Stadium, Tokyo (JPN)",date:"05 AUG 2021"},
        "1500m":{venue:"Nemzeti Atlétikai Központ, Budapest (HUN)",date:"26 AUG 2023"}
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