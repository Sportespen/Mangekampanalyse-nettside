(function(){
  function fixRankingComparison(){
    const active=document.querySelector('.tab.active')?.dataset?.tab;
    if(active!=='ranking')return;
    const table=document.querySelector('#athleteCompareOutput table.ranking-table');
    if(!table)return;
    const head=table.querySelector('thead tr');
    if(!head)return;
    const first=head.children[0];
    if(!first||first.textContent.trim()!=='Plass')return;
    first.remove();
    table.querySelectorAll('tbody tr').forEach(tr=>tr.children[0]?.remove());
  }
  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('.tab,[data-id],#athleteCompareBtn'))setTimeout(fixRankingComparison,60);
  },true);
  document.addEventListener('change',ev=>{
    if(ev.target?.id==='eventSelect')setTimeout(fixRankingComparison,20);
  },true);
  const out=document.querySelector('#athleteCompareOutput');
  if(out)new MutationObserver(()=>fixRankingComparison()).observe(out,{childList:true,subtree:true});
  setTimeout(fixRankingComparison,0);
})();
