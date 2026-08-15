(function(){
  function eventNameFor(input){
    const i=Number(input?.dataset?.whatif);
    try{return Array.isArray(D?.events)?String(D.events[i]||''):'';}catch(_e){return '';}
  }
  function maxDigits(event){
    if(['Lengde','Høyde','Stav'].includes(event))return 3;
    if(['100m','110mh','100mh','200m','400m','Kule','Diskos','Spyd'].includes(event))return 4;
    if(event==='800m'||event==='1500m')return 5;
    return 4;
  }
  function formatDigits(event,digits){
    const max=maxDigits(event);
    const d=String(digits||'').replace(/\D/g,'').slice(0,max);
    if(!d)return '';
    if(['100m','110mh','100mh','200m','400m','Kule','Diskos','Spyd'].includes(event)){
      if(d.length<=2)return d;
      return d.slice(0,-2)+','+d.slice(-2);
    }
    if(['Lengde','Høyde','Stav'].includes(event)){
      if(d.length<=1)return d;
      return d.slice(0,-2)+','+d.slice(-2);
    }
    if(event==='800m'||event==='1500m'){
      if(d.length<=2)return d;
      if(d.length===3)return d.slice(0,1)+':'+d.slice(1);
      if(d.length===4)return d.slice(0,1)+':'+d.slice(1,2)+','+d.slice(2);
      return d.slice(0,1)+':'+d.slice(1,3)+','+d.slice(3,5);
    }
    if(d.length<=2)return d;
    return d.slice(0,-2)+','+d.slice(-2);
  }
  function normalize(input){
    const event=eventNameFor(input);
    const digits=String(input.value||'').replace(/\D/g,'');
    const formatted=formatDigits(event,digits);
    if(input.value!==formatted){
      input.value=formatted;
      try{input.setSelectionRange(formatted.length,formatted.length);}catch(_e){}
    }
  }
  function upgrade(input){
    if(!input||input.dataset.digitInputReady==='1')return;
    input.dataset.digitInputReady='1';
    input.setAttribute('inputmode','numeric');
    input.setAttribute('pattern','[0-9]*');
    input.setAttribute('autocomplete','off');
    input.placeholder='Kun tall';
    input.addEventListener('beforeinput',ev=>{
      if(ev.inputType==='insertText'&&ev.data&&/\D/.test(ev.data))ev.preventDefault();
    });
    normalize(input);
  }
  /* Capture phase is essential: format the visible digits BEFORE athlete-compare.js
     recalculates the score on its normal input listener. Without this, raw partial
     values such as 1080 could momentarily be interpreted as 1.08 / 1080 seconds. */
  document.addEventListener('input',ev=>{
    const input=ev.target?.closest?.('[data-whatif]');
    if(input)normalize(input);
  },true);
  function scan(){document.querySelectorAll('[data-whatif]').forEach(upgrade);}
  const mo=new MutationObserver(scan);
  function start(){mo.observe(document.body,{subtree:true,childList:true});scan();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
