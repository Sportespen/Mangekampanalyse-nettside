(function(){
  const H=window.MANGEKAMP_HISTORY=window.MANGEKAMP_HISTORY||{};
  const add=(name,event,rows)=>{
    H[name]=H[name]||{};
    const current=Array.isArray(H[name][event])?H[name][event]:[];
    const all=[...rows,...current].filter(r=>Array.isArray(r)&&Number.isFinite(Number(r[0])));
    all.sort((a,b)=>Date.parse(String(b[4]||''))-Date.parse(String(a[4]||'')));
    const seen=new Set();
    H[name][event]=all.filter(r=>{
      const key=[Number(r[0]).toFixed(3),String(r[4]||''),String(r[2]||'')].join('|');
      if(seen.has(key))return false;
      seen.add(key);return true;
    }).slice(0,4);
  };

  // Jip de Greef – World Athletics verified senior performances, 2026.
  add('Jip de Greef','100m',[[10.78,'10.78','Hayward Field, Eugene, OR','2026','2026-06-10','NCAA Division I Outdoor Championships']]);
  add('Jip de Greef','Lengde',[[7.27,'7.27','Hayward Field, Eugene, OR','2026','2026-06-10','NCAA Division I Outdoor Championships']]);
  add('Jip de Greef','Kule',[[13.71,'13.71','Hayward Field, Eugene, OR','2026','2026-06-10','NCAA Division I Outdoor Championships']]);
  add('Jip de Greef','Høyde',[[1.92,'1.92','Hayward Field, Eugene, OR','2026','2026-06-10','NCAA Division I Outdoor Championships']]);
  add('Jip de Greef','110mh',[[14.26,'14.26','Demirjian Park, Champaign, IL','2026','2026-05-08','Illini Tune-Up']]);
  add('Jip de Greef','Stav',[[5.24,'5.24','Demirjian Park, Champaign, IL','2026','2026-05-08','Illini Tune-Up']]);

  // Leon Krummenacher – senior Multistars, Brescia 25–26 April 2026.
  add('Leon Krummenacher','100m',[[11.43,'11.43','Centro Gabre Gabric, Brescia','2026','2026-04-25','39th Multistars']]);
  add('Leon Krummenacher','Kule',[[13.87,'13.87','Centro Gabre Gabric, Brescia','2026','2026-04-25','39th Multistars']]);
  add('Leon Krummenacher','Høyde',[[1.95,'1.95','Centro Gabre Gabric, Brescia','2026','2026-04-25','39th Multistars']]);
  add('Leon Krummenacher','400m',[[50.79,'50.79','Centro Gabre Gabric, Brescia','2026','2026-04-25','39th Multistars']]);
  add('Leon Krummenacher','110mh',[[14.60,'14.60','Centro Gabre Gabric, Brescia','2026','2026-04-26','39th Multistars']]);
  add('Leon Krummenacher','Diskos',[[42.40,'42.40','Centro Gabre Gabric, Brescia','2026','2026-04-26','39th Multistars']]);
  add('Leon Krummenacher','Stav',[[4.95,'4.95','Centro Gabre Gabric, Brescia','2026','2026-04-26','39th Multistars']]);
  add('Leon Krummenacher','Spyd',[[63.07,'63.07','Centro Gabre Gabric, Brescia','2026','2026-04-26','39th Multistars']]);
  add('Leon Krummenacher','1500m',[[271.41,'4:31.41','Centro Gabre Gabric, Brescia','2026','2026-04-26','39th Multistars']]);
})();
