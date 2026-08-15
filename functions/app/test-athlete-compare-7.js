export async function onRequestGet({request}){
  const u=new URL(request.url);
  const source=new URL('/app/test-athlete-compare.html?source=7',u.origin);
  const r=await fetch(source.toString(),{headers:{'Cache-Control':'no-cache'}});
  let html=await r.text();
  html=html
    .replace("athlete-compare-jonathan-fix.js?v=20260815-1","athlete-compare-jonathan-fix.js?v=20260815-7")
    .replace("athlete-compare.js?v=20260815-test6","athlete-compare.js?v=20260815-test7")
    .replace("athlete-compare-placeholder.js?v=20260815-6","athlete-compare-placeholder.js?v=20260815-7")
    .replace("20260815-athlete-compare-test6","20260815-athlete-compare-test7");
  return new Response(html,{status:r.status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
}
