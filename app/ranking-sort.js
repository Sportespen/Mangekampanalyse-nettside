let rankingSort={key:'rank',dir:'asc'};
const rankingHeaderMeta=[
  {key:'rank',type:'number',tip:'Plassering basert på personlig beste i valgt øvelse.'},
  {key:'nation',type:'text',tip:'Nasjon utøveren representerer.'},
  {key:'name',type:'text',tip:'Utøverens navn.'},
  {key:'result',type:'number',tip:'Utøverens personlige beste i valgt øvelse.'},
  {key:'points',type:'number',tip:'Mangekamppoeng for det personlige beste-resultatet.'},
  {key:'year',type:'number',tip:'Året det personlige beste-resultatet ble oppnådd.'},
  {key:'venue',type:'text',tip:'Stedet der det personlige beste-resultatet ble oppnådd.'}
];
function setupRankingHeaders(){
  document.querySelectorAll('#ranking thead th').forEach((th,i)=>{
    const meta=rankingHeaderMeta[i]; if(!meta)return;
    th.classList.add('sortable-head');
    th.dataset.rankingSortKey=meta.key;
    th.title=meta.tip+' Klikk på overskriften for å sortere.';
    th.onclick=()=>{
      if(rankingSort.key===meta.key) rankingSort.dir=rankingSort.dir==='asc'?'desc':'asc';
      else rankingSort={key:meta.key,dir:meta.type==='text'?'asc':'desc'};
      renderRanking();
    };
  });
}
const renderRankingBase=renderRanking;
renderRanking=function(){
  let i=+($('#eventSelect').value||0),e=D.events[i];
  let lower=['100m','400m','110mh','1500m','100mh','200m','800m'].includes(e);
  let base=D.athletes.map(x=>({x,v:x.best?.[i]})).filter(o=>o.v!=null);
  base.sort((a,b)=>lower?a.v-b.v:b.v-a.v);
  base.forEach((o,k)=>o.rank=k+1);
  let arr=[...base].sort((a,b)=>{
    let av,bv,meta=rankingHeaderMeta.find(m=>m.key===rankingSort.key)||rankingHeaderMeta[0];
    if(rankingSort.key==='rank'){av=a.rank;bv=b.rank}
    else if(rankingSort.key==='nation'){av=a.x.nation;bv=b.x.nation}
    else if(rankingSort.key==='name'){av=a.x.name;bv=b.x.name}
    else if(rankingSort.key==='result'){av=a.v;bv=b.v}
    else if(rankingSort.key==='year'){av=pbYear(a.x,i);bv=pbYear(b.x,i)}
    else if(rankingSort.key==='venue'){av=pbVenue(a.x,i);bv=pbVenue(b.x,i)}
    else {av=scoreEvent(i,a.v);bv=scoreEvent(i,b.v)}
    let c=meta.type==='text'?String(av??'').localeCompare(String(bv??''),'nb',{sensitivity:'base'}):(Number(av)||0)-(Number(bv)||0);
    return rankingSort.dir==='asc'?c:-c;
  });
  document.querySelectorAll('#ranking thead th').forEach(th=>{
    th.classList.remove('sort-asc','sort-desc');
    if(th.dataset.rankingSortKey===rankingSort.key) th.classList.add(rankingSort.dir==='asc'?'sort-asc':'sort-desc');
  });
  $('#rankingCards').innerHTML=arr.map(o=>`<tr><td>${o.rank}</td><td>${esc(o.x.nation)}</td><td>${esc(o.x.name)}</td><td>${displayMark(e,o.v)}</td><td>${scoreEvent(i,o.v)}</td><td>${esc(pbYear(o.x,i))}</td><td>${esc(pbVenue(o.x,i))}</td></tr>`).join('');
};
setupRankingHeaders();
$('#eventSelect').onchange=renderRanking;
renderRanking();