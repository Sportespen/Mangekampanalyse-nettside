(function(){
  const nativeFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    try{
      const raw=typeof input==='string'?input:(input&&input.url)||'';
      const u=new URL(raw,location.href);
      if(u.pathname==='/api/athlete-search'){
        u.pathname='/api/athlete-search-v2';
        input=typeof input==='string'?u.toString():new Request(u.toString(),input);
      }
    }catch(_e){}
    return nativeFetch(input,init);
  };

  const key=()=>`mangekamp_compare_test_${typeof currentType==='string'?currentType:'men'}`;
  let restoring=false;

  function updatePlaceholder(){
    const input=document.querySelector('#athleteCompareSearch');
    if(!input)return;
    input.placeholder=(typeof currentType==='string'&&currentType==='women')
      ? 'Skriv navn, f.eks. Miranda Lauvstad'
      : 'Skriv navn, f.eks. Jonathan Hertwig';
  }
  function updateModalSize(){
    const modal=document.querySelector('#modal');
    const card=modal?.querySelector('.modal-card');
    if(!card)return;
    card.style.width='min(920px, calc(100vw - 32px))';
    card.style.maxWidth='920px';
    card.style.maxHeight='86vh';
    card.style.overflow='auto';
    card.style.boxSizing='border-box';
    const tableWrap=card.querySelector('.table-wrap');
    if(tableWrap){tableWrap.style.overflowX='auto';tableWrap.style.maxWidth='100%';}
  }
  function read(){try{return JSON.parse(localStorage.getItem(key())||'null');}catch(_e){return null;}}
  function write(name){try{if(name)localStorage.setItem(key(),JSON.stringify({name}));}catch(_e){}}
  function clear(){try{localStorage.removeItem(key());}catch(_e){}}
  function selectedName(){return document.querySelector('#athleteCompareOutput h3')?.textContent?.trim()||'';}
  function capture(){const name=selectedName();if(name)write(name);}
  function restore(){
    const saved=read();
    const input=document.querySelector('#athleteCompareSearch');
    const btn=document.querySelector('#athleteCompareBtn');
    if(!saved?.name||!input||!btn||restoring||selectedName()===saved.name)return;
    restoring=true;
    input.value=saved.name;
    btn.click();
    setTimeout(()=>{
      const target=[...document.querySelectorAll('#athleteCompareResults button[data-name]')].find(b=>b.dataset.name===saved.name);
      if(target)target.click();
      setTimeout(()=>{restoring=false;capture();},650);
    },450);
  }
  function refresh(){updatePlaceholder();updateModalSize();capture();}

  document.addEventListener('click',ev=>{
    const pick=ev.target.closest?.('#athleteCompareResults button[data-name]');
    if(pick)write(pick.dataset.name);
    if(ev.target.closest?.('#removeCompareBtn'))clear();
    if(ev.target.closest?.('.event-switch-btn'))setTimeout(()=>{updatePlaceholder();restore();},120);
    if(ev.target.closest?.('[data-basis],#whatIfBtn'))setTimeout(updateModalSize,0);
  },true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)capture();else setTimeout(restore,150);});
  window.addEventListener('pagehide',capture);
  window.addEventListener('pageshow',()=>setTimeout(restore,180));

  const mo=new MutationObserver(refresh);
  function start(){mo.observe(document.body,{subtree:true,childList:true});refresh();setTimeout(restore,250);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
