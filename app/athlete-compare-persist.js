(function(){
  const key=()=>`mangekamp_compare_test_${typeof currentType==='string'?currentType:'men'}`;
  let reloading=false;
  let restoring=false;

  function read(){try{return JSON.parse(localStorage.getItem(key())||'null');}catch(_e){return null;}}
  function write(v){try{localStorage.setItem(key(),JSON.stringify(v));}catch(_e){}}
  function clear(){try{localStorage.removeItem(key());}catch(_e){}}
  function selectedName(){return document.querySelector('#athleteCompareOutput h3')?.textContent?.trim()||'';}

  function captureFromOutput(){
    const name=selectedName();
    if(!name)return;
    const old=read()||{};
    write({...old,name,updatedAt:Date.now()});
  }

  function restoreSelection(){
    const saved=read();
    if(!saved?.name||restoring)return;
    const input=document.querySelector('#athleteCompareSearch');
    const btn=document.querySelector('#athleteCompareBtn');
    if(!input||!btn)return;
    if(selectedName()===saved.name)return;
    restoring=true;
    input.value=saved.name;
    btn.click();
    setTimeout(()=>{
      const results=document.querySelector('#athleteCompareResults');
      const target=[...(results?.querySelectorAll('button[data-name]')||[])].find(b=>b.dataset.name===saved.name);
      if(target)target.click();
      setTimeout(()=>{restoring=false;captureFromOutput();},700);
    },500);
  }

  function ensureBox(){
    const forecast=document.querySelector('#forecast');
    if(!forecast)return;
    if(document.querySelector('#athleteCompareBox')){restoreSelection();return;}
    if(reloading)return;
    reloading=true;
    const s=document.createElement('script');
    s.src='athlete-compare.js?v=persist-'+Date.now();
    s.onload=()=>{reloading=false;setTimeout(restoreSelection,80);};
    s.onerror=()=>{reloading=false;};
    document.body.appendChild(s);
  }

  document.addEventListener('click',ev=>{
    const pick=ev.target.closest?.('#athleteCompareResults button[data-name]');
    if(pick)write({name:pick.dataset.name,updatedAt:Date.now()});
    if(ev.target.closest?.('#removeCompareBtn'))clear();
    if(ev.target.closest?.('.event-switch-btn'))setTimeout(()=>{ensureBox();restoreSelection();},80);
  },true);

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)captureFromOutput();
    else setTimeout(()=>{ensureBox();restoreSelection();},120);
  });
  window.addEventListener('pagehide',captureFromOutput);
  window.addEventListener('pageshow',()=>setTimeout(()=>{ensureBox();restoreSelection();},150));

  const mo=new MutationObserver(()=>{
    captureFromOutput();
    ensureBox();
  });
  function start(){mo.observe(document.body,{subtree:true,childList:true});ensureBox();restoreSelection();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
