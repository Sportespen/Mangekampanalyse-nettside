(function(){
  function recalcWhenOpened(){
    setTimeout(()=>{
      const modal=document.querySelector('#modal');
      if(!modal?.classList.contains('open'))return;
      const fields=[...document.querySelectorAll('[data-whatif]')];
      if(!fields.length)return;
      const populated=fields.find(inp=>String(inp.value||'').trim()!=='');
      if(populated){
        populated.dispatchEvent(new Event('input',{bubbles:true}));
      }
    },0);
  }

  document.addEventListener('click',ev=>{
    if(ev.target.closest?.('#whatIfBtn'))recalcWhenOpened();
  },true);
})();
