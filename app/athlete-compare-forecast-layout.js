(function(){
  function isForecast(){return document.querySelector('.tab.active')?.dataset?.tab==='forecast';}
  function enhance(){
    if(!isForecast())return;
    const out=document.querySelector('#athleteCompareOutput');
    const table=out?.querySelector('table');
    if(!table)return;
    const heads=[...table.querySelectorAll('thead th')];
    const basisIndex=heads.findIndex(th=>th.textContent.trim()==='Resultater i grunnlaget');
    const resultIndex=heads.findIndex(th=>th.textContent.trim()==='Forventet resultat');
    if(basisIndex<0||resultIndex<0)return;
    const rows=[...table.querySelectorAll('tbody tr')];
    rows.forEach(tr=>{
      const cells=[...tr.children];
      const resultCell=cells[resultIndex],basisCell=cells[basisIndex];
      if(!resultCell||!basisCell)return;
      const btn=basisCell.querySelector('[data-basis]');
      if(btn){
        const count=btn.textContent.trim();
        btn.textContent=`▾ ${count} resultat${count==='1'?'':'er'}`;
        btn.style.display='block';
        btn.style.margin='4px auto 0';
        btn.style.fontSize='12px';
        btn.style.fontWeight='700';
        btn.style.textDecoration='none';
        btn.style.opacity='0.9';
        btn.title='Vis resultatgrunnlag';
        resultCell.appendChild(btn);
      }
      basisCell.remove();
    });
    heads[basisIndex]?.remove();
    const note=[...out.querySelectorAll('p')].find(p=>p.textContent.includes('Resultater i grunnlaget'));
    if(note)note.textContent='Trykk på nedtrekket under et forventet resultat for å se hvilke WA-resultater prognosen bygger på.';
  }
  document.addEventListener('click',ev=>{if(ev.target.closest?.('.tab,#athleteCompareResults button'))setTimeout(enhance,140);},true);
  document.addEventListener('change',ev=>{if(ev.target?.id==='eventSelect')setTimeout(enhance,80);},true);
  const timer=setInterval(()=>{enhance();if(document.querySelector('#athleteCompareOutput table')&&isForecast())clearInterval(timer);},400);
  setTimeout(()=>clearInterval(timer),8000);
})();