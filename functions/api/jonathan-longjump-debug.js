const SOURCE='https://worldathletics.nimarion.de';
export async function onRequestGet(){
  const id='14989292';
  const r=await fetch(`${SOURCE}/athletes/${id}/results`,{headers:{Accept:'application/json','User-Agent':'Mangekampanalyse/2.0'},cf:{cacheTtl:0,cacheEverything:false}});
  const rows=await r.json();
  const filtered=(Array.isArray(rows)?rows:[]).filter(x=>/long jump/i.test(String(x?.discipline||x?.event||''))).map(x=>({
    date:x?.date,mark:x?.mark,discipline:x?.discipline,event:x?.event,competition:x?.competition,meeting:x?.meeting,location:x?.location,venue:x?.venue,competitionVenue:x?.competitionVenue,wind:x?.wind,windReading:x?.windReading,legal:x?.legal,indoor:x?.indoor,isIndoor:x?.isIndoor,environment:x?.environment,venueType:x?.venueType,competitionType:x?.competitionType,stadiumType:x?.stadiumType,category:x?.category,race:x?.race
  }));
  return new Response(JSON.stringify({count:filtered.length,rows:filtered},null,2),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
}
