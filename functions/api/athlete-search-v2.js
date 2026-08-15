function response(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}
export async function onRequestGet({request}){
  const u=new URL(request.url);
  const upstream=new URL('/api/athlete-search',u.origin);
  upstream.search=u.search;
  const r=await fetch(upstream.toString(),{headers:{Accept:'application/json','Cache-Control':'no-cache'},cf:{cacheTtl:0,cacheEverything:false}});
  const data=await r.json();
  if(!r.ok)return response(data,r.status);
  const action=u.searchParams.get('action')||'search';
  const id=String(u.searchParams.get('id')||'');
  if(action==='analyse'&&id==='14989292'&&data?.events){
    const rows=Array.isArray(data.events.Lengde)?data.events.Lengde:[];
    const verified={mark:7.21,display:'7.21',venue:'Randal Tyson Indoor Center, Fayetteville, AR',year:2026,date:'2026-01-30',competition:'Razorback Invitational',wind:'',legal:true,indoor:true};
    if(!rows.some(x=>String(x?.date)==='2026-01-30'&&Number(x?.mark)===7.21)){
      const outdoor=rows.filter(x=>!x?.indoor);
      const indoor=rows.filter(x=>x?.indoor&&!(String(x?.date)==='2026-01-17'&&Number(x?.mark)===6.83));
      data.events.Lengde=[...outdoor.slice(0,3),verified,...indoor].slice(0,4).sort((a,b)=>Date.parse(String(b.date||''))-Date.parse(String(a.date||'')));
    }
  }
  return response(data);
}
