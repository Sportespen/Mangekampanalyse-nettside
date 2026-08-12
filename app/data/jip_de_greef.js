(function(){
  const men=window.MANGEKAMP_DATA?.men;
  if(!men||!Array.isArray(men.birmingham)) return;
  const data={
    qp:24,wr:44,name:'Jip de Greef',nation:'NED',birth:'2004',pb:8039,theoretical:8286,utilization:97.0,potential:247,diff_top:0,
    bests:{
      '100m':{display:'10.78',points:910,mark:10.78,venue:'Eugene, OR (USA)',year:'2026'},
      'Lengde':{display:'7.52',points:940,mark:7.52,venue:'Illinois-Armory, Champaign, IL (USA) (i)',year:'2026'},
      'Kule':{display:'14.54',points:761,mark:14.54,venue:'Demirjian Park, Champaign, IL (USA)',year:'2026'},
      'Høyde':{display:'1.97',points:776,mark:1.97,venue:'Demirjian Park, Champaign, IL (USA)',year:'2026'},
      '400m':{display:'48.61',points:880,mark:48.61,venue:'Demirjian Park, Champaign, IL (USA)',year:'2026'},
      '110mh':{display:'14.26',points:941,mark:14.26,venue:'USA',year:'2026'},
      'Diskos':{display:'48.37',points:836,mark:48.37,venue:'NED',year:'2024'},
      'Stav':{display:'5.28',points:998,mark:5.28,venue:'Illinois-Armory, Champaign, IL (USA) (i)',year:'2026'},
      'Spyd':{display:'52.17',points:621,mark:52.17,venue:'Demirjian Park, Champaign, IL (USA)',year:'2026'},
      '1500m':{display:'4:49.20',points:623,mark:289.20,venue:'Demirjian Park, Champaign, IL (USA)',year:'2026'}
    }
  };
  const i=men.birmingham.findIndex(a=>String(a.name||'').toLowerCase()==='jip de greef');
  if(i>=0) men.birmingham[i]={...men.birmingham[i],...data,bests:{...(men.birmingham[i].bests||{}),...data.bests}};
  else men.birmingham.push(data);
})();
