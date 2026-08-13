import json
from urllib.parse import quote
import requests

TRPC='https://proxy.european-athletics.com/trpc'
HEADERS={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36','X-Client-Platform':'Desktop'}
COMPETITION='ECH26'

def query(proc,payload):
    encoded=quote(json.dumps({'json':payload},separators=(',',':')))
    r=requests.get(f'{TRPC}/{proc}?input={encoded}',headers=HEADERS,timeout=30)
    try:data=r.json()
    except Exception:data={'raw':r.text}
    return {'procedure':proc,'input':payload,'status':r.status_code,'data':data}

def main():
    calls=[]
    tests=[
        ('liveResults.getThrowLongResultsFeed','ATHMDECATH------------DT----------'),
        ('liveResults.getHeightResultsFeed','ATHMDECATH------------PV----------'),
    ]
    for proc,event in tests:
        variants=[
            {'competitionCode':COMPETITION,'event':event},
            {'competitionCode':COMPETITION,'event':event.lower()},
            {'competitionCode':COMPETITION,'event':event,'isSummary':True},
            {'competitionCode':COMPETITION,'event':event.lower(),'isSummary':True},
        ]
        for payload in variants:
            calls.append(query(proc,payload))
    with open('ea-attempt-probe.json','w',encoding='utf-8') as f:
        json.dump({'calls':calls},f,ensure_ascii=False,indent=2)
    summary=[]
    for c in calls:
        raw=c.get('data')
        text=json.dumps(raw,ensure_ascii=False)
        summary.append({'procedure':c['procedure'],'input':c['input'],'status':c['status'],'sample':text[:5000]})
    print(json.dumps(summary,ensure_ascii=False,indent=2)[:120000])

if __name__=='__main__':main()
