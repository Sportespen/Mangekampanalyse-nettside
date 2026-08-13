(function(){
  function normName(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,' ').trim().toLowerCase();}
  function liveSection(){const live=window.MANGEKAMP_LIVE||{};return (typeof currentType!=='undefined'&&currentType==='women')?(live.women||{}):(live.men||{});}
  function liveEntryFor(name,eventName){const results=liveSection().results||{};const key=normName(name);for(const [n,v] of Object.entries(results)){if(normName(n)===key)return v?.[eventName]||null;}return null;}
  function originalPrediction(athlete,eventIndex){try{if(typeof predict==='function'){const v=predict(athlete,eventIndex);return Number.isFinite(Number(v))?Number(v):null;}}catch(_e){}return null;}
  function collectAttempts(raw){if(!raw||typeof raw!=='object')return[];const candidates=[raw.attempts,raw.trials,raw.series,raw.progression,raw.attemptSeries,raw.results];for(const c of candidates){if(!c)continue;if(Array.isArray(c))return c.map(x=>typeof x==='object'?(x.display??x.result??x.mark??x.value??x.height??JSON.stringify(x)):x).filter(x=>x!=null&&String(x).trim()!=='').map(String);if(typeof c==='string')return c.split(/\s*[,;|]\s*/).filter(Boolean);}return[];}
  function showLiveDetails(athlete,eventIndex){const eventName=D.events[eventIndex];const raw=liveEntryFor(athlete.name,eventName)||{};const actual=Number(raw.mark);const predicted=originalPrediction(athlete,eventIndex);const attempts=collectAttempts(raw);const attemptHtml=attempts.length?`<div class="table-wrap"><table class="ranking-table"><thead><tr><th>Forsøk</th><th>Resultat</th></tr></thead><tbody>${attempts.map((v,i)=>`<tr><td>${i+1}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div>`:'<p style="color:#9fb2c6">Forsøksdata er ikke tilgjengelig fra live-kilden for denne øvelsen ennå.</p>';
    const actualText=Number.isFinite(actual)?displayMark(eventName,actual):(raw.display||'—');
    const predText=predicted==null?'—':displayMark(eventName,predicted);
    document.querySelector('#modalContent').innerHTML=`<h2>${esc(athlete.name)} – ${esc(eventName)}</h2><div class="detail-grid"><div><small>Opprinnelig forventet resultat</small><b>${predText}</b></div><div><small>Gjeldende / beste resultat</small><b>${esc(actualText)}</b></div><div><small>Status</small><b>${esc(raw.status||raw.resultStatus||'LIVE')}</b></div></div><h3 style="margin-top:22px">Forsøk underveis</h3>${attemptHtml}`;
    document.querySelector('#modal').classList.add('open');
  }
  function bind(){document.querySelectorAll('#liveForecastBody tr').forEach(row=>{const name=row.querySelector('td.name')?.textContent?.trim();if(!name)return;const athlete=(D.athletes||[]).find(a=>normName(a.name)===normName(name));if(!athlete)return;const cells=[...row.querySelectorAll('td')];D.events.forEach((eventName,i)=>{const cell=cells[3+i];if(!cell||!cell.classList.contains('actual'))return;cell.title='Dobbeltklikk for å se live-forsøk og opprinnelig forventet resultat';cell.style.cursor='pointer';cell.ondblclick=()=>showLiveDetails(athlete,i);});});}
  const old=window.bindLiveForecastBasis;window.bindLiveForecastBasis=function(){if(typeof old==='function')old();bind();};
  window.bindLiveAttemptDetails=bind;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else setTimeout(bind,0);
})();
