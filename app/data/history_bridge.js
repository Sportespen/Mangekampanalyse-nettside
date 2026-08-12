(function(){
  const H=window.MANGEKAMP_HISTORY=window.MANGEKAMP_HISTORY||{};
  const add=(name,venue,year,v)=>{H[name]=H[name]||{};const ev=['100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m'];ev.forEach((e,i)=>{if(v[i]==null)return;const mark=v[i];const display=e==='1500m'?`${Math.floor(mark/60)}:${(mark%60).toFixed(2).padStart(5,'0')}`:Number(mark).toFixed(2);H[name][e]=H[name][e]||[];if(!H[name][e].some(r=>Number(r[0])===Number(mark)&&String(r[2])===venue))H[name][e].unshift([mark,display,venue,String(year)]);});};
  const addW=(name,venue,year,v)=>{H[name]=H[name]||{};const ev=['100mh','Høyde','Kule','200m','Lengde','Spyd','800m'];ev.forEach((e,i)=>{if(v[i]==null)return;const mark=v[i];const display=e==='800m'?`${Math.floor(mark/60)}:${(mark%60).toFixed(2).padStart(5,'0')}`:Number(mark).toFixed(2);H[name][e]=H[name][e]||[];if(!H[name][e].some(r=>Number(r[0])===Number(mark)&&String(r[2])===venue))H[name][e].unshift([mark,display,venue,String(year)]);});};
  // Verified World Athletics 2026 senior decathlon series used to backfill missing Birmingham forecast history.
  add('Amadeus Gräber','Mösle-Stadium, Götzis (AUT)',2026,[10.62,7.28,13.61,2.00,48.58,14.70,44.03,5.20,65.55,276.61]);
  add('Rasmus Roosleht','Stadionring, Ratingen (GER)',2026,[10.87,7.11,15.64,2.03,48.90,14.67,46.73,4.70,67.07,273.24]);
  add('Dario Dester','Stadionring, Ratingen (GER)',2026,[10.70,7.31,14.53,1.97,47.54,14.16,43.83,4.90,58.80,271.51]);
  add('Vilém Stráský','Stadion Miejski, Nakło nad Notecią (POL)',2026,[10.87,7.32,14.26,1.88,49.00,14.31,45.77,4.60,56.38,264.31]);
  add('Andrin Huber','Landhaus, Teufen (SUI)',2026,[10.87,6.79,14.87,1.93,48.76,14.38,43.51,4.90,60.27,271.26]);
  add('Risto Lillemets','Mösle-Stadium, Götzis (AUT)',2026,[10.87,6.99,15.81,1.85,49.06,14.64,46.71,4.70,61.18,273.25]);
  add('Luuk Pelkmans','Hayward Field, Eugene, OR (USA)',2026,[11.17,7.25,15.57,2.04,49.12,14.69,38.36,4.81,57.60,263.32]);
  add('Edgaras Benkunskas','Stadion Miejski, Nakło nad Notecią (POL)',2026,[11.19,7.06,15.66,2.00,50.29,14.31,48.59,4.60,65.12,290.04]);
  add('Ondřej Kopecký','Sports Stadium CESA VUT, Brno (CZE)',2026,[10.97,7.56,14.69,1.94,49.48,14.52,47.69,4.80,54.29,281.39]);
  add('Dai Keïta','Atletiekvereniging Heerenveen, Heerenveen (NED)',2026,[10.95,7.54,13.72,1.99,48.91,14.83,37.78,5.00,55.53,268.80]);
  add('Zsombor Gálpál','UTE Atlétikai Stadion, Budapest (HUN)',2026,[10.62,6.76,15.30,1.89,47.47,14.57,41.37,4.70,59.89,276.15]);
  add('Leon Krummenacher','Landhaus, Teufen (SUI)',2026,[11.20,6.68,13.77,1.96,50.41,14.54,47.00,5.00,63.80,271.37]);
  add('Alberto Nonino','Stadio M.S. Cozzoli, Molfetta (ITA)',2026,[10.90,7.18,12.90,1.93,48.26,14.68,42.26,5.10,49.56,257.80]);
  add('Nino Portmann','Landhaus, Teufen (SUI)',2026,[10.58,7.47,14.19,1.93,48.20,14.00,43.63,4.30,56.21,289.21]);
  add('Emil Uhlin','Hayward Field, Eugene, OR (USA)',2026,[11.04,6.66,13.86,2.04,48.96,14.70,46.56,null,52.13,260.20]);
  add('Antoine Ferranti','Antonio Domínguez Stadium, Arona (ESP)',2026,[11.13,7.46,13.66,2.12,48.25,14.61,41.06,4.90,54.14,254.44]);
  add('Jeff Tesselaar','Mösle-Stadium, Götzis (AUT)',2026,[10.66,7.61,14.57,1.94,47.35,14.60,44.62,4.50,53.79,258.40]);
  add('Jip de Greef','Demirjian Park, Champaign, IL (USA)',2026,[10.75,7.47,14.54,1.97,48.61,14.41,39.22,5.17,52.17,289.20]);
  // Verified World Athletics 2026 senior heptathlon series.
  addW('Vanessa Grimm','Mösle-Stadium, Götzis (AUT)',2026,[13.39,1.77,15.41,24.30,6.17,41.61,132.08]);
  addW('Jéssica Barreira','Estadio Universitario, Lisboa (POR)',2026,[13.15,1.62,15.30,24.13,6.48,45.83,140.20]);
  addW('Noor Vidts','Mösle-Stadium, Götzis (AUT)',2026,[13.24,1.74,13.79,24.45,6.21,42.55,129.67]);
  addW('Erika Wärff','Mösle-Stadium, Götzis (AUT)',2026,[13.63,1.83,13.87,24.70,6.01,49.76,140.57]);
  addW('Adéla Tkáčová','Sports Stadium CESA VUT, Brno (CZE)',2026,[13.59,1.73,12.77,23.22,6.14,43.33,134.03]);
  addW('Sarolta Kriszt','UTE Atlétikai Stadion, Budapest (HUN)',2026,[13.33,1.66,11.98,23.65,6.22,47.67,132.02]);
  addW('Lovisa Karlsson','Stadion Miejski, Nakło nad Notecią (POL)',2026,[13.03,1.68,13.36,24.28,6.45,41.88,136.67]);
  addW('Sofia Cosculluela','Hayward Field, Eugene, OR (USA)',2026,[13.46,1.69,12.64,24.09,6.52,44.06,138.11]);
  addW('Anastasia Ntragkomirova','Mösle-Stadium, Götzis (AUT)',2026,[14.19,1.74,15.34,25.61,6.31,45.25,150.52]);

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