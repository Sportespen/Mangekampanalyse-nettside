const TRPC = 'https://proxy.european-athletics.com/trpc';
const COMPETITION_CODE = 'ECH26';

const MEN = [
  ['100m','ATHMDECATH------------100---------'],
  ['Lengde','ATHMDECATH------------LJ----------'],
  ['Kule','ATHMDECATH------------SP----------'],
  ['Høyde','ATHMDECATH------------HJ----------'],
  ['400m','ATHMDECATH------------400---------'],
  ['110mh','ATHMDECATH------------110H--------'],
  ['Diskos','ATHMDECATH------------DT----------'],
  ['Stav','ATHMDECATH------------PV----------'],
  ['Spyd','ATHMDECATH------------JT----------'],
  ['1500m','ATHMDECATH------------1500--------']
];
const WOMEN = [
  ['100mh','ATHWHEPTATH-----------100H--------'],
  ['Høyde','ATHWHEPTATH-----------HJ----------'],
  ['Kule','ATHWHEPTATH-----------SP----------'],
  ['200m','ATHWHEPTATH-----------200---------'],
  ['Lengde','ATHWHEPTATH-----------LJ----------'],
  ['Spyd','ATHWHEPTATH-----------JT----------'],
  ['800m','ATHWHEPTATH-----------800---------']
];

function enc(payload) {
  return encodeURIComponent(JSON.stringify({json: payload}));
}

async function query(proc, payload, allow404=false) {
  const url = `${TRPC}/${proc}?input=${enc(payload)}`;
  const r = await fetch(url, {
    headers: {'X-Client-Platform':'Desktop','Accept':'application/json'},
    cf: {cacheTtl: 0, cacheEverything: false}
  });
  if (allow404 && r.status === 404) return null;
  if (!r.ok) throw new Error(`${proc}: HTTP ${r.status}`);
  const data = await r.json();
  return data?.result?.data?.json ?? null;
}

function parseMark(event, value) {
  if (value == null) return null;
  let text = String(value).trim().replace(',', '.');
  if (!text || ['DNS','DNF','DQ','NM','NH','—','-'].includes(text.toUpperCase())) return null;
  text = text.replace(/\s*(?:PB|SB|NR|CR|WL|EL|WR|Q|q)\b.*$/i, '').trim();
  if (text.includes(':') && (event === '1500m' || event === '800m')) {
    const p = text.split(':');
    const sec = Number(p[p.length-2]) * 60 + Number(p[p.length-1]);
    return Number.isFinite(sec) ? sec : null;
  }
  const m = text.match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

function cleanName(v) {
  return String(v || '').replace(/\s+/g,' ').trim();
}

async function athleteMap() {
  const data = await query('liveResults.getAthletesFeed',{competitionCode:COMPETITION_CODE}) || {};
  const out = {};
  for (const a of (data.athletes || [])) {
    const id = String(a.athleteId || a.federationId || '');
    if (!id) continue;
    out[id] = {
      name: cleanName(a.fullName || `${a.firstName || ''} ${a.lastName || ''}`),
      nation: String(a.countryCode || a.nation || a.country || ''),
      birth: String(a.birthDate || a.dateOfBirth || a.yearOfBirth || '')
    };
  }
  return out;
}

async function statusesMap() {
  const data = await query('liveResults.getEventStatusesFeed',{competitionCode:COMPETITION_CODE}) || {};
  const out = {};
  for (const i of (data.eventStatuses || [])) out[String(i.eventId)] = String(i.status || '');
  return out;
}

async function eventRows(phaseId) {
  const payload = await query('liveResults.getCombinedEventResultsFeed',{
    event:phaseId, competitionCode:COMPETITION_CODE, isSummary:true
  }, true);
  return payload && Array.isArray(payload.athletes) ? payload.athletes : [];
}

async function collectSection(defs, athletes, statuses) {
  const results = {};
  let completedEvents = 0;
  const eventStatus = {};

  for (const [eventName, phaseId] of defs) {
    const status = statuses[phaseId] || '';
    eventStatus[eventName] = status;
    const cf = status.toLowerCase();
    if (['scheduled','entries','startlist',''].includes(cf)) continue;

    const rows = await eventRows(phaseId);
    let added = 0;
    for (const row of rows) {
      const id = String(row.athleteId || '');
      const meta = athletes[id] || {};
      const name = meta.name || cleanName(row.fullName || row.name || '');
      const raw = row.result;
      const mark = parseMark(eventName, raw);
      if (!name || mark == null) continue;
      const entry = results[name] ||= {};
      if (meta.nation) entry.nation = meta.nation;
      if (meta.birth) entry.birth = meta.birth;
      const cr = row.combinedResult && typeof row.combinedResult === 'object' ? row.combinedResult : {};
      entry[eventName] = {
        mark,
        display:String(raw),
        points:cr.points ?? null,
        status,
        wind:row.raceWind || row.bestResultWind || ''
      };
      added++;
    }
    if (added && ['finished','official'].includes(cf)) completedEvents++;
  }
  return {completedEvents,results,eventStatus};
}

export async function onRequestGet() {
  try {
    const [athletes,statuses,state] = await Promise.all([
      athleteMap(),
      statusesMap(),
      query('directusHub.getCompetitionStateHub',{slug:'birmingham-2026'}).catch(()=>({}))
    ]);
    const [men,women] = await Promise.all([
      collectSection(MEN,athletes,statuses),
      collectSection(WOMEN,athletes,statuses)
    ]);
    const now = new Date().toISOString();
    const payload = {
      competition:'EM Birmingham 2026',
      source:'https://live.european-athletics.com/birmingham-2026',
      competitionCode:COMPETITION_CODE,
      liveState:state?.live_state || 'unknown',
      providerUpdatedAt:state?.date_updated || null,
      updatedAt:now,
      status:state?.live_state === 'live' ? 'live' : 'waiting',
      men,women
    };
    return new Response(JSON.stringify(payload),{
      headers:{
        'content-type':'application/json; charset=utf-8',
        'cache-control':'no-store, no-cache, must-revalidate, max-age=0',
        'access-control-allow-origin':'*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({error:String(err?.message || err),updatedAt:new Date().toISOString()}),{
      status:502,
      headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}
    });
  }
}
