const RAW=window.MANGEKAMP_DATA;
const $=s=>document.querySelector(s);
const fmt=(v,d=0)=>v==null?'—':Number(v).toFixed(d);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function normalizeSection(section,type){
  const events=section.events||[];
  const source=section.athletes||section.birmingham||[];
  const athletes=source.map(x=>({
    ...x,
    combinedPB:x.combinedPB??x.pb??0,
    theoreticalPB:x.theoreticalPB??x.theoretical??0,
    best:x.best??events.map(e=>x.bests?.[e]?.mark??null),
    recent:x.recent??events.map(e=>(x.expected?.[e]?.recent||[]).map(r=>r.mark).filter(v=>v!=null)),
    potential:x.potential??((x.theoretical??0)-(x.pb??0)),
    utilization:x.utilization??0
  }));
  return {...section,athletes,testAthletes:section.testAthletes||athletes.slice(0,8)};
}

const ROOT={
  men:normalizeSection(RAW.men,'men'),
  women:normalizeSection(RAW.women,'women')
};
let currentType='men';
let D=ROOT[currentType];

function showTab(id){document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active-panel'));document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));$('#'+id).classList.add('active-panel');document.querySelector(`[data-tab="${id}"]`)?.classList.add('active');}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
function setType(type){currentType=type;D=ROOT[type];document.querySelectorAll('.event-switch-btn').forEach(b=>b.classList.toggle('active',b.dataset.type===type));$('#eventTitle').textContent=D.label;$('#pbHead').textContent=type==='men'?'Tikamp-PB':'Sjukamp-PB';$('#athleteCount').textContent=D.athletes.length+' utøvere';$('#forecastReady').textContent='Klar for EM Birmingham – '+D.label.toLowerCase();$('#testTitle').textContent='TEST – Götzis 2026 Replay – '+D.label;renderAnalyse();fillEvents();renderRanking();fillSteps();renderTest();}
document.querySelectorAll('.event-switch-btn').forEach(b=>b.onclick=()=>setType(b.dataset.type));
function renderAnalyse(){let a=[...D.athletes].sort((x,y)=>y.combinedPB-x.combinedPB);let top=a[0]?.combinedPB||0;$('#analyseBody').innerHTML=a.map(x=>`<tr data-name="${esc(x.name)}"><td>${esc(x.qp)}</td><td>${esc(x.wr)}</td><td>${esc(x.nation)}</td><td class="name">${esc(x.name)}</td><td>${esc(x.birth)}</td><td>${x.combinedPB}</td><td>${x.theoreticalPB}</td><td>${fmt(x.utilization,1)} %</td><td>${x.potential}</td><td>${x.combinedPB-top}</td></tr>`).join('');let avg=a.length?Math.round(a.reduce((s,x)=>s+x.combinedPB,0)/a.length):0,u=a.length?a.reduce((s,x)=>s+x.utilization,0)/a.length:0,p=[...a].sort((x,y)=>y.potential-x.potential)[0];$('#stats').innerHTML=a.length?`<div class="stat">◉ Utøvere: <b>${a.length}</b></div><div class="stat">☆ Snitt ${currentType==='men'?'tikamp':'sjukamp'}-PB: <b>${avg}</b></div><div class="stat">◷ Snitt utnyttelse: <b>${fmt(u,1)} %</b></div><div class="stat">♛ Størst uutnyttet potensial: <b>${p.potential} (${esc(p.name)})</b></div>`:'';document.querySelectorAll('#analyseBody tr').forEach(r=>r.onclick=()=>openAthlete(r.dataset.name));}
function openAthlete(name){let x=D.athletes.find(a=>a.name===name);if(!x)return;$('#modalContent').innerHTML=`<h2>${esc(x.name)}</h2><p>${esc(x.nation)} • født ${esc(x.birth)}</p><div class="detail-grid"><div><small>${currentType==='men'?'Tikamp':'Sjukamp'}-PB</small><b>${x.combinedPB}</b></div><div><small>Teoretisk PB</small><b>${x.theoreticalPB}</b></div><div><small>Utnyttelse</small><b>${fmt(x.utilization,1)} %</b></div></div>`;$('#modal').classList.add('open')}
$('#modalClose').onclick=()=>$('#modal').classList.remove('open');$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.remove('open')};
function fillEvents(){let s=$('#eventSelect');s.innerHTML=D.events.map((e,i)=>`<option value="${i}">${esc(e)}</option>`).join('');s.onchange=renderRanking;}
function scoreEvent(i,v){if(v==null||isNaN(v))return 0;let e=D.events[i],A,B,C;if(currentType==='men'){let map={"100m":[25.4347,18,1.81],"Lengde":[0.14354,220,1.4],"Kule":[51.39,1.5,1.05],"Høyde":[0.8465,75,1.42],"400m":[1.53775,82,1.81],"110mh":[5.74352,28.5,1.92],"Diskos":[12.91,4,1.1],"Stav":[0.2797,100,1.35],"Spyd":[10.14,7,1.08],"1500m":[0.03768,480,1.85]};[A,B,C]=map[e];if(['100m','400m','110mh','1500m'].includes(e))return Math.floor(A*Math.pow(B-v,C));if(e==='Lengde'||e==='Høyde'||e==='Stav')v*=100;return Math.floor(A*Math.pow(v-B,C));}let map={"100mh":[9.23076,26.7,1.835],"Høyde":[1.84523,75,1.348],"Kule":[56.0211,1.5,1.05],"200m":[4.99087,42.5,1.81],"Lengde":[0.188807,210,1.41],"Spyd":[15.9803,3.8,1.04],"800m":[0.11193,254,1.88]};[A,B,C]=map[e];if(['100mh','200m','800m'].includes(e))return Math.floor(A*Math.pow(B-v,C));if(e==='Lengde'||e==='Høyde')v*=100;return Math.floor(A*Math.pow(v-B,C));}
function renderRanking(){let i=+$('#eventSelect').value||0,e=D.events[i];let arr=D.athletes.map(x=>({x,v:x.best?.[i]})).filter(o=>o.v!=null);let lower=['100m','400m','110mh','1500m','100mh','200m','800m'].includes(e);arr.sort((a,b)=>lower?a.v-b.v:b.v-a.v);$('#rankingCards').innerHTML=arr.map((o,k)=>`<tr><td>${k+1}</td><td>${esc(o.x.nation)}</td><td>${esc(o.x.name)}</td><td>${displayMark(e,o.v)}</td><td>${scoreEvent(i,o.v)}</td></tr>`).join('');}
function displayMark(e,v){if(v==null)return '—';if(e==='1500m'||e==='800m'){let m=Math.floor(v/60),s=(v-m*60).toFixed(2).padStart(5,'0');return `${m}:${s}`.replace('.',',')}return Number(v).toFixed(2).replace('.',',')}
function fillSteps(){let s=$('#stepSelect');s.innerHTML=['0 – Før start',...D.events.map((e,i)=>`${i+1} – ${e}`)].map((x,i)=>`<option value="${i}">${x}</option>`).join('');s.onchange=renderTest;}
function predict(x,i){let vals=x.recent?.[i]||[];if(vals.length<3)return x.best?.[i]??null;let a=[...vals];let lower=['100m','400m','110mh','1500m','100mh','200m','800m'].includes(D.events[i]);a.sort((p,q)=>lower?p-q:q-p);let best3=a.slice(0,3);return best3.reduce((s,v)=>s+v,0)/best3.length;}
function renderTest(){let step=+$('#stepSelect').value||0;$('#testBanner').textContent=`TESTMODUS Götzis 2026 · ${step?'replay oppdatert etter '+D.events[step-1]:'før start'} · ${D.testAthletes.length} utøvere`;let rows=D.testAthletes.map(x=>{let vals=D.events.map((e,i)=>i<step?(x.actual?.[i]??predict(x,i)):predict(x,i));let actualPts=vals.slice(0,step).reduce((s,v,i)=>s+scoreEvent(i,v),0);let total=vals.reduce((s,v,i)=>s+scoreEvent(i,v),0);return{x,vals,actualPts,total}}).sort((a,b)=>step?b.actualPts-a.actualPts:b.total-a.total);let forecastRank=[...rows].sort((a,b)=>b.total-a.total);let rankMap=new Map(forecastRank.map((r,i)=>[r.x.name,i+1]));$('#forecastHead').innerHTML='<tr><th>Plass nå</th><th>Nasjon</th><th>Utøver</th>'+D.events.map(e=>`<th>${e}</th>`).join('')+'<th>POENG NÅ</th><th>Forventet sluttpoeng</th><th>Forventet sluttplass</th><th>Endring</th></tr>';$('#forecastBody').innerHTML=rows.map((r,idx)=>{let fr=rankMap.get(r.x.name),change=step?(idx+1)-fr:0;return `<tr><td>${step?idx+1:''}</td><td>${r.x.nation}</td><td class="name">${esc(r.x.name)}</td>${r.vals.map((v,i)=>`<td class="${i<step?'actual':'pred'}">${displayMark(D.events[i],v)}</td>`).join('')}<td class="points">${step?r.actualPts:''}</td><td>${step?r.total:''}</td><td>${step?fr:''}</td><td class="${change>0?'up':change<0?'down':''}">${step?(change>0?'▲ '+change:change<0?'▼ '+Math.abs(change):'–'):''}</td></tr>`}).join('');}
$('#showTest').onclick=()=>showTab('test');setType('men');