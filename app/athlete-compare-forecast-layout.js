(function(){
  function isForecast(){return document.querySelector('.tab.active')?.dataset?.tab==='forecast';}
  function cleanText(cell){
    if(!cell)return '—';
    return [...cell.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').trim()||cell.textContent.trim()||'—';
  }
  function enhance(){
    if(!isForecast())return;
    const out=document.querySelector('#athleteCompareOutput');
    const table=out?.querySelector('table');
    if(!table||table.dataset.compactCompareRow==='1')return;
    const heads=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());
    const exerciseIndex=heads.indexOf('Øvelse');
    const resultIndex=heads.indexOf('Forventet resultat');
    const basisIndex=heads.indexOf('Resultater i grunnlaget');
    if(exerciseIndex<0||resultIndex<0||basisIndex<0)return;

    const sourceRows=[...table.querySelectorAll('tbody tr')];
    if(!sourceRows.length)return;
    const h3=out.querySelector('h3');
    const meta=h3?.nextElementSibling;
    const name=h3?.textContent?.trim()||'Utøver';
    const nation=(meta?.textContent||'').split('•')[0].trim()||'—';
    const totalBox=[...out.querySelectorAll('div')].find(d=>d.querySelector('small')?.textContent.trim()==='Forventet sluttpoeng');
    const total=totalBox?.querySelector('b')?.textContent?.trim()||'—';
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
      const markSpan=document.createElement('div');
      markSpan.textContent=mark;
      const color=resultCell?.style?.color||getComputedStyle(resultCell||document.body).color;
      if(color)markSpan.style.color=color;
      td.appendChild(markSpan);
      if(basisBtn){
        basisBtn.textContent=`▾ ${count}`;
        basisBtn.title=`Vis ${count} resultat${count==='1'?'':'er'} i grunnlaget`;
        basisBtn.style.cssText='display:block;margin:3px auto 0;border:0;background:transparent;color:inherit;font-size:11px;font-weight:800;line-height:1;cursor:pointer;text-decoration:none;opacity:.9;';
        td.appendChild(basisBtn);
      }
      eventCells.push(td);
    });

    const wrap=document.createElement('div');wrap.className='table-wrap';
    const compact=document.createElement('table');compact.className='forecast-table';compact.dataset.compactCompareRow='1';
    compact.innerHTML=`<thead><tr><th>Nasjon</th><th>Utøver</th>${eventHeads.join('')}<th>Forventet sluttpoeng</th><th></th><th></th></tr></thead><tbody><tr style="background:#153b61"><td>${nation}</td><td class="name" style="font-weight:900;white-space:nowrap">${name}</td></tr></tbody>`;
    const row=compact.querySelector('tbody tr');
    eventCells.forEach(td=>row.appendChild(td));
    const totalTd=document.createElement('td');totalTd.textContent=total;totalTd.style.cssText='font-weight:900;font-size:18px;text-align:center;white-space:nowrap';row.appendChild(totalTd);
    const whatTd=document.createElement('td');if(whatIf){whatIf.style.whiteSpace='nowrap';whatTd.appendChild(whatIf);}row.appendChild(whatTd);
    const removeTd=document.createElement('td');if(remove){remove.style.whiteSpace='nowrap';removeTd.appendChild(remove);}row.appendChild(removeTd);
    wrap.appendChild(compact);

    out.innerHTML='';
    out.appendChild(wrap);
    const hint=document.createElement('p');
    hint.style.cssText='margin:8px 0 0;color:#7f98af;font-size:12px';
    hint.textContent='Trykk på ▾ under et resultat for å se hvilke WA-resultater prognosen bygger på.';
    out.appendChild(hint);
  }
  document.addEventListener('click',ev=>{if(ev.target.closest?.('.tab,#athleteCompareResults button'))setTimeout(enhance,140);},true);
  document.addEventListener('change',ev=>{if(ev.target?.id==='eventSelect')setTimeout(enhance,80);},true);
  const timer=setInterval(()=>enhance(),400);
  setTimeout(()=>clearInterval(timer),10000);
})();