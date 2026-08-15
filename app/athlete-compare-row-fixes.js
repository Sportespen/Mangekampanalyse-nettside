(function(){
  function activeTab(){return document.querySelector('.tab.active')?.dataset?.tab||'analyse';}
  function compareOut(){return document.querySelector('#athleteCompareOutput');}
  function compareTable(){return compareOut()?.querySelector('table')||null;}

  function normalizeRanking(){
    if(activeTab()!=='ranking')return false;
    const table=compareTable();if(!table)return false;
    const heads=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());
    const placeIndex=heads.indexOf('Plass');
    if(placeIndex<0)return true;
    table.querySelectorAll('tr').forEach(tr=>{if(tr.children[placeIndex])tr.children[placeIndex].remove();});
    return true;
  }

  function apply(){
    normalizeRanking();
  }

  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply();});
  }

  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('.tab,#athleteCompareResults button,#athleteCompareBtn')){
      setTimeout(schedule,0);
      setTimeout(schedule,80);
      setTimeout(schedule,250);
      setTimeout(schedule,700);
    }
  },true);
  document.addEventListener('change',ev=>{if(ev.target?.id==='eventSelect'){setTimeout(schedule,0);setTimeout(schedule,100);}},true);
  window.addEventListener('athleteComparisonRendered',schedule);

  const observer=new MutationObserver(mutations=>{
    if(activeTab()!=='ranking')return;
    if(mutations.some(m=>m.target?.id==='athleteCompareOutput'||m.target?.closest?.('#athleteCompareOutput')||[...m.addedNodes].some(n=>n.nodeType===1&&(n.id==='athleteCompareOutput'||n.querySelector?.('#athleteCompareOutput table')))))schedule();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,100),{once:true});else setTimeout(schedule,100);
})();