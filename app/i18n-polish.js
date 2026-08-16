(function(){
  const css=document.createElement('style');
  css.textContent=`
    #mkaLanguageSwitcher{position:absolute!important;right:max(24px,calc((100vw - 1240px)/2))!important;top:20px!important;display:flex!important;gap:9px!important;z-index:100!important;align-items:center!important;margin:0!important;padding:0!important}
    #mkaLanguageSwitcher button{width:42px!important;height:30px!important;padding:0!important;border:1px solid #315a7d!important;border-radius:6px!important;background-color:#0b2038!important;background-repeat:no-repeat!important;background-position:center!important;background-size:30px 20px!important;font-size:0!important;line-height:0!important;overflow:hidden!important;cursor:pointer!important;opacity:.82!important}
    #mkaLanguageSwitcher button[data-lang="nb"]{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='66' height='48' viewBox='0 0 22 16'%3E%3Crect width='22' height='16' fill='%23BA0C2F'/%3E%3Cpath d='M0 6h22v4H0zM6 0h4v16H6z' fill='white'/%3E%3Cpath d='M0 7h22v2H0zM7 0h2v16H7z' fill='%2300215B'/%3E%3C/svg%3E")!important}
    #mkaLanguageSwitcher button[data-lang="en"]{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='66' height='48' viewBox='0 0 60 40'%3E%3Crect width='60' height='40' fill='%23012169'/%3E%3Cpath d='M0 0l60 40M60 0L0 40' stroke='white' stroke-width='8'/%3E%3Cpath d='M0 0l60 40M60 0L0 40' stroke='%23C8102E' stroke-width='4'/%3E%3Cpath d='M30 0v40M0 20h60' stroke='white' stroke-width='12'/%3E%3Cpath d='M30 0v40M0 20h60' stroke='%23C8102E' stroke-width='7'/%3E%3C/svg%3E")!important}
    #mkaLanguageSwitcher button[data-lang="de"]{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='66' height='48' viewBox='0 0 5 3'%3E%3Crect width='5' height='1' y='0' fill='%23000'/%3E%3Crect width='5' height='1' y='1' fill='%23DD0000'/%3E%3Crect width='5' height='1' y='2' fill='%23FFCE00'/%3E%3C/svg%3E")!important}
    #mkaLanguageSwitcher button.active{border:2px solid #ff8a19!important;background-color:#132f4b!important;opacity:1!important}
    .topbar{position:relative!important}
    .competition-select-wrap{display:inline-flex!important;max-width:100%!important}
    #competitionSelect{max-width:min(620px,calc(100vw - 80px))!important;text-overflow:ellipsis!important}
    .feature-card{min-height:146px!important;height:auto!important;padding:16px!important}
    .feature-copy{min-width:0!important}
    .feature-copy strong{line-height:1.08!important;white-space:normal!important}
    .feature-copy small{line-height:1.35!important;white-space:normal!important}
    .status small{line-height:1.35!important;white-space:normal!important}
    @media(max-width:800px){#mkaLanguageSwitcher{right:12px!important;top:12px!important}#mkaLanguageSwitcher button{width:37px!important;height:28px!important;background-size:27px 18px!important}.brand{padding-right:145px!important}.feature-card{min-height:130px!important}#competitionSelect{max-width:calc(100vw - 70px)!important}}
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

  const eventLabels={
    '100m':{nb:'100m',en:'100m',de:'100 m'},
    '400m':{nb:'400m',en:'400m',de:'400 m'},
    '1500m':{nb:'1500m',en:'1500m',de:'1500 m'},
    '200m':{nb:'200m',en:'200m',de:'200 m'},
    '800m':{nb:'800m',en:'800m',de:'800 m'},
    '110mh':{nb:'110mh',en:'110m hurdles',de:'110 m Hürden'},
    '100mh':{nb:'100mh',en:'100m hurdles',de:'100 m Hürden'},
    'Lengde':{nb:'Lengde',en:'Long jump',de:'Weitsprung'},
    'Kule':{nb:'Kule',en:'Shot put',de:'Kugelstoß'},
    'Høyde':{nb:'Høyde',en:'High jump',de:'Hochsprung'},
    'Diskos':{nb:'Diskos',en:'Discus',de:'Diskuswurf'},
    'Stav':{nb:'Stav',en:'Pole vault',de:'Stabhochsprung'},
    'Spyd':{nb:'Spyd',en:'Javelin',de:'Speerwurf'}
  };
  const eventReverse={};
  Object.entries(eventLabels).forEach(([key,v])=>Object.values(v).forEach(label=>eventReverse[label]=key));

  function lang(){return localStorage.getItem('mka-language')||'nb'}
  function replaceTextNode(n,map){let s=n.nodeValue;if(!s||!s.trim())return;for(const [a,b] of Object.entries(map)){s=s.replaceAll(a,b)}n.nodeValue=s}
  function translateEventSelect(){
    const l=lang(),sel=document.querySelector('#eventSelect');if(!sel)return;
    [...sel.options].forEach((o,i)=>{
      let key=o.dataset.mkaEventKey||eventReverse[o.textContent.trim()];
      if(!key){try{if(typeof D!=='undefined'&&Array.isArray(D.events))key=D.events[Number(o.value)||i]}catch(_){}}
      if(key&&eventLabels[key]){o.dataset.mkaEventKey=key;o.textContent=eventLabels[key][l]||key;}
    });
  }
  function sizeCompetitionSelect(){
    const s=document.querySelector('#competitionSelect');if(!s)return;
    const txt=s.options?.[s.selectedIndex]?.textContent||'';
    const cs=getComputedStyle(s),canvas=sizeCompetitionSelect.canvas||(sizeCompetitionSelect.canvas=document.createElement('canvas'));
    const ctx=canvas.getContext('2d');ctx.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const px=Math.ceil(ctx.measureText(txt).width+58);
    s.style.width=Math.max(190,Math.min(620,px))+'px';
  }
  function polish(){
    const l=lang();
    if(l!=='nb'){
      const map=extra[l];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(n=>replaceTextNode(n,map));
      document.querySelectorAll('button').forEach(b=>{if(/^↻\s*Oppdater$/.test(b.textContent.trim()))b.textContent='↻ '+map['Oppdater']});
      document.querySelectorAll('.status b').forEach(b=>{let s=b.textContent;s=s.replace(/(\d+) øvelse fullført/,`$1 ${map['øvelse fullført']}`).replace(/(\d+) øvelser fullført/,`$1 ${map['øvelser fullført']}`);b.textContent=s});
    }
    translateEventSelect();sizeCompetitionSelect();
  }
  const obs=new MutationObserver(()=>{clearTimeout(window.__mkaPolishTimer);window.__mkaPolishTimer=setTimeout(polish,25)});obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  document.addEventListener('click',e=>{if(e.target.closest('#mkaLanguageSwitcher'))setTimeout(polish,100)},true);
  document.addEventListener('mka:languagechange',()=>setTimeout(polish,30));
  document.querySelector('#competitionSelect')?.addEventListener('change',sizeCompetitionSelect);
  window.addEventListener('resize',sizeCompetitionSelect);
  setTimeout(polish,180);
})();