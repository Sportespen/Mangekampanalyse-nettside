(function(){
  function isTimeEvent(eventName){
    return ['100m','400m','110mh','1500m','100mh','200m','800m'].includes(eventName);
  }

  function currentStep(){
    const s=document.querySelector('#stepSelect');
    return s?Number(s.value||0):0;
  }

  function applyBeforeStartBlank(){
    if(currentStep()===0){
      const body=document.querySelector('#forecastBody');
      if(body) body.innerHTML='';
      const banner=document.querySelector('#testBanner');
      if(banner) banner.textContent='TESTMODUS Götzis 2026 · før start · tabellen fylles når første øvelse er fullført';
    }
  }

  function showBasis(athlete,eventIndex){
    const eventName=D.events[eventIndex];
    const recent=(athlete.recent?.[eventIndex]||[]).filter(v=>v!=null).map(Number);
    const lower=isTimeEvent(eventName);
    const sorted=[...recent].sort((a,b)=>lower?a-b:b-a);
    const used=sorted.slice(0,3);
    const prediction=used.length?used.reduce((s,v)=>s+v,0)/used.length:(athlete.best?.[eventIndex]??null);
    const weakest=recent.length>=4?(lower?Math.max(...recent):Math.min(...recent)):null;

    const rows=recent.length
      ? recent.map((v,i)=>{
          const discarded=recent.length>=4 && v===weakest && recent.indexOf(v)===i;
          return `<tr><td>${i+1}</td><td>${displayMark(eventName,v)}</td><td>${discarded?'Utelatt':'Med i grunnlaget'}</td></tr>`;
        }).join('')
      : '<tr><td colspan="3">Ingen registrerte nylige resultater. Personlig beste brukes som reservegrunnlag.</td></tr>';

    const usedText=used.length?used.map(v=>displayMark(eventName,v)).join(' + '):'—';
    document.querySelector('#modalContent').innerHTML=`
      <h2>${esc(athlete.name)} – ${esc(eventName)}</h2>
      <p>Grunnlag for forventet resultat. Det svakeste av de fire siste resultatene utelates, og snittet av de tre beste brukes.</p>
      <div class="table-wrap"><table class="ranking-table"><thead><tr><th>#</th><th>Resultat</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="detail-grid">
        <div><small>Tre resultater brukt</small><b>${usedText}</b></div>
        <div><small>Forventet resultat</small><b>${prediction==null?'—':displayMark(eventName,prediction)}</b></div>
        <div><small>Forventede poeng</small><b>${prediction==null?'—':scoreEvent(eventIndex,prediction)}</b></div>
      </div>`;
    document.querySelector('#modal').classList.add('open');
  }

  function bindForecastCells(){
    if(currentStep()===0) return;
    const rows=[...document.querySelectorAll('#forecastBody tr')];
    rows.forEach(row=>{
      const name=row.querySelector('td.name')?.textContent?.trim();
      if(!name) return;
      const athlete=(D.testAthletes||[]).find(a=>a.name===name)||(D.athletes||[]).find(a=>a.name===name);
      if(!athlete) return;
      const cells=[...row.querySelectorAll('td')];
      D.events.forEach((eventName,i)=>{
        const cell=cells[3+i];
        if(!cell || !cell.classList.contains('pred')) return;
        cell.title='Dobbeltklikk for å se beregningsgrunnlaget';
        cell.style.cursor='pointer';
        cell.ondblclick=()=>showBasis(athlete,i);
      });
    });
  }

  function refreshEnhancements(){
    applyBeforeStartBlank();
    bindForecastCells();
  }

  const originalRenderTest=renderTest;
  renderTest=function(){
    originalRenderTest();
    refreshEnhancements();
  };

  const step=document.querySelector('#stepSelect');
  if(step){
    const originalChange=step.onchange;
    step.onchange=function(e){
      if(originalChange) originalChange.call(this,e);
      refreshEnhancements();
    };
  }

  refreshEnhancements();
})();