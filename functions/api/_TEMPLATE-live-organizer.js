// TEMPLATE for wiring up a NEW organizer's live-results source.
//
// This file is NOT wired into routing (the leading underscore excludes it from Cloudflare Pages'
// automatic /functions -> route mapping), so it is safe to keep in the repo as a working reference
// even when not in use. To adopt it for a new competition:
//   1. Copy this file to functions/api/live-<something>.js (drop the leading underscore).
//   2. Fill in every section marked TODO below against the new organizer's ACTUAL API - fetched
//      and inspected empirically first (see "Diagnostikk-mønster" in CLAUDE.md), never guessed.
//   3. Wire the new endpoint into app/live-refresh-api-fix20260918.js (and its .js sibling) the
//      same way live-decastar.js is wired in today - see CLAUDE.md's "Neste arrangør" playbook.
//   4. Validate the new endpoint's output against this contract with
//      `python3 scripts/validate_live_contract.py <url-or-file>` before pointing the client at it.
//
// ============================== THE CONTRACT ==============================
// The client (live-engine-fix20260918.js / live-engine.js) only ever reads the JSON shape below -
// it has ZERO knowledge of any organizer's own API format. As long as a function here produces
// exactly this shape, the entire rest of the app (forecast table, highlight, freeze, attempt
// dropdown, DNF handling, ...) works completely unchanged for any organizer.
//
// {
//   "competition": string,          // display name shown in the forecast banner
//   "source": string,                // shown nowhere critical today, but keep it truthful
//   "competitionId": string,         // your organizer's own competition/event ID, for your own reference
//   "updatedAt": string,             // ISO 8601 timestamp of THIS response, e.g. new Date().toISOString()
//   "status": "live" | "waiting",    // "waiting" before the first event has started
//   "men":   { <SECTION>, see below },
//   "women": { <SECTION>, see below }
// }
//
// <SECTION> (repeated once for men, once for women):
// {
//   "completedEvents": number,
//   // How many disciplines, IN THE FIXED ORDER LISTED IN disciplineOrder BELOW, are fully resolved
//   // for the WHOLE FIELD (every entered athlete has a mark or a terminal code) - not just the
//   // first athlete to finish. Getting this wrong (counting on ANY mark instead of ALL of them)
//   // was a real, user-reported bug on the previous organizer - see CLAUDE.md point 13.
//
//   "results": {
//     "<athlete full name, matching the roster data file's athlete.name as closely as possible>": {
//       "<discipline key, e.g. '100m', 'Lengde', 'Kule' - see disciplineOrder below>": {
//         "mark": number | null,        // parsed numeric mark (seconds for track, metres for field);
//                                         // null if no valid mark yet
//         "display": string,             // raw text as the organizer shows it (e.g. "10.61", "DNF")
//         "resultStatus": "DNS"|"DNF"|"DQ"|"NM"|"NH"|null,   // terminal code, or null if not terminal
//         "points": number | null,       // organizer's own points for this mark, if they provide it
//         "status": string,              // raw status string from the organizer, for debugging
//         "athleteId": string | null,    // organizer's own athlete ID, if available
//         "attempts": [ ... ],           // see "ATTEMPTS" below - [] if the organizer gives none
//         "attemptMode": "series" | "vertical" | null,   // "series" for throws/horizontal jumps,
//                                         // "vertical" for high jump/pole vault, null for track events
//         "wind": string,                // wind reading for this event, "" if not applicable/unknown
//         "active": boolean               // true while this specific athlete is mid-attempt RIGHT NOW
//                                         // (drives the red "live now" dot AND, since 2026-09-19,
//                                         // the highlight jumping to a brand-new event before its
//                                         // first attempt is judged - see CLAUDE.md point 15)
//       }
//       // ...one entry per discipline this athlete has ANY data for yet
//     }
//     // ...one entry per athlete with any data yet - omit athletes with nothing at all
//   },
//
//   "eventHasMarks": { "<discipline key>": number }
//   // Count of athletes who have ANY entry (not necessarily a final mark) for that discipline -
//   // used for diagnostics/sanity-checking, not for any critical UI logic.
// }
//
// ATTEMPTS (per-discipline "attempts" array above) - used for the attempts dropdown AND, since
// 2026-09-19, for moving the "latest result" highlight to a fresh foul the instant it's judged
// (see CLAUDE.md point 14):
//   - For throws/horizontal jumps ("series"): one entry per individual attempt, in order:
//       { "attemptId": number, "result": string /* e.g. "48.05" or "X" for a foul */, "wind": string }
//   - For high jump/pole vault ("vertical"): one entry per HEIGHT attempted so far, in order:
//       { "attemptId": number, "height": string /* e.g. "1.94" */, "result": string /* e.g. "XO" - up
//         to 3 chars, one per sub-attempt at that height, "O"=clear "X"=miss */ }
//   - For track events: always [] (attemptMode is null; a race is one shot, nothing to enumerate)
//
// ============================================================================================

