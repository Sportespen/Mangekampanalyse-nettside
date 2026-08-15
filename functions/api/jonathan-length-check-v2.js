function response(data,status=200){return new Response(JSON.stringify(data,null,2),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}
export async function onRequestGet({request}){
  const u=new URL(request.url);
  const target=new URL('/api/athlete-search-v2',u.origin);
  target.searchParams.set('action','analyse');
  target.searchParams.set('type','men');
  target.searchParams.set('id','14989292');
  target.searchParams.set('name','Jonathan Hertwig-Ødegaard');
  const r=await fetch(target.toString(),{headers:{Accept:'application/json','Cache-Control':'no-cache'},cf:{cacheTtl:0,cacheEverything:false}});
  let data={};
  try{data=await r.json();}catch(e){return response({ok:false,http:r.status,error:'invalid json from athlete-search-v2'},502);}
  const rows=Array.isArray(data?.events?.Lengde)?data.events.Lengde:[];
  return response({ok:r.ok,http:r.status,endpoint:'/api/athlete-search-v2',athleteId:String(data?.id||'14989292'),name:data?.name||'',lengthCount:rows.length,length:rows.map(x=>({date:x?.date,mark:x?.mark,display:x?.display,competition:x?.competition,venue:x?.venue,indoor:x?.indoor,wind:x?.wind}))});
}
