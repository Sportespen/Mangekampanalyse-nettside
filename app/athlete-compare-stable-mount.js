(function(){
  let preserved=null;
  function activePanel(){const active=document.querySelector('.tab.active')?.dataset?.tab||'analyse';return document.getElementById(active);}
  function hasSelection(box){return !!box?.querySelector?.('#athleteCompareOutput table, #athleteCompareOutput h3');}
  function remember(){const box=document.getElementById('athleteCompareBox');if(box&&hasSelection(box))preserved=box;}
  function mount(){
    const panel=activePanel();if(!panel)return;
    let box=document.getElementById('athleteCompareBox');
    if(box&&hasSelection(box))preserved=box;
    if(!box&&preserved){panel.insertAdjacentElement('afterend',preserved);box=preserved;}
    if(box&&box.previousElementSibling!==panel)panel.insertAdjacentElement('afterend',box);
  }
  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('#athleteCompareResults button'))setTimeout(()=>{remember();mount();},50);
    if(ev.target.closest?.('.tab'))setTimeout(()=>{
      mount();
      if(document.querySelector('.tab.active')?.dataset?.tab==='ranking')document.getElementById('eventSelect')?.dispatchEvent(new Event('change',{bubbles:true}));
    },40);
    if(ev.target.closest?.('#removeCompareBtn'))preserved=null;
  },true);
  const main=document.querySelector('main');
  if(main){new MutationObserver(()=>{if(preserved&&!document.body.contains(preserved))mount();}).observe(main,{childList:true});}
  setInterval(()=>{remember();if(preserved&&!document.body.contains(preserved))mount();},2000);
})();
