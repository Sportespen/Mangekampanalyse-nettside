(function(){
  const STATUS_INFO={
    DNS:['Did Not Start','Startet ikke i øvelsen eller konkurransen.'],
    DNF:['Did Not Finish','Startet, men fullførte ikke øvelsen eller konkurransen.'],
    DQ:['Disqualified','Diskvalifisert.'],
    NM:['No Mark','Ingen gyldig resultat/notering i øvelsen.'],
    NH:['No Height','Ingen gyldig høyde i høyde eller stav.']
  };
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function showAll(code,name){
    const modal=document.querySelector('#modal'),content=document.querySelector('#modalContent');
    if(!modal||!content)return;
    const rows=Object.entries(STATUS_INFO).map(([key,[meaning,explanation]])=>`<tr${key===code?' style="background:#173b60"':''}><td style="padding:9px 12px;font-weight:900">${key}</td><td style="padding:9px 12px;font-weight:800">${esc(meaning)}</td><td style="padding:9px 12px">${esc(explanation)}</td></tr>`).join('');
    content.innerHTML=`<h2>${esc(name||'Utøver')} – ${esc(code)}</h2><p style="color:#dce8f4;margin:0 0 14px">Statuskoder fra arrangørens resultatliste:</p><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#173b60"><th style="padding:9px 12px;text-align:left">Kode</th><th style="padding:9px 12px;text-align:left">Betydning</th><th style="padding:9px 12px;text-align:left">Forklaring</th></tr></thead><tbody>${rows}</tbody></table></div><p style="margin-top:16px;color:#aebed0">Når en utøver ikke fortsetter konkurransen, vises samme statuskode også i de etterfølgende øvelsene som ikke blir startet.</p>`;
    modal.classList.add('open');
  }
  document.addEventListener('dblclick',function(e){
    const td=e.target.closest&&e.target.closest('.terminal-code');
    if(!td)return;
    const code=String(td.textContent||'').trim().toUpperCase();
    if(!STATUS_INFO[code])return;
    const tr=td.closest('tr');
    const name=tr&&tr.cells&&tr.cells[2]?tr.cells[2].textContent.trim():'Utøver';
    e.preventDefault();e.stopImmediatePropagation();
    showAll(code,name);
  },true);
})();