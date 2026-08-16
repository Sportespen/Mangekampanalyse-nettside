import fs from 'node:fs/promises';

const NOW = new Date();
const currentYear = NOW.getUTCFullYear();
const years = [currentYear, currentYear - 1, currentYear - 2];
const configs = [
  {type:'men', discipline:'decathlon', gender:'men', label:'Tikamp'},
  {type:'women', discipline:'heptathlon', gender:'women', label:'Sjukamp'},
];

function decodeHtml(s='') {
  return s
    .replace(/&#(\d+);/g, (_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_,n)=>String.fromCodePoint(parseInt(n,16)))
    .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}
function cleanText(s='') { return decodeHtml(s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()); }
function norm(s='') { return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/gi,'ae').replace(/ø/gi,'o').replace(/å/gi,'a').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }

async function fetchPage(cfg, year, page) {
  const url = `https://worldathletics.org/records/toplists/combined-events/${cfg.discipline}/all/${cfg.gender}/senior/${year}?ageCategory=senior&bestResultsOnly=true&maxResultsByCountry=all&page=${page}&regionType=world&windReading=regular`;
  const r = await fetch(url,{headers:{'user-agent':'Mozilla/5.0 (Mangekampanalyse name index)','accept':'text/html'}});
  if(!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

function parseAthletes(html,cfg,year) {
  const out=[];
  const re=/<a\b[^>]*href=["']([^"']*\/athletes\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while((m=re.exec(html))) {
    const href=m[1];
    const idMatch=href.match(/(?:-|athlete=)(\d{7,9})(?:$|[?&#/])/i);
    if(!idMatch) continue;
    const name=cleanText(m[2]);
    if(!name || name.length<3 || !/[A-Za-zÀ-ž]/.test(name)) continue;
    out.push({id:idMatch[1],name,nation:'',birth:'',discipline:cfg.label,type:cfg.type,sourceYear:year,url:href});
  }
  return out;
}

async function collect(cfg) {
  const map=new Map();
  for(const year of years) {
    let emptyStreak=0;
    for(let page=1; page<=30; page++) {
      const html=await fetchPage(cfg,year,page);
      const rows=parseAthletes(html,cfg,year);
      let added=0;
      for(const a of rows) {
        if(!map.has(a.id)) { map.set(a.id,a); added++; }
      }
      console.log(`${cfg.type} ${year} page ${page}: links=${rows.length}, new=${added}`);
      if(rows.length===0 || added===0) emptyStreak++; else emptyStreak=0;
      if(emptyStreak>=2) break;
    }
  }
  return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'en'));
}

const men=await collect(configs[0]);
const women=await collect(configs[1]);
const payload={generatedAt:new Date().toISOString(),years,men,women};
await fs.mkdir('app/data',{recursive:true});
await fs.writeFile('app/data/athlete-name-index.json',JSON.stringify(payload,null,2)+'\n');
console.log(`INDEX men=${men.length} women=${women.length}`);
for(const needle of ['Jonathan Hertwig','Markus Rooth']) {
  const hits=men.filter(a=>norm(a.name).includes(norm(needle)));
  console.log(`CHECK ${needle}: ${hits.map(x=>`${x.name} [${x.id}]`).join(' | ') || 'MISSING'}`);
}
if(!men.some(a=>norm(a.name).includes('jonathan hertwig'))) throw new Error('Jonathan Hertwig-Ødegaard missing from index');
if(!men.some(a=>norm(a.name)==='markus rooth')) throw new Error('Markus Rooth missing from index');
