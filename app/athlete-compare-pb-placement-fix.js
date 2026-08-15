(function(){
  function cleanMainRowPB(){
    document.querySelectorAll('#athleteCompareOutput .compare-pb, #athleteCompareOutput .compare-pb-total').forEach(el=>el.remove());
  }
  const observer=new MutationObserver(cleanMainRowPB);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',()=>setTimeout(cleanMainRowPB,0),true);
  cleanMainRowPB();
})();
