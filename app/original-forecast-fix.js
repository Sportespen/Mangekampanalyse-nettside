(function(){
  let lastAthlete=null;
  function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,' ').trim().toLowerCase();}
  function isTimeEvent(name){return ['100m','400m','110mh','1500m','100mh','200m','800m'].includes(name);}
  function historyFor(name){const h=window.MANGEKAMP_HISTORY||{};if(h[name])return h[name];const n=norm(name);for(const [k,v] of Object.entries(h)){if(norm(k)===n)return v;}return null;}
  function entry(raw){if(raw==null)return null;if(Array.isArray(raw)){const mark=Number(raw[0]);if(!Number.isFinite(mark))return null;return{mark,year:String(raw[3]||''),date:String(raw[4]||''),venue:String(raw[2]||''),competition:String(raw[5]||'')};}const mark=Number(raw.mark??raw.value??raw.result??raw.result_mark);if(!Number.isFinite(mark))return null;const date=String(raw.result_date??raw.date??'');return{mark,year:String(raw.year??(date.match(/\b(19|20)\d{2}\b/)?.[0]||'')),date,venue:String(raw.venue??raw.place??raw.location??''),competition:String(raw.competition??raw.meeting??'')};}
  function currentMeet(r){const c=(r.competition+' '+r.venue).toLowerCase();const d=Date.parse(r.date||'');return (Number.isFinite(d)&&d>=Date.parse('2026-08-12T00:00:00Z'))&&(c.includes('birmingham')||c.includes('european athletics championships'));
  }
  function predictedMark(a,i){const eventName=D.events[i],src=historyFor(a.name)?.[eventName]||[],rows=[];for(const raw of src){const r=entry(raw);if(!r||!['2025','2026'].includes(r.year)||currentMeet(r))continue;rows.push(r);if(rows.length===4)break;}if(!rows.length)return null;rows.sort((x,y)=>isTimeEvent(eventName)?x.mark-y.mark:y.mark-x.mark);const used=rows.length>=4?rows.slice(0,3):rows;return used.reduce((s,r)=>s+r.mark,0)/used.length;
  }
  function originalTotal(a){let sum=0;for(let i=0;i<D.events.length;i++){let mark=predictedMark(a,i);if(!Number.isFinite(mark)){const fallback=Number(a?.predicted?.[i]??a?.forecast?.[i]??a?.expected?.[i]);if(Number.isFinite(fallback))mark=fallback;}if(!Number.isFinite(mark))return null;const pts=Number(scoreEvent(i,mark));if(!Number.isFinite(pts))return null;sum+=pts;}return sum;
  }
  window.addEventListener('click',function(ev){const cell=ev.target.closest?.('.forecast-total-cell');if(!cell)return;const name=cell.closest('tr')?.querySelector('td.name')?.textContent?.trim();lastAthlete=(D.athletes||[]).find(a=>norm(a.name)===norm(name))||null;},true);
  const observer=new MutationObserver(function(){const box=document.querySelector('.forecast-score-dropdown');if(!box||!lastAthlete)return;const rows=box.querySelectorAll(':scope > div');if(rows.length<3)return;const old=originalTotal(lastAthlete);const current=Number((rows[0].querySelector('b')?.textContent||'').replace(/[^0-9.-]/g,''));const oldB=rows[1].querySelector('b'),diffB=rows[2].querySelector('b');if(oldB)oldB.textContent=Number.isFinite(old)?String(old):'—';if(diffB){const diff=Number.isFinite(current)&&Number.isFinite(old)?current-old:null;diffB.textContent=diff==null?'—':(diff>0?'+':'')+diff;}
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();
