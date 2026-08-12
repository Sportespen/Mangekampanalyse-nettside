(function(){
  const H=window.MANGEKAMP_HISTORY=window.MANGEKAMP_HISTORY||{};
  const set=(name,v,venue,date1,date2)=>{const ev=['100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m'];const rows={};ev.forEach((e,i)=>{const m=v[i];if(m==null)return;const d=i<5?date1:date2;const disp=e==='1500m'?`${Math.floor(m/60)}:${(m%60).toFixed(2).padStart(5,'0')}`:Number(m).toFixed(2);rows[e]=[[m,disp,venue,'2026',d]];});H[name]=Object.assign({},H[name]||{},rows);};
  set('Dai Keïta',[10.95,7.54,13.72,1.99,48.91,14.83,37.78,5.00,55.53,268.80],'Atletiekvereniging Heerenveen, Heerenveen','2026-05-09','2026-05-10');
  set('Zsombor Gálpál',[10.62,6.76,15.30,1.89,47.47,14.57,41.37,4.70,59.89,276.15],'UTE Atlétikai Stadion, Budapest','2026-06-13','2026-06-14');
  set('Leon Krummenacher',[11.20,6.68,13.77,1.96,50.41,14.54,47.00,5.00,63.80,271.37],'Landhaus, Teufen','2026-06-27','2026-06-28');
  set('Alberto Nonino',[10.90,7.18,12.90,1.93,48.26,14.68,42.26,5.10,49.56,257.80],'Stadio M.S. Cozzoli, Molfetta','2026-07-10','2026-07-11');
  set('Nino Portmann',[10.58,7.47,14.19,1.93,48.20,14.00,43.63,4.30,56.21,289.21],'Landhaus, Teufen','2026-06-27','2026-06-28');
  set('Emil Uhlin',[11.04,6.66,13.86,2.04,48.96,14.70,46.56,null,52.13,260.20],'Hayward Field, Eugene, OR','2026-06-10','2026-06-11');
})();
