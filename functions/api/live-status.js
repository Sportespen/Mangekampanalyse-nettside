export async function onRequestGet({request}){
  try{
    const u=new URL(request.url);
    const target=`${u.origin}/api/live?t=${Date.now()}`;
    const r=await fetch(target,{headers:{Accept:'application/json'},cf:{cacheTtl:0,cacheEverything:false}});
    const data=await r.json();
    const w=data?.women||{};
    const sample=[];
    for(const [name,row] of Object.entries(w.results||{})){
      if(row?.Spyd) sample.push({name,spyd:row.Spyd.display??row.Spyd.mark,points:row.Spyd.points??null});
      if(sample.length>=8)break;
    }
    return new Response(JSON.stringify({
      http:r.status,
      updatedAt:data?.updatedAt||null,
      completedEvents:w.completedEvents??null,
      eventHasMarks:w.eventHasMarks||{},
      spydCount:Object.values(w.results||{}).filter(x=>x?.Spyd).length,
      sample
    },null,2),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate, max-age=0'}});
  }catch(e){
    return new Response(JSON.stringify({error:String(e?.message||e)},null,2),{status:500,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
  }
}
