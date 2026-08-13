const SOURCE='https://worldathletics.nimarion.de';
const MEN=['Johannes Erm','Sander Skotheim','Leo Neugebauer','Niklas Kaul','Makenson Gletty','Sven Roosen','Karel Tilga','Tomas Järvinen','Amadeus Gräber','Rasmus Roosleht','Dario Dester','Vilém Stráský','Antoine Ferranti','Ondřej Kopecký','Andrin Huber','Risto Lillemets','Jeff Tesselaar','Luuk Pelkmans','Edgaras Benkunskas','Dai Keïta','Zsombor Gálpál','Nino Portmann','Alberto Nonino','Leon Krummenacher','Emil Uhlin','Jip de Greef'];
const WOMEN=['Annik Kälin',"Kate O'Connor",'Emma Oosterwegel','Sofie Dokter','Katarina Johnson-Thompson','Sophie Weißenberg','Sandrina Sprengel','Adrianna Sułek-Schubert','Sveva Gerevini',"Jade O'Dowda",'Vanessa Grimm','Szabina Szűcs','Beatričė Juškevičiūtė','Noor Vidts','María Vicente','Lovisa Karlsson','Jéssica Barreira','Sarolta Kriszt','Jana Koščak','Erika Wärff','Verena Mayr','Sofia Cosculluela','Anastasia Ntragkomirova','Adéla Tkáčová'];
const EVENT_MAP=[[/^100 metres$/i,'100m'],[/^100m$/i,'100m'],[/long jump/i,'Lengde'],[/shot put/i,'Kule'],[/high jump/i,'Høyde'],[/^400 metres$/i,'400m'],[/^400m$/i,'400m'],[/110 metres hurdles/i,'110mh'],[/110m hurdles/i,'110mh'],[/discus throw/i,'Diskos'],[/pole vault/i,'Stav'],[/javelin throw/i,'Spyd'],[/^1500 metres$/i,'1500m'],[/^1500m$/i,'1500m'],[/100 metres hurdles/i,'100mh'],[/100m hurdles/i,'100mh'],[/^200 metres$/i,'200m'],[/^200m$/i,'200m'],[/^800 metres$/i,'800m'],[/^800m$/i,'800m']];
const WIND_EVENTS=new Set(['100m','Lengde','110mh','100mh','200m']);
function appEvent(label){for(const[rx,name]of EVENT_MAP)if(rx.test(String(label||'').trim()))return name;return null;}
function parseMark(mark,event){const s=String(mark??'').trim().replace(',','.');if(!s||/^(DNS|DNF|DQ|NM|NH)$/i.test(s))return null;if((event==='1500m'||event==='800m')&&s.includes(':')){const p=s.split(':').map(Number);if(p.length===2&&p.every(Number.isFinite))return p[0]*60+p[1];}const n=Number(s.replace(/[^0-9.+-]/g,''));return Number.isFinite(n)?n:null;}
function yearOf(date){const m=String(date||'').match(/(?:19|20)\d{2}/);return m?m[0]:'';}
function dateValue(date){const t=Date.parse(String(date||''));return Number.isFinite(t)?t:0;}
function seniorOnly(r,event,type){const text=[r?.discipline,r?.category,r?.competition,r?.race,r?.implement,r?.ageCategory].filter(Boolean).join(' ').toLowerCase();if(/\b(u18|u20|junior|youth)\b/.test(text))return false;if(type==='men'){if(event==='Kule'&&/(6\s*kg|5\s*kg)/i.test(text))return false;if(event==='Diskos'&&/(1\.75\s*kg|1\.5\s*kg)/i.test(text))return false;if(event==='110mh'&&/(0\.991|99\.1|0\.914|91\.4)/i.test(text))return false;}return true;}
function windLegal(r,event){if(!WIND_EVENTS.has(event))return true;if(r?.legal===false)return false;const raw=String(r?.wind??'').trim().replace(',','.');if(!raw)return r?.legal===true;const w=Number(raw.replace(/[^0-9.+-]/g,''));return Number.isFinite(w)&&w<=2.0;}
async function json(url){const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Mangekampanalyse/1.0'},cf:{cacheTtl:60,cacheEverything:true}});if(!r.ok)throw new Error(`HTTP ${r.status} ${url}`);return r.json();}
function chooseAthlete(found,name){if(!Array.isArray(found)||!found.length)return null;const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,' ').trim().toLowerCase();const target=norm(name);return found.find(a=>norm(a.name||a.fullName)===target)||found[0];}
function pushRow(grouped,e,row){(grouped[e]||=[]).push(row);}
function finalize(grouped){const out={};for(const[e,rows]of Object.entries(grouped)){const seen=new Set();out[e]=rows.sort((a,b)=>dateValue(b.date)-dateValue(a.date)).filter(r=>{if(!['2025','2026'].includes(String(r.year||'')))return false;const k=[r.mark,r.date,r.venue,r.competition].join('|');if(seen.has(k))return false;seen.add(k);return true;}).slice(0,4);}return out;}
async function getGraphqlConfig(){try{const [k,e]=await Promise.all([json(`${SOURCE}/graphql/api-key`),json(`${SOURCE}/graphql/endpoint`)]);const apiKey=k?.apiKey||k?.key||k?.value||k?.data?.apiKey||'';const endpoint=e?.endpoint||e?.url||e?.value||e?.data?.endpoint||'';return apiKey&&endpoint?{apiKey,endpoint}:null;}catch{return null;}}
async function graphqlYear(config,id,year){if(!config)return[];const query=`query($id:Int!,$resultsByYear:Int!){getSingleCompetitorResultsDate(id:$id,resultsByYearOrderBy:"date",resultsByYear:$resultsByYear){resultsByDate{competition competitionId date discipline place mark}}}`;try{const r=await fetch(config.endpoint,{method:'POST',headers:{'content-type':'application/json','x-api-key':config.apiKey,accept:'application/json'},body:JSON.stringify({query,variables:{id:Number(id),resultsByYear:Number(year)}})});if(!r.ok)return[];const j=await r.json();return j?.data?.getSingleCompetitorResultsDate?.resultsByDate||[];}catch{return[];}}
async function athleteHistory(name,type,graphqlConfig){try{
  const found=await json(`${SOURCE}/athletes/search?name=${encodeURIComponent(name)}`);
  const athlete=chooseAthlete(found,name);
  if(!athlete?.id)return{name,error:'Athlete not found',events:{}};
  const years=[2026,2025];
  const batches=await Promise.all(years.map(y=>json(`${SOURCE}/athletes/${athlete.id}/results?year=${y}`).catch(()=>[])));
  const grouped={};
  for(const r of batches.flat()){
    const e=appEvent(r?.discipline);if(!e||!seniorOnly(r,e,type)||!windLegal(r,e))continue;const mark=parseMark(r?.mark,e);if(mark==null)continue;
    const venue=String(r.location||r.venue||'').trim();
    pushRow(grouped,e,{mark,display:String(r.mark||''),venue,year:yearOf(r.date),date:String(r.date||''),competition:String(r.competition||r.meeting||''),wind:String(r.wind??''),legal:true,source:'mirror'});
  }
  let current=finalize(grouped);
  const targetEvents=type==='women'?['Høyde','Kule','800m','Spyd']:['Høyde','400m','Diskos','Stav','Spyd','1500m'];
  const needsFallback=targetEvents.some(e=>(current[e]||[]).length<4);
  if(needsFallback&&graphqlConfig){
    const officialBatches=await Promise.all(years.map(y=>graphqlYear(graphqlConfig,athlete.id,y)));
    for(const r of officialBatches.flat()){
      const e=appEvent(r?.discipline);if(!e||WIND_EVENTS.has(e)||!targetEvents.includes(e)||!seniorOnly(r,e,type))continue;const mark=parseMark(r?.mark,e);if(mark==null)continue;
      pushRow(grouped,e,{mark,display:String(r.mark||''),venue:'',year:yearOf(r.date),date:String(r.date||''),competition:String(r.competition||''),wind:'',legal:true,source:'worldathletics-graphql'});
    }
    current=finalize(grouped);
  }
  return{name,id:athlete.id,events:current};
}catch(e){return{name,error:String(e?.message||e),events:{}};}}
async function mapLimited(items,limit,fn){const out=new Array(items.length);let next=0;async function worker(){while(true){const i=next++;if(i>=items.length)return;out[i]=await fn(items[i],i);}}await Promise.all(Array.from({length:Math.min(limit,items.length)},worker));return out;}
export async function onRequestGet({request}){const u=new URL(request.url);const type=u.searchParams.get('type')==='women'?'women':'men';const names=type==='women'?WOMEN:MEN;try{const graphqlConfig=await getGraphqlConfig();const data=await mapLimited(names,3,n=>athleteHistory(n,type,graphqlConfig));const coverage=data.map(a=>({name:a.name,events:Object.fromEntries(Object.entries(a.events||{}).map(([e,r])=>[e,r.length])),error:a.error||null}));return new Response(JSON.stringify({source:graphqlConfig?'World Athletics + mirror':'World Athletics mirror',updatedAt:new Date().toISOString(),type,athletes:data,coverage}),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=60'}});}catch(e){return new Response(JSON.stringify({error:String(e?.message||e)}),{status:502,headers:{'content-type':'application/json'}});}}
