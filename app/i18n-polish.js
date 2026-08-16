(function(){
  const css=document.createElement('style');
  css.textContent=`
    .mka-language-switcher{position:absolute!important;right:max(28px,calc((100vw - 1240px)/2))!important;top:24px!important;display:flex!important;gap:9px!important;z-index:100!important;align-items:center}
    .mka-language-switcher button{width:42px!important;height:32px!important;padding:2px!important;border:1px solid #315a7d!important;border-radius:7px!important;background:#0b2038!important;font-size:0!important;line-height:1!important;overflow:hidden;cursor:pointer}
    .mka-language-switcher button::after{font-size:24px!important;line-height:26px!important}
    .mka-language-switcher button[data-lang="nb"]::after{content:'🇳🇴'}
    .mka-language-switcher button[data-lang="en"]::after{content:'🇬🇧'}
    .mka-language-switcher button[data-lang="de"]::after{content:'🇩🇪'}
    .mka-language-switcher button.active{border:2px solid #ff8a19!important;background:#132f4b!important}
    .topbar{position:relative!important}
    .feature-card{min-height:146px!important;height:auto!important;padding:16px!important}
    .feature-copy{min-width:0!important}
    .feature-copy strong{line-height:1.08!important}
    .feature-copy small{line-height:1.35!important;white-space:normal!important}
    .status small{line-height:1.35!important}
    @media(max-width:800px){.mka-language-switcher{right:12px!important;top:12px!important}.mka-language-switcher button{width:36px!important;height:29px!important}.mka-language-switcher button::after{font-size:21px!important}.brand{padding-right:140px!important}.feature-card{min-height:130px!important}}
  `;
  document.head.appendChild(css);

  const extra={
    en:{
      'Sist oppdatert':'Last updated','Live-resultater kobles inn fortløpende.':'Live results are updated continuously.','Oppdater':'Refresh',
      'øvelse fullført':'event completed','øvelser fullført':'events completed','Poeng diff':'Points gap','Forventet sluttplass':'Expected final rank',
      '1500 diff':'1500m gap','800 diff':'800m gap','Snitt tikamp-PB':'Average decathlon PB','Snitt sjukamp-PB':'Average heptathlon PB',
      'Snitt utnyttelse':'Average utilisation','Størst uutnyttet potensial':'Largest unused potential','født':'born'
    },
    de:{
      'Sist oppdatert':'Zuletzt aktualisiert','Live-resultater kobles inn fortløpende.':'Live-Ergebnisse werden fortlaufend aktualisiert.','Oppdater':'Aktualisieren',
      'øvelse fullført':'Disziplin abgeschlossen','øvelser fullført':'Disziplinen abgeschlossen','Poeng diff':'Punktedifferenz','Forventet sluttplass':'Erwarteter Endplatz',
      '1500 diff':'1500-m-Differenz','800 diff':'800-m-Differenz','Snitt tikamp-PB':'Ø Zehnkampf-PB','Snitt sjukamp-PB':'Ø Siebenkampf-PB',
      'Snitt utnyttelse':'Ø Ausnutzung','Størst uutnyttet potensial':'Größtes ungenutztes Potenzial','født':'geboren'
    }
  };
  function lang(){return localStorage.getItem('mka-language')||'nb'}
  function replaceTextNode(n,map){let s=n.nodeValue;if(!s||!s.trim())return;for(const [a,b] of Object.entries(map)){s=s.replaceAll(a,b)}n.nodeValue=s}
  function polish(){const l=lang();if(l==='nb')return;const map=extra[l];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(n=>replaceTextNode(n,map));
    document.querySelectorAll('button').forEach(b=>{if(/^↻\s*Oppdater$/.test(b.textContent.trim()))b.textContent='↻ '+map['Oppdater']});
    document.querySelectorAll('.status b').forEach(b=>{let s=b.textContent;s=s.replace(/(\d+) øvelse fullført/,`$1 ${map['øvelse fullført']}`).replace(/(\d+) øvelser fullført/,`$1 ${map['øvelser fullført']}`);b.textContent=s});
  }
  const obs=new MutationObserver(()=>{clearTimeout(window.__mkaPolishTimer);window.__mkaPolishTimer=setTimeout(polish,20)});obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  document.addEventListener('click',e=>{if(e.target.closest('.mka-language-switcher'))setTimeout(polish,80)},true);
  setTimeout(polish,150);
})();