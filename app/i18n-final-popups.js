(function(){
  if(window.__MKA_FINAL_POPUPS)return;window.__MKA_FINAL_POPUPS=true;
  const lang=()=>localStorage.getItem('mka-language')||'nb';
  const L=window.MKA_LANG;
  const eventLabel=s=>L?.eventLabel?L.eventLabel(s):s;
  const dict={
    nb:{forecastUses:'Prognosen bruker de 3 beste av disse 4 resultatene.',forecastFewer:'Det finnes færre enn 4 gyldige resultater i perioden, så alle viste resultater brukes.',date:'Dato',result:'Resultat',wind:'Vind',venue:'Konkurranse / sted',expected:'Forventet resultat',pb:'PB (personlig rekord)',now:'Forventet sluttpoeng nå',before:'Opprinnelig forventet sluttpoeng før start',change:'Endring',combined:'Mangekamp-PB',theoretical:'Teoretisk PB',utilTotal:'Utnyttelse totalt (gjennomførte øvelser)',utilEvent:'Utnyttelse pr. gjennomført øvelse mot PB'},
    en:{forecastUses:'The forecast uses the best 3 of these 4 results.',forecastFewer:'Fewer than 4 valid results are available in the period, so all shown results are used.',date:'Date',result:'Result',wind:'Wind',venue:'Competition / venue',expected:'Expected result',pb:'PB (personal best)',now:'Expected final score now',before:'Original expected final score before start',change:'Change',combined:'Combined-events PB',theoretical:'Theoretical PB',utilTotal:'Total utilisation (completed events)',utilEvent:'Utilisation per completed event vs PB'},
    de:{forecastUses:'Die Prognose verwendet die besten 3 dieser 4 Ergebnisse.',forecastFewer:'Im Zeitraum liegen weniger als 4 gültige Ergebnisse vor, daher werden alle angezeigten Ergebnisse verwendet.',date:'Datum',result:'Ergebnis',wind:'Wind',venue:'Wettkampf / Ort',expected:'Erwartetes Ergebnis',pb:'PB (persönliche Bestleistung)',now:'Erwartete Endpunktzahl aktuell',before:'Ursprünglich erwartete Endpunktzahl vor dem Start',change:'Änderung',combined:'Mehrkampf-PB',theoretical:'Theoretische PB',utilTotal:'Gesamtausnutzung (abgeschlossene Disziplinen)',utilEvent:'Ausnutzung je abgeschlossener Disziplin gegenüber PB'}
  };
  const d=()=>dict[lang()]||dict.nb;
  function translateBasisModal(){
    const m=document.querySelector('#modalContent');if(!m)return;
    const h=m.querySelector('h2');
    if(h&&h.textContent.includes(' – ')){
      const i=h.textContent.lastIndexOf(' – '),raw=h.textContent.slice(i+3).trim();
      h.textContent=h.textContent.slice(0,i)+' – '+eventLabel(raw);
    }
    const p=m.querySelector('h2 + p');
    if(p){
      const q=p.textContent.trim();
      if(/Prognosen bruker de 3 beste|forecast uses|Prognose verwendet/i.test(q))p.textContent=d().forecastUses;
      else if(/færre enn 4 gyldige|fewer than 4 valid|weniger als 4 gültige/i.test(q))p.textContent=d().forecastFewer;
    }
    const map={Dato:d().date,Date:d().date,Datum:d().date,Resultat:d().result,Result:d().result,Ergebnis:d().result,Vind:d().wind,Wind:d().wind,'Konkurranse / sted':d().venue,'Competition / venue':d().venue,'Wettkampf / Ort':d().venue};
    m.querySelectorAll('th').forEach(x=>{const q=x.textContent.trim();if(map[q])x.textContent=map[q]});
    [...m.querySelectorAll('small')].forEach(s=>{
      const q=s.textContent.trim();
      if(/^(Forventet resultat|Expected result|Erwartetes Ergebnis)$/i.test(q))s.textContent=d().expected;
      else if(/^PB \((personlig rekord|personal best|persönliche Bestleistung)\)$/i.test(q))s.textContent=d().pb;
    });
  }
  function translateScoreDropdown(){
    const box=document.querySelector('.forecast-score-dropdown');if(!box)return;
    const rows=[...box.children].filter(el=>el.tagName==='DIV');
    const labels=[d().now,d().before,d().change,d().combined,d().theoretical,d().utilTotal];
    for(let i=0;i<6&&i<rows.length;i++){const s=rows[i].querySelector('small');if(s)s.textContent=labels[i];}
    if(rows[6]){const s=rows[6].querySelector('small');if(s)s.textContent=d().utilEvent;}
    rows.slice(7).forEach(r=>{const s=r.querySelector('small');if(s)s.textContent=eventLabel(s.textContent.trim())});
  }
  function apply(){translateBasisModal();translateScoreDropdown();}
  function after(){queueMicrotask(apply);requestAnimationFrame(apply);setTimeout(apply,0);setTimeout(apply,40);}
  document.addEventListener('mka:languagechange',after);
  document.addEventListener('click',after,false);
  document.addEventListener('dblclick',after,false);
  const modal=document.querySelector('#modalContent');
  if(modal)new MutationObserver(()=>after()).observe(modal,{childList:true,subtree:true});
  const bodyObserver=new MutationObserver(list=>{for(const rec of list){for(const n of rec.addedNodes){if(n.nodeType===1&&(n.matches?.('.forecast-score-dropdown')||n.querySelector?.('.forecast-score-dropdown'))){after();return;}}}});
  bodyObserver.observe(document.body,{childList:true,subtree:false});
  window.addEventListener('load',after);
  after();
})();