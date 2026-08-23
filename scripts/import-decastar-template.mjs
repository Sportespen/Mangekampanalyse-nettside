// Décastar 2026 import staging template.
// Fill STARTLIST with official entries when published. The output shape is deliberately
// identical for men/women so app data generation can be automated without touching core UI.
const STARTLIST={men:[],women:[]};
const required=['name','nation'];
function validate(section,rows){const seen=new Set();for(const [i,row] of rows.entries()){for(const key of required)if(!String(row[key]||'').trim())throw new Error(`${section}[${i}] mangler ${key}`);const k=row.name.trim().toLowerCase();if(seen.has(k))throw new Error(`${section}: duplikat ${row.name}`);seen.add(k);}}
validate('men',STARTLIST.men);validate('women',STARTLIST.women);
const out={competitionId:'decastar',status:'staged',generatedAt:new Date().toISOString(),men:STARTLIST.men,women:STARTLIST.women};
process.stdout.write(JSON.stringify(out,null,2)+'\n');
