document.addEventListener('click',function(ev){const box=ev.target.closest&&ev.target.closest('.forecast-score-dropdown');if(!box)return;box.remove();},true);
