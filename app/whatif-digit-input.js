(function(){
  function eventNameFor(input){
    const i=Number(input?.dataset?.whatif);
    try{return Array.isArray(D?.events)?String(D.events[i]||''):'';}catch(_e){return '';}
  }
  function requiredDigits(event){
    if(['Lengde','Høyde','Stav'].includes(event))return 3;
    if(['100m','110mh','100mh','200m','400m','Kule','Diskos','Spyd'].includes(event))return 4;
    if(event==='1500m'||event==='800m')return 5;
    return 4;
  }
  function placeholderFor(event){
    if(['Lengde','Høyde','Stav'].includes(event))return '0,00';
    if(event==='1500m'||event==='800m')return '0:00,00';
    return '00,00';
  }
  function formatDigits(event,digits){
    const req=requiredDigits(event);
    const d=String(digits||'').replace(/\D/g,'').slice(0,req);
    if(!d)return '';
    if(['100m','110mh','100mh','200m','400m','Kule','Diskos','Spyd'].includes(event)){
      if(d.length<3)return d;
      return d.slice(0,-2)+','+d.slice(-2);
    }
    if(['Lengde','Høyde','Stav'].includes(event)){
      if(d.length<2)return d;
      return d.slice(0,-2)+','+d.slice(-2);
    }
    if(event==='1500m'||event==='800m'){
      if(d.length<5)return d;
      return d.slice(0,1)+':'+d.slice(1,3)+','+d.slice(3,5);
    }
    if(d.length<3)return d;
    return d.slice(0,-2)+','+d.slice(-2);
  }
  function digitCount(input){return String(input?.value||'').replace(/\D/g,'').length;}
  function isCompleteOrEmpty(input){const n=digitCount(input);return n===0||n===requiredDigits(eventNameFor(input));}
  function validate(input){
    const event=eventNameFor(input),req=requiredDigits(event),digits=digitCount(input),ok=digits===0||digits===req;
    input.dataset.exactDigits=ok?'1':'0';input.style.borderColor=ok?'#456783':'#ff9f43';input.title=ok?'':`Skriv nøyaktig ${req} tall før du går videre`;return ok;
  }
  function updateApply(){
    const apply=document.querySelector('#whatIfApply');if(!apply)return;
    const bad=[...document.querySelectorAll('[data-whatif]')].some(x=>String(x.value||'').trim()&&!isCompleteOrEmpty(x));
    apply.disabled=bad;apply.style.opacity=bad?'0.45':'1';apply.style.cursor=bad?'not-allowed':'pointer';apply.title=bad?'Fyll inn riktig antall tall i alle brukte felt':'';
  }
  function normalize(input){
    const event=eventNameFor(input),req=requiredDigits(event),digits=String(input.value||'').replace(/\D/g,'').slice(0,req),formatted=formatDigits(event,digits);
    if(input.value!==formatted){input.value=formatted;try{input.setSelectionRange(formatted.length,formatted.length);}catch(_e){}}
    validate(input);updateApply();
  }
  function fields(){return [...document.querySelectorAll('[data-whatif]')];}
  function move(input,dir){const list=fields(),i=list.indexOf(input),next=list[i+dir];if(next){next.focus();try{next.setSelectionRange(next.value.length,next.value.length);}catch(_e){}}}
  function blockLeave(input){if(isCompleteOrEmpty(input))return false;validate(input);input.focus();try{input.setSelectionRange(input.value.length,input.value.length);}catch(_e){}return true;}
  function upgrade(input){
    if(!input||input.dataset.digitInputReady==='1')return;input.dataset.digitInputReady='1';
    const event=eventNameFor(input);input.setAttribute('inputmode','numeric');input.setAttribute('pattern','[0-9]*');input.setAttribute('autocomplete','off');input.placeholder=placeholderFor(event);
    input.addEventListener('beforeinput',ev=>{if(ev.inputType==='insertText'&&ev.data&&/\D/.test(ev.data))ev.preventDefault();});
    input.addEventListener('keydown',ev=>{if(ev.key==='ArrowDown'||ev.key==='ArrowUp'||ev.key==='Tab'){if(blockLeave(input)){ev.preventDefault();ev.stopPropagation();return;}if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){ev.preventDefault();move(input,ev.key==='ArrowDown'?1:-1);}}});
    input.addEventListener('blur',()=>{if(!isCompleteOrEmpty(input))setTimeout(()=>{if(document.querySelector('#modal.open'))blockLeave(input);},0);});normalize(input);
  }
  document.addEventListener('input',ev=>{const input=ev.target?.closest?.('[data-whatif]');if(input)normalize(input);},true);
  const mo=new MutationObserver(()=>document.querySelectorAll('[data-whatif]').forEach(upgrade));
  function start(){mo.observe(document.body,{subtree:true,childList:true});document.querySelectorAll('[data-whatif]').forEach(upgrade);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();