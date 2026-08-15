(function(){
  function updatePlaceholder(){
    const input=document.querySelector('#athleteCompareSearch');
    if(!input)return;
    input.placeholder=(typeof currentType==='string'&&currentType==='women')
      ? 'Skriv navn, f.eks. Miranda Lauvstad'
      : 'Skriv navn, f.eks. Jonathan Hertwig';
  }
  function updateModalSize(){
    const modal=document.querySelector('#modal');
    const card=modal?.querySelector('.modal-card');
    if(!card)return;
    card.style.width='min(920px, calc(100vw - 32px))';
    card.style.maxWidth='920px';
    card.style.maxHeight='86vh';
    card.style.overflow='auto';
    card.style.boxSizing='border-box';
    const tableWrap=card.querySelector('.table-wrap');
    if(tableWrap){tableWrap.style.overflowX='auto';tableWrap.style.maxWidth='100%';}
  }
  function refresh(){updatePlaceholder();updateModalSize();}
  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('.event-switch-btn'))setTimeout(updatePlaceholder,0);
    if(ev.target.closest?.('[data-basis],#whatIfBtn'))setTimeout(updateModalSize,0);
  },true);
  const mo=new MutationObserver(refresh);
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{mo.observe(document.body,{subtree:true,childList:true});refresh();},{once:true});
  }else{
    mo.observe(document.body,{subtree:true,childList:true});
    refresh();
  }
})();
