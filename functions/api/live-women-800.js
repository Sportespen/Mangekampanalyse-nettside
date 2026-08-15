const TRPC='https://proxy.european-athletics.com/trpc';
const COMPETITION_CODE='ECH26';
const PHASE='ATHWHEPTATH-----------800---------';
const HEATS=[1,2,3,4,5].map(n=>`ATHWHEPTATH-----------800-000${n}00--`);

function enc(payload){return encodeURIComponent(JSON.stringify({json:payload}));}
async function query(proc,payload,allow404=false){
  const url=`${TRPC}/${proc}?input=${enc(payload)}`;
  const r=await fetch(url,{headers:{'X-Client-Platform':'Desktop','Accept':'application/json','User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36'},cf:{cacheTtl:0,cacheEverything:false}});
  if(allow404&&r.status===404)return null;
  if(!r.ok)throw new Error(`${proc}: HTTP ${r.status}`);
  const data=await r.json();
  return data?.result?.data?.json??null;
}
function cleanName(v){return String(v||'').replace(/\s+/g,' ').trim();}
function athleteObjects(payload){
  const out=[],seen=new Set();
  function walk(v,depth=0){
    if(v==null||depth>6)return;
    if(Array.isArray(v)){for(const x of v)walk(x,depth+1);return;}
    if(typeof v!=='object')return;
    const hasName=!!(v.fullName||v.firstName||v.lastName||v.name||v.athleteName);
    const hasKey=v.athleteId!=null||v.federationId!=null||v.id!=null||v.bib!=null;
    if(hasName&&hasKey){const key=String(v.athleteId??v.federationId??v.id??v.bib);if(!seen.has(key)){seen.add(key);out.push(v);}}
    for(const x of Object.values(v))walk(x,depth+1);
  }
  walk(payload);return out;
}
async function athleteMap(){
  const data=await query('liveResults.getAthletesFeed',{competitionCode:COMPETITION_CODE})||{};
  const out={};
  for(const a of athleteObjects(data)){
    const meta={name:cleanName(a.fullName||a.name||a.athleteName||`${a.firstName||''} ${a.lastName||''}`),nation:String(a.countryCode||a.nation||a.country||''),birth:String(a.birthDate||a.dateOfBirth||a.yearOfBirth||'')};
    for(const id of [a.athleteId,a.federationId,a.id])if(id!=null&&String(id)!=='')out['id:'+String(id)]=meta;
    if(a.bib!=null&&String(a.bib)!=='')out['bib:'+String(a.bib)]=meta;
  }
  return out;
}
function looksLikeAthleteRow(v){return !!(v&&typeof v==='object'&&!Array.isArray(v)&&(v.athleteId!=null||v.federationId!=null||v.fullName||v.athleteName));}
function rowsFromPayload(payload){
  if(!payload)return[];
  if(Array.isArray(payload.athletes))return payload.athletes;
  if(Array.isArray(payload.results)&&payload.results.some(looksLikeAthleteRow))return payload.results;
  if(Array.isArray(payload)&&payload.some(looksLikeAthleteRow))return payload;
  const found=[],seen=new Set();
  function walk(v,depth=0){
    if(v==null||depth>8)return;
    if(Array.isArray(v)){for(const item of v){if(looksLikeAthleteRow(item)){const key=String(item.athleteId??item.federationId??item.fullName??item.athleteName??found.length);if(!seen.has(key)){seen.add(key);found.push(item);}}else walk(item,depth+1);}return;}
    if(typeof v==='object')for(const child of Object.values(v))walk(child,depth+1);
  }
  walk(payload);return found;
}
function scalarResult(value,depth=0){
  if(value==null||depth>4)return null;
  if(typeof value!=='object')return value;
  if(Array.isArray(value))return null;
  for(const k of ['result','results','performance','mark','value','distance','bestResult','resultValue','bestResultValue','bestMark','bestPerformance','resultMark','best']){
    if(value[k]!=null){const found=scalarResult(value[k],depth+1);if(found!=null&&String(found).trim()!=='')return found;}
  }
  return null;
}
function rawResult(row){
  for(const value of [row?.result,row?.performance,row?.mark,row?.resultValue,row?.bestResult,row?.bestMark,row?.bestResultValue,row?.bestPerformance,row?.resultMark,row?.best]){
    const c=scalarResult(value);if(c!=null&&String(c).trim()!=='')return c;
  }
  return null;
}
function parse800(value){
  if(value==null)return null;
  let text=String(value).trim().replace(',','.');
  if(!text||/^(DNS|DNF|DQ|NM|NH)$/i.test(text)||['—','-'].includes(text))return null;
  text=text.replace(/\s*(?:PB|SB|NR|CR|WL|EL|WR|Q|q)\b.*$/i,'').trim();
  if(text.includes(':')){const p=text.split(':');const sec=Number(p[p.length-2])*60+Number(p[p.length-1]);return Number.isFinite(sec)?sec:null;}
  const m=text.match(/\d+(?:\.\d+)?/);return m?Number(m[0]):null;
}
function terminal(v){const t=String(v??'').trim().toUpperCase();return ['DNS','DNF','DQ','NM','NH'].includes(t)?t:null;}

export async function onRequestGet(){
  try{
    const athletes=await athleteMap();
    const payloads=await Promise.all(HEATS.map(unit=>query('liveResults.getCombinedEventResultsFeed',{event:unit,competitionCode:COMPETITION_CODE,isSummary:false},true).catch(()=>null)));
    const results={};let count=0;
    for(const payload of payloads){
      for(const row of rowsFromPayload(payload)){
        const id=String(row.athleteId||row.federationId||''),bib=String(row.bib||'');
        const meta=athletes['id:'+id]||athletes['bib:'+bib]||{};
        const name=meta.name||cleanName(row.fullName||row.name||row.athleteName||'');
        const raw=rawResult(row),mark=parse800(raw),status=terminal(raw)||terminal(row.status)||terminal(row.resultStatus)||terminal(row.athleteStatus);
        if(!name||(mark==null&&!status))continue;
        const cr=row.combinedResult&&typeof row.combinedResult==='object'?row.combinedResult:{};
        const entry=results[name]||={};
        if(meta.nation)entry.nation=meta.nation;if(meta.birth)entry.birth=meta.birth;
        entry['800m']={mark,display:status||String(raw??''),resultStatus:status,points:status?0:(cr.points??row.points??null),status:String(row.status||''),wind:'',athleteId:id||null,attempts:[],attemptMode:'series',bestRoundNo:null,pointsBefore:cr.pointsBefore??null,pointsAfter:cr.pointsAfter??null,rankBefore:cr.rankBefore??null,rankAfter:cr.rankAfter??null};
        count++;
      }
    }
    return new Response(JSON.stringify({competition:'EM Birmingham 2026',updatedAt:new Date().toISOString(),women:{results,eventStatus:{'800m':''},eventHasMarks:{'800m':count}}}),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate, max-age=0','access-control-allow-origin':'*'}});
  }catch(err){return new Response(JSON.stringify({error:String(err?.message||err),updatedAt:new Date().toISOString()}),{status:502,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}
}
