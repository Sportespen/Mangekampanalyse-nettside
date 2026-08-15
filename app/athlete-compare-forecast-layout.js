(function(){
  function isForecast(){return document.querySelector('.tab.active')?.dataset?.tab==='forecast';}
  function cleanText(cell){
    if(!cell)return '—';
    return [...cell.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').trim()||cell.textContent.trim()||'—';
  }
  function enhance(){
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
      eventHeads.push(`<th>${ev}</th>`);
      const td=document.createElement('td');
      td.style.cssText='text-align:center;font-weight:900;white-space:nowrap;';
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

    const wrap=document.createElement('div');wrap.className='table-wrap';
    const compact=document.createElement('table');compact.className='forecast-table';compact.dataset.compactCompareRow='1';
    compact.innerHTML=`<thead><tr><th>Nasjon</th><th>Utøver</th>${eventHeads.join('')}<th>Forventet sluttpoeng</th><th>Handling</th></tr></thead><tbody><tr style="background:#153b61"><td>${nation}</td><td class="name" style="font-weight:900;white-space:nowrap">${name}</td></tr></tbody>`;
    const row=compact.querySelector('tbody tr');
    eventCells.forEach(td=>row.appendChild(td));
    const totalTd=document.createElement('td');totalTd.textContent=total;totalTd.style.cssText='font-weight:900;font-size:18px;text-align:center;white-space:nowrap';row.appendChild(totalTd);
    const actionTd=document.createElement('td');actionTd.style.cssText='white-space:nowrap;display:flex;gap:8px;justify-content:center;align-items:center';
    if(whatIf){whatIf.style.whiteSpace='nowrap';actionTd.appendChild(whatIf);}
    if(remove){remove.style.whiteSpace='nowrap';actionTd.appendChild(remove);}
    row.appendChild(actionTd);
    wrap.appendChild(compact);

    out.innerHTML='';
    out.appendChild(wrap);
    const hint=document.createElement('p');
    hint.style.cssText='margin:8px 0 0;color:#7f98af;font-size:12px';
    hint.textContent='Trykk på et forventet resultat for å se hvilke WA-resultater prognosen bygger på.';
    out.appendChild(hint);
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
    if(!isForecast())return;
    if(mutations.some(m=>m.target?.id==='athleteCompareOutput'||m.target?.closest?.('#athleteCompareOutput')||[...m.addedNodes].some(n=>n.nodeType===1&&(n.id==='athleteCompareOutput'||n.querySelector?.('#athleteCompareOutput, #athleteCompareOutput table')))))schedule();
  });
  observer.observe(root,{childList:true,subtree:true});
  schedule();
})();