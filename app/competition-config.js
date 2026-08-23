(function(){
  const competitions={
    birmingham:{
      id:'birmingham',
      labels:{nb:'EM Birmingham 2026',en:'European Championships Birmingham 2026',de:'EM Birmingham 2026'},
      enabled:true,
      live:{main:'/api/live',extras:['/api/live-women-800']},
      cacheKey:'mka-live-last-known-good-v2:birmingham',
      staticLive:'data/live_birmingham.js'
    },
    decastar:{
      id:'decastar',
      labels:{nb:'Décastar Talence 2026',en:'Décastar Talence 2026',de:'Décastar Talence 2026'},
      enabled:false,
      live:{main:null,extras:[]},
      cacheKey:'mka-live-last-known-good-v2:decastar',
      staticLive:'data/live_decastar.js'
    }
  };
  function language(){const v=localStorage.getItem('mka-language');return ['nb','en','de'].includes(v)?v:'nb';}
  function selectedId(){return document.querySelector('#competitionSelect')?.value||'birmingham';}
  function get(id){return competitions[id]||competitions.birmingham;}
  function current(){return get(selectedId());}
  function label(id){const c=get(id);return c.labels[language()]||c.labels.nb||id;}
  window.MKA_COMPETITIONS={competitions,get,current,label,selectedId};
})();
