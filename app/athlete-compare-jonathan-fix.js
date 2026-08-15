(function(){
  const nativeFetch=window.fetch.bind(window);
  const verified={mark:7.21,display:'7.21',venue:'Randal Tyson Indoor Center, Fayetteville, AR',year:2026,date:'2026-01-30',competition:'Razorback Invitational',wind:'',legal:true,indoor:true};
  function fix(data){
    if(!data||!data.events||!Array.isArray(data.events.Lengde))return data;
    const isJonathan=String(data.id||'')==='14989292'||/jonathan\s+hertwig/i.test(String(data.name||''));
    if(!isJonathan)return data;
    const rows=data.events.Lengde.slice();
    const isOldIndoor=r=>String(r?.date)==='2026-01-17'&&Number(r?.mark)===6.83;
    const outdoor=rows
      .filter(r=>!r?.indoor&&!isOldIndoor(r)&&String(r?.date)!=='2026-01-30')
      .sort((a,b)=>Date.parse(String(b.date||''))-Date.parse(String(a.date||'')));
    const corrected=[...outdoor.slice(0,3),verified]
      .filter((r,i,a)=>a.findIndex(x=>String(x.date)===String(r.date)&&Number(x.mark)===Number(r.mark))===i)
      .sort((a,b)=>Date.parse(String(b.date||''))-Date.parse(String(a.date||'')))
      .slice(0,4);
    data.events.Lengde=corrected;
    return data;
  }
  window.fetch=async function(input,init){
    const r=await nativeFetch(input,init);
    try{
      const url=typeof input==='string'?input:(input?.url||'');
      if(!/\/api\/athlete-search-v2\?/.test(url)||!/action=analyse/.test(url))return r;
      const data=fix(await r.clone().json());
      return new Response(JSON.stringify(data),{status:r.status,statusText:r.statusText,headers:r.headers});
    }catch(_e){return r;}
  };
})();
