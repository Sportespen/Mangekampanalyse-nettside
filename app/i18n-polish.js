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
    #athleteCompareBox .table-wrap{overflow-x:auto!important;-webkit-overflow-scrolling:touch}
    #athleteCompareBox table[data-compact-compare-row="1"]{min-width:1180px!important}
    @media(max-width:1100px){
      main,.site-footer{padding-left:16px!important;padding-right:16px!important}
      .hero-row{gap:16px!important}
      .feature-tabs{grid-template-columns:1fr!important;max-width:760px!important}
      .feature-card{min-height:132px!important}
      .feature-logo{width:108px!important;height:108px!important;flex-basis:108px!important}
      .feature-copy strong{font-size:19px!important}
      .panel-head{gap:12px!important}
      #mkaLanguageSwitcher{right:18px!important}
    }
    @media(max-width:800px){
      .topbar{padding:10px 12px!important;min-height:92px!important;align-items:flex-start!important}
      .brand{max-width:calc(100% - 150px)!important;gap:8px!important}
      .brand img{width:62px!important;height:62px!important;flex-basis:62px!important}
      .brand h1{font-size:20px!important;line-height:1.05!important;white-space:normal!important;word-break:break-word!important}
      .tagline{font-size:10px!important;line-height:1.25!important;border-top-width:3px!important}
      #mkaLanguageSwitcher{right:10px!important;top:12px!important;gap:5px!important}
      #mkaLanguageSwitcher button{width:38px!important;height:28px!important;background-size:29px 19px!important}
      main{padding:10px!important}
      .hero-row{flex-direction:column!important;align-items:stretch!important;gap:12px!important}
      .hero-left{min-width:0!important;width:100%!important}
      #competitionSelect{min-width:0!important;width:100%!important;max-width:100%!important}
      .competition-select-wrap{display:flex!important;width:100%!important}
      .event-switch{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}
      .event-switch-btn{width:100%!important;padding:10px 8px!important;font-size:12px!important}
      .hero-row h2{font-size:25px!important}
      .status{width:100%!important;min-width:0!important}
      .feature-tabs{display:grid!important;grid-template-columns:1fr!important;gap:10px!important;margin:12px 0!important}
      .feature-card{min-height:112px!important;padding:10px!important;gap:12px!important;border-radius:14px!important}
      .feature-logo{width:88px!important;height:88px!important;flex-basis:88px!important}
      .feature-copy strong{font-size:16px!important}
      .feature-copy small{font-size:11px!important;max-width:none!important}
      .panel{min-height:0!important;border-radius:10px!important}
      .panel-head{padding:12px!important;flex-direction:column!important;align-items:stretch!important}
      .panel-head h3{font-size:18px!important}
      .panel-head p{font-size:12px!important;line-height:1.45!important}
      .stats{gap:10px!important;padding:12px!important;font-size:12px!important}
      #athleteCompareBox{padding:11px!important;margin-top:12px!important;border-radius:10px!important}
      #athleteCompareBox h3{font-size:17px!important}
      #athleteCompareBox p{font-size:12px!important}
      #athleteCompareSearch{font-size:14px!important;padding:10px 11px!important}
      #athleteCompareBtn{padding:9px 11px!important}
      #athleteCompareOutput .table-wrap{margin-left:-1px!important;margin-right:-1px!important}
      .modal{padding:6px!important}
      .modal-card{width:100%!important;max-width:none!important;max-height:96vh!important;padding:16px 12px!important;border-radius:8px!important}
      .modal-card h2{font-size:20px!important;padding-right:34px!important}
      .basis-summary{grid-template-columns:1fr 1fr!important}
      .site-footer{padding:16px 12px 22px!important;font-size:11px!important}
    }
    @media(max-width:520px){
      .brand{max-width:calc(100% - 128px)!important}
      .brand img{width:52px!important;height:52px!important;flex-basis:52px!important}
      .brand h1{font-size:17px!important}
      #mkaLanguageSwitcher button{width:35px!important;height:26px!important;background-size:27px 18px!important}
      .event-switch{grid-template-columns:1fr!important}
      .feature-card{align-items:flex-start!important}
      .feature-logo{width:76px!important;height:76px!important;flex-basis:76px!important}
      .feature-copy strong{font-size:15px!important}
      .feature-copy small{font-size:10.5px!important}
      .hero-row h2{font-size:22px!important}
      .status{padding:11px!important}
      .basis-summary{grid-template-columns:1fr!important}
      .basis-summary>div+div{border-left:0!important;border-top:1px solid #456783!important}
    }
  `;
  document.head.appendChild(css);

  const extra={en:{'Sist oppdatert':'Last updated','Live-resultater kobles inn fortløpende.':'Live results are updated continuously.','Oppdater':'Refresh','øvelse fullført':'event completed','øvelser fullført':'events completed'},de:{'Sist oppdatert':'Zuletzt aktualisiert','Live-resultater kobles inn fortløpende.':'Live-Ergebnisse werden fortlaufend aktualisiert.','Oppdater':'Aktualisieren','øvelse fullført':'Disziplin abgeschlossen','øvelser fullført':'Disziplinen abgeschlossen'}};
  const brand={nb:'MANGEKAMPANALYSE',en:'COMBINED EVENTS ANALYSIS',de:'MEHRKAMPFANALYSE'};
  function lang(){return localStorage.getItem('mka-language')||'nb'}
  function sizeCompetitionSelect(){const s=document.querySelector('#competitionSelect');if(!s)return;if(window.innerWidth<=800){s.style.width='100%';return;}const txt=s.options?.[s.selectedIndex]?.textContent||'';const cs=getComputedStyle(s),canvas=sizeCompetitionSelect.canvas||(sizeCompetitionSelect.canvas=document.createElement('canvas')),ctx=canvas.getContext('2d');ctx.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;s.style.width=Math.max(230,Math.min(720,Math.ceil(ctx.measureText(txt).width+72)))+'px';}
  function polish(){const l=lang(),h1=document.querySelector('.brand h1');if(h1)h1.textContent=brand[l]||brand.nb;if(l!=='nb'){const map=extra[l];document.querySelectorAll('.status small').forEach(el=>{let t=el.textContent;Object.entries(map).forEach(([a,b])=>t=t.replaceAll(a,b));el.textContent=t});document.querySelectorAll('button').forEach(b=>{if(/^↻\s*Oppdater$/.test(b.textContent.trim()))b.textContent='↻ '+map.Oppdater});}sizeCompetitionSelect();}
  const obs=new MutationObserver(()=>{clearTimeout(window.__mkaPolishTimer);window.__mkaPolishTimer=setTimeout(polish,30)});obs.observe(document.body,{childList:true,subtree:true,characterData:true});document.addEventListener('mka:languagechange',()=>setTimeout(polish,50));document.querySelector('#competitionSelect')?.addEventListener('change',sizeCompetitionSelect);window.addEventListener('resize',sizeCompetitionSelect);setTimeout(polish,150);
})();