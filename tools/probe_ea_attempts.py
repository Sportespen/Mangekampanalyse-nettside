import json
from urllib.parse import quote
import requests

TRPC = 'https://proxy.european-athletics.com/trpc'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36',
    'X-Client-Platform': 'Desktop',
}
COMPETITION = 'ECH26'
FIELD_PREFIXES = [
    'ATHMDECATH------------LJ',
    'ATHMDECATH------------SP',
    'ATHMDECATH------------HJ',
    'ATHMDECATH------------DT',
    'ATHMDECATH------------PV',
    'ATHMDECATH------------JT',
]

def query(proc, payload):
    encoded = quote(json.dumps({'json': payload}, separators=(',', ':')))
    r = requests.get(f'{TRPC}/{proc}?input={encoded}', headers=HEADERS, timeout=30)
    try:
        data = r.json()
    except Exception:
        data = {'raw': r.text[:4000]}
    return {'procedure': proc, 'input': payload, 'status': r.status_code, 'data': data}


def extract_event_ids():
    res = query('liveResults.getEventNamesFeed', {
        'competitionCode': COMPETITION,
        'event': 'ATHMDECATH------------DT----------',
        'isSummary': False,
    })
    ids = []
    try:
        names = res['data']['result']['data']['json']['eventsNames']
        for item in names:
            eid = item.get('id', '')
            if any(eid.startswith(p) for p in FIELD_PREFIXES):
                ids.append({'id': eid, 'names': item.get('names', {})})
    except Exception:
        pass
    return res, ids


def contains_attempt_data(data):
    text = json.dumps(data, ensure_ascii=False).lower()
    return any(x in text for x in ['huber', '34.13', '43.39', 'attempt', 'series', 'trial'])


def main():
    names_response, event_ids = extract_event_ids()
    calls = []
    procedures = [
        'liveResults.getCombinedEventResultsFeed',
        'liveResults.getStandingsFeed',
        'liveResults.getPlacingTableFeed',
    ]
    for item in event_ids:
        event = item['id']
        for proc in procedures:
            for payload in (
                {'competitionCode': COMPETITION, 'event': event},
                {'competitionCode': COMPETITION, 'event': event, 'isSummary': False},
                {'competitionCode': COMPETITION, 'event': event, 'isSummary': True},
            ):
                res = query(proc, payload)
                if res['status'] != 404:
                    res['event_name'] = item.get('names', {})
                    res['interesting'] = contains_attempt_data(res['data'])
                    calls.append(res)

    report = {
        'event_ids': event_ids,
        'event_names_response_status': names_response.get('status'),
        'calls': calls,
    }
    with open('ea-attempt-probe.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    summary = []
    for c in calls:
        if c['status'] == 200 or c.get('interesting'):
            summary.append(c)
    print(json.dumps({'event_ids': event_ids, 'hits': summary}, ensure_ascii=False, indent=2)[:140000])


if __name__ == '__main__':
    main()
