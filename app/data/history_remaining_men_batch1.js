(function(){
  const H=window.MANGEKAMP_HISTORY=window.MANGEKAMP_HISTORY||{};
  const add=(name,venue,year,date,v)=>{H[name]=H[name]||{};const ev=['100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m'];ev.forEach((e,i)=>{if(v[i]==null)return;const mark=v[i];const display=e==='1500m'?`${Math.floor(mark/60)}:${(mark%60).toFixed(2).padStart(5,'0')}`:Number(mark).toFixed(2);H[name][e]=H[name][e]||[];if(!H[name][e].some(r=>Number(r[0])===Number(mark)&&String(r[2])===venue&&String(r[4]||'')===date))H[name][e].unshift([mark,display,venue,String(year),date]);});};
  add('Sven Roosen','Mösle-Stadium, Götzis (AUT)',2026,'2026-05-31',[10.52,7.12,14.69,1.88,47.52,14.08,48.07,4.70,65.07,263.31]);
  add('Karel Tilga','Mösle-Stadium, Götzis (AUT)',2026,'2026-05-31',[10.95,7.39,15.58,1.97,49.47,14.59,50.44,4.70,65.69,266.17]);
  add('Tomas Järvinen','Mösle-Stadium, Götzis (AUT)',2026,'2026-05-31',[10.61,7.48,12.88,2.09,47.69,14.18,43.76,4.90,62.20,275.82]);
})();