import json
import re
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

PUBLIC = 'https://live.european-athletics.com/birmingham-test-2026'
ORIGIN = 'https://ea-webliveresults-production-asp.azurewebsites.net/'
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36'}


def get(url):
    r = requests.get(url, headers=HEADERS, timeout=30)
    return r.status_code, r.headers.get('content-type',''), r.text


def main():
    report = {'public': PUBLIC, 'origin': ORIGIN, 'pages': [], 'scripts': [], 'api_hints': []}
    urls = [ORIGIN, urljoin(ORIGIN, 'birmingham-test-2026'), urljoin(ORIGIN, 'birmingham-test-2026/timetable')]
    scripts = set()

    for url in urls:
        try:
            status, content_type, text = get(url)
            report['pages'].append({'url':url,'status':status,'content_type':content_type,'length':len(text),'title':BeautifulSoup(text,'html.parser').title.string if BeautifulSoup(text,'html.parser').title else ''})
            soup = BeautifulSoup(text, 'html.parser')
            for tag in soup.find_all('script', src=True):
                scripts.add(urljoin(url, tag['src']))
        except Exception as exc:
            report['pages'].append({'url':url,'error':str(exc)})

    hints = set()
    for script in sorted(scripts):
        try:
            status, content_type, text = get(script)
            report['scripts'].append({'url':script,'status':status,'length':len(text)})
            for match in re.findall(r'https?://[^\"\'\s)]+', text):
                low = match.lower()
                if any(key in low for key in ('api','azure','result','athletics')):
                    hints.add(match[:500])
        except Exception as exc:
            report['scripts'].append({'url':script,'error':str(exc)})

    report['api_hints'] = sorted(hints)[:200]
    with open('ea-live-probe.json','w',encoding='utf-8') as f:
        json.dump(report,f,ensure_ascii=False,indent=2)
    with open('ea-live-page.html','w',encoding='utf-8') as f:
        f.write(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps(report,ensure_ascii=False,indent=2)[:30000])

if __name__ == '__main__':
    main()
