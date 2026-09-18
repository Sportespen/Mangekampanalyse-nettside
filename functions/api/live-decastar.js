const API='https://api.athle.matsport.com';
const COMPETITION_ID='65e4f577-c90c-4008-9955-dfa3563d7a86';
const TERMINAL=new Set(['DNS','DNF','DQ','NM','NH']);
const EVENT_MAP=[
  [/100\s*m(?!.*hurdles)(?!.*h\b)/i,'100m'],
  [/long jump/i,'Lengde'],
  [/shot put/i,'Kule'],
  [/high jump/i,'Høyde'],
  [/^400\s*m/i,'400m'],
  [/110\s*m.*hurdles/i,'110mh'],
  [/discus/i,'Diskos'],
  [/pole vault/i,'Stav'],
  [/javelin/i,'Spyd'],
  [/1\s?500\s*m/i,'1500m'],
  [/100\s*m.*hurdles/i,'100mh'],
  [/^200\s*m/i,'200m'],
  [/^800\s*m/i,'800m']
];
// Which of the event payload's three result blocks actually carries a finished/live mark for this
// discipline - confirmed against a past matsport competition (see PR history): engaged[] is only
// ever the pre-competition entry list (personalBest/seasonBest, no live result field at all), a
// real mark shows up in trackResult (running events, field "time"), horizontalResult (jumps/throws,
// field "result", meters) or verticalResult (High Jump/Pole Vault, field "result", meters) once the
// event is under way or official.
const RESULT_BLOCK={
  '100m':'trackResult','400m':'trackResult','110mh':'trackResult','1500m':'trackResult',
  '100mh':'trackResult','200m':'trackResult','800m':'trackResult',
  'Lengde':'horizontalResult','Kule':'horizontalResult','Diskos':'horizontalResult','Spyd':'horizontalResult',
  'Høyde':'verticalResult','Stav':'verticalResult'
};
function appDiscipline(text){const s=String(text||'');for(const[rx,name]of EVENT_MAP)if(rx.test(s))return name;return null;}
function cleanName(v){return String(v||'').replace(/\s+/g,' ').trim();}
async function getJson(path){
  const r=await fetch(`${API}${path}`,{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 Mangekampanalyse/2.0'},cf:{cacheTtl:20,cacheEverything:true}});
  if(!r.ok)throw new Error(`${path}: HTTP ${r.status}`);
  return r.json();
}
async function getSchedule(){
  const comp=await getJson(`/competitions/${COMPETITION_ID}`);
  return Array.isArray(comp?.schedules)?comp.schedules:[];
}
// The site's own promised event order (100m/Lengde/Kule/Høyde/400m/110mh/Diskos/Stav/Spyd/1500m
// for men, 100mh/Høyde/Kule/200m/Lengde/Spyd/800m for women) decides which regex above wins for
// an ambiguous phase name, so order matters: hurdles-specific patterns must be checked before the
// bare "100m"/"long jump"-style ones they could otherwise also match.
function eventIdsByDiscipline(schedule,gender){
  const out={};
  for(const day of schedule){
    for(const ev of (day?.events||[])){
      if(String(ev?.gender||'').toUpperCase()!==gender)continue;
      const discipline=appDiscipline(ev?.phase)||appDiscipline(ev?.event);
      if(!discipline||!ev?.id)continue;
      (out[discipline]??=new Set()).add(ev.id);
    }
  }
  return Object.fromEntries(Object.entries(out).map(([k,v])=>[k,[...v]]));
}
function rawStatus(value){const t=String(value??'').trim().toUpperCase();return TERMINAL.has(t)?t:null;}
// attemptHorizontal rows carry the raw per-round attempt (round_Attempt, e.g. "X" for a foul) plus
// the cumulative best-so-far (round_Result) - the modal wants the former, one row per attempt.
function attemptsFromHorizontal(row){
  const src=Array.isArray(row?.attemptHorizontal)?row.attemptHorizontal:[];
  const out=[];
  for(const a of src){
    const result=String(a?.round_Attempt??'').trim();
    if(!result)continue;
    out.push({attemptId:Number(a?.numRound)||out.length+1,result,wind:String(a?.round_Wind??'').trim()});
  }
  return out;
}
// attemptVertical rows are one entry per bar height with up to three sub-attempts
// (ht_Att1/ht_Att2/ht_Att3, each "O"/"X"/"-"/""); combine the attempted ones into a single
// "XXO"-style marker per height, skipping heights not yet attempted at all.
function attemptsFromVertical(row){
  const src=Array.isArray(row?.attemptVertical)?row.attemptVertical:[];
  const out=[];
  for(const a of src){
    const marks=[a?.ht_Att1,a?.ht_Att2,a?.ht_Att3].map(v=>String(v??'').trim()).filter(v=>v&&v!=='-');
    if(!marks.length)continue;
    out.push({attemptId:Number(a?.numAttempt)||out.length+1,height:String(a?.ht??'').trim(),result:marks.join('')});
  }
  return out;
}
function parseMark(discipline,raw){
  if(raw==null)return null;
  let text=String(raw).trim().replace(',','.');
  if(!text||TERMINAL.has(text.toUpperCase())||['—','-','X'].includes(text))return null;
  if(text.includes(':')&&(discipline==='1500m'||discipline==='800m')){
    const p=text.split(':');const sec=Number(p[p.length-2])*60+Number(p[p.length-1]);
    return Number.isFinite(sec)?sec:null;
  }
  const m=text.match(/-?\d+(?:\.\d+)?/);
  return m?Number(m[0]):null;
}
async function collectDiscipline(ids,discipline,resultsByName){
  const blockKey=RESULT_BLOCK[discipline];
  const isTrack=blockKey==='trackResult',isVertical=blockKey==='verticalResult';
  const payloads=await Promise.all(ids.map(id=>getJson(`/events/${id}`).catch(()=>null)));
  for(const payload of payloads){
    // Wind is per-heat (one reading for everyone in that start list), not per-athlete - confirmed
    // live against Décastar Talence 2026's men's 100m Heat 1 ("+1.8"), so it's read once per payload
    // and applied to every row from that same heat below.
    const heatWind=isTrack?String(payload?.[blockKey]?.wind??'').trim():'';
    const rows=Array.isArray(payload?.[blockKey]?.results)?payload[blockKey].results:[];
    for(const row of rows){
      const athlete=row?.athlete||{};
      // athlete.longName is already "SURNAME Firstname" (e.g. "MARCY Tristan"); forename here is
      // actually the surname and name is the given name, so longName is the one clean full name.
      const name=cleanName(athlete.longName||`${athlete.forename||''} ${athlete.name||''}`);
      if(!name)continue;
      const raw=isTrack?row?.time:row?.result;
      const mark=parseMark(discipline,raw);
      const terminal=rawStatus(row?.status);
      if(mark==null&&!terminal)continue;
      const entry=resultsByName[name]??={};
      if(athlete.country)entry.nation=athlete.country;
      if(athlete.id_WA)entry.athleteIdWA=String(athlete.id_WA);
      entry[discipline]={
        mark,display:terminal||String(raw??''),resultStatus:terminal,
        points:terminal?0:(row?.points!=null&&row.points!==''?Number(row.points):null),
        status:row?.status||'',athleteId:athlete.id_WA?String(athlete.id_WA):null,
        attempts:isTrack?[]:isVertical?attemptsFromVertical(row):attemptsFromHorizontal(row),
        attemptMode:isTrack?null:isVertical?'vertical':'series',
        wind:heatWind
      };
    }
  }
}
async function collectSection(schedule,gender){
  const idsByDiscipline=eventIdsByDiscipline(schedule,gender);
  const results={};
  await Promise.all(Object.entries(idsByDiscipline).map(([discipline,ids])=>collectDiscipline(ids,discipline,results)));
  const eventHasMarks={};
  for(const discipline of Object.keys(idsByDiscipline)){
    eventHasMarks[discipline]=Object.values(results).filter(r=>r[discipline]).length;
  }
  const disciplineOrder=Object.keys(idsByDiscipline);
  let completedEvents=0;
  for(const discipline of disciplineOrder){if((eventHasMarks[discipline]||0)>0)completedEvents++;else break;}
  return {completedEvents,results,eventHasMarks};
}
export async function onRequestGet(){
  try{
    const schedule=await getSchedule();
    const [men,women]=await Promise.all([collectSection(schedule,'M'),collectSection(schedule,'W')]);
    return new Response(JSON.stringify({
      competition:'Décastar Talence 2026',
      source:'https://athle.matsport.com',
      competitionId:COMPETITION_ID,
      updatedAt:new Date().toISOString(),
      status:(men.completedEvents||women.completedEvents)?'live':'waiting',
      men,women
    }),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate, max-age=0','access-control-allow-origin':'*'}});
  }catch(err){
    return new Response(JSON.stringify({error:String(err?.message||err),updatedAt:new Date().toISOString()}),{status:502,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
  }
}
