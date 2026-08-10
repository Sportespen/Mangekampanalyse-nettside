(function(){
  function isTimeEvent(eventName){
    return ['100m','400m','110mh','1500m','100mh','200m','800m'].includes(eventName);
  }

  function currentStep(){
    const s=document.querySelector('#stepSelect');
    return s?Number(s.value||0):0;
  }

  function applyBeforeStartBlank(){
    if(currentStep()!==0) return;
    const body=document.querySelector('#forecastBody');
    if(body){
      const athletes=D.testAthletes||[];
      const blankEventCells=D.events.map(()=>'<td></td>').join('');
      body.innerHTML=athletes.map(x=>`<tr><td></td><td>${esc(x.nation||'')}</td><td class="name">${esc(x.name||'')}</td>${blankEventCells}<td></td><td></td><td></td><td></td></tr>`).join('');
    }
    const banner=document.querySelector('#testBanner');
    if(banner) banner.textContent=`TESTMODUS Götzis 2026 · før start · ${D.testAthletes.length} utøvere`;
  }

  function normalizeRecentEntry(entry){
    if(entry==null) return null;
    if(typeof entry==='number') return {mark:Number(entry),venue:'',year:'',date:''};
    if(typeof entry==='string'){
      const n=Number(entry.replace(',','.'));
      return Number.isFinite(n)?{mark:n,venue:'',year:'',date:''}:null;
    }
    const mark=Number(entry.mark??entry.value??entry.result??entry.result_mark);
    if(!Number.isFinite(mark)) return null;
    const date=String(entry.result_date??entry.date??'');
    const year=String(entry.year??(date.match(/\b(19|20)\d{2}\b/)?.[0]||''));
    return {
      mark,
      venue:String(entry.venue??entry.place??entry.location??''),
      year,
      date
    };
  }

  function recentEntriesFor(athlete,eventIndex){
    const rich=athlete.recentDetails?.[eventIndex]||athlete.recent_details?.[eventIndex]||athlete.history?.[eventIndex];
    const source=rich||athlete.recent?.[eventIndex]||[];
    return (Array.isArray(source)?source:[]).map(normalizeRecentEntry).filter(Boolean);
  }

  function showBasis(athlete,eventIndex){
    const eventName=D.events[eventIndex];
    const entries=recentEntriesFor(athlete,eventIndex);
    const lower=isTimeEvent(eventName);
    const sorted=[...entries].sort((a,b)=>lower?a.mark-b.mark:b.mark-a.mark);
    const usedEntries=sorted.slice(0,3);
    const prediction=usedEntries.length?usedEntries.reduce((s,r)=>s+r.mark,0)/usedEntries.length:(athlete.best?.[eventIndex]??null);
    const weakest=entries.length>=4?(lower?Math.max(...entries.map(r=>r.mark)):Math.min(...entries.map(r=>r.mark))):null;
    let weakestUsed=false;

    const rows=entries.length
      ? entries.map((r,i)=>{
          let discarded=false;
          if(entries.length>=4 && !weakestUsed && r.mark===weakest){discarded=true;weakestUsed=true;}
          return `<tr><td>${i+1}</td><td>${displayMark(eventName,r.mark)}</td><td>${esc(r.venue||'—')}</td><td>${esc(r.year||'—')}</td><td>${discarded?'Utelatt':'Med i grunnlaget'}</td></tr>`;
        }).join('')
      : '<tr><td colspan="5">Ingen registrerte nylige resultater med historikk. Personlig beste brukes som reservegrunnlag.</td></tr>';

    const usedText=usedEntries.length?usedEntries.map(r=>displayMark(eventName,r.mark)).join(' + '):'—';
    document.querySelector('#modalContent').innerHTML=`
      <h2>${esc(athlete.name)} – ${esc(eventName)}</h2>
      <p>Grunnlag for forventet resultat. Det svakeste av de fire siste resultatene utelates, og snittet av de tre beste brukes.</p>
      <div class="table-wrap"><table class="ranking-table"><thead><tr><th>#</th><th>Resultat</th><th>Sted</th><th>År</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
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