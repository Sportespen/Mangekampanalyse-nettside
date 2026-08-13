import json
from probe_ea_live import query

CANDIDATES = [
    'liveResults.getFieldEventResultsFeed',
    'liveResults.getEventResultsFeed',
    'liveResults.getFieldResultsFeed',
    'liveResults.getEventResultFeed',
    'liveResults.getResultsFeed',
    'liveResults.getFieldEventFeed',
]

PAYLOADS = [
    {'event':'ATHMDECATH------------LJ----------','competitionCode':'ECH26'},
    {'event':'ATHMDECATH------------LJ----------','competitionCode':'ECH26','isSummary':False},
    {'event':'ATHMDECATH------------LJ----------','competitionCode':'ECH26','unit':'A'},
]

def main():
    calls=[]
    for proc in CANDIDATES:
        for payload in PAYLOADS:
            try:
                calls.append(query(proc,payload))
            except Exception as exc:
                calls.append({'procedure':proc,'input':payload,'status':'exception','error':str(exc)})
    with open('ea-attempt-probe.json','w',encoding='utf-8') as f:
        json.dump({'calls':calls},f,ensure_ascii=False,indent=2)
    summary=[{'procedure':c.get('procedure'),'input':c.get('input'),'status':c.get('status')} for c in calls]
    print(json.dumps(summary,ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
