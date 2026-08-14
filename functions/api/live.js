const TRPC = 'https://proxy.european-athletics.com/trpc';
const COMPETITION_CODE = 'ECH26';

const MEN = [
  ['100m','ATHMDECATH------------100---------'],
  ['Lengde','ATHMDECATH------------LJ----------',['ATHMDECATH------------LJ--A00100--','ATHMDECATH------------LJ--B00100--']],
  ['Kule','ATHMDECATH------------SP----------',['ATHMDECATH------------SP--A00100--','ATHMDECATH------------SP--B00100--']],
  ['Høyde','ATHMDECATH------------HJ----------',['ATHMDECATH------------HJ--A00100--','ATHMDECATH------------HJ--B00100--']],
  ['400m','ATHMDECATH------------400---------'],
  ['110mh','ATHMDECATH------------110H--------'],
  ['Diskos','ATHMDECATH------------DT----------',['ATHMDECATH------------DT--A00100--','ATHMDECATH------------DT--B00100--']],
  ['Stav','ATHMDECATH------------PV----------',['ATHMDECATH------------PV--A00100--','ATHMDECATH------------PV--B00100--']],
  ['Spyd','ATHMDECATH------------JT----------',['ATHMDECATH------------JT--A00100--','ATHMDECATH------------JT--B00100--']],
  ['1500m','ATHMDECATH------------1500--------']
];
const WOMEN = [
  ['100mh','ATHWHEPTATH-----------100H--------'],
  ['Høyde','ATHWHEPTATH-----------HJ----------',['ATHWHEPTATH-----------HJ--A00100--','ATHWHEPTATH-----------HJ--B00100--']],
  ['Kule','ATHWHEPTATH-----------SP----------',['ATHWHEPTATH-----------SP--A00100--','ATHWHEPTATH-----------SP--B00100--']],
  ['200m','ATHWHEPTATH-----------200---------'],
  ['Lengde','ATHWHEPTATH-----------LJ----------',['ATHWHEPTATH-----------LJ--A00100--','ATHWHEPTATH-----------LJ--B00100--']],
  ['Spyd','ATHWHEPTATH-----------JT----------',['ATHWHEPTATH-----------JT--A00100--','ATHWHEPTATH-----------JT--B00100--']],
  ['800m','ATHWHEPTATH-----------800---------']
];
const TERMINAL = new Set(['DNS','DNF','DQ','NM','NH']);
function enc(payload){return encodeURIComponent(JSON.stringify({json:payload}));}
async function query(proc,payload,allow404=false){const url=`${TRPC}/${proc}?input=${enc(payload)}`;const r=await fetch(url,{headers:{'X-Client-Platform':'Desktop','Accept':'application/json','User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36'},cf:{cacheTtl:0,cacheEverything:false}});if(allow404&&r.status===404)return null;if(!r.ok)throw new Error(`${proc}: HTTP ${r.status}`);const data=await r.json();return data?.result?.data?.json??null;}
function rawStatus(value){const t=String(value??'').trim().toUpperCase();return TERMINAL.has(t)?t:null;}
function parseMark(event,value){if(value==null)return null;let text=String(value).trim().replace(',','.');if(!text||TERMINAL.has(text.toUpperCase())||['—','-'].includes(text))return null;text=text.replace(/\s*(?:PB|SB|NR|CR|WL|EL|WR|Q|q)\b.*$/i,'').trim();if(text.includes(':')&&(event==='1500m'||event==='800m')){const p=text.split(':');const sec=Number(p[p.length-2])*60+Number(p[p.length-1]);return Number.isFinite(sec)?sec:null;}const m=text.match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):null;}
function cleanName(v){return String(v||'').replace(/\s+/g,' ').trim();}
function cleanAttempts(value){if(!Array.isArray(value))return[];return value.map((a,i)=>{if(a==null)return null;if(typeof a!=='object')return{attemptId:i+1,result:String(a)};const result=a.results??a.result??a.mark??a.value??a.height??'';if(result==null||String(result).trim()==='')return null;return{attemptId:Number(a.attemptId??a.round??a.roundNo??i+1),result:String(result).trim(),wind:String(a.wind??a.resultWind??'').trim()};}).filter(Boolean);}
function verticalAttempts(row){
  const src=row?.attempts;
  if(!Array.isArray(src))return[];
  const out=[];
  for(let i=0;i<src.length;i++){
    const a=src[i];
    if(!a||typeof a!=='object')continue;
    const height=a.height??a.barHeight??a.attemptHeight??a.value??a.mark;
    // European Athletics uses the field name `attempts` for the O/X/- marker
    // on each height row (for example {height:'4.70', attempts:'o'}).
    const result=a.attempts??a.results??a.result??a.status??a.attemptResult??a.trial;
    if(height==null)continue;
    const marker=result==null||String(result).trim()===''?'-':String(result).trim();
    out.push({attemptId:Number(a.roundId??a.attemptId??a.round??i+1),height:String(height).trim(),result:marker});
  }
  return out;
}
async function athleteMap(){const data=await query('liveResults.getAthletesFeed',{competitionCode:COMPETITION_CODE})||{};const out={};for(const a of(data.athletes||[])){const id=String(a.athleteId||a.federationId||'');if(!id)continue;out[id]={name:cleanName(a.fullName||`${a.firstName||''} ${a.lastName||''}`),nation:String(a.countryCode||a.nation||a.country||''),birth:String(a.birthDate||a.dateOfBirth||a.yearOfBirth||'')};}return out;}
async function statusesMap(){const data=await query('liveResults.getEventStatusesFeed',{competitionCode:COMPETITION_CODE})||{};const out={};for(const i of(data.eventStatuses||[]))out[String(i.eventId)]=String(i.status||'');return out;}
function rowsFromPayload(payload){if(!payload)return[];if(Array.isArray(payload.athletes))return payload.athletes;if(Array.isArray(payload.results))return payload.results;if(Array.isArray(payload))return payload;return[];}
async function eventRows(phaseId,groupIds=[]){const requests=[query('liveResults.getCombinedEventResultsFeed',{event:phaseId,competitionCode:COMPETITION_CODE,isSummary:true},true).catch(()=>null),query('liveResults.getCombinedEventResultsFeed',{event:phaseId,competitionCode:COMPETITION_CODE,isSummary:false},true).catch(()=>null),...groupIds.map(groupId=>query('liveResults.getCombinedEventResultsFeed',{event:groupId,competitionCode:COMPETITION_CODE,isSummary:false},true).catch(()=>null))];const payloads=await Promise.all(requests),byAthlete=new Map(),anonymous=[];for(const payload of payloads){for(const row of rowsFromPayload(payload)){const id=String(row?.athleteId||row?.federationId||'');if(!id){anonymous.push(row);continue;}const prev=byAthlete.get(id)||{};const next={...prev,...row};if(Array.isArray(row?.attempts)&&row.attempts.length)next.attempts=row.attempts;if(Array.isArray(row?.results))next.results=row.results;if(Array.isArray(row?.trials))next.trials=row.trials;if(Array.isArray(row?.series))next.series=row.series;if(Array.isArray(row?.attemptResults))next.attemptResults=row.attemptResults;if(Array.isArray(row?.progression))next.progression=row.progression;byAthlete.set(id,next);}}return[...byAthlete.values(),...anonymous];}
async function collectSection(defs,athletes,statuses){const results={},eventStatus={},eventHasMarks={};const all=await Promise.all(defs.map(async([eventName,phaseId,groupIds=[]])=>({eventName,status:statuses[phaseId]||'',rows:await eventRows(phaseId,groupIds)})));for(const{eventName,status,rows}of all){eventStatus[eventName]=status;let added=0;for(const row of rows){const id=String(row.athleteId||row.federationId||'');const meta=athletes[id]||{};const name=meta.name||cleanName(row.fullName||row.name||row.athleteName||'');const raw=row.result??row.performance??row.mark??row.resultValue;const mark=parseMark(eventName,raw);const terminal=rawStatus(raw)||rawStatus(row.status)||rawStatus(row.resultStatus)||rawStatus(row.athleteStatus);if(!name||(mark==null&&!terminal))continue;const entry=results[name]||={};if(meta.nation)entry.nation=meta.nation;if(meta.birth)entry.birth=meta.birth;const cr=row.combinedResult&&typeof row.combinedResult==='object'?row.combinedResult:{};const isVertical=eventName==='Høyde'||eventName==='Stav';const attempts=isVertical?verticalAttempts(row):cleanAttempts(row.attempts);entry[eventName]={mark,display:terminal||String(raw??''),resultStatus:terminal,points:terminal?0:(cr.points??row.points??null),status,wind:row.raceWind||row.bestResultWind||row.wind||'',athleteId:id||null,attempts,attemptMode:isVertical?'vertical':'series',bestRoundNo:row.bestRoundNo??null,pointsBefore:cr.pointsBefore??null,pointsAfter:cr.pointsAfter??null,rankBefore:cr.rankBefore??null,rankAfter:cr.rankAfter??null};added++;}eventHasMarks[eventName]=added;}let completedEvents=0;for(const[eventName]of defs){if((eventHasMarks[eventName]||0)>0)completedEvents++;else break;}return{completedEvents,results,eventStatus,eventHasMarks};}
export async function onRequestGet(){try{const[athletes,statuses,state]=await Promise.all([athleteMap(),statusesMap(),query('directusHub.getCompetitionStateHub',{slug:'birmingham-2026'}).catch(()=>({}))]);const[men,women]=await Promise.all([collectSection(MEN,athletes,statuses),collectSection(WOMEN,athletes,statuses)]);const now=new Date().toISOString();return new Response(JSON.stringify({competition:'EM Birmingham 2026',source:'https://live.european-athletics.com/birmingham-2026',competitionCode:COMPETITION_CODE,liveState:state?.live_state||'unknown',providerUpdatedAt:state?.date_updated||null,updatedAt:now,status:state?.live_state==='live'?'live':'waiting',men,women}),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate, max-age=0','access-control-allow-origin':'*'}});}catch(err){return new Response(JSON.stringify({error:String(err?.message||err),updatedAt:new Date().toISOString()}),{status:502,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}}