const API = 'https://TODO-organizer-api-base-url';
const COMPETITION_ID = 'TODO-this-organizers-own-competition-id';

// TERMINAL status codes THIS organizer uses. Confirmed empirically (see CLAUDE.md point 8) - do
// not assume it's the same set as the previous organizer's DNS/DNF/DQ/NM/NH.
const TERMINAL = new Set(['DNS', 'DNF', 'DQ', 'NM', 'NH']);

// The site's own fixed internal event order for men/women - see app/data/00_base.js. Map the new
// organizer's own event/phase names to these EXACT keys. Order the regexes so any hurdle-specific
// pattern is checked before a broader one it could also match (see CLAUDE.md point 3).
const EVENT_MAP = [
  // [/TODO regex matching the organizer's own event name/i, 'InternalKey'],
];

// Which of the organizer's own result fields carries the live mark for each discipline. The
// previous organizer split results into three blocks (track/horizontal/vertical) fetched per
// event; a different organizer might give you one flat per-athlete list instead - restructure
// collectDiscipline()/collectSection() below to fit whatever shape is actually there.
const RESULT_BLOCK = {
  // '100m': 'TODO', 'Lengde': 'TODO', ...
};

function appDiscipline(text) {
  const s = String(text || '');
  for (const [rx, name] of EVENT_MAP) if (rx.test(s)) return name;
  return null;
}

async function getJson(path) {
  // TODO: confirm the organizer's real update cadence (see "Diagnostikk-mønster" in CLAUDE.md)
  // and set cacheTtl to something sensible for it - don't just reuse matsport's tuned value blindly.
  const r = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 Mangekampanalyse/2.0' },
    cf: { cacheTtl: 10, cacheEverything: true },
  });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.json();
}

// TODO: rewrite everything below to match the new organizer's actual API shape. The function
// names/signatures are a reasonable starting skeleton, not a contract you need to preserve exactly -
// what matters is that onRequestGet() at the bottom returns the JSON shape documented above.

async function getSchedule() {
  // TODO
  return [];
}

async function collectDiscipline(ids, discipline, resultsByName, disciplineStats) {
  // TODO: populate resultsByName[athleteName][discipline] = {...} for every athlete with data,
  // and update disciplineStats[discipline] = {entered, resolved} as you go (see the contract notes
  // on completedEvents above).
}

async function collectSection(schedule, gender) {
  const results = {};
  const disciplineStats = {};
  // TODO: call collectDiscipline() for each discipline in this section

  const disciplineOrder = []; // TODO: the fixed event order for this gender, matching EVENT_MAP's targets
  let completedEvents = 0;
  for (const discipline of disciplineOrder) {
    const stats = disciplineStats[discipline];
    if (stats && stats.entered > 0 && stats.resolved >= stats.entered) completedEvents++;
    else break;
  }

  const eventHasMarks = {};
  for (const discipline of disciplineOrder) {
    eventHasMarks[discipline] = Object.values(results).filter((r) => r[discipline]).length;
  }

  return { completedEvents, results, eventHasMarks };
}

export async function onRequestGet() {
  try {
    const schedule = await getSchedule();
    const [men, women] = await Promise.all([
      collectSection(schedule, 'M'),
      collectSection(schedule, 'W'),
    ]);
    return new Response(
      JSON.stringify({
        competition: 'TODO Competition Name Year',
        source: API,
        competitionId: COMPETITION_ID,
        updatedAt: new Date().toISOString(),
        status: men.completedEvents || women.completedEvents ? 'live' : 'waiting',
        men,
        women,
      }),
      {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
          'access-control-allow-origin': '*',
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err?.message || err), updatedAt: new Date().toISOString() }),
      { status: 502, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } }
    );
  }
}
