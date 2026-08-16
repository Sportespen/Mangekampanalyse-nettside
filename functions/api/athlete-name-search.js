const CFG='https://worldathletics.nimarion.de';
const QUERY=`query SearchCompetitors($query: String, $gender: GenderType, $disciplineCode: String, $environment: String, $countryCode: String) {
  searchCompetitors(query: $query, gender: $gender, disciplineCode: $disciplineCode, environment: $environment, countryCode: $countryCode) {
    aaAthleteId familyName givenName birthDate disciplines gender country urlSlug
  }
}`;
function response(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/gi,'ae').replace(/ø/gi,'o').replace(/å/gi,'a').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function tokens(v){return norm(v).split(' ').filter(Boolean);}
function matches(name,q){const nt=tokens(name),qt=tokens(q);return qt.length&&qt.every(x=>nt.some(n=>n===x||n.startsWith(x)||n.includes(x)));}
function score(name,q){const n=norm(name),qt=tokens(q),nt=tokens(name);if(n===norm(q))return 0;if(qt.length===1&&nt.includes(qt[0]))return 1;if(qt.every(x=>nt.some(n=>n===x)))return 2;if(qt.every(x=>nt.some(n=>n.startsWith(x))))return 3;return 4;}
async function getJson(url){const r=await fetch(url,{headers:{Accept:'application/json'},cf:{cacheTtl:300,cacheEverything:true}});if(!r.ok)throw new Error(`Config HTTP ${r.status}`);return r.json();}
function val(o,keys){for(const k of keys){if(o&&typeof o[k]==='string'&&o[k])return o[k];}return typeof o==='string'?o:'';}
function isCombined(a,type,wasFiltered){if(wasFiltered)return true;const d=JSON.stringify(a?.disciplines||'').toLowerCase();return type==='women'?/heptathlon|\bhep\b/.test(d):/decathlon|\bdec\b/.test(d);}
function addUnique(map,a,filtered){const id=String(a?.aaAthleteId||'');if(!id)return;const old=map.get(id);if(!old)map.set(id,{a,filtered:!!filtered});else if(filtered)old.filtered=true;}
async function gql(endpoint,apiKey,variables,ttl=60){const r=await fetch(endpoint,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json','x-api-key':apiKey},body:JSON.stringify({query:QUERY,variables}),cf:{cacheTtl:ttl,cacheEverything:true}});if(!r.ok)throw new Error(`GraphQL HTTP ${r.status}`);const j=await r.json();return Array.isArray(j?.data?.searchCompetitors)?j.data.searchCompetitors:[];}
async function collectRows(endpoint,apiKey,base,disciplineCode,q){
  const merged=new Map();
  const single=tokens(q).length===1;

  // For a single name, build a live index of the complete DEC/HEP pool first.
  // This is cached at the edge and refreshes automatically, so new athletes are included.
  if(single){
    const indexRows=await gql(endpoint,apiKey,{...base,query:null,disciplineCode},1800).catch(()=>[]);
    for(const a of indexRows)addUnique(merged,a,true);
  }

  // Always supplement with the normal WA name search. This keeps surname/full-name
  // behaviour unchanged and catches athletes not yet present in the cached pool.
  const [filteredRows,allRows]=await Promise.all([
    gql(endpoint,apiKey,{...base,query:q,disciplineCode}).catch(()=>[]),
    gql(endpoint,apiKey,{...base,query:q,disciplineCode:null}).catch(()=>[])
  ]);
  for(const a of filteredRows)addUnique(merged,a,true);
  for(const a of allRows)addUnique(merged,a,false);

  return merged;
}
export async function onRequestGet({request}){
  const u=new URL(request.url),q=String(u.searchParams.get('q')||'').trim(),type=u.searchParams.get('type')==='women'?'women':'men';
  if(q.length<2)return response({athletes:[]});
  try{
    const [epRaw,keyRaw]=await Promise.all([getJson(`${CFG}/graphql/endpoint`),getJson(`${CFG}/graphql/api-key`)]);
    const endpoint=val(epRaw,['endpoint','url','value']);
    const apiKey=val(keyRaw,['apiKey','key','value']);
    if(!endpoint||!apiKey)throw new Error('Mangler GraphQL-konfigurasjon');
    const gender=type==='women'?'female':'male';
    const disciplineCode=type==='women'?'HEP':'DEC';
    const base={query:q,gender,environment:null,countryCode:null};
    const merged=await collectRows(endpoint,apiKey,base,disciplineCode,q);
    const athletes=[...merged.values()]
      .filter(({a,filtered})=>isCombined(a,type,filtered))
      .map(({a})=>({id:String(a.aaAthleteId||''),name:[a.givenName,a.familyName].filter(Boolean).join(' ').trim(),nation:String(a.country||''),birth:String(a.birthDate||''),discipline:type==='women'?'Sjukamp':'Tikamp'}))
      .filter(a=>a.id&&a.name&&matches(a.name,q))
      .sort((a,b)=>score(a.name,q)-score(b.name,q)||a.name.localeCompare(b.name,'nb'))
      .slice(0,100);
    return response({type,athletes});
  }catch(err){return response({error:String(err?.message||err),athletes:[]},502);}
}
