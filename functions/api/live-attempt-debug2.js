export async function onRequestGet({request}){
  try{
    const u=new URL(request.url);
    const target=`${u.origin}/api/live?t=${Date.now()}`;
    const r=await fetch(target,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cf:{cacheTtl:0,cacheEverything:false}});
    const live=await r.json();
    const results=live?.women?.results||{};
    let kateName=null,kate=null;
    for(const [name,row] of Object.entries(results)){
      const n=String(name).toLowerCase();
      if(n.includes("kate o'connor")||n.includes('kate o’connor')||n.includes('kate oconnor')){kateName=name;kate=row;break;}
    }
    const eventKeys=kate&&typeof kate==='object'?Object.keys(kate):[];
    const eventObjects={};
    for(const key of eventKeys){
      const v=kate?.[key];
      if(v&&typeof v==='object')eventObjects[key]={mark:v.mark??null,display:v.display??null,points:v.points??null,athleteId:v.athleteId??null,attempts:v.attempts??null,attemptsCount:Array.isArray(v.attempts)?v.attempts.length:null};
    }
    return new Response(JSON.stringify({diagnosticVersion:'KATE_EVENT_KEYS_V2',liveHttp:r.status,liveUpdatedAt:live?.updatedAt||null,kateName,eventKeys,eventObjects},null,2),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate, max-age=0'}});
  }catch(e){return new Response(JSON.stringify({diagnosticVersion:'KATE_EVENT_KEYS_V2',error:String(e?.message||e)},null,2),{status:500,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}
}
