(function(){
  function eventNameFor(input){
    const i=Number(input?.dataset?.whatif);
    try{return Array.isArray(D?.events)?String(D.events[i]||''):'';}catch(_e){return '';}
  }
  function maxDigits(event){
    if(['100m','110mh','100mh','200m'].includes(event))return 4;      // 10,90 / 23,50
    if(event==='400m')return 4;                                     // 47,50
    if(['Lengde','Høyde','Stav'].includes(event))return 3;           // 7,20 / 1,92 / 4,60
    if(['Kule','Diskos','Spyd'].includes(event))return 4;            // 15,00 / 45,00 / 60,00
    if(['800m','1500m'].includes(event))return 5;                    // 21000 -> 2:10,00 / 42000 -> 4:20,00
    return 5;
  }
  function formatDigits(event,digits){
    let d=String(digits||'').replace(/\D/g,'');
    d=d.slice(0,maxDigits(event));
    if(!d)return '';
    if(['Lengde','Høyde','Stav'].includes(event)){
      if(d.length===1)return d;
      if(d.length===2)return d[0]+','+d[1];
      return d[0]+','+d.slice(1);
    }
    if(['100m','110mh','100mh','200m','400m','Kule','Diskos','Spyd'].includes(event)){
      if(d.length<=2)return d;
      return d.slice(0,-2)+','+d.slice(-2);
    }
    if(event==='800m'||event==='1500m'){
      if(d.length<=3)return d;
      if(d.length===4)return d.slice(0,1)+':'+d.slice(1,2)+','+d.slice(2);
      return d.slice(0,1)+':'+d.slice(1,3)+','+d.slice(3,5);
    }
    return d;
  }
  function upgrade(input){
    if(!input||input.dataset.digitInputReady==='2')return;
    input.dataset.digitInputReady='2';
    input.setAttribute('inputmode','numeric');
    input.setAttribute('pattern','[0-9]*');
    input.setAttribute('autocomplete','off');
    input.placeholder='Kun tall';
    input.addEventListener('beforeinput',ev=>{
      if(ev.inputType==='insertText'&&ev.data&&/\D/.test(ev.data))ev.preventDefault();
    });
    input.addEventListener('input',()=>{
      const event=eventNameFor(input);
      const digits=String(input.value||'').replace(/\D/g,'').slice(0,maxDigits(event));
      const formatted=formatDigits(event,digits);
      if(input.value!==formatted){
        input.value=formatted;
        try{input.setSelectionRange(formatted.length,formatted.length);}catch(_e){}
        input.dispatchEvent(new Event('change',{bubbles:true}));
      }
    });
  }
  function scan(){document.querySelectorAll('[data-whatif]').forEach(upgrade);}
  const mo=new MutationObserver(scan);
  function start(){mo.observe(document.body,{subtree:true,childList:true});scan();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
