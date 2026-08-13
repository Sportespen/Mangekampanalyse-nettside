import json
import re
from urllib.parse import urljoin
import requests

PAGES=[
 'https://live.european-athletics.com/birmingham-test-2026',
 'https://live.european-athletics.com/apeldoorn-2025/timetable/athwhighjump/results?phaseId=ATHWHIGHJUMP----------FNL---------&status=Results&unitId=ATHWHIGHJUMP----------FNL-000100--'
]
HEADERS={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36'}

def get(url):
    r=requests.get(url,headers=HEADERS,timeout=30)
    return r.status_code,r.text

def main():
    report={'pages':[],'scripts':[],'procedures':[],'contexts':[]}
    scripts=[]
    for page in PAGES:
        st,html=get(page);report['pages'].append({'url':page,'status':st,'size':len(html)})
        for src in re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',html,re.I):
            u=urljoin(page,src)
            if u not in scripts:scripts.append(u)
    proc=set();contexts=[]
    for u in scripts:
        try:
            st,text=get(u);report['scripts'].append({'url':u,'status':st,'size':len(text)})
            for m in re.findall(r'liveResults\.[A-Za-z0-9_]+',text):proc.add(m)
            low=text.lower()
            for needle in ['attempts','attempt','trial','progression','fieldresult','unitid','resultdetails']:
                pos=0
                while True:
                    i=low.find(needle,pos)
                    if i<0:break
                    snip=re.sub(r'\s+',' ',text[max(0,i-650):i+900])
                    if 'liveResults' in snip or 'query' in snip or 'result' in snip:
                        if snip not in contexts:contexts.append(snip[:1700])
                    pos=i+len(needle)
                    if len(contexts)>=180:break
                if len(contexts)>=180:break
        except Exception as exc:report['scripts'].append({'url':u,'error':str(exc)})
    report['procedures']=sorted(proc);report['contexts']=contexts[:180]
    with open('ea-attempt-probe.json','w',encoding='utf-8') as f:json.dump(report,f,ensure_ascii=False,indent=2)
    print(json.dumps({'pages':report['pages'],'procedures':sorted(proc),'contexts':contexts[:35]},ensure_ascii=False,indent=2)[:120000])

if __name__=='__main__':main()
