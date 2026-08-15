(function(){
  function updatePlaceholder(){
    const input=document.querySelector('#athleteCompareSearch');
    if(!input)return;
    input.placeholder=(typeof currentType==='string'&&currentType==='women')
      ? 'Skriv navn, f.eks. Miranda Lauvstad'
      : 'Skriv navn, f.eks. Jonathan Hertwig';
  }
  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('.event-switch-btn'))setTimeout(updatePlaceholder,0);
  },true);
  const mo=new MutationObserver(updatePlaceholder);
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{mo.observe(document.body,{subtree:true,childList:true});updatePlaceholder();},{once:true});
  }else{
    mo.observe(document.body,{subtree:true,childList:true});
    updatePlaceholder();
  }
})();
