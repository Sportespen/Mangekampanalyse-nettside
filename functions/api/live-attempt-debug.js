export async function onRequestGet({request}){
  try{
    const u=new URL(request.url);
    const target=`${u.origin}/api/live?t=${Date.now()}`;
    const r=await fetch(target,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cf:{cacheTtl:0,cacheEverything:false}});
    const live=await r.json();
    const results=live?.women?.results||{};
    let kateName=null,kate=null;
    for(const [name,row] of Object.entries(results)){
      if(String(name).toLowerCase().includes("kate o'connor")||String(name).toLowerCase().includes('kate o’connor')||String(name).toLowerCase().includes('kate oconnor')){
        kateName=name;kate=row;break;
      }
    }
    const spyd=kate?.Spyd||null;
    return new Response(JSON.stringify({
      diagnosticVersion:'KATE_SPYD_ATTEMPTS_V1',
      liveHttp:r.status,
      liveUpdatedAt:live?.updatedAt||null,
      kateName,
      spyd,
      attempts:spyd?.attempts||null,
      attemptsCount:Array.isArray(spyd?.attempts)?spyd.attempts.length:null
    },null,2),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate, max-age=0'}});
  }catch(e){return new Response(JSON.stringify({diagnosticVersion:'KATE_SPYD_ATTEMPTS_V1',error:String(e?.message||e)},null,2),{status:500,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}
}
