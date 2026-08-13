import json
import re
from urllib.parse import urljoin
import requests

PAGES=[
 'https://live.european-athletics.com/birmingham-2026/timetable/athmdecath------------dt----------/results',
 'https://live.european-athletics.com/birmingham-2026/timetable/athmdecath------------pv----------/results',
]
HEADERS={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36','X-Client-Platform':'Desktop'}

def get(url):
    r=requests.get(url,headers=HEADERS,timeout=30)
    return r.status_code,r.text

def main():
    report={'pages':[],'scripts':[],'procedures':[],'contexts':[],'pageContexts':[]}
    scripts=[]
    needles=['Att1','Att2','Att3','attempts','attempt','trial','progression','fieldresult','unitid','resultdetails','Huber','43.39','43,39']
    for page in PAGES:
        st,html=get(page);report['pages'].append({'url':page,'status':st,'size':len(html)})
        low=html.lower()
        for needle in needles:
            i=low.find(needle.lower())
            if i>=0: report['pageContexts'].append({'page':page,'needle':needle,'context':re.sub(r'\s+',' ',html[max(0,i-800):i+1600])})
        for src in re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',html,re.I):
            u=urljoin(page,src)
            if u not in scripts:scripts.append(u)
    proc=set();contexts=[]
    for u in scripts:
        try:
            st,text=get(u);report['scripts'].append({'url':u,'status':st,'size':len(text)})
            for m in re.findall(r'(?:liveResults|directusHub)\.[A-Za-z0-9_]+',text):proc.add(m)
            low=text.lower()
            for needle in needles:
                pos=0
                while True:
                    i=low.find(needle.lower(),pos)
                    if i<0:break
                    snip=re.sub(r'\s+',' ',text[max(0,i-1000):i+2200])
                    if any(k in snip for k in ['liveResults','competitionCode','unitId','attempt','result']):
                        if snip not in contexts:contexts.append(snip[:3200])
                    pos=i+len(needle)
                    if len(contexts)>=300:break
                if len(contexts)>=300:break
        except Exception as exc:report['scripts'].append({'url':u,'error':str(exc)})
    report['procedures']=sorted(proc);report['contexts']=contexts[:300]
    with open('ea-attempt-probe.json','w',encoding='utf-8') as f:json.dump(report,f,ensure_ascii=False,indent=2)
    print(json.dumps({'pages':report['pages'],'procedures':sorted(proc),'pageContexts':report['pageContexts'][:30],'contexts':contexts[:80]},ensure_ascii=False,indent=2)[:150000])

if __name__=='__main__':main()
