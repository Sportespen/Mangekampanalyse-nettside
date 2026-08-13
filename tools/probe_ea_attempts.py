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
    for event in ['ATHMDECATH------------DT----------','ATHMDECATH------------PV----------']:
        calls.append(query('liveResults.getEventResultsHeaderFeed',{'competitionCode':COMPETITION,'event':event.lower()}))
        calls.append(query('liveResults.getEventResultsHeaderFeed',{'competitionCode':COMPETITION,'event':event}))
    with open('ea-attempt-probe.json','w',encoding='utf-8') as f:
        json.dump({'calls':calls},f,ensure_ascii=False,indent=2)
    print(json.dumps(calls,ensure_ascii=False,indent=2)[:120000])

if __name__=='__main__':main()
