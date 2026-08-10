import json
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

BASE = 'https://live.european-athletics.com/birmingham-test-2026'
HEADERS = {'User-Agent': 'Mozilla/5.0'}


def get_page(url):
    response = requests.get(url, headers=HEADERS, timeout=30)
    return response.status_code, response.headers.get('content-type', ''), response.text


def main():
    report = {'base': BASE, 'pages': [], 'links': [], 'scripts': []}
    urls = [BASE, BASE + '/entries', BASE + '/records', BASE + '/schedule']

    for url in urls:
        try:
            status, content_type, text = get_page(url)
            report['pages'].append({
                'url': url,
                'status': status,
                'content_type': content_type,
                'length': len(text),
                'decathlon': 'decathlon' in text.lower(),
                'heptathlon': 'heptathlon' in text.lower(),
                'result': 'result' in text.lower(),
            })
            soup = BeautifulSoup(text, 'html.parser')
            for tag in soup.find_all('a', href=True):
                link = urljoin(url, tag['href'])
                if urlparse(link).netloc == urlparse(BASE).netloc:
                    report['links'].append(link)
            for tag in soup.find_all('script', src=True):
                report['scripts'].append(urljoin(url, tag['src']))
        except Exception as exc:
            report['pages'].append({'url': url, 'error': str(exc)})

    report['links'] = sorted(set(report['links']))
    report['scripts'] = sorted(set(report['scripts']))
    with open('ea-live-probe.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
