(function(){
  const pbCache=new Map();
  function isForecast(){return document.querySelector('.tab.active')?.dataset?.tab==='forecast';}
  function cleanText(cell){
    if(!cell)return '—';
    return [...cell.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').trim()||cell.textContent.trim()||'—';
  }
  function fmtPB(ev,v){
    const n=Number(v);if(!Number.isFinite(n))return '—';
    if(ev==='1500m'||ev==='800m'){const m=Math.floor(n/60),s=(n-m*60).toFixed(2).padStart(5,'0');return `${m}:${s}`.replace('.',',');}
    return n.toFixed(2).replace('.',',');
  }
  async function getPBData(name){
    const type=window.currentType||'men',key=`${type}|${name}`;
    if(pbCache.has(key))return pbCache.get(key);
    const promise=(async()=>{
      try{
        const sr=await fetch(`/api/athlete-search-v2?action=search&type=${encodeURIComponent(type)}&q=${encodeURIComponent(name)}`,{cache:'no-store'});
        const sd=await sr.json();if(!sr.ok)throw new Error(sd.error||'search');
        const list=Array.isArray(sd.athletes)?sd.athletes:[];
        const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9æøå]+/g,' ').trim();
        const hit=list.find(x=>norm(x.name)===norm(name))||list[0];
        if(!hit?.id)return null;
        const ar=await fetch(`/api/athlete-search-v2?action=analyse&type=${encodeURIComponent(type)}&id=${encodeURIComponent(hit.id)}&name=${encodeURIComponent(hit.name||name)}`,{cache:'no-store'});
        const ad=await ar.json();if(!ar.ok)throw new Error(ad.error||'analyse');
        return ad;
      }catch(_){return null;}
    })();
    pbCache.set(key,promise);return promise;
  }
  async function decoratePB(compact,name,eventCells,totalTd){
    const data=await getPBData(name);if(!data||!compact.isConnected)return;
    const events=window.D?.events||[];
    eventCells.forEach((td,i)=>{
      const ev=events[i],pb=data.pbs?.[ev],mark=pb?.mark;
      let small=td.querySelector('.compare-pb');
      if(!small){small=document.createElement('div');small.className='compare-pb';small.style.cssText='margin-top:2px;color:#9fb2c6;font-size:10px;font-weight:700;line-height:1.05;white-space:nowrap';td.appendChild(small);}
      small.textContent=`PB ${fmtPB(ev,mark)}`;
    });
    if(totalTd){
      let small=totalTd.querySelector('.compare-pb-total');
      if(!small){small=document.createElement('div');small.className='compare-pb-total';small.style.cssText='margin-top:2px;color:#9fb2c6;font-size:10px;font-weight:700;line-height:1.05';totalTd.appendChild(small);}
      small.textContent=`PB ${Number(data.combinedPB)||'—'}`;
    }
  }
  function tighten(){
    const box=document.querySelector('#athleteCompareBox');if(!box)return;
    box.style.padding='13px 14px';box.style.marginTop='16px';
    const title=box.querySelector('h3');if(title)title.style.marginBottom='3px';
    const search=box.querySelector('#athleteCompareSearch')?.parentElement?.parentElement;if(search)search.style.marginTop='10px';
    const out=box.querySelector('#athleteCompareOutput');if(out)out.style.marginTop='10px';
  }
  function enhance(){
    tighten();
    if(!isForecast())return false;
    const out=document.querySelector('#athleteCompareOutput');
    const table=out?.querySelector('table');
    if(!table)return false;
    if(table.dataset.compactCompareRow==='1')return true;
    const heads=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());
    const exerciseIndex=heads.indexOf('Øvelse');
    const resultIndex=heads.indexOf('Forventet resultat');
    const basisIndex=heads.indexOf('Resultater i grunnlaget');
    if(exerciseIndex<0||resultIndex<0||basisIndex<0)return false;

    const sourceRows=[...table.querySelectorAll('tbody tr')];
    if(!sourceRows.length)return false;
    const h3=out.querySelector('h3');
    const meta=h3?.nextElementSibling;
    const name=h3?.textContent?.trim()||'Utøver';
    const nation=(meta?.textContent||'').split('•')[0].trim()||'—';
    const totalBox=[...out.querySelectorAll('div')].find(d=>d.querySelector(':scope > small')?.textContent.trim()==='Forventet sluttpoeng');
    const total=totalBox?.querySelector(':scope > b')?.textContent?.trim()||'—';
    const whatIf=out.querySelector('#whatIfBtn');
    const remove=out.querySelector('#removeCompareBtn');
    const scenarioReset=out.querySelector('#scenarioReset');
    const scenarioNote=scenarioReset?.parentElement||null;
    let scenarioTotal='',scenarioDiff='';
    if(scenarioNote){
      const txt=scenarioNote.textContent||'';
      const totalMatch=txt.match(/Hva hvis-scenario:\s*(\d+)\s*poeng/i);
      const diffMatch=txt.match(/\(([+-]?\d+)\)/);
      scenarioTotal=totalMatch?.[1]||'';
      scenarioDiff=diffMatch?.[1]||'';
    }

    const eventHeads=[];
    const eventCells=[];
    sourceRows.forEach((tr,i)=>{
      const cells=[...tr.children];
      const ev=cells[exerciseIndex]?.textContent.trim()||((window.D?.events||[])[i]||'');
      const resultCell=cells[resultIndex];
      const basisCell=cells[basisIndex];
      const mark=cleanText(resultCell);
      const basisBtn=basisCell?.querySelector('[data-basis]');
      const count=basisBtn?.textContent.trim()||'';
      eventHeads.push(`<th style="padding:7px 6px;font-size:12px;white-space:nowrap">${ev}</th>`);
      const td=document.createElement('td');
      td.style.cssText='text-align:center;font-weight:900;white-space:nowrap;padding:7px 6px;font-size:13px;line-height:1.05';
      const markBtn=document.createElement(basisBtn?'button':'span');
      markBtn.textContent=mark;
      markBtn.style.cssText=`border:0;background:transparent;padding:0;font:inherit;font-weight:900;color:${getComputedStyle(resultCell||document.body).color};${basisBtn?'cursor:pointer;':''}`;
      if(basisBtn){
        markBtn.title=`Vis ${count} resultat${count==='1'?'':'er'} i grunnlaget`;
        markBtn.onclick=()=>basisBtn.click();
      }
      td.appendChild(markBtn);
      eventCells.push(td);
    });

    const wrap=document.createElement('div');wrap.className='table-wrap';wrap.style.marginTop='0';
    const compact=document.createElement('table');compact.className='forecast-table';compact.dataset.compactCompareRow='1';compact.style.fontSize='13px';
    compact.innerHTML=`<thead><tr><th style="padding:7px 8px">Nasjon</th><th style="padding:7px 8px">Utøver</th>${eventHeads.join('')}<th style="padding:7px 8px;white-space:nowrap">Forventet sluttpoeng</th><th style="padding:7px 8px">Handling</th></tr></thead><tbody><tr style="background:#153b61"><td style="padding:8px">${nation}</td><td class="name" style="font-weight:900;white-space:nowrap;padding:8px">${name}</td></tr></tbody>`;
    const row=compact.querySelector('tbody tr');
    eventCells.forEach(td=>row.appendChild(td));
    const totalTd=document.createElement('td');totalTd.style.cssText='font-weight:900;font-size:18px;text-align:center;white-space:nowrap;padding:7px 8px;line-height:1.05';const totalMain=document.createElement('div');totalMain.textContent=total;totalTd.appendChild(totalMain);row.appendChild(totalTd);
    const actionTd=document.createElement('td');actionTd.style.cssText='white-space:nowrap;display:flex;gap:7px;justify-content:center;align-items:center;padding:7px 8px';
    if(whatIf){whatIf.style.cssText+=';white-space:nowrap;padding:9px 13px';actionTd.appendChild(whatIf);}
    if(remove){remove.style.cssText+=';white-space:nowrap;padding:9px 12px';actionTd.appendChild(remove);}
    row.appendChild(actionTd);
    wrap.appendChild(compact);

    out.innerHTML='';
    if(scenarioTotal){
      const scenarioWrap=document.createElement('div');
      scenarioWrap.style.cssText='display:flex;justify-content:flex-end;margin:0 0 8px';
      const scenarioBox=document.createElement('div');
      scenarioBox.id='scenarioSummaryBox';
      scenarioBox.style.cssText='display:flex;align-items:center;gap:10px;padding:7px 9px;border:1px solid #6f4cff;border-radius:8px;background:#151c3b;min-width:235px;max-width:310px;justify-content:space-between';
      scenarioBox.innerHTML=`<div><small style="display:block;color:#b8aaff;font-weight:700;font-size:10px">Hva hvis-scenario</small><b style="display:block;font-size:19px;line-height:1.05">${scenarioTotal} poeng</b></div><div style="text-align:center"><small style="display:block;color:#9fb2c6;font-size:10px">Endring</small><b style="font-size:16px;color:#b8aaff">${scenarioDiff||'—'}</b></div>`;
      const reset=document.createElement('button');
      reset.type='button';reset.textContent='Nullstill';
      reset.style.cssText='padding:6px 8px;border:1px solid #456783;border-radius:6px;background:#0d2743;color:#fff;font-size:11px;font-weight:800;cursor:pointer';
      reset.onclick=()=>scenarioReset?.click();
      scenarioBox.appendChild(reset);scenarioWrap.appendChild(scenarioBox);out.appendChild(scenarioWrap);
    }
    out.appendChild(wrap);
    const hint=document.createElement('p');
    hint.style.cssText='margin:6px 0 0;color:#7f98af;font-size:11px';
    hint.textContent='Trykk på et forventet resultat for å se hvilke WA-resultater prognosen bygger på.';
    out.appendChild(hint);
    decoratePB(compact,name,eventCells,totalTd);
    return true;
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;enhance();});
  }

  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('.tab,#athleteCompareResults button,#athleteCompareBtn')){
      setTimeout(schedule,0);
      setTimeout(schedule,150);
      setTimeout(schedule,600);
      setTimeout(schedule,1500);
    }
  },true);
  document.addEventListener('change',ev=>{if(ev.target?.id==='eventSelect')setTimeout(schedule,0);},true);

  const root=document.documentElement;
  const observer=new MutationObserver(mutations=>{
    tighten();
    if(!isForecast())return;
    if(mutations.some(m=>m.target?.id==='athleteCompareOutput'||m.target?.closest?.('#athleteCompareOutput')||[...m.addedNodes].some(n=>n.nodeType===1&&(n.id==='athleteCompareOutput'||n.querySelector?.('#athleteCompareOutput, #athleteCompareOutput table')))))schedule();
  });
  observer.observe(root,{childList:true,subtree:true});
  schedule();
})();