(function(){
  function isTimeEvent(eventName){return ['100m','400m','110mh','1500m','100mh','200m','800m'].includes(eventName);}
  function normalizeRecentEntry(entry){
    if(entry==null)return null;
    if(Array.isArray(entry)){const mark=Number(entry[0]);if(!Number.isFinite(mark))return null;return{mark,venue:String(entry[2]||''),year:String(entry[3]||''),date:String(entry[4]||'')};}
    const mark=Number(entry.mark??entry.value??entry.result??entry.result_mark);if(!Number.isFinite(mark))return null;
    const date=String(entry.result_date??entry.date??'');const year=String(entry.year??(date.match(/\b(19|20)\d{2}\b/)?.[0]||''));
    return {mark,venue:String(entry.venue??entry.place??entry.location??''),year,date};
  }
  function recentEntriesFor(athlete,eventIndex){
    const eventName=D.events[eventIndex];
    const source=window.MANGEKAMP_HISTORY?.[athlete.name]?.[eventName]||[];
    const seen=new Set(),out=[];
    for(const raw of (Array.isArray(source)?source:[])){
      const r=normalizeRecentEntry(raw);if(!r)continue;
      if(r.year!=='2026'&&r.year!=='2025')continue;
      const key=[r.mark,r.venue,r.year].join('|');if(seen.has(key))continue;
      seen.add(key);out.push(r);if(out.length===4)break;
    }
    return out;
  }
  function basisFor(athlete,eventIndex){const eventName=D.events[eventIndex],entries=recentEntriesFor(athlete,eventIndex),lower=isTimeEvent(eventName);const sorted=[...entries].sort((a,b)=>lower?a.mark-b.mark:b.mark-a.mark);const usedEntries=sorted.length>=4?sorted.slice(0,3):sorted;const prediction=usedEntries.length?usedEntries.reduce((s,r)=>s+r.mark,0)/usedEntries.length:null;return{eventName,entries,usedEntries,prediction,lower};}
  function basisColor(count){if(count>=4)return '#39d98a';if(count===3)return '#ff9f43';if(count===2)return '#ffd54a';if(count===1)return '#ff5b5b';return '';}
  function basisLabel(count){if(count>=4)return '4 resultater – fullt grunnlag';if(count===3)return '3 resultater – begrenset grunnlag';if(count===2)return '2 resultater – begrenset grunnlag';if(count===1)return '1 resultat – begrenset grunnlag';return 'Ingen resultater';}
  function showBasis(athlete,eventIndex){
    const {eventName,entries,usedEntries,prediction,lower}=basisFor(athlete,eventIndex);
    const weakest=entries.length>=4?(lower?Math.max(...entries.map(r=>r.mark)):Math.min(...entries.map(r=>r.mark))):null;let weakestUsed=false;
    const rows=entries.length?entries.map((r,i)=>{let discarded=false;if(entries.length>=4&&!weakestUsed&&r.mark===weakest){discarded=true;weakestUsed=true;}return `<tr><td>${i+1}</td><td>${displayMark(eventName,r.mark)}</td><td>${esc(r.venue||'—')}</td><td>${esc(r.year||'—')}</td><td>${discarded?'Utelatt':'Med i grunnlaget'}</td></tr>`;}).join(''):'<tr><td colspan="5">Ingen registrerte resultater fra 2025–2026.</td></tr>';
    const usedText=usedEntries.length?usedEntries.map(r=>displayMark(eventName,r.mark)).join(' + '):'—';
    const color=basisColor(entries.length);
    const warning=entries.length<4?`<p style="color:${color};font-weight:800">${basisLabel(entries.length)} fra 2025–2026.</p>`:'';
    document.querySelector('#modalContent').innerHTML=`<h2>${esc(athlete.name)} – ${esc(eventName)}</h2><p>Grunnlag: opptil fire siste gyldige seniorresultater fra 2025–2026. Ved fire resultater utelates det svakeste og snittet av de tre beste brukes. Finnes færre enn fire, brukes bare de tilgjengelige.</p>${warning}<div class="table-wrap"><table class="ranking-table"><thead><tr><th>#</th><th>Resultat</th><th>Sted</th><th>År</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div><div class="detail-grid"><div><small>Resultater brukt</small><b>${usedText}</b></div><div><small>Forventet resultat</small><b style="color:${color}">${prediction==null?'—':displayMark(eventName,prediction)}</b></div><div><small>Forventede poeng</small><b style="color:${color}">${prediction==null?'—':scoreEvent(eventIndex,prediction)}</b></div></div>`;
    document.querySelector('#modal').classList.add('open');
  }
  window.forecastBasisCount=function(athlete,eventIndex){return basisFor(athlete,eventIndex).entries.length;};
  window.bindLiveForecastBasis=function(){
    document.querySelectorAll('#liveForecastBody tr').forEach(row=>{
      const name=row.querySelector('td.name')?.textContent?.trim();if(!name)return;
      const athlete=(D.athletes||[]).find(a=>a.name===name);if(!athlete)return;
      const cells=[...row.querySelectorAll('td')];
      D.events.forEach((eventName,i)=>{const cell=cells[3+i];if(!cell||!cell.classList.contains('pred'))return;const count=window.forecastBasisCount(athlete,i);cell.title='Dobbeltklikk for å se beregningsgrunnlaget';cell.style.cursor='pointer';cell.style.color=basisColor(count);cell.style.fontWeight=count?'800':'';cell.ondblclick=()=>showBasis(athlete,i);});
    });
  };
})();
