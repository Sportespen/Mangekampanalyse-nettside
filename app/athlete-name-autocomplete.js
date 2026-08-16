(function(){
  if(window.__athleteNameAutocompleteV1)return;
  window.__athleteNameAutocompleteV1=true;
  let timer=0,last='';
  function bind(){
    const input=document.querySelector('#athleteCompareSearch');
    const btn=document.querySelector('#athleteCompareBtn');
    const results=document.querySelector('#athleteCompareResults');
    if(!input||!btn||input.dataset.autocompleteBound==='1')return;
    input.dataset.autocompleteBound='1';
    if(results){results.style.maxHeight='360px';results.style.overflowY='auto';}
    input.addEventListener('input',()=>{
      clearTimeout(timer);
      const q=input.value.trim();
      if(q.length<2){if(results)results.style.display='none';last='';return;}
      timer=setTimeout(()=>{
        const now=input.value.trim();
        if(now.length<2||now===last)return;
        last=now;
        btn.click();
      },350);
    });
    input.addEventListener('focus',()=>{
      if(results&&results.children.length&&input.value.trim().length>=2)results.style.display='block';
    });
  }
  new MutationObserver(bind).observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
