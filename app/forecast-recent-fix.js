(function(){
  function normalizeEntry(raw){
    if(raw==null)return null;
    if(Array.isArray(raw)){const mark=Number(raw[0]);if(!Number.isFinite(mark))return null;return{mark,venue:String(raw[2]||''),year:String(raw[3]||'')};}
    const mark=Number(raw.mark??raw.value??raw.result??raw.result_mark);if(!Number.isFinite(mark))return null;
    return{mark,venue:String(raw.venue??raw.place??raw.location??''),year:String(raw.year??'')};
  }
  function normName(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,' ').trim().toLowerCase();}
  function historyForAthlete(name){
    const history=window.MANGEKAMP_HISTORY||{};
    if(history[name])return history[name];
    const target=normName(name);
    for(const [key,value] of Object.entries(history)){if(normName(key)===target)return value;}
    const tt=target.split(' ').filter(Boolean);
    for(const [key,value] of Object.entries(history)){
      const kk=normName(key),kt=kk.split(' ').filter(Boolean);
      if(kk.includes(target)||target.includes(kk))return value;
      if(tt.length>=2&&kt.length>=2&&tt[0]===kt[0]&&tt.some(t=>t.length>=4&&kt.includes(t)))return value;
    }
    return null;
  }
  function recentForecastValues(athlete,eventIndex){
    const eventName=D.events[eventIndex];
    const source=historyForAthlete(athlete?.name)?.[eventName]||[];
    const seen=new Set(),vals=[];
    for(const raw of (Array.isArray(source)?source:[])){
      const r=normalizeEntry(raw);if(!r)continue;
      if(r.year!=='2026'&&r.year!=='2025')continue;
      const key=[r.mark,r.venue,r.year].join('|');
      if(seen.has(key))continue;
      seen.add(key);vals.push(r.mark);if(vals.length===4)break;
    }
    return vals;
  }
  predictionInputs=function(athlete,eventIndex){
    const vals=recentForecastValues(athlete,eventIndex);if(!vals.length)return[];
    if(vals.length<4)return vals;
    const lower=['100m','400m','110mh','1500m','100mh','200m','800m'].includes(D.events[eventIndex]);
    return [...vals].sort((a,b)=>lower?a-b:b-a).slice(0,3);
  };
  predict=function(athlete,eventIndex){const used=predictionInputs(athlete,eventIndex);return used.length?used.reduce((s,v)=>s+v,0)/used.length:null;};
  window.mangekampRecentForecastValues=recentForecastValues;
})();

/* Stabilitet for utøversammenligning: sikkert kjønnssøk + gjenoppretting etter fanebytte/PWA-reload. */
(function(){
  const nativeFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    try{
      const raw=typeof input==='string'?input:(input&&input.url)||'';
      const u=new URL(raw,location.href);
      if(u.pathname==='/api/athlete-search'){
        u.pathname='/api/athlete-search-safe';
        input=typeof input==='string'?u.toString():new Request(u.toString(),input);
      }
    }catch(_e){}
    return nativeFetch(input,init);
  };

  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,' ').trim().toLowerCase();
  const key=type=>`mangekamp_compare_v2_${type}`;
  let restoring=false;
  function typeNow(){return typeof currentType==='string'?currentType:'men';}
  function read(type=typeNow()){try{return JSON.parse(localStorage.getItem(key(type))||'null');}catch(_e){return null;}}
  function write(data,type=typeNow()){try{localStorage.setItem(key(type),JSON.stringify(data));}catch(_e){}}
  function clear(type=typeNow()){try{localStorage.removeItem(key(type));}catch(_e){}}
  function selectedName(){return document.querySelector('#athleteCompareOutput h3')?.textContent?.trim()||'';}
  function capture(){
    const name=selectedName();if(!name)return;
    const old=read()||{};
    write({...old,name,updatedAt:Date.now()});
  }
  function captureScenario(){
    const inputs=[...document.querySelectorAll('[data-whatif]')];if(!inputs.length)return;
    const old=read()||{};
    write({...old,name:old.name||selectedName(),scenario:inputs.map(x=>x.value||''),updatedAt:Date.now()});
  }
  function chooseStored(){
    const saved=read();if(!saved?.name)return;
    const results=document.querySelector('#athleteCompareResults');
    if(!results||results.style.display==='none')return;
    const button=[...results.querySelectorAll('button[data-name]')].find(b=>norm(b.dataset.name)===norm(saved.name));
    if(button){restoring=true;button.click();setTimeout(()=>{restoring=false;restoreScenario();},600);}
  }
  function restoreScenario(){
    const saved=read();if(!saved?.scenario?.some(Boolean)||!document.querySelector('#whatIfBtn'))return;
    document.querySelector('#whatIfBtn').click();
    setTimeout(()=>{
      const fields=[...document.querySelectorAll('[data-whatif]')];
      if(!fields.length)return;
      fields.forEach((f,i)=>{f.value=saved.scenario[i]||'';f.dispatchEvent(new Event('input',{bubbles:true}));});
      document.querySelector('#whatIfApply')?.click();
    },120);
  }
  function restore(){
    const saved=read();if(!saved?.name)return;
    const input=document.querySelector('#athleteCompareSearch'),btn=document.querySelector('#athleteCompareBtn'),out=document.querySelector('#athleteCompareOutput');
    if(!input||!btn||!out)return;
    if(selectedName()&&norm(selectedName())===norm(saved.name))return;
    if(restoring)return;
    input.value=saved.name;
    restoring=true;
    btn.click();
    setTimeout(()=>{restoring=false;chooseStored();},350);
  }
  function resetForType(){
    document.querySelector('#athleteCompareResults')?.style.setProperty('display','none');
    const status=document.querySelector('#athleteCompareStatus');if(status)status.textContent='';
    const out=document.querySelector('#athleteCompareOutput');if(out)out.innerHTML='';
    const input=document.querySelector('#athleteCompareSearch');if(input)input.value='';
    setTimeout(restore,80);
  }
  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('#removeCompareBtn')){clear();return;}
    if(ev.target.closest?.('#whatIfApply'))setTimeout(captureScenario,0);
    if(ev.target.closest?.('#scenarioReset')){const s=read();if(s){delete s.scenario;write(s);}}
    if(ev.target.closest?.('.event-switch-btn'))setTimeout(resetForType,0);
  },true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)capture();else setTimeout(restore,120);});
  window.addEventListener('pagehide',capture);
  window.addEventListener('pageshow',()=>setTimeout(restore,180));
  const mo=new MutationObserver(()=>{
    capture();
    chooseStored();
    const saved=read();
    if(saved?.name&&!selectedName()&&document.querySelector('#athleteCompareBox'))setTimeout(restore,100);
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mo.observe(document.body,{subtree:true,childList:true});setTimeout(restore,250);},{once:true});
  else{mo.observe(document.body,{subtree:true,childList:true});setTimeout(restore,250);}
})();
