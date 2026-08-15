const TRPC='https://proxy.european-athletics.com/trpc';
const COMPETITION_CODE='ECH26';
const IDS=['ATHWHEPTATH-----------JT----------','ATHWHEPTATH-----------JT--A00100--','ATHWHEPTATH-----------JT--B00100--'];
function enc(payload){return encodeURIComponent(JSON.stringify({json:payload}));}
async function q(event,isSummary){const url=`${TRPC}/liveResults.getCombinedEventResultsFeed?input=${enc({event,competitionCode:COMPETITION_CODE,isSummary})}`;try{const r=await fetch(url,{headers:{'X-Client-Platform':'Desktop','Accept':'application/json','User-Agent':'Mozilla/5.0'},cf:{cacheTtl:0,cacheEverything:false}});const text=await r.text();let body;try{body=JSON.parse(text);}catch{body=text.slice(0,20000);}return{event,isSummary,status:r.status,body};}catch(e){return{event,isSummary,error:String(e)}}}
export async function onRequestGet(){const out=[];for(const id of IDS){out.push(await q(id,true));out.push(await q(id,false));}return new Response(JSON.stringify(out,null,2),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}
