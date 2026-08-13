import json
import re
from urllib.parse import urljoin
import requests

BASE='https://live.european-athletics.com/birmingham-test-2026'
HEADERS={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36'}


def get(url):
    r=requests.get(url,headers=HEADERS,timeout=30)
    return r.status_code,r.text


def main():
    report={'page':BASE,'scripts':[],'procedures':[],'attempt_contexts':[]}
    status,html=get(BASE)
    report['page_status']=status
    scripts=[]
    for src in re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',html,re.I):
        u=urljoin(BASE,src)
        if u not in scripts:scripts.append(u)
    proc=set(); contexts=[]
    for u in scripts:
        try:
            st,text=get(u)
            report['scripts'].append({'url':u,'status':st,'size':len(text)})
            for m in re.findall(r'liveResults\.[A-Za-z0-9_]+',text):proc.add(m)
            low=text.lower()
            for needle in ['attempt','trial','progression','combinedevent','fieldresult']:
                pos=0
                while True:
                    i=low.find(needle,pos)
                    if i<0:break
                    snippet=re.sub(r'\s+',' ',text[max(0,i-450):i+650])
                    if snippet not in contexts:contexts.append(snippet[:1200])
                    pos=i+len(needle)
                    if len(contexts)>=120:break
                if len(contexts)>=120:break
        except Exception as exc:
            report['scripts'].append({'url':u,'error':str(exc)})
    report['procedures']=sorted(proc)
    report['attempt_contexts']=contexts[:120]
    with open('ea-attempt-probe.json','w',encoding='utf-8') as f:json.dump(report,f,ensure_ascii=False,indent=2)
    print(json.dumps({'page_status':status,'scripts':len(scripts),'procedures':sorted(proc),'contexts':contexts[:20]},ensure_ascii=False,indent=2)[:120000])

if __name__=='__main__':main()
