(function(){
  if(!document.querySelector('script[data-stable-compare-mount]')){const s=document.createElement('script');s.dataset.stableCompareMount='1';s.src='athlete-compare-stable-mount.js?v=20260815-stable22';document.body.appendChild(s);}
  if(!document.querySelector('script[data-compare-row-fixes]')){const s=document.createElement('script');s.dataset.compareRowFixes='1';s.src='athlete-compare-row-fixes.js?v=20260815-stable22';document.body.appendChild(s);}
  if(!document.querySelector('script[data-compare-settype-guard]')){const s=document.createElement('script');s.dataset.compareSettypeGuard='1';s.src='athlete-compare-settype-guard.js?v=20260815-stable22';document.body.appendChild(s);}
  const old=document.querySelector('script[data-compare-forecast-layout]');if(old)old.remove();
  const s=document.createElement('script');s.dataset.compareForecastLayout='1';s.src='athlete-compare-forecast-layout.js?v=20260815-row5-'+Date.now();document.body.appendChild(s);
  const oldFinal=document.querySelector('script[data-compare-final-fixes]');if(oldFinal)oldFinal.remove();
  const f=document.createElement('script');f.dataset.compareFinalFixes='1';f.src='athlete-compare-final-fixes.js?v=20260815-final1-'+Date.now();document.body.appendChild(f);
})();