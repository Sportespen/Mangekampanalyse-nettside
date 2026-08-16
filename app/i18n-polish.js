(function(){
  const css=document.createElement('style');
  css.textContent=`
    .topbar{position:relative!important}
    #mkaLanguageSwitcher{position:absolute!important;right:calc((100% - min(1240px,calc(100% - 40px)))/2)!important;top:18px!important;display:flex!important;gap:8px!important;z-index:100!important;align-items:center!important;margin:0!important;padding:0!important}
    #mkaLanguageSwitcher button{width:46px!important;height:32px!important;padding:0!important;border:1px solid #315a7d!important;border-radius:7px!important;background-color:#0b2038!important;background-repeat:no-repeat!important;background-position:center!important;background-size:36px 24px!important;font-size:0!important;line-height:0!important;overflow:hidden!important;cursor:pointer!important;opacity:.9!important}
    #mkaLanguageSwitcher button[data-lang="nb"]{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 16'%3E%3Crect width='22' height='16' fill='%23BA0C2F'/%3E%3Cpath d='M0 6h22v4H0zM6 0h4v16H6z' fill='white'/%3E%3Cpath d='M0 7h22v2H0zM7 0h2v16H7z' fill='%2300215B'/%3E%3C/svg%3E")!important}
    #mkaLanguageSwitcher button[data-lang="en"]{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'%3E%3Crect width='60' height='40' fill='%23012169'/%3E%3Cpath d='M0 0l60 40M60 0L0 40' stroke='white' stroke-width='8'/%3E%3Cpath d='M0 0l60 40M60 0L0 40' stroke='%23C8102E' stroke-width='4'/%3E%3Cpath d='M30 0v40M0 20h60' stroke='white' stroke-width='12'/%3E%3Cpath d='M30 0v40M0 20h60' stroke='%23C8102E' stroke-width='7'/%3E%3C/svg%3E")!important}
    #mkaLanguageSwitcher button[data-lang="de"]{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 3'%3E%3Crect width='5' height='1' fill='%23000'/%3E%3Crect width='5' height='1' y='1' fill='%23DD0000'/%3E%3Crect width='5' height='1' y='2' fill='%23FFCE00'/%3E%3C/svg%3E")!important}
    #mkaLanguageSwitcher button.active{border:2px solid #ff8a19!important;background-color:#132f4b!important;opacity:1!important}
    .competition-select-wrap{display:inline-flex!important;width:auto!important;max-width:100%!important}
    #competitionSelect{width:auto;min-width:230px!important;max-width:min(720px,calc(100vw - 90px))!important;text-overflow:clip!important;padding-right:38px!important}
    .feature-card{min-height:146px!important;height:auto!important;padding:16px!important}
    .feature-copy{min-width:0!important}
    .feature-copy strong{line-height:1.08!important;white-space:normal!important}
    .feature-copy small,.status small{line-height:1.35!important;white-space:normal!important}
    @media(max-width:800px){#mkaLanguageSwitcher{right:12px!important;top:12px!important}#mkaLanguageSwitcher button{width:40px!important;height:29px!important;background-size:31px 20px!important}.brand{padding-right:145px!important}.feature-card{min-height:130px!important}#competitionSelect{max-width:calc(100vw - 70px)!important}}
  `;
  document.head.appendChild(css);

  const extra={en:{'Sist oppdatert':'Last updated','Live-resultater kobles inn fortløpende.':'Live results are updated continuously.','Oppdater':'Refresh','øvelse fullført':'event completed','øvelser fullført':'events completed'},de:{'Sist oppdatert':'Zuletzt aktualisiert','Live-resultater kobles inn fortløpende.':'Live-Ergebnisse werden fortlaufend aktualisiert.','Oppdater':'Aktualisieren','øvelse fullført':'Disziplin abgeschlossen','øvelser fullført':'Disziplinen abgeschlossen'}};
  function lang(){return localStorage.getItem('mka-language')||'nb'}
  function sizeCompetitionSelect(){const s=document.querySelector('#competitionSelect');if(!s)return;const txt=s.options?.[s.selectedIndex]?.textContent||'';const cs=getComputedStyle(s),canvas=sizeCompetitionSelect.canvas||(sizeCompetitionSelect.canvas=document.createElement('canvas')),ctx=canvas.getContext('2d');ctx.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;s.style.width=Math.max(230,Math.min(720,Math.ceil(ctx.measureText(txt).width+72)))+'px';}
  function polish(){const l=lang();if(l!=='nb'){const map=extra[l];document.querySelectorAll('.status small').forEach(el=>{let t=el.textContent;Object.entries(map).forEach(([a,b])=>t=t.replaceAll(a,b));el.textContent=t});document.querySelectorAll('button').forEach(b=>{if(/^↻\s*Oppdater$/.test(b.textContent.trim()))b.textContent='↻ '+map.Oppdater});}sizeCompetitionSelect();}
  const obs=new MutationObserver(()=>{clearTimeout(window.__mkaPolishTimer);window.__mkaPolishTimer=setTimeout(polish,30)});obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  document.addEventListener('mka:languagechange',()=>setTimeout(polish,50));
  document.querySelector('#competitionSelect')?.addEventListener('change',sizeCompetitionSelect);window.addEventListener('resize',sizeCompetitionSelect);setTimeout(polish,150);
})();