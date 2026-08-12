from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

import requests

TRPC = 'https://proxy.european-athletics.com/trpc'
COMPETITION_CODE = 'ECH26'
OUT = Path('app/data/live_birmingham.js')
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36',
    'X-Client-Platform': 'Desktop',
}

MEN = [
    ('100m', 'ATHMDECATH------------100---------'),('Lengde', 'ATHMDECATH------------LJ----------'),('Kule', 'ATHMDECATH------------SP----------'),('Høyde', 'ATHMDECATH------------HJ----------'),('400m', 'ATHMDECATH------------400---------'),('110mh', 'ATHMDECATH------------110H--------'),('Diskos', 'ATHMDECATH------------DT----------'),('Stav', 'ATHMDECATH------------PV----------'),('Spyd', 'ATHMDECATH------------JT----------'),('1500m', 'ATHMDECATH------------1500--------')]
WOMEN = [
    ('100mh', 'ATHWHEPTATH-----------100H--------'),('Høyde', 'ATHWHEPTATH-----------HJ----------'),('Kule', 'ATHWHEPTATH-----------SP----------'),('200m', 'ATHWHEPTATH-----------200---------'),('Lengde', 'ATHWHEPTATH-----------LJ----------'),('Spyd', 'ATHWHEPTATH-----------JT----------'),('800m', 'ATHWHEPTATH-----------800---------')]


def query(procedure: str, payload: dict, allow_404: bool = False):
    encoded = quote(json.dumps({'json': payload}, separators=(',', ':')))
    response = requests.get(f'{TRPC}/{procedure}?input={encoded}', headers=HEADERS, timeout=30)
    if allow_404 and response.status_code == 404:
        return None
    response.raise_for_status()
    data = response.json()
    return data.get('result', {}).get('data', {}).get('json')


def parse_mark(event: str, value):
    if value is None: return None
    text = str(value).strip().replace(',', '.')
    if not text or text.upper() in {'DNS','DNF','DQ','NM','NH','—','-'}: return None
    text = re.sub(r'\s*(?:PB|SB|NR|CR|WL|EL|WR|Q|q)\b.*$', '', text, flags=re.I).strip()
    if ':' in text and event in {'1500m','800m'}:
        parts=text.split(':')
        try: return float(parts[-2])*60+float(parts[-1])
        except (ValueError,IndexError): return None
    m=re.search(r'-?\d+(?:\.\d+)?',text)
    return float(m.group(0)) if m else None


def normalize_name(value: str) -> str:
    return ' '.join(str(value or '').split()).strip()


def load_previous():
    if not OUT.exists(): return None
    text=OUT.read_text(encoding='utf-8')
    m=re.search(r'window\.MANGEKAMP_LIVE\s*=\s*(\{.*\})\s*;?\s*$',text,flags=re.S)
    if not m: return None
    try: return json.loads(m.group(1))
    except Exception: return None


def athlete_map():
    data=query('liveResults.getAthletesFeed',{'competitionCode':COMPETITION_CODE}) or {}
    result={}
    for athlete in data.get('athletes',[]):
        athlete_id=str(athlete.get('athleteId') or athlete.get('federationId') or '')
        if athlete_id:
            result[athlete_id]={
                'name':normalize_name(athlete.get('fullName') or f"{athlete.get('firstName','')} {athlete.get('lastName','')}"),
                'nation':str(athlete.get('countryCode') or athlete.get('nation') or athlete.get('country') or ''),
                'birth':str(athlete.get('birthDate') or athlete.get('dateOfBirth') or athlete.get('yearOfBirth') or '')
            }
    return result


def statuses_map():
    data=query('liveResults.getEventStatusesFeed',{'competitionCode':COMPETITION_CODE}) or {}
    return {str(i.get('eventId')):str(i.get('status') or '') for i in data.get('eventStatuses',[])}


def extract_rows(payload):
    if isinstance(payload,list): return payload
    if not isinstance(payload,dict): return []
    for key in ('combinedEventResults','results','participants','rankings','athletes'):
        rows=payload.get(key)
        if isinstance(rows,list): return rows
    found=[]
    for value in payload.values():
        rows=extract_rows(value)
        if rows: found.extend(rows)
    return found


def first_value(row,keys):
    for key in keys:
        if key in row and row.get(key) not in (None,''): return row.get(key)
    return None


def related_phase_ids(phase_id,statuses):
    ids=[phase_id]
    # EA may expose each heat/group under a child event id. Match on the stable
    # combined-event discipline prefix and collect every child id from statuses.
    stable=phase_id.rstrip('-')
    for event_id in statuses:
        if event_id==phase_id: continue
        if event_id.startswith(stable) or stable.startswith(event_id.rstrip('-')):
            ids.append(event_id)
    return list(dict.fromkeys(ids))


def fetch_payloads(phase_id,statuses):
    payloads=[]
    for candidate in related_phase_ids(phase_id,statuses):
        for is_summary in (False,True):
            payload=query('liveResults.getCombinedEventResultsFeed',{'event':candidate,'competitionCode':COMPETITION_CODE,'isSummary':is_summary},allow_404=True)
            if payload is not None and extract_rows(payload):
                payloads.append(payload)
                break
    return payloads


def collect_section(event_defs,athletes,statuses,previous_section=None):
    results={}
    completed=0
    event_status={}
    for event_name,phase_id in event_defs:
        status=statuses.get(phase_id,'')
        event_status[event_name]=status
        status_cf=status.casefold()
        if status_cf in {'scheduled','entries','startlist',''}: continue
        added_names=set()
        for payload in fetch_payloads(phase_id,statuses):
            for row in extract_rows(payload):
                if not isinstance(row,dict): continue
                athlete_id=str(first_value(row,('athleteId','participantId','id','competitorId')) or '')
                meta=athletes.get(athlete_id,{})
                name=meta.get('name') or normalize_name(first_value(row,('fullName','name','athleteName','participantName')) or '')
                raw_mark=first_value(row,('result','mark','performance','resultValue','value'))
                mark=parse_mark(event_name,raw_mark)
                if not name or mark is None: continue
                points=first_value(row,('points','resultPoints','eventPoints','score','totalPoints'))
                entry=results.setdefault(name,{})
                if meta.get('nation'): entry['nation']=meta['nation']
                if meta.get('birth'): entry['birth']=meta['birth']
                entry[event_name]={'mark':mark,'display':str(raw_mark or ''),'points':points,'status':first_value(row,('status','resultStatus')) or status}
                added_names.add(name)
        if added_names and status_cf in {'finished','official'}: completed+=1

    # Never lose already captured live marks if EA temporarily returns a partial heat.
    prev=(previous_section or {}).get('results',{})
    for name,vals in prev.items():
        dest=results.setdefault(name,{})
        for key,val in vals.items():
            if key not in dest: dest[key]=val
    return {'completedEvents':completed,'results':results,'eventStatus':event_status}


def comparable(data):
    if not isinstance(data,dict): return None
    copy=json.loads(json.dumps(data));copy['updatedAt']=None;return copy


def main():
    athletes=athlete_map();statuses=statuses_map();state=query('directusHub.getCompetitionStateHub',{'slug':'birmingham-2026'}) or {};previous=load_previous() or {}
    fresh={'competition':'EM Birmingham 2026','source':'https://live.european-athletics.com/birmingham-2026','competitionCode':COMPETITION_CODE,'liveState':state.get('live_state') or 'unknown','providerUpdatedAt':state.get('date_updated'),'updatedAt':None,'status':'live' if state.get('live_state')=='live' else 'waiting','men':collect_section(MEN,athletes,statuses,previous.get('men')),'women':collect_section(WOMEN,athletes,statuses,previous.get('women'))}
    if previous and comparable(previous)==comparable(fresh):
        fresh['updatedAt']=previous.get('updatedAt');print('Ingen endringer i mangekamp-live-data.')
    else:
        fresh['updatedAt']=datetime.now(timezone.utc).isoformat().replace('+00:00','Z');print(f"Live-data endret: menn {fresh['men']['completedEvents']}/10, kvinner {fresh['women']['completedEvents']}/7");print(f"Aktive utøvere med live-data: menn {len(fresh['men']['results'])}, kvinner {len(fresh['women']['results'])}")
    OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text('window.MANGEKAMP_LIVE='+json.dumps(fresh,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')

if __name__=='__main__': main()
