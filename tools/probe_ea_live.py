import json
import re
from urllib.parse import quote

import requests

TRPC = 'https://proxy.european-athletics.com/trpc'
ORIGIN = 'https://ea-webliveresults-production-asp.azurewebsites.net/'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36',
    'X-Client-Platform': 'Desktop',
}


def trpc_query(procedure, payload):
    encoded = quote(json.dumps({'json': payload}, separators=(',', ':')))
    url = f'{TRPC}/{procedure}?input={encoded}'
    r = requests.get(url, headers=HEADERS, timeout=30)
    item = {'procedure':procedure,'input':payload,'status':r.status_code,'text':r.text[:30000]}
    try: item['json'] = r.json()
    except Exception: pass
    return item


def unwrap(item):
    data=item.get('json')
    if isinstance(data,dict): return data.get('result',{}).get('data',{}).get('json')
    return None


def snippets(text, needle, radius=300):
    out=[]; low=text.lower(); pos=0
    while True:
        i=low.find(needle.lower(),pos)
        if i<0: break
        out.append(text[max(0,i-radius):min(len(text),i+len(needle)+radius)])
        pos=i+len(needle)
        if len(out)>=10: break
    return out


def main():
    report={'trpc':TRPC,'origin':ORIGIN,'calls':[],'html_snippets':{}}
    root=requests.get(ORIGIN,headers=HEADERS,timeout=30).text
    for key in ('data_provider_code','competitionCode','competition_code','live_state','Birmingham','ATH'):
        report['html_snippets'][key]=snippets(root,key)

    candidates=['birmingham-test-2026','birmingham-2026','birmingham2026','birmingham','european-athletics-championships-2026']
    competition_code=None
    chosen_slug=None
    for slug in candidates:
        call=trpc_query('directusHub.getCompetitionConfigHub',{'slug':slug})
        report['calls'].append(call)
        data=unwrap(call)
        if isinstance(data,dict) and data:
            code=data.get('data_provider_code') or data.get('competitionCode') or data.get('code')
            if code:
                competition_code=code; chosen_slug=slug; break

    report['competition_code']=competition_code
    report['chosen_slug']=chosen_slug
    if chosen_slug:
        report['calls'].append(trpc_query('directusHub.getCompetitionStateHub',{'slug':chosen_slug}))
    if competition_code:
        for proc,payload in [
            ('liveResults.getScheduleFeed',{'competitionCode':competition_code}),
            ('liveResults.getEventNamesFeed',{'competitionCode':competition_code}),
            ('liveResults.getEventStatusesFeed',{'competitionCode':competition_code}),
            ('liveResults.getPlacingTableFeed',{'competitionCode':competition_code}),
            ('liveResults.getCountriesFeed',{'competitionCode':competition_code}),
        ]:
            report['calls'].append(trpc_query(proc,payload))

    with open('ea-live-probe.json','w',encoding='utf-8') as f: json.dump(report,f,ensure_ascii=False,indent=2)
    with open('ea-live-page.html','w',encoding='utf-8') as f: f.write(root)
    summary={'competition_code':competition_code,'chosen_slug':chosen_slug,'calls':[{'procedure':c['procedure'],'input':c['input'],'status':c['status'],'sample':c['text'][:1000]} for c in report['calls']], 'birmingham_snippets':report['html_snippets']['Birmingham'][:3]}
    print(json.dumps(summary,ensure_ascii=False,indent=2)[:30000])

if __name__=='__main__': main()
