from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote
import requests

TRPC='https://proxy.european-athletics.com/trpc';COMPETITION_CODE='ECH26';OUT=Path('app/data/live_birmingham.js')
HEADERS={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36','X-Client-Platform':'Desktop'}
MEN=[('100m','ATHMDECATH------------100---------'),('Lengde','ATHMDECATH------------LJ----------'),('Kule','ATHMDECATH------------SP----------'),('Høyde','ATHMDECATH------------HJ----------'),('400m','ATHMDECATH------------400---------'),('110mh','ATHMDECATH------------110H--------'),('Diskos','ATHMDECATH------------DT----------'),('Stav','ATHMDECATH------------PV----------'),('Spyd','ATHMDECATH------------JT----------'),('1500m','ATHMDECATH------------1500--------')]
WOMEN=[('100mh','ATHWHEPTATH-----------100H--------'),('Høyde','ATHWHEPTATH-----------HJ----------'),('Kule','ATHWHEPTATH-----------SP----------'),('200m','ATHWHEPTATH-----------200---------'),('Lengde','ATHWHEPTATH-----------LJ----------'),('Spyd','ATHWHEPTATH-----------JT----------'),('800m','ATHWHEPTATH-----------800---------')]

def query(procedure,payload,allow_404=False):
    encoded=quote(json.dumps({'json':payload},separators=(',',':')));r=requests.get(f'{TRPC}/{procedure}?input={encoded}',headers=HEADERS,timeout=30)
    if allow_404 and r.status_code==404:return None
    r.raise_for_status();return r.json().get('result',{}).get('data',{}).get('json')

def parse_mark(event,value):
    if value is None:return None
    text=str(value).strip().replace(',','.')
    if not text or text.upper() in {'DNS','DNF','DQ','NM','NH','—','-'}:return None
    text=re.sub(r'\s*(?:PB|SB|NR|CR|WL|EL|WR|Q|q)\b.*$','',text,flags=re.I).strip()
    if ':' in text and event in {'1500m','800m'}:
        p=text.split(':')
        try:return float(p[-2])*60+float(p[-1])
        except:return None
    m=re.search(r'-?\d+(?:\.\d+)?',text);return float(m.group(0)) if m else None

def normalize_name(v):return ' '.join(str(v or '').split()).strip()

def load_previous():
    if not OUT.exists():return {}
    m=re.search(r'window\.MANGEKAMP_LIVE\s*=\s*(\{.*\})\s*;?\s*$',OUT.read_text(encoding='utf-8'),flags=re.S)
    try:return json.loads(m.group(1)) if m else {}
    except:return {}

def athlete_map():
    data=query('liveResults.getAthletesFeed',{'competitionCode':COMPETITION_CODE}) or {};out={}
    for a in data.get('athletes',[]):
        aid=str(a.get('athleteId') or a.get('federationId') or '')
        if aid:out[aid]={'name':normalize_name(a.get('fullName') or f"{a.get('firstName','')} {a.get('lastName','')}"),'nation':str(a.get('countryCode') or a.get('nation') or a.get('country') or ''),'birth':str(a.get('birthDate') or a.get('dateOfBirth') or a.get('yearOfBirth') or '')}
    return out

def statuses_map():
    data=query('liveResults.getEventStatusesFeed',{'competitionCode':COMPETITION_CODE}) or {};return {str(i.get('eventId')):str(i.get('status') or '') for i in data.get('eventStatuses',[])}

def event_rows(phase_id):
    # IMPORTANT: EA's exact discipline summary already contains every heat/group.
    # Never query/merge parent combined-event ids here; those rows contain cumulative points,
    # which were previously misread as marks (e.g. 1631.00 instead of 11.12).
    payload=query('liveResults.getCombinedEventResultsFeed',{'event':phase_id,'competitionCode':COMPETITION_CODE,'isSummary':True},allow_404=True)
    return payload.get('athletes',[]) if isinstance(payload,dict) and isinstance(payload.get('athletes'),list) else []

def collect_section(defs,athletes,statuses,previous_section=None):
    results={};completed=0;event_status={};prev=(previous_section or {}).get('results',{})
    for event_name,phase_id in defs:
        status=statuses.get(phase_id,'');event_status[event_name]=status;cf=status.casefold()
        if cf in {'scheduled','entries','startlist',''}:continue
        rows=event_rows(phase_id);added=0
        for row in rows:
            aid=str(row.get('athleteId') or '');meta=athletes.get(aid,{})
            name=meta.get('name') or normalize_name(row.get('fullName') or row.get('name') or '')
            raw=row.get('result');mark=parse_mark(event_name,raw)
            if not name or mark is None:continue
            entry=results.setdefault(name,{})
            if meta.get('nation'):entry['nation']=meta['nation']
            if meta.get('birth'):entry['birth']=meta['birth']
            cr=row.get('combinedResult') if isinstance(row.get('combinedResult'),dict) else {}
            entry[event_name]={'mark':mark,'display':str(raw),'points':cr.get('points'),'status':status,'wind':row.get('raceWind') or row.get('bestResultWind') or ''};added+=1
        if added and cf in {'finished','official'}:completed+=1
        # Only preserve a previous event if EA temporarily returns zero rows for that event.
        if not added:
            for name,vals in prev.items():
                old=vals.get(event_name)
                if old is not None:
                    dest=results.setdefault(name,{})
                    for meta_key in ('nation','birth'):
                        if vals.get(meta_key) and not dest.get(meta_key):dest[meta_key]=vals[meta_key]
                    dest[event_name]=old
    return {'completedEvents':completed,'results':results,'eventStatus':event_status}

def comparable(data):
    if not isinstance(data,dict):return None
    c=json.loads(json.dumps(data));c['updatedAt']=None;return c

def main():
    athletes=athlete_map();statuses=statuses_map();state=query('directusHub.getCompetitionStateHub',{'slug':'birmingham-2026'}) or {};previous=load_previous()
    fresh={'competition':'EM Birmingham 2026','source':'https://live.european-athletics.com/birmingham-2026','competitionCode':COMPETITION_CODE,'liveState':state.get('live_state') or 'unknown','providerUpdatedAt':state.get('date_updated'),'updatedAt':None,'status':'live' if state.get('live_state')=='live' else 'waiting','men':collect_section(MEN,athletes,statuses,previous.get('men')),'women':collect_section(WOMEN,athletes,statuses,previous.get('women'))}
    fresh['updatedAt']=previous.get('updatedAt') if previous and comparable(previous)==comparable(fresh) else datetime.now(timezone.utc).isoformat().replace('+00:00','Z')
    OUT.write_text('window.MANGEKAMP_LIVE='+json.dumps(fresh,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    print('Menn:',fresh['men']['completedEvents'],'ferdige; liveutøvere',len(fresh['men']['results']))
if __name__=='__main__':main()
