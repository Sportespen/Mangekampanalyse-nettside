(function(){
  const nativeFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    try{
      const raw=typeof input==='string'?input:input?.url;
      if(typeof raw==='string'&&raw.startsWith('/api/athlete-search?')){
        const next=raw.replace('/api/athlete-search?','/api/athlete-search-v2?');
        return nativeFetch(next,init);
      }
    }catch(_e){}
    return nativeFetch(input,init);
  };
})();
