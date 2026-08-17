(function(){
  function ensureFlags(){
    if(document.querySelector('#mkaLanguageSwitcher')) return;
    const langs=[['nb','🇳🇴','Norsk'],['en','🇬🇧','English'],['de','🇩🇪','Deutsch']];
    if(!document.querySelector('#mka-language-flags-style')){
      const s=document.createElement('style');
      s.id='mka-language-flags-style';
      s.textContent=`.topbar{display:flex!important;align-items:center!important}#mkaLanguageSwitcher{margin-left:auto!important;display:flex!important;align-items:center!important;gap:7px!important;padding:0 16px!important;flex:0 0 auto!important;visibility:visible!important;opacity:1!important;z-index:1000!important}#mkaLanguageSwitcher button{width:42px!important;height:34px!important;border:1px solid #355b7c!important;border-radius:8px!important;background:#0b2038!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:22px!important;line-height:1!important;cursor:pointer!important;opacity:.78!important;padding:0!important}#mkaLanguageSwitcher button.active{opacity:1!important;border-color:#7b5cff!important;box-shadow:0 0 0 2px #6f4cff33!important;background:#102d4b!important}@media(max-width:650px){#mkaLanguageSwitcher{gap:4px!important;padding:0 8px!important}#mkaLanguageSwitcher button{width:36px!important;height:31px!important;font-size:19px!important}}`;
      document.head.appendChild(s);
    }
    const w=document.createElement('div');w.id='mkaLanguageSwitcher';w.setAttribute('role','group');w.setAttribute('aria-label','Språk');
    const current=localStorage.getItem('mka-language')||'nb';
    langs.forEach(([code,flag,label])=>{const b=document.createElement('button');b.type='button';b.dataset.lang=code;b.textContent=flag;b.title=label;b.setAttribute('aria-label',label);b.classList.toggle('active',code===current);b.onclick=()=>{localStorage.setItem('mka-language',code);w.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.lang===code));if(window.MKA_I18N?.setLanguage)window.MKA_I18N.setLanguage(code);else document.dispatchEvent(new CustomEvent('mka:languagechange',{detail:{language:code}}));};w.appendChild(b);});
    (document.querySelector('.topbar')||document.querySelector('header')||document.body).appendChild(w);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureFlags);else ensureFlags();
  setTimeout(ensureFlags,500);
})();