import json
from urllib.parse import quote

import requests

TRPC='https://proxy.european-athletics.com/trpc'
HEADERS={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36','X-Client-Platform':'Desktop'}


def query(proc,payload):
    encoded=quote(json.dumps({'json':payload},separators=(',',':')))
    r=requests.get(f'{TRPC}/{proc}?input={encoded}',headers=HEADERS,timeout=30)
    return {'procedure':proc,'input':payload,'status':r.status_code,'text':r.text[:50000]}


def main():
    calls=[]
    tests=[
        'ATHMDECATH------------------------',
        'ATHMDECATH------------100---------',
        'ATHWHEPTATH-----------------------',
        'ATHWHEPTATH-----------100H--------',
    ]
    for event in tests:
        calls.append(query('liveResults.getCombinedEventResultsFeed',{
            'event':event,'competitionCode':'ECH26','isSummary':True
        }))
    report={'calls':calls}
    with open('ea-live-probe.json','w',encoding='utf-8') as f:json.dump(report,f,ensure_ascii=False,indent=2)
    with open('ea-live-page.html','w',encoding='utf-8') as f:f.write('<pre>'+json.dumps(report,ensure_ascii=False,indent=2).replace('&','&amp;').replace('<','&lt;')+'</pre>')
    print(json.dumps({'calls':[{'input':c['input'],'status':c['status'],'sample':c['text'][:5000]} for c in calls]},ensure_ascii=False,indent=2)[:30000])

if __name__=='__main__':main()
