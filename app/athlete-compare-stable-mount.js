(function(){
  let preserved=null,queued=false;
  function activePanel(){const active=document.querySelector('.tab.active')?.dataset?.tab||'analyse';return document.getElementById(active);}
  function hasSelection(box){return !!box?.querySelector?.('#athleteCompareOutput table, #athleteCompareOutput h3');}
  function remember(){const box=document.getElementById('athleteCompareBox');if(box&&hasSelection(box))preserved=box;}
  function mount(){
    const panel=activePanel();if(!panel)return;
    let box=document.getElementById('athleteCompareBox');
    if(box&&hasSelection(box))preserved=box;
    if(preserved&&box&&box!==preserved&&!hasSelection(box)){box.replaceWith(preserved);box=preserved;}
    if(!box&&preserved){panel.insertAdjacentElement('afterend',preserved);box=preserved;}
    if(box&&box.previousElementSibling!==panel)panel.insertAdjacentElement('afterend',box);
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;remember();mount();});}
  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('#athleteCompareResults button'))setTimeout(()=>{remember();mount();},60);
    if(ev.target.closest?.('.tab'))setTimeout(mount,20);
    if(ev.target.closest?.('#removeCompareBtn'))preserved=null;
  },true);
  const observer=new MutationObserver(queue);
  function start(){observer.observe(document.body,{subtree:true,childList:true});remember();mount();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
