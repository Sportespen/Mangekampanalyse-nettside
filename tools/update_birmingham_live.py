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
    ('100m', 'ATHMDECATH------------100---------'),
    ('Lengde', 'ATHMDECATH------------LJ----------'),
    ('Kule', 'ATHMDECATH------------SP----------'),
    ('Høyde', 'ATHMDECATH------------HJ----------'),
    ('400m', 'ATHMDECATH------------400---------'),
    ('110mh', 'ATHMDECATH------------110H--------'),
    ('Diskos', 'ATHMDECATH------------DT----------'),
    ('Stav', 'ATHMDECATH------------PV----------'),
    ('Spyd', 'ATHMDECATH------------JT----------'),
    ('1500m', 'ATHMDECATH------------1500--------'),
]
WOMEN = [
    ('100mh', 'ATHWHEPTATH-----------100H--------'),
    ('Høyde', 'ATHWHEPTATH-----------HJ----------'),
    ('Kule', 'ATHWHEPTATH-----------SP----------'),
    ('200m', 'ATHWHEPTATH-----------200---------'),
    ('Lengde', 'ATHWHEPTATH-----------LJ----------'),
    ('Spyd', 'ATHWHEPTATH-----------JT----------'),
    ('800m', 'ATHWHEPTATH-----------800---------'),
]


def query(procedure: str, payload: dict, allow_404: bool = False):
    encoded = quote(json.dumps({'json': payload}, separators=(',', ':')))
    response = requests.get(f'{TRPC}/{procedure}?input={encoded}', headers=HEADERS, timeout=30)
    if allow_404 and response.status_code == 404:
        return None
    response.raise_for_status()
    data = response.json()
    return data.get('result', {}).get('data', {}).get('json')


def parse_mark(event: str, value):
    if value is None:
        return None
    text = str(value).strip().replace(',', '.')
    if not text or text.upper() in {'DNS', 'DNF', 'DQ', 'NM', 'NH', '—', '-'}:
        return None
    # Strip common qualification/record annotations while keeping the mark.
    text = re.sub(r'\s*(?:PB|SB|NR|CR|WL|EL|WR|Q|q)\b.*$', '', text, flags=re.I).strip()
    if ':' in text and event in {'1500m', '800m'}:
        parts = text.split(':')
        try:
            return float(parts[-2]) * 60 + float(parts[-1])
        except (ValueError, IndexError):
            return None
    match = re.search(r'-?\d+(?:\.\d+)?', text)
    return float(match.group(0)) if match else None


def normalize_name(value: str) -> str:
    return ' '.join(str(value or '').split()).strip()


def load_previous():
    if not OUT.exists():
        return None
    text = OUT.read_text(encoding='utf-8')
    match = re.search(r'window\.MANGEKAMP_LIVE\s*=\s*(\{.*\})\s*;?\s*$', text, flags=re.S)
    if not match:
        return None
    try:
        return json.loads(match.group(1))
    except Exception:
        return None


def athlete_map():
    data = query('liveResults.getAthletesFeed', {'competitionCode': COMPETITION_CODE}) or {}
    result = {}
    for athlete in data.get('athletes', []):
        athlete_id = str(athlete.get('athleteId') or athlete.get('federationId') or '')
        if athlete_id:
            result[athlete_id] = normalize_name(athlete.get('fullName') or f"{athlete.get('firstName','')} {athlete.get('lastName','')}")
    return result


def statuses_map():
    data = query('liveResults.getEventStatusesFeed', {'competitionCode': COMPETITION_CODE}) or {}
    return {str(item.get('eventId')): str(item.get('status') or '') for item in data.get('eventStatuses', [])}


def extract_rows(payload):
    if not isinstance(payload, dict):
        return []
    for key in ('combinedEventResults', 'results', 'participants'):
        rows = payload.get(key)
        if isinstance(rows, list):
            return rows
    return []


def collect_section(event_defs, names, statuses):
    results = {}
    completed = 0
    event_status = {}
    for event_name, phase_id in event_defs:
        status = statuses.get(phase_id, '')
        event_status[event_name] = status
        is_complete = status.casefold() in {'finished', 'official'}
        if not is_complete:
            continue
        payload = query(
            'liveResults.getCombinedEventResultsFeed',
            {'event': phase_id, 'competitionCode': COMPETITION_CODE, 'isSummary': True},
            allow_404=True,
        )
        if payload is None:
            continue
        rows = extract_rows(payload)
        added = 0
        for row in rows:
            athlete_id = str(row.get('athleteId') or row.get('participantId') or '')
            name = names.get(athlete_id) or normalize_name(row.get('fullName') or row.get('name') or '')
            mark = parse_mark(event_name, row.get('result') if 'result' in row else row.get('mark'))
            if not name or mark is None:
                continue
            results.setdefault(name, {})[event_name] = {
                'mark': mark,
                'display': str(row.get('result') or row.get('mark') or ''),
                'points': row.get('points') or row.get('resultPoints') or row.get('totalPoints'),
                'status': row.get('status') or status,
            }
            added += 1
        # Count the discipline as completed only once the feed actually contains results.
        if added:
            completed += 1
    return {'completedEvents': completed, 'results': results, 'eventStatus': event_status}


def comparable(data):
    if not isinstance(data, dict):
        return None
    copy = json.loads(json.dumps(data))
    copy['updatedAt'] = None
    return copy


def main():
    names = athlete_map()
    statuses = statuses_map()
    state = query('directusHub.getCompetitionStateHub', {'slug': 'birmingham-2026'}) or {}

    fresh = {
        'competition': 'EM Birmingham 2026',
        'source': 'https://live.european-athletics.com/birmingham-2026',
        'competitionCode': COMPETITION_CODE,
        'liveState': state.get('live_state') or 'unknown',
        'providerUpdatedAt': state.get('date_updated'),
        'updatedAt': None,
        'status': 'live' if state.get('live_state') == 'live' else 'waiting',
        'men': collect_section(MEN, names, statuses),
        'women': collect_section(WOMEN, names, statuses),
    }

    previous = load_previous()
    if previous and comparable(previous) == comparable(fresh):
        fresh['updatedAt'] = previous.get('updatedAt')
        print('Ingen endringer i mangekamp-live-data.')
    else:
        fresh['updatedAt'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
        print(f"Live-data endret: menn {fresh['men']['completedEvents']}/10, kvinner {fresh['women']['completedEvents']}/7")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        'window.MANGEKAMP_LIVE=' + json.dumps(fresh, ensure_ascii=False, separators=(',', ':')) + ';\n',
        encoding='utf-8',
    )


if __name__ == '__main__':
    main()
