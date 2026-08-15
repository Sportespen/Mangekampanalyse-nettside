(function(){
  function eventNameFor(input){
    const i=Number(input?.dataset?.whatif);
    try{return Array.isArray(D?.events)?String(D.events[i]||''):'';}catch(_e){return '';}
  }
  function requiredDigits(event){
    if(['Lengde','Høyde','Stav'].includes(event))return 3;
    if(['100m','110mh','100mh','200m','400m','Kule','Diskos','Spyd'].includes(event))return 4;
    if(event==='1500m')return 6;
    if(event==='800m')return 5;
    return 4;
  }
  function maskFor(event){
    if(['Lengde','Høyde','Stav'].includes(event))return '0,00';
    if(['100m','110mh','100mh','200m','400m','Kule','Diskos','Spyd'].includes(event))return '00,00';
    if(event==='1500m')return '0:00,00';
    if(event==='800m')return '0:00,00';
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
    if(event==='1500m'){
      if(d.length<6)return d;
      const min=String(Number(d.slice(0,2)));
      return min+':'+d.slice(2,4)+','+d.slice(4,6);
    }
    if(event==='800m'){
      if(d.length<5)return d;
      return d.slice(0,1)+':'+d.slice(1,3)+','+d.slice(3,5);
    }
    if(d.length<3)return d;
    return d.slice(0,-2)+','+d.slice(-2);
  }
  function validate(input){
    const event=eventNameFor(input);
    const req=requiredDigits(event);
    const digits=String(input.value||'').replace(/\D/g,'');
    const ok=!digits.length||digits.length===req;
    input.dataset.exactDigits=ok?'1':'0';
    input.style.borderColor=ok?'#456783':'#ff9f43';
    input.title=ok?'':`Skriv nøyaktig ${req} tall`;
    return ok;
  }
  function updateApply(){
    const apply=document.querySelector('#whatIfApply');
    if(!apply)return;
    const bad=[...document.querySelectorAll('[data-whatif]')].some(x=>String(x.value||'').trim()&&x.dataset.exactDigits!=='1');
    apply.disabled=bad;
    apply.style.opacity=bad?'0.45':'1';
    apply.style.cursor=bad?'not-allowed':'pointer';
    apply.title=bad?'Fyll inn riktig antall tall i alle brukte felt':'';
  }
  function normalize(input){
    const event=eventNameFor(input);
    const req=requiredDigits(event);
    const digits=String(input.value||'').replace(/\D/g,'').slice(0,req);
    const formatted=formatDigits(event,digits);
    if(input.value!==formatted){input.value=formatted;try{input.setSelectionRange(formatted.length,formatted.length);}catch(_e){}}
    validate(input);updateApply();
  }
  function focusSibling(input,dir){
    const fields=[...document.querySelectorAll('[data-whatif]')];
    const i=fields.indexOf(input);
    const next=fields[i+dir];
    if(!next)return;
    next.focus();
    try{next.setSelectionRange(next.value.length,next.value.length);}catch(_e){}
  }
  function upgrade(input){
    if(!input||input.dataset.digitInputReady==='1')return;
    input.dataset.digitInputReady='1';
    const event=eventNameFor(input);
    input.setAttribute('inputmode','numeric');
    input.setAttribute('pattern','[0-9]*');
    input.setAttribute('autocomplete','off');
    input.placeholder=maskFor(event);
    input.addEventListener('beforeinput',ev=>{if(ev.inputType==='insertText'&&ev.data&&/\D/.test(ev.data))ev.preventDefault();});
    input.addEventListener('keydown',ev=>{
      if(ev.key==='ArrowDown'){ev.preventDefault();focusSibling(input,1);}
      else if(ev.key==='ArrowUp'){ev.preventDefault();focusSibling(input,-1);}
    });
    normalize(input);
  }
  document.addEventListener('input',ev=>{const input=ev.target?.closest?.('[data-whatif]');if(input)normalize(input);},true);
  function scan(){document.querySelectorAll('[data-whatif]').forEach(upgrade);updateApply();}
  const mo=new MutationObserver(scan);
  function start(){mo.observe(document.body,{subtree:true,childList:true});scan();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
