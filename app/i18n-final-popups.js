(function(){
  if(window.__MKA_FINAL_POPUPS)return;window.__MKA_FINAL_POPUPS=true;
  const lang=()=>localStorage.getItem('mka-language')||'nb';
  const L=window.MKA_LANG;
  const eventLabel=s=>L?.eventLabel?L.eventLabel(s):s;
  const dict={
    nb:{forecastUses:'Prognosen bruker de 3 beste av disse 4 resultatene.',date:'Dato',result:'Resultat',wind:'Vind',venue:'Konkurranse / sted',expected:'Forventet resultat',now:'Forventet sluttpoeng nå',before:'Opprinnelig forventet sluttpoeng før start',change:'Endring',combined:'Mangekamp-PB',theoretical:'Teoretisk PB',utilTotal:'Utnyttelse totalt (gjennomførte øvelser)',utilEvent:'Utnyttelse pr. gjennomført øvelse mot PB'},
    en:{forecastUses:'The forecast uses the best 3 of these 4 results.',date:'Date',result:'Result',wind:'Wind',venue:'Competition / venue',expected:'Expected result',now:'Expected final score now',before:'Original expected final score before start',change:'Change',combined:'Combined-events PB',theoretical:'Theoretical PB',utilTotal:'Total utilisation (completed events)',utilEvent:'Utilisation per completed event vs PB'},
    de:{forecastUses:'Die Prognose verwendet die besten 3 dieser 4 Ergebnisse.',date:'Datum',result:'Ergebnis',wind:'Wind',venue:'Wettkampf / Ort',expected:'Erwartetes Ergebnis',now:'Erwartete Endpunktzahl aktuell',before:'Ursprünglich erwartete Endpunktzahl vor dem Start',change:'Änderung',combined:'Mehrkampf-PB',theoretical:'Theoretische PB',utilTotal:'Gesamtausnutzung (abgeschlossene Disziplinen)',utilEvent:'Ausnutzung je abgeschlossener Disziplin gegenüber PB'}
  };
  const d=()=>dict[lang()]||dict.nb;
  function translateBasisModal(){
    const m=document.querySelector('#modalContent');if(!m)return;
    const h=m.querySelector('h2');if(h&&h.textContent.includes(' – ')){const i=h.textContent.lastIndexOf(' – ');h.textContent=h.textContent.slice(0,i)+' – '+eventLabel(h.textContent.slice(i+3));}
    const p=m.querySelector('h2 + p');if(p&&/Prognosen bruker de 3 beste|forecast uses|Prognose verwendet/i.test(p.textContent))p.textContent=d().forecastUses;
    const headers=[...m.querySelectorAll('th')];const labels=[null,d().date,d().result,d().wind,d().venue];headers.forEach((x,i)=>{if(labels[i])x.textContent=labels[i]});
    [...m.querySelectorAll('small')].forEach(s=>{const q=s.textContent.trim();if(/Forventet resultat|Expected result|Erwartetes Ergebnis/i.test(q))s.textContent=d().expected;});
  }
  function translateScoreDropdown(){
    const box=document.querySelector('.forecast-score-dropdown');if(!box)return;
    const rows=[...box.querySelectorAll(':scope > div')];
    const labels=[d().now,d().before,d().change,d().combined,d().theoretical,d().utilTotal];
    for(let i=0;i<6&&i<rows.length;i++){const s=rows[i].querySelector('small');if(s)s.textContent=labels[i];}
    if(rows[6]){const s=rows[6].querySelector('small');if(s)s.textContent=d().utilEvent;}
    rows.slice(7).forEach(r=>{const s=r.querySelector('small');if(s)s.textContent=eventLabel(s.textContent.trim())});
  }
  function after(){queueMicrotask(()=>{translateBasisModal();translateScoreDropdown();});requestAnimationFrame(()=>{translateBasisModal();translateScoreDropdown();});}
  document.addEventListener('dblclick',after,true);
  document.addEventListener('click',e=>{if(e.target.closest?.('.forecast-total-cell,[data-basis],#whatIfBtn'))after();},true);
  document.addEventListener('mka:languagechange',after);
  window.addEventListener('load',after);
})();