const WA='https://worldathletics.org';
const YEARS=new Set([2026,2025]);
const CUTOFF=Date.parse('2026-08-12T00:00:00Z');
const EVENT_MAP=[[/^100 metres$/i,'100m'],[/^100m$/i,'100m'],[/^long jump$/i,'Lengde'],[/^shot put$/i,'Kule'],[/^high jump$/i,'Høyde'],[/^400 metres$/i,'400m'],[/^400m$/i,'400m'],[/^110 metres hurdles$/i,'110mh'],[/^110m hurdles$/i,'110mh'],[/^discus throw$/i,'Diskos'],[/^pole vault$/i,'Stav'],[/^javelin throw$/i,'Spyd'],[/^1500 metres$/i,'1500m'],[/^1500m$/i,'1500m'],[/^100 metres hurdles$/i,'100mh'],[/^100m hurdles$/i,'100mh'],[/^200 metres$/i,'200m'],[/^200m$/i,'200m'],[/^800 metres$/i,'800m'],[/^800m$/i,'800m']];
const EVENTS={men:['100m','Lengde','Kule','Høyde','400m','110mh','Diskos','Stav','Spyd','1500m'],women:['100mh','Høyde','Kule','200m','Lengde','Spyd','800m']};
const WIND_EVENTS=new Set(['100m','Lengde','110mh','100mh','200m']);
const SENIOR_DISCIPLINES={men:{'100m':['100 Metres','100m'],Lengde:['Long Jump'],Kule:['Shot Put'],Høyde:['High Jump'],'400m':['400 Metres','400m'],'110mh':['110 Metres Hurdles','110m Hurdles'],Diskos:['Discus Throw'],Stav:['Pole Vault'],Spyd:['Javelin Throw'],'1500m':['1500 Metres','1500m']},women:{'100mh':['100 Metres Hurdles','100m Hurdles'],Høyde:['High Jump'],Kule:['Shot Put'],'200m':['200 Metres','200m'],Lengde:['Long Jump'],Spyd:['Javelin Throw'],'800m':['800 Metres','800m']}};
const VALID_RANGES={men:{'100m':[9,13.5],Lengde:[5,9.5],Kule:[8,22],Høyde:[1.4,2.5],'400m':[43,60],'110mh':[12,20],Diskos:[20,70],Stav:[3,6.5],Spyd:[30,90],'1500m':[210,360]},women:{'100mh':[11.5,20],Høyde:[1.3,2.2],Kule:[7,20],'200m':[21,32],Lengde:[4.5,8],Spyd:[25,75],'800m':[110,190]}};
function appEvent(v){for(const[rx,n]of EVENT_MAP)if(rx.test(String(v||'').trim()))return n;return null;}
function exactSeniorDiscipline(r,event,type){const d=String(r?.discipline||r?.event||'').trim().replace(/\s+/g,' ').toLowerCase();return (SENIOR_DISCIPLINES[type]?.[event]||[]).some(x=>x.toLowerCase()===d);}
function parseMark(mark,event){const s=String(mark??'').trim().replace(',','.');if(!s||/^(DNS|DNF|DQ|NM|NH|NT)$/i.test(s))return null;if((event==='1500m'||event==='800m')&&s.includes(':')){const p=s.split(':').map(Number);if(p.length===2&&p.every(Number.isFinite))return p[0]*60+p[1];}const n=Number(s.replace(/[^0-9.+-]/g,''));return Number.isFinite(n)?n:null;}
function dateValue(d){const t=Date.parse(String(d||''));return Number.isFinite(t)?t:0;}
function yearOf(d){const m=String(d||'').match(/(?:19|20)\d{2}/);return m?Number(m[0]):0;}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/gi,'ae').replace(/ø/gi,'o').replace(/å/gi,'a').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function tokens(v){return norm(v).split(' ').filter(Boolean);}
function matchesPartial(name,q){const nt=tokens(name),qt=tokens(q);return qt.length>0&&qt.every(q=>nt.some(n=>n===q||n.startsWith(q)||n.includes(q)));}
function matchScore(name,q){const n=norm(name),nt=tokens(name),qt=tokens(q);if(n===norm(q))return 0;if(qt.length===1&&nt.includes(qt[0]))return 1;if(qt.every(q=>nt.some(t=>t===q)))return 2;if(qt.every(q=>nt.some(t=>t.startsWith(q))))return 3;if(qt.every(q=>nt.some(t=>t.includes(q))))return 4;return 9;}
function seniorOnly(r,event,type){if(!exactSeniorDiscipline(r,event,type))return false;const text=[r?.discipline,r?.category,r?.competition,r?.race,r?.implement,r?.ageCategory,r?.event].filter(Boolean).join(' ').toLowerCase();if(/\b(u18|u20|junior|youth)\b/.test(text))return false;return true;}
function venueText(v){if(v==null)return'';if(typeof v==='string'||typeof v==='number')return String(v).trim();if(typeof v!=='object')return'';return [v.venueName,v.stadium,v.name,v.city,v.town,v.place,v.locationName,v.countryCode,v.country?.code,v.country?.name].map(venueText).filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).join(', ');}
function venueOf(r){return venueText(r?.location)||venueText(r?.venue)||venueText(r?.competitionVenue)||'';}
function indoorOf(r){const text=[r?.competition,r?.meeting,venueOf(r),r?.category,r?.venueName,r?.stadium].filter(Boolean).join(' ').toLowerCase();if(/indoor|indoors|short track|\(i\)/.test(text))return true;const explicit=[r?.indoor,r?.isIndoor,r?.environment,r?.venueType,r?.competitionType,r?.stadiumType].filter(v=>v!==undefined&&v!==null).map(v=>String(v).toLowerCase()).join(' ');if(/(^|\b)(true|indoor|indoors|short track)(\b|$)/.test(explicit))return true;if(/(^|\b)(false|outdoor|outdoors)(\b|$)/.test(explicit))return false;return false;}
function windLegal(r,event){if(!WIND_EVENTS.has(event)||indoorOf(r))return true;if(r?.legal===false)return false;const raw=String(r?.wind??r?.windReading??r?.resultWind??'').trim().replace(',','.');if(!raw)return r?.legal===true;const w=Number(raw.replace(/[^0-9.+-]/g,''));return Number.isFinite(w)&&w<=2.0;}
const WA_GRAPHQL_ENDPOINT='https://graphql-prod-4894.edge.aws.worldathletics.org/graphql';
const WA_GRAPHQL_KEY='da2-o6pmci4cb5denlbnvn5u3kfexq';
const MONTHS={JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12};
function toIsoDate(s){const m=String(s||'').trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);if(!m)return String(s||'');const month=MONTHS[m[2].toUpperCase()];if(!month)return String(s||'');return `${m[3]}-${String(month).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;}
// Same technique as functions/_shared/wa-html.js in Sportespen/Rankingstevner and as
// .github/workflows/decastar-*-bulk.yml here: the public profile page embeds its data as
// plain JSON in a <script id="__NEXT_DATA__"> tag, including resultsByYear.resultsByEvent
// (full per-competition results for the current season) - no API key, no dependency on
// worldathletics.nimarion.de at all, which is now dead outright (not just rate-limited).
async function fetchCompetitorFromHtml(id){const r=await fetch(`${WA}/athletes/-/${encodeURIComponent(id)}`,{headers:{'User-Agent':'Mozilla/5.0 Mangekampanalyse/2.0'},cf:{cacheTtl:60,cacheEverything:true}});if(!r.ok)throw new Error(`worldathletics.org ${r.status}`);const html=await r.text();const marker='id="__NEXT_DATA__"';const idx=html.indexOf(marker);if(idx===-1)throw new Error('__NEXT_DATA__ not found');const openEnd=html.indexOf('>',idx)+1;const closeIdx=html.indexOf('</script>',openEnd);const nextData=JSON.parse(html.slice(openEnd,closeIdx));const competitor=nextData?.props?.pageProps?.competitor;if(!competitor)throw new Error('no competitor in page');return competitor;}
function rowsFromCompetitor(competitor){const events=competitor?.resultsByYear?.resultsByEvent||[];const rows=[];for(const ev of events){const discipline=ev?.discipline;for(const r of (ev?.results||[]))rows.push({discipline,mark:r?.mark,date:toIsoDate(r?.date),competition:r?.competition,venue:r?.venue,wind:r?.wind,legal:r?.notLegal!==true,category:r?.category});}return rows;}
function metaFromCompetitor(competitor){const b=competitor?.basicData||{};const name=String(b.fullName||b.friendlyName||[b.firstName,b.lastName].filter(Boolean).join(' ')||'').trim();const nation=String(b.countryCode||b.countryName||'').trim();const birth=String(b.birthDate||b.birthDateStr||'').trim();const gender=b.male===true?'men':(b.male===false?'women':'');return {name,nation,birth,gender};}
function athleteName(a){return String(a?.name||a?.fullName||[a?.firstname??a?.firstName,a?.lastname??a?.lastName].filter(Boolean).join(' ')||'').trim();}
function athleteNation(a){return String(a?.countryCode||a?.country||a?.nationality||a?.federation||'').trim();}
function athleteBirth(a){return String(a?.birthdate||a?.dateOfBirth||a?.birthDate||a?.dob||a?.birth||'').trim();}
function athleteGender(a){const raw=String(a?.gender??a?.sex??a?.genderCode??a?.sexCode??'').trim().toLowerCase();if(!raw)return'';if(['m','male','man','men'].includes(raw))return'men';if(['f','female','woman','women','w'].includes(raw))return'women';return'';}
function combinedFlags(rows){let hept=false,deca=false;for(const r of Array.isArray(rows)?rows:[]){const t=String(r?.discipline||r?.event||r?.competition||'');if(/heptathlon/i.test(t))hept=true;if(/decathlon/i.test(t))deca=true;}return{hept,deca};}
// Checking only resultsByYear (current season) for a "Decathlon"/"Heptathlon" row wrongly
// excludes athletes who haven't done a full combined event yet this season (e.g. only
// individual-event meets so far) even though they're an established, world-ranked decathlete/
// heptathlete with a real combined PB from a prior season - confirmed live for a real athlete
// (a 2025 U23 decathlon medallist, ranked ~#82 in the men's decathlon world rankings, whose 2026
// season so far was individual-event-only) who searches turned up zero results for. Prefer the
// athlete's World Rankings event group (present regardless of this season's meet calendar) and
// only fall back to the current-season flag when no ranking data exists at all.
// World Rankings alone still misses athletes who haven't done a combined event recently enough
// for their ranking to still be active (e.g. an Olympic decathlon medallist who's only done
// individual events since mid-2024 - confirmed live: worldRankings.current comes back empty for
// him even though he's clearly still a decathlete). searchCompetitors' own `disciplines` field
// is a career-wide top-disciplines summary, not season-scoped, so it catches these cases too.
function eligibleCombinedAthlete(a,rows,type,competitor){
  const g=athleteGender(a);
  if(g&&g!==type)return false;
  const wantGroup=type==='men'?/decathlon/i:/heptathlon/i;
  if(wantGroup.test(String(a?.disciplines||'')))return true;
  const rankings=competitor?.worldRankings?.current;
  if(Array.isArray(rankings)&&rankings.length){
    const wantGroup=type==='men'?/decathlon/i:/heptathlon/i;
    return rankings.some(r=>wantGroup.test(String(r?.eventGroup||'')));
  }
  const f=combinedFlags(rows);
  if(type==='men')return f.deca;
  if(!f.hept)return false;
  if(g==='women')return true;
  return !f.deca;
}
function samePerformance(a,b){return Number(a.mark).toFixed(3)===Number(b.mark).toFixed(3)&&String(a.date||'')===String(b.date||'')&&norm(a.venue)===norm(b.venue);}
function uniqueRecent(rows){const kept=[];for(const r of [...rows].sort((a,b)=>dateValue(b.date)-dateValue(a.date))){if(!YEARS.has(Number(r.year)))continue;if(kept.some(x=>samePerformance(x,r)))continue;kept.push(r);}return kept;}
function finalize(grouped){const out={};for(const[e,rows]of Object.entries(grouped)){const all=uniqueRecent(rows),outdoor=all.filter(r=>!r.indoor).sort((a,b)=>dateValue(b.date)-dateValue(a.date)),indoor=all.filter(r=>r.indoor).sort((a,b)=>dateValue(b.date)-dateValue(a.date)),kept=outdoor.slice(0,4);if(kept.length<4){for(const r of indoor){if(kept.length===4)break;kept.push(r);}}out[e]=kept;}return out;}
function applyVerifiedCorrections(data){if(!data?.events)return data;const isJonathan=String(data.id||'')==='14989292'||/jonathan\s+hertwig/i.test(String(data.name||''));if(!isJonathan)return data;const verified={mark:7.21,display:'7.21',venue:'Randal Tyson Indoor Center, Fayetteville, AR',year:2026,date:'2026-01-30',competition:'Razorback Invitational',wind:'',legal:true,indoor:true};const rows=Array.isArray(data.events.Lengde)?data.events.Lengde:[];const outdoor=rows.filter(r=>!r?.indoor&&String(r?.date)!=='2026-01-30').sort((a,b)=>dateValue(b.date)-dateValue(a.date));data.events.Lengde=[...outdoor.slice(0,3),verified].sort((a,b)=>dateValue(b.date)-dateValue(a.date));return data;}
async function resultsFor(id){try{const competitor=await fetchCompetitorFromHtml(id);return {rows:rowsFromCompetitor(competitor),competitor};}catch(_e){return {rows:[],competitor:null};}}
function addUnique(all,a){if(a?.id&&!all.some(x=>String(x.id)===String(a.id)))all.push(a);}
// worldathletics.org's own /athletes-home?query= page is edge-cached and does NOT return
// query-specific results server-side (confirmed live: identical HTML/initialSearchResults for
// wildly different queries) - the real per-query search only happens client-side via WA's
// internal GraphQL (searchCompetitors), same backend family as fetchCompetitorFromHtml's
// __NEXT_DATA__ approach. The apiKey below is not a secret: it's a public AWS AppSync key
// (da2- prefix) baked directly into WA's own publicly-shipped JS bundle config, used by every
// visitor's browser - not a rotating per-session token, so no Playwright capture needed here.
async function waSearch(q){
  const query=`query SearchCompetitors($query: String) { searchCompetitors(query: $query) { aaAthleteId familyName givenName country gender disciplines } }`;
  const res=await fetch(WA_GRAPHQL_ENDPOINT,{method:'POST',headers:{'content-type':'application/json','x-api-key':WA_GRAPHQL_KEY,'x-graphql-client-name':'worldathletics'},body:JSON.stringify({query,variables:{query:q}})}).catch(()=>null);
  if(!res||!res.ok)return[];
  const payload=await res.json().catch(()=>null);
  const list=payload?.data?.searchCompetitors;
  if(!Array.isArray(list))return[];
  const out=[];
  for(const a of list){
    const id=a?.aaAthleteId;
    if(!id)continue;
    addUnique(out,{id:String(id),name:`${a.givenName||''} ${a.familyName||''}`.trim(),countryCode:String(a.country||'').toUpperCase(),disciplines:String(a.disciplines||'')});
  }
  return out;
}
async function rawSearch(q){const all=[];const terms=[q,...tokens(q)];for(const term of [...new Set(terms.filter(x=>String(x).trim().length>=2))]){const wa=await waSearch(term);for(const a of wa)addUnique(all,a);}return all.filter(a=>matchesPartial(athleteName(a),q)).sort((a,b)=>matchScore(athleteName(a),q)-matchScore(athleteName(b),q)||athleteName(a).localeCompare(athleteName(b),'nb'));}
async function searchAthletes(q,type){const found=await rawSearch(q);const candidates=found.filter(a=>a?.id&&(!athleteGender(a)||athleteGender(a)===type)).slice(0,200);const checked=[];for(let i=0;i<candidates.length;i+=25){const batch=await Promise.all(candidates.slice(i,i+25).map(async a=>{const {rows,competitor}=await resultsFor(a.id);if(!eligibleCombinedAthlete(a,rows,type,competitor))return null;return{id:a.id,name:athleteName(a),nation:athleteNation(a),birth:athleteBirth(a),discipline:type==='women'?'Sjukamp':'Tikamp',score:matchScore(athleteName(a),q)};}));checked.push(...batch.filter(Boolean));if(checked.length>=30)break;}return checked.sort((a,b)=>a.score-b.score||a.name.localeCompare(b.name,'nb')).slice(0,30).map(({score,...a})=>a);}
async function analyseAthlete(id,type,nameHint){let competitor=null;try{competitor=await fetchCompetitorFromHtml(id);}catch(_e){competitor=null;}const rows=competitor?rowsFromCompetitor(competitor):[];const meta=competitor?metaFromCompetitor(competitor):{name:'',nation:'',birth:'',gender:''};
  // meta has no `disciplines` field (only searchAthletes' candidates carry it, from
  // searchCompetitors), so a direct analyse-by-id call - the normal flow right after picking an
  // athlete from search results - would wrongly reject an athlete like Markus Rooth whose
  // combined-event world ranking has expired from inactivity. Re-run the same career-wide
  // disciplines lookup by name to match search's eligibility result.
  let disciplines='';
  try{const hit=(await waSearch(nameHint||meta.name||String(id))).find(a=>String(a.id)===String(id));disciplines=hit?.disciplines||'';}catch(_e){}
  if(!eligibleCombinedAthlete({...meta,disciplines},rows,type,competitor))throw new Error(type==='women'?'Utøveren er ikke en relevant kvinnelig sjukamputøver.':'Utøveren er ikke en relevant mannlig tikamputøver.');const grouped={};for(const r of rows){const event=appEvent(r?.discipline);if(!event||!EVENTS[type].includes(event)||!seniorOnly(r,event,type)||!windLegal(r,event))continue;const mark=parseMark(r?.mark,event),date=String(r?.date||''),t=dateValue(date),year=yearOf(date),range=VALID_RANGES[type]?.[event],indoor=indoorOf(r);if(mark==null||!t||t>=CUTOFF||!YEARS.has(year)||(range&&(mark<range[0]||mark>range[1])))continue;(grouped[event]||=[]).push({mark,display:String(r?.mark||''),venue:venueOf(r),year,date,competition:String(r?.competition||r?.meeting||''),wind:String(r?.wind??r?.windReading??r?.resultWind??''),legal:true,indoor});}const data={id:String(id),name:meta.name||nameHint||`Utøver ${id}`,nation:meta.nation||'',birth:meta.birth||'',type,events:finalize(grouped)};return applyVerifiedCorrections(data);}
function response(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}
export async function onRequestGet({request}){const u=new URL(request.url),action=u.searchParams.get('action')||'search',type=u.searchParams.get('type')==='women'?'women':'men';try{if(action==='search'){const q=String(u.searchParams.get('q')||'').trim();if(q.length<2)return response({athletes:[]});return response({type,athletes:await searchAthletes(q,type)});}if(action==='analyse'){const id=String(u.searchParams.get('id')||'').trim(),name=String(u.searchParams.get('name')||'').trim();if(!id)return response({error:'Mangler utøver-ID'},400);return response(await analyseAthlete(id,type,name));}return response({error:'Ukjent handling'},400);}catch(e){return response({error:String(e?.message||e)},502);}}