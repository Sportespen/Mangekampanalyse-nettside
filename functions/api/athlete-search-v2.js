function response(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ø/gi,'o').toLowerCase();}
export async function onRequestGet({request}){
  const u=new URL(request.url);
  const upstream=new URL('/api/athlete-search',u.origin);
  upstream.search=u.search;
  const r=await fetch(upstream.toString(),{headers:{Accept:'application/json','Cache-Control':'no-cache'},cf:{cacheTtl:0,cacheEverything:false}});
  const data=await r.json();
  if(!r.ok)return response(data,r.status);
  const action=u.searchParams.get('action')||'search';
  const name=String(u.searchParams.get('name')||data?.name||'');
  const isJonathan=/jonathan\s+hertwig.*odegaard/.test(norm(name));
  if(action==='analyse'&&isJonathan&&data?.events){
    const rows=Array.isArray(data.events.Lengde)?data.events.Lengde:[];
    const verified={mark:7.21,display:'7.21',venue:'Randal Tyson Indoor Center, Fayetteville, AR',year:2026,date:'2026-01-30',competition:'Razorback Invitational',wind:'',legal:true,indoor:true};
    const withoutOldIndoor=rows.filter(x=>!(String(x?.date)==='2026-01-17'&&Number(x?.mark)===6.83));
    const outdoor=withoutOldIndoor.filter(x=>!x?.indoor).sort((a,b)=>Date.parse(String(b.date||''))-Date.parse(String(a.date||'')));
    data.events.Lengde=[...outdoor.slice(0,3),verified].sort((a,b)=>Date.parse(String(b.date||''))-Date.parse(String(a.date||'')));
  }
  return response(data);
}
