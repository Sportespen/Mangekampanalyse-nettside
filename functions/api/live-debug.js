const TRPC='https://proxy.european-athletics.com/trpc';
const COMPETITION_CODE='ECH26';
const UNIT='ATHWHEPTATH-----------JT--A00100--';
function enc(payload){return encodeURIComponent(JSON.stringify({json:payload}));}
async function q(event){const url=`${TRPC}/liveResults.getCombinedEventResultsFeed?input=${enc({event,competitionCode:COMPETITION_CODE,isSummary:false})}`;const r=await fetch(url,{headers:{'X-Client-Platform':'Desktop','Accept':'application/json','User-Agent':'Mozilla/5.0'},cf:{cacheTtl:0,cacheEverything:false}});let body=null;try{body=await r.json();}catch{}return{status:r.status,json:body?.result?.data?.json??null};}
function rowsFromPayload(payload){if(!payload)return[];if(Array.isArray(payload.athletes))return payload.athletes;if(Array.isArray(payload.results))return payload.results;const found=[];function walk(v,d=0){if(v==null||d>8)return;if(Array.isArray(v)){for(const x of v){if(x&&typeof x==='object'&&(x.athleteId!=null||x.federationId!=null)&&x.result!=null)found.push(x);else walk(x,d+1);}return;}if(typeof v==='object')for(const x of Object.values(v))walk(x,d+1);}walk(payload);return found;}
export async function onRequestGet({request}){
  try{
    const u=new URL(request.url);
    const liveTarget=`${u.origin}/api/live?t=${Date.now()}`;
    const [unitResp,liveResp]=await Promise.all([
      q(UNIT),
      fetch(liveTarget,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cf:{cacheTtl:0,cacheEverything:false}})
    ]);
    const live=await liveResp.json();
    const unitRows=rowsFromPayload(unitResp.json);
    const w=live?.women||{};
    const directSample=unitRows.slice(0,8).map(r=>({athleteId:r.athleteId??r.federationId??null,bib:r.bib??null,result:r.result??r.performance??r.mark??null,points:r.combinedResult?.points??r.points??null}));
    const liveSample=[];for(const [name,row] of Object.entries(w.results||{})){if(row?.Spyd)liveSample.push({name,spyd:row.Spyd.display??row.Spyd.mark,points:row.Spyd.points??null});if(liveSample.length>=8)break;}
    return new Response(JSON.stringify({
      diagnosticVersion:'UNIT_VS_LIVE_V1',
      unitId:UNIT,
      directUnitHttp:unitResp.status,
      directUnitRows:unitRows.length,
      directUnitSample:directSample,
      liveHttp:liveResp.status,
      liveUpdatedAt:live?.updatedAt||null,
      liveCompletedEvents:w.completedEvents??null,
      liveSpydEventHasMarks:w.eventHasMarks?.Spyd??null,
      liveSpydCount:Object.values(w.results||{}).filter(x=>x?.Spyd).length,
      liveSample
    },null,2),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate, max-age=0'}});
  }catch(e){return new Response(JSON.stringify({diagnosticVersion:'UNIT_VS_LIVE_V1',error:String(e?.message||e)},null,2),{status:500,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}
}
