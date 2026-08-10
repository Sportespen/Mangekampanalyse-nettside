import asyncio
import json

from playwright.async_api import async_playwright

BASE = 'https://live.european-athletics.com/birmingham-test-2026'


async def main():
    report = {'base': BASE, 'title': '', 'url': '', 'responses': [], 'links': []}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1440, 'height': 1000},
            locale='en-GB',
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36'
        )
        page = await context.new_page()

        async def capture(response):
            url = response.url
            content_type = response.headers.get('content-type', '')
            if ('json' in content_type.lower() or any(word in url.lower() for word in ('api', 'result', 'event', 'competition', 'schedule'))):
                item = {'url': url, 'status': response.status, 'content_type': content_type}
                if 'json' in content_type.lower():
                    try:
                        text = await response.text()
                        item['sample'] = text[:4000]
                    except Exception:
                        pass
                report['responses'].append(item)

        page.on('response', capture)
        try:
            await page.goto(BASE, wait_until='domcontentloaded', timeout=90000)
            await page.wait_for_timeout(12000)
        except Exception as exc:
            report['navigation_error'] = str(exc)

        report['title'] = await page.title()
        report['url'] = page.url
        try:
            report['links'] = await page.eval_on_selector_all('a[href]', 'els => els.map(a => a.href)')
        except Exception:
            pass
        html = await page.content()
        with open('ea-live-page.html', 'w', encoding='utf-8') as f:
            f.write(html)
        await browser.close()

    dedup = {}
    for item in report['responses']:
        dedup[item['url']] = item
    report['responses'] = list(dedup.values())
    report['links'] = sorted(set(report['links']))
    with open('ea-live-probe.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(json.dumps(report, ensure_ascii=False, indent=2)[:30000])


if __name__ == '__main__':
    asyncio.run(main())
