(function(){
  function openWithSingleClick(ev){
    const cell=ev.target.closest?.('#liveForecastBody td.pred, #liveForecastBody td.terminal-code');
    if(!cell)return;
    // Reuse the existing, tested detail handlers. Dispatching dblclick here keeps
    // the detail-generation code in its original source while the user interaction
    // is consistently single-click everywhere.
    ev.preventDefault();
    ev.stopPropagation();
    cell.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true,view:window}));
  }
  document.addEventListener('click',openWithSingleClick,true);
})();