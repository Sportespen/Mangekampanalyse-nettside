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
// The site's own promised event order (100m/Lengde/Kule/Høyde/400m/110mh/Diskos/Stav/Spyd/1500m
// for men, 100mh/Høyde/Kule/200m/Lengde/Spyd/800m for women) decides which regex above wins for
// an ambiguous phase name, so order matters: hurdles-specific patterns must be checked before the
// bare "100m"/"long jump"-style ones they could otherwise also match.
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
// Groups every heat/group id for a discipline together (e.g. "400m Heat 1/2/3", "High Jump Group
// A/B") so collectDiscipline() can merge whichever of them actually carries an athlete's result.
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
// The live-result field name on an "engaged" row is unverified until the meet actually starts
// (matsport only ever showed personalBest/seasonBest pre-competition when this was built, two
// days before Décastar Talence 2026) - check every plausible key defensively rather than assume
// one, mirroring the same resilience approach already used for Birmingham's live feed.
function rawResult(row){
  const direct=[row?.result,row?.mark,row?.performance,row?.resultValue,row?.bestResult,row?.bestMark,row?.time,row?.distance,row?.height,row?.value];
  for(const v of direct){if(v!=null&&String(v).trim()!=='')return v;}
  return null;
}
function parseMark(discipline,raw){
  if(raw==null)return null;
  let text=String(raw).trim().replace(',','.');
  if(!text||TERMINAL.has(text.toUpperCase())||['—','-'].includes(text))return null;
  if(text.includes(':')&&(discipline==='1500m'||discipline==='800m')){
    const p=text.split(':');const sec=Number(p[p.length-2])*60+Number(p[p.length-1]);
    return Number.isFinite(sec)?sec:null;
  }
  const m=text.match(/-?\d+(?:\.\d+)?/);
  return m?Number(m[0]):null;
}
async function collectDiscipline(ids,discipline,resultsByName){
  const payloads=await Promise.all(ids.map(id=>getJson(`/events/${id}`).catch(()=>null)));
  for(const payload of payloads){
    for(const row of (Array.isArray(payload?.engaged)?payload.engaged:[])){
      const athlete=row?.athlete||{};
      // athlete.longName is already "SURNAME Firstname" (e.g. "MARCY Tristan"); forename here is
      // actually the surname and name is the given name, so longName is the one clean full name.
      const name=cleanName(athlete.longName||`${athlete.forename||''} ${athlete.name||''}`);
      if(!name)continue;
      const raw=rawResult(row);
      const mark=parseMark(discipline,raw);
      const terminal=rawStatus(raw)||rawStatus(row?.status);
      if(mark==null&&!terminal)continue;
      const entry=resultsByName[name]??={};
      if(athlete.country)entry.nation=athlete.country;
      if(athlete.id_WA)entry.athleteIdWA=String(athlete.id_WA);
      entry[discipline]={mark,display:terminal||String(raw??''),resultStatus:terminal,status:row?.status||'',athleteId:athlete.id_WA?String(athlete.id_WA):null};
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
