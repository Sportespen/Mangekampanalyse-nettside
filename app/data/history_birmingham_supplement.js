(function(){
const H=window.MANGEKAMP_HISTORY=window.MANGEKAMP_HISTORY||{};
const add=(name,venue,year,v)=>{H[name]=H[name]||{};const ev=['100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m'];ev.forEach((e,i)=>{if(v[i]==null)return;const mark=v[i];const display=e==='1500m'?`${Math.floor(mark/60)}:${(mark%60).toFixed(2).padStart(5,'0')}`:Number(mark).toFixed(2);H[name][e]=H[name][e]||[];if(!H[name][e].some(r=>Number(r[0])===Number(mark)&&String(r[2])===venue))H[name][e].unshift([mark,display,venue,String(year)]);});};
// World Athletics 2026 senior decathlon toplists / official combined-event series.
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
// Pole vault was N/A in this particular decathlon; remaining nine valid marks are retained.
add('Emil Uhlin','Hayward Field, Eugene, OR (USA)',2026,[11.04,6.66,13.86,2.04,48.96,14.70,46.56,null,52.13,260.20]);
})();
