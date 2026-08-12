(function(){
  function isTimeEvent(eventName){return ['100m','400m','110mh','1500m','100mh','200m','800m'].includes(eventName);}
  function normalizeRecentEntry(entry){
    if(entry==null)return null;
    if(typeof entry==='number')return {mark:Number(entry),venue:'',year:'',date:''};
    if(typeof entry==='string'){const n=Number(entry.replace(',','.'));return Number.isFinite(n)?{mark:n,venue:'',year:'',date:''}:null;}
    const mark=Number(entry.mark??entry.value??entry.result??entry.result_mark);if(!Number.isFinite(mark))return null;
    const date=String(entry.result_date??entry.date??'');const year=String(entry.year??(date.match(/\b(19|20)\d{2}\b/)?.[0]||''));
    return {mark,venue:String(entry.venue??entry.place??entry.location??''),year,date};
  }
  function recentEntriesFor(athlete,eventIndex){const rich=athlete.recentDetails?.[eventIndex]||athlete.recent_details?.[eventIndex]||athlete.history?.[eventIndex];const source=rich||athlete.recent?.[eventIndex]||[];return(Array.isArray(source)?source:[]).map(normalizeRecentEntry).filter(Boolean).slice(0,4);}
  function basisFor(athlete,eventIndex){const eventName=D.events[eventIndex],entries=recentEntriesFor(athlete,eventIndex),lower=isTimeEvent(eventName);const sorted=[...entries].sort((a,b)=>lower?a.mark-b.mark:b.mark-a.mark);const usedEntries=sorted.length>=4?sorted.slice(0,3):sorted.slice(0,Math.min(3,sorted.length));const prediction=usedEntries.length?usedEntries.reduce((s,r)=>s+r.mark,0)/usedEntries.length:null;return{eventName,entries,usedEntries,prediction,lower};}
  function showBasis(athlete,eventIndex){
    const {eventName,entries,usedEntries,prediction,lower}=basisFor(athlete,eventIndex);
    const weakest=entries.length>=4?(lower?Math.max(...entries.map(r=>r.mark)):Math.min(...entries.map(r=>r.mark))):null;let weakestUsed=false;
    const rows=entries.length?entries.map((r,i)=>{let discarded=false;if(entries.length>=4&&!weakestUsed&&r.mark===weakest){discarded=true;weakestUsed=true;}return `<tr><td>${i+1}</td><td>${displayMark(eventName,r.mark)}</td><td>${esc(r.venue||'—')}</td><td>${esc(r.year||'—')}</td><td>${discarded?'Utelatt':'Med i grunnlaget'}</td></tr>`;}).join(''):'<tr><td colspan="5">Ingen registrerte nylige resultater.</td></tr>';
    const usedText=usedEntries.length?usedEntries.map(r=>displayMark(eventName,r.mark)).join(' + '):'—';
    const low=usedEntries.length>0&&usedEntries.length<3;
    const warning=low?`<p style="color:#ff5b5b;font-weight:800">Begrenset grunnlag: prognosen bygger på ${usedEntries.length} resultat${usedEntries.length===1?'':'er'}.</p>`:'';
    document.querySelector('#modalContent').innerHTML=`<h2>${esc(athlete.name)} – ${esc(eventName)}</h2><p>Grunnlag for forventet resultat. Ved fire registrerte resultater utelates det svakeste og snittet av de tre beste brukes. Ved tre, to eller ett resultat brukes de tilgjengelige resultatene.</p>${warning}<div class="table-wrap"><table class="ranking-table"><thead><tr><th>#</th><th>Resultat</th><th>Sted</th><th>År</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div><div class="detail-grid"><div><small>Resultater brukt</small><b>${usedText}</b></div><div><small>Forventet resultat</small><b style="${low?'color:#ff5b5b':''}">${prediction==null?'—':displayMark(eventName,prediction)}</b></div><div><small>Forventede poeng</small><b style="${low?'color:#ff5b5b':''}">${prediction==null?'—':scoreEvent(eventIndex,prediction)}</b></div></div>`;
    document.querySelector('#modal').classList.add('open');
  }
  window.forecastBasisCount=function(athlete,eventIndex){return basisFor(athlete,eventIndex).usedEntries.length;};
  window.bindLiveForecastBasis=function(){
    document.querySelectorAll('#liveForecastBody tr').forEach(row=>{
      const name=row.querySelector('td.name')?.textContent?.trim();if(!name)return;
      const athlete=(D.athletes||[]).find(a=>a.name===name);if(!athlete)return;
      const cells=[...row.querySelectorAll('td')];
      D.events.forEach((eventName,i)=>{const cell=cells[3+i];if(!cell||!cell.classList.contains('pred'))return;const count=window.forecastBasisCount(athlete,i);cell.title='Dobbeltklikk for å se beregningsgrunnlaget';cell.style.cursor='pointer';if(count>0&&count<3){cell.style.color='#ff5b5b';cell.style.fontWeight='800';}cell.ondblclick=()=>showBasis(athlete,i);});
    });
  };
})();