import json
import re
from urllib.parse import quote, urljoin

import requests
from bs4 import BeautifulSoup

TRPC='https://proxy.european-athletics.com/trpc'
ORIGIN='https://ea-webliveresults-production-asp.azurewebsites.net/'
HEADERS={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36','X-Client-Platform':'Desktop'}


def trpc_query(procedure,payload):
    encoded=quote(json.dumps({'json':payload},separators=(',',':')))
    r=requests.get(f'{TRPC}/{procedure}?input={encoded}',headers=HEADERS,timeout=30)
    item={'procedure':procedure,'input':payload,'status':r.status_code,'text':r.text[:50000]}
    try:item['json']=r.json()
    except Exception:pass
    return item


def main():
    report={'trpc':TRPC,'procedures':[],'results_page':'','scripts':[],'calls':[]}
    results_url=ORIGIN+'birmingham-2026/timetable/athwshotput/results?phaseId=ATHWSHOTPUT-----------QUAL--------&status=Results&unitId=ATHWSHOTPUT-----------QUALA00100--&unitView=summary'
    html=requests.get(results_url,headers=HEADERS,timeout=30).text
    report['results_page']=results_url
    scripts=set(urljoin(results_url,s['src']) for s in BeautifulSoup(html,'html.parser').find_all('script',src=True))
    procs=set()
    snippets=[]
    for url in sorted(scripts):
        try:
            text=requests.get(url,headers=HEADERS,timeout=30).text
            report['scripts'].append({'url':url,'length':len(text)})
            for m in re.findall(r'eaTrpc\.([A-Za-z0-9_]+\.[A-Za-z0-9_]+)\.(?:useQuery|useMutation)',text):
                procs.add(m)
            for needle in ('getResults','ResultsFeed','getStart','getPhase','getUnit','liveResults.'):
                pos=0; low=text.lower()
                while True:
                    i=low.find(needle.lower(),pos)
                    if i<0:break
                    sn=re.sub(r'\s+',' ',text[max(0,i-500):min(len(text),i+1000)])
                    if sn not in snippets:snippets.append(sn)
                    pos=i+len(needle)
                    if len(snippets)>=80:break
                if len(snippets)>=80:break
        except Exception as exc:
            report['scripts'].append({'url':url,'error':str(exc)})
    report['procedures']=sorted(procs)
    report['snippets']=snippets[:80]

    # Call obvious result-related procedures with likely argument shapes so their validation errors reveal schemas.
    for proc in sorted(p for p in procs if any(k in p.lower() for k in ('result','phase','unit','start','entry'))):
        for payload in [
            {'competitionCode':'ECH26','phaseId':'ATHWSHOTPUT-----------QUAL--------','unitId':'ATHWSHOTPUT-----------QUALA00100--'},
            {'competitionCode':'ECH26','eventId':'ATHWSHOTPUT-----------------------','phaseId':'ATHWSHOTPUT-----------QUAL--------','unitId':'ATHWSHOTPUT-----------QUALA00100--'},
        ]:
            call=trpc_query(proc,payload);report['calls'].append(call)
            if call['status']==200 and 'error' not in call['text'][:300]:break

    with open('ea-live-probe.json','w',encoding='utf-8') as f:json.dump(report,f,ensure_ascii=False,indent=2)
    with open('ea-live-page.html','w',encoding='utf-8') as f:f.write(html)
    summary={'procedures':report['procedures'],'calls':[{'procedure':c['procedure'],'status':c['status'],'sample':c['text'][:1600]} for c in report['calls']]}
    print(json.dumps(summary,ensure_ascii=False,indent=2)[:60000])

if __name__=='__main__':main()
