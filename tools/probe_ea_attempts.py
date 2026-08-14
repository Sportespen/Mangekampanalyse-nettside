import json
import re
from urllib.parse import quote, urljoin
import requests
from bs4 import BeautifulSoup

TRPC='https://proxy.european-athletics.com/trpc'
SITE='https://live.european-athletics.com/birmingham-test-2026'
HEADERS={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36','X-Client-Platform':'Desktop'}
COMPETITION='ECH26'
EVENTS=['ATHMDECATH------------DT----------','ATHMDECATH------------PV----------','ATHMDECATH------------LJ----------']

def query(proc,payload):
    encoded=quote(json.dumps({'json':payload},separators=(',',':')))
    r=requests.get(f'{TRPC}/{proc}?input={encoded}',headers=HEADERS,timeout=30)
    try:data=r.json()
    except Exception:data={'raw':r.text[:2000]}
    return {'procedure':proc,'input':payload,'status':r.status_code,'data':data}

def discover_procedures():
    r=requests.get(SITE,headers=HEADERS,timeout=30)
    soup=BeautifulSoup(r.text,'html.parser')
    scripts=[]
    procedures=set()
    interesting=[]
    for tag in soup.find_all('script',src=True):
        url=urljoin(SITE,tag['src'])
        if url in scripts: continue
        scripts.append(url)
        try:text=requests.get(url,headers=HEADERS,timeout=30).text
        except Exception:continue
        for proc in re.findall(r'liveResults\.[A-Za-z0-9_]+',text): procedures.add(proc)
        low=text.lower()
        if any(k in low for k in ['attempt','trial','progression','fieldresult','resultdetail']):
            snippets=[]
            for m in re.finditer(r'(?i)(attempt|trial|progression|fieldResult|resultDetail)',text):
                a=max(0,m.start()-180);b=min(len(text),m.end()+280)
                snippets.append(text[a:b])
                if len(snippets)>=8:break
            interesting.append({'url':url,'snippets':snippets})
    return {'page_status':r.status_code,'script_count':len(scripts),'procedures':sorted(procedures),'interesting_scripts':interesting}

def compact(obj,depth=0):
    if depth>5:return type(obj).__name__
    if isinstance(obj,dict):
        out={}
        for k,v in obj.items():
            kl=str(k).lower()
            if any(x in kl for x in ['attempt','trial','series','progress','result','unit','athlete','bib','rank','mark','performance']): out[k]=compact(v,depth+1)
            elif depth<2: out[k]=compact(v,depth+1)
        return out
    if isinstance(obj,list):return [compact(x,depth+1) for x in obj[:8]]
    if isinstance(obj,(str,int,float,bool)) or obj is None:return obj
    return str(obj)

def main():
    discovery=discover_procedures()
    calls=[]
    candidates=set(discovery['procedures'])
    candidates.update([
        'liveResults.getCombinedEventResultsFeed',
        'liveResults.getEventResultsFeed',
        'liveResults.getEventResultsHeaderFeed',
        'liveResults.getFieldEventResultsFeed',
        'liveResults.getFieldResultsFeed',
        'liveResults.getResultDetailsFeed',
        'liveResults.getEventResultDetailsFeed',
        'liveResults.getFieldEventResultDetailsFeed'
    ])
    for event in EVENTS:
        payloads=[
            {'competitionCode':COMPETITION,'event':event,'isSummary':False},
            {'competitionCode':COMPETITION,'event':event},
            {'competitionCode':COMPETITION,'eventCode':event},
        ]
        for proc in sorted(candidates):
            if not any(k in proc.lower() for k in ['result','field','attempt','trial']):continue
            for payload in payloads:
                res=query(proc,payload)
                if res['status']!=404:
                    res['compact']=compact(res['data'])
                    calls.append(res)
    report={'discovery':discovery,'calls':calls}
    with open('ea-attempt-probe.json','w',encoding='utf-8') as f:json.dump(report,f,ensure_ascii=False,indent=2)
    print(json.dumps({'procedures':discovery['procedures'],'interesting_scripts':discovery['interesting_scripts'][:4],'non404_calls':calls},ensure_ascii=False,indent=2)[:120000])

if __name__=='__main__':main()
