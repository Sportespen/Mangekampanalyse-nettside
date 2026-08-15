(function(){
  const nativeFetch=window.fetch.bind(window);
  function ensureIndicator(){
    const input=document.querySelector('#athleteCompareSearch');if(!input)return null;
    const row=input.parentElement;if(!row)return null;
    let el=document.querySelector('#athleteCompareBusy');
    if(!el){
      el=document.createElement('span');el.id='athleteCompareBusy';
      el.style.cssText='display:none;align-items:center;gap:7px;color:#d8e6f3;font-weight:800;white-space:nowrap;margin-left:4px';
      el.innerHTML='<span class="compare-hourglass" style="display:inline-block;font-size:20px">⌛</span><span>Analyserer…</span>';
      row.appendChild(el);
      if(!document.querySelector('#athleteCompareBusyStyle')){
        const st=document.createElement('style');st.id='athleteCompareBusyStyle';st.textContent='@keyframes compareHourglass{0%{transform:rotate(0deg)}45%{transform:rotate(0deg)}55%{transform:rotate(180deg)}95%{transform:rotate(180deg)}100%{transform:rotate(360deg)}} #athleteCompareBusy .compare-hourglass{animation:compareHourglass 1.4s linear infinite;transform-origin:center}';document.head.appendChild(st);
      }
    }
    return el;
  }
  function busy(on){
    const el=ensureIndicator();if(el)el.style.display=on?'inline-flex':'none';
    const btn=document.querySelector('#athleteCompareBtn');if(btn){btn.disabled=!!on;btn.style.opacity=on?'0.55':'1';btn.style.cursor=on?'wait':'pointer';}
  }
  window.fetch=async function(input,init){
    let isAnalyse=false;
    try{const raw=typeof input==='string'?input:(input&&input.url)||'',u=new URL(raw,location.href);isAnalyse=u.pathname==='/api/athlete-search-v2'&&u.searchParams.get('action')==='analyse';}catch(_e){}
    if(isAnalyse)busy(true);
    try{return await nativeFetch(input,init);}finally{if(isAnalyse)busy(false);}
  };
  const mo=new MutationObserver(()=>ensureIndicator());
  function start(){mo.observe(document.body,{subtree:true,childList:true});ensureIndicator();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();