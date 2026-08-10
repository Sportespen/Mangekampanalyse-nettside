import json
import re
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

PUBLIC = 'https://live.european-athletics.com/birmingham-test-2026'
ORIGIN = 'https://ea-webliveresults-production-asp.azurewebsites.net/'
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36'}
KEYWORDS = ('trpc','timetable','result','competition','event','phase','unit','tenant','schedule')


def get(url):
    r = requests.get(url, headers=HEADERS, timeout=30)
    return r.status_code, r.headers.get('content-type',''), r.text


def context_snippets(text, needle, radius=450):
    low = text.lower()
    pos = 0
    out = []
    while True:
        idx = low.find(needle.lower(), pos)
        if idx < 0:
            break
        out.append(text[max(0, idx-radius):min(len(text), idx+len(needle)+radius)])
        pos = idx + len(needle)
        if len(out) >= 20:
            break
    return out


def main():
    report = {'public': PUBLIC, 'origin': ORIGIN, 'pages': [], 'scripts': [], 'api_hints': [], 'snippets': []}
    urls = [ORIGIN, urljoin(ORIGIN, 'birmingham-test-2026'), urljoin(ORIGIN, 'birmingham-test-2026/timetable')]
    scripts = set()

    for url in urls:
        try:
            status, content_type, text = get(url)
            soup = BeautifulSoup(text,'html.parser')
            report['pages'].append({'url':url,'status':status,'content_type':content_type,'length':len(text),'title':soup.title.string if soup.title else ''})
            for tag in soup.find_all('script', src=True):
                scripts.add(urljoin(url, tag['src']))
        except Exception as exc:
            report['pages'].append({'url':url,'error':str(exc)})

    hints = set()
    procedure_like = set()
    snippets = []
    for script in sorted(scripts):
        try:
            status, content_type, text = get(script)
            item = {'url':script,'status':status,'length':len(text)}
            report['scripts'].append(item)
            for match in re.findall(r'https?://[^\"\'\s)]+', text):
                low = match.lower()
                if any(key in low for key in ('api','azure','result','athletics','trpc')):
                    hints.add(match[:500])
            # tRPC routers/procedures are typically encoded as dotted strings.
            for match in re.findall(r'[A-Za-z][A-Za-z0-9_]{1,40}(?:\.[A-Za-z][A-Za-z0-9_]{1,50}){1,4}', text):
                low = match.lower()
                if any(k in low for k in ('result','timetable','competition','event','phase','unit','schedule')):
                    procedure_like.add(match)
            for keyword in KEYWORDS:
                for snippet in context_snippets(text, keyword):
                    clean = re.sub(r'\s+', ' ', snippet)
                    if ('trpc' in clean.lower() or 'query' in clean.lower() or 'mutation' in clean.lower()) and clean not in snippets:
                        snippets.append(clean[:1100])
                        if len(snippets) >= 100:
                            break
                if len(snippets) >= 100:
                    break
        except Exception as exc:
            report['scripts'].append({'url':script,'error':str(exc)})

    report['api_hints'] = sorted(hints)[:200]
    report['procedure_candidates'] = sorted(procedure_like)[:500]
    report['snippets'] = snippets[:100]
    with open('ea-live-probe.json','w',encoding='utf-8') as f:
        json.dump(report,f,ensure_ascii=False,indent=2)
    with open('ea-live-page.html','w',encoding='utf-8') as f:
        f.write(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps(report,ensure_ascii=False,indent=2)[:60000])

if __name__ == '__main__':
    main()
