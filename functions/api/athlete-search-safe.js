const SOURCE='https://worldathletics.nimarion.de';

function norm(v){return String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
async function json(url){const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Mangekampanalyse/2.0'},cf:{cacheTtl:60,cacheEverything:true}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();}
async function athleteRows(id){return json(`${SOURCE}/athletes/${encodeURIComponent(id)}/results`).catch(()=>[]);}
function disciplineText(r){return norm([r?.discipline,r?.event,r?.competition,r?.category].filter(Boolean).join(' '));}
function femaleHeptProfile(rows){
  const list=Array.isArray(rows)?rows:[];
  let hasHept=false,hasDeca=false,female=0,male=0;
  for(const r of list){
    const t=disciplineText(r);
    if(t.includes('heptathlon'))hasHept=true;
    if(t.includes('decathlon'))hasDeca=true;
    if(/100 metres hurdles|100m hurdles/.test(t))female+=3;
    if(/(^| )200 metres( |$)|(^| )200m( |$)/.test(t))female+=1;
    if(/(^| )800 metres( |$)|(^| )800m( |$)/.test(t))female+=1;
    if(/javelin throw/.test(t))female+=1;
    if(/110 metres hurdles|110m hurdles/.test(t))male+=3;
    if(/(^| )400 metres( |$)|(^| )400m( |$)/.test(t))male+=1;
    if(/(^| )1500 metres( |$)|(^| )1500m( |$)/.test(t))male+=1;
    if(/discus throw|pole vault/.test(t))male+=1;
  }
  if(hasDeca)return false;
  return hasHept && female>=3 && female>male;
}
function response(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}

export async function onRequestGet({request}){
  const u=new URL(request.url);
  const type=u.searchParams.get('type')==='women'?'women':'men';
  try{
    const original=new URL('/api/athlete-search',u.origin);
    original.search=u.search;
    const upstream=await fetch(original.toString(),{headers:{Accept:'application/json','Cache-Control':'no-cache'},cf:{cacheTtl:0,cacheEverything:false}});
    const data=await upstream.json();
    if(!upstream.ok)return response(data,upstream.status);
    if(type!=='women')return response(data);
    const action=u.searchParams.get('action')||'search';
    if(action==='search'){
      const kept=[];
      for(const a of (data.athletes||[])){
        if(!a?.id)continue;
        const rows=await athleteRows(a.id);
        if(femaleHeptProfile(rows))kept.push(a);
      }
      return response({...data,athletes:kept});
    }
    if(action==='analyse'){
      const id=String(u.searchParams.get('id')||'');
      if(!id)return response({error:'Mangler utøver-ID'},400);
      const rows=await athleteRows(id);
      if(!femaleHeptProfile(rows))return response({error:'Utøveren er ikke en kvinnelig sjukamputøver.'},400);
      return response(data);
    }
    return response(data);
  }catch(e){return response({error:String(e?.message||e)},502);}
}
