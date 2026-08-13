// Production forecast history is provided by generated data/history_web.js.
// Live history refresh stays disabled so verified history is never overwritten after page load.
window.refreshMangekampHistory = async function(){ return window.MANGEKAMP_HISTORY; };

// Priority patch: pin verified Emil Uhlin and Jip de Greef history after the base history file.
(function(){
  var s=document.createElement('script');
  s.src='data/history_priority_patch.js?v=20260813-0915';
  s.onload=function(){
    if(typeof renderLiveForecast==='function') renderLiveForecast();
    if(typeof window.bindLiveForecastBasis==='function') window.bindLiveForecastBasis();
  };
  document.body.appendChild(s);
})();
