(function(){
  function eventNameFor(input){
    const i=Number(input?.dataset?.whatif);
    try{return Array.isArray(D?.events)?String(D.events[i]||''):'';}catch(_e){return '';}
  }
  function formatDigits(event,digits){
    const d=String(digits||'').replace(/\D/g,'');
    if(!d)return '';
    const last2=()=>d.length<=2?d:d.slice(0,-2)+','+d.slice(-2);
    if(['100m','110mh','100mh','200m','400m'].includes(event))return last2();
    if(['Lengde','Kule','Høyde','Diskos','Stav','Spyd'].includes(event))return last2();
    if(event==='1500m'||event==='800m'){
      if(d.length<=3)return d;
      if(d.length===4)return d.slice(0,1)+':'+d.slice(1,2)+','+d.slice(2);
      return d.slice(0,-4)+':'+d.slice(-4,-2)+','+d.slice(-2);
    }
    return last2();
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
    input.addEventListener('input',()=>{
      const event=eventNameFor(input);
      const digits=String(input.value||'').replace(/\D/g,'');
      const formatted=formatDigits(event,digits);
      if(input.value!==formatted){input.value=formatted;input.dispatchEvent(new Event('change',{bubbles:true}));}
    });
  }
  function scan(){document.querySelectorAll('[data-whatif]').forEach(upgrade);}
  const mo=new MutationObserver(scan);
  function start(){mo.observe(document.body,{subtree:true,childList:true});scan();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
