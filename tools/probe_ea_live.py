import json
from urllib.parse import quote

import requests

TRPC = 'https://proxy.european-athletics.com/trpc'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36',
    'X-Client-Platform': 'Desktop',
}


def trpc_query(procedure, payload):
    encoded = quote(json.dumps({'json': payload}, separators=(',', ':')))
    url = f'{TRPC}/{procedure}?input={encoded}'
    r = requests.get(url, headers=HEADERS, timeout=30)
    item = {
        'procedure': procedure,
        'input': payload,
        'url': url,
        'status': r.status_code,
        'content_type': r.headers.get('content-type', ''),
        'text': r.text[:30000],
    }
    try:
        item['json'] = r.json()
    except Exception:
        pass
    return item


def unwrap(item):
    data = item.get('json')
    if isinstance(data, dict):
        return data.get('result', {}).get('data', {}).get('json')
    return None


def main():
    report = {'trpc': TRPC, 'calls': []}

    config = trpc_query('directusHub.getCompetitionConfigHub', {'slug': 'birmingham-test-2026'})
    report['calls'].append(config)
    config_data = unwrap(config)
    competition_code = None
    if isinstance(config_data, dict):
        competition_code = config_data.get('data_provider_code') or config_data.get('competitionCode') or config_data.get('code')
    report['competition_code'] = competition_code

    state = trpc_query('directusHub.getCompetitionStateHub', {'slug': 'birmingham-test-2026'})
    report['calls'].append(state)

    if competition_code:
        for procedure, payload in [
            ('liveResults.getScheduleFeed', {'competitionCode': competition_code}),
            ('liveResults.getEventNamesFeed', {'competitionCode': competition_code}),
            ('liveResults.getEventStatusesFeed', {'competitionCode': competition_code}),
            ('liveResults.getPlacingTableFeed', {'competitionCode': competition_code}),
            ('liveResults.getCountriesFeed', {'competitionCode': competition_code}),
        ]:
            report['calls'].append(trpc_query(procedure, payload))

    with open('ea-live-probe.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    with open('ea-live-page.html', 'w', encoding='utf-8') as f:
        f.write('<pre>' + json.dumps(report, ensure_ascii=False, indent=2).replace('&','&amp;').replace('<','&lt;') + '</pre>')

    summary = {
        'competition_code': competition_code,
        'calls': [
            {
                'procedure': c['procedure'],
                'status': c['status'],
                'sample': c.get('text', '')[:1500]
            }
            for c in report['calls']
        ]
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
