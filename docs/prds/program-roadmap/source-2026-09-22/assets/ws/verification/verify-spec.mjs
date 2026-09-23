/** Specification-fixture checks only. This is NOT Core's production compiler or test suite.
 * Run: node verification/verify-spec.mjs (or bun verification/verify-spec.mjs).
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const files = dir => fs.readdirSync(path.join(root,dir)).filter(x=>x.endsWith('.json')).sort();
const blueprints = files('blueprints').map(f=>read(`blueprints/${f}`));
const forms = files('form-blueprints').map(f=>read(`form-blueprints/${f}`));
const recipes = read('contracts/recipe-catalog.json').recipes;
const scenarios = read('verification/acceptance-scenarios.json').scenarios;
const tickets = read('contracts/implementation-backlog.json').tickets;
const register = read('contracts/source-contract-register.json').contracts;
const tests=[];
function test(name, fn) {try {fn();tests.push({name,status:'passed'});}catch(e){tests.push({name,status:'failed',detail:e.message});}}
function ensure(ok,message){if(!ok)throw new Error(message);}
function unique(xs,label){ensure(new Set(xs).size===xs.length,`Duplicate ${label}`);}
const recipeIDs=new Set(recipes.map(r=>r.id));
const bpIDs=new Set(blueprints.map(b=>b.blueprintId));
const contractIDs=new Set(register.map(c=>`${c.bindingKind}:${c.contractId}`));
const scenarioIDs=new Set(scenarios.map(s=>s.id));
function walk(node,visit,inParallel=false){
 visit(node,inParallel);
 if(node.kind==='sequence') node.steps.forEach(n=>walk(n,visit,inParallel));
 if(node.kind==='choose_one'){node.cases.forEach(c=>walk(c.then,visit,inParallel));walk(node.otherwise,visit,inParallel);}
 if(node.kind==='parallel')node.branches.forEach(b=>walk(b.body,visit,true));
}
function nestedRefs(value, fn){
 if(!value||typeof value!=='object')return;
 if(value.ref&&value.ref.scope)fn(value.ref);
 for(const v of Object.values(value))nestedRefs(v,fn);
}
function checkBlueprint(bp){
 ensure(bp.status==='reference_blueprint'&&bp.defaultEnabled===false,'Blueprint must remain inert');
 ensure(bp.enrollment.historicalMode==='disabled','Historical execution must be disabled');
 ensure(recipeIDs.has(bp.recipeId),'Unknown recipe');
 const nodes=[];walk(bp.root,(n,p)=>{nodes.push(n);ensure(!(p&&n.kind==='finish'),'Parallel child cannot terminate engagement');});
 unique(nodes.map(n=>n.id),'node id');ensure(nodes.length<=250,'Node bound');
 const ids=new Set(nodes.map(n=>n.id));
 for(const s of bp.stages) for(const id of s.nodeIds)ensure(ids.has(id),`Stage references missing node ${id}`);
 for(const n of nodes){
  if(['task','evidence','action','subflow'].includes(n.kind)){
   const k={task:'tasks',evidence:'evidence',action:'actions',subflow:'subflows'}[n.kind];
   ensure(typeof bp.bindings[k]?.[n.contract]==='string',`Missing ${k} alias ${n.contract}`);
  }
  if(n.role)ensure(bp.bindings.roles[n.role],`Unknown role ${n.role}`);
  if(n.form)ensure(bp.bindings.forms[n.form],`Unknown form ${n.form}`);
  if(n.kind==='parallel'){
   unique(n.branches.map(b=>b.id),'parallel branch');
   const branches=new Set(n.branches.map(b=>b.id));
   for(const id of n.join.requiredBranches??[])ensure(branches.has(id),`Missing required branch ${id}`);
   if(n.join.mode==='quorum')ensure(n.join.count<=branches.size,'Impossible quorum');
  }
 }
 nestedRefs(bp.root,r=>{
  if(r.scope==='fact')ensure(bp.bindings.facts[r.key],`Unknown fact ${r.key}`);
  if(r.scope==='parameter')ensure(Object.hasOwn(bp.parameters,r.key),`Unknown parameter ${r.key}`);
  // Full path dominance/type/purpose checks remain the production compiler's work.
 });
 for(const [kind,aliases] of Object.entries(bp.bindings)){
  for(const c of Object.values(aliases)){
   ensure(contractIDs.has(`${kind}:${c}`),`Unregistered ${kind} ${c}`);
   if(kind==='subflows')ensure(bpIDs.has(c.split('@')[0]),`Missing subflow ${c}`);
  }
 }
 ensure(contractIDs.has(`triggers:${bp.enrollment.triggerContract}`),'Trigger missing from source register');
}
test('Catalog contains exactly 96 unique recipes',()=>{ensure(recipes.length===96,'Recipe count');unique(recipes.map(r=>r.id),'recipe');});
test('Catalog covers all eight persona packs at declared counts',()=>{
 const expected={ADM:10,GEN:20,DON:16,MOB:12,FIN:12,MPD:8,COM:10,CARE:8};
 for(const [k,n] of Object.entries(expected))ensure(recipes.filter(r=>r.pack===k).length===n,`Pack ${k}`);
});
test('16 uniquely identified workflow reference blueprints',()=>{ensure(blueprints.length===16,'Blueprint count');unique(blueprints.map(b=>b.blueprintId),'blueprint');});
blueprints.forEach(bp=>test(`${bp.blueprintId}: references, structure and inert status`,()=>checkBlueprint(bp)));
test('No subflow recursion',()=>{
 const graph=new Map(blueprints.map(b=>[b.blueprintId,Object.values(b.bindings.subflows).map(c=>c.split('@')[0])]));
 function visit(id,active=new Set(),depth=0){ensure(!active.has(id),'Recursive subflow');ensure(depth<=4,'Subflow depth');const next=new Set(active).add(id);for(const c of graph.get(id)||[])visit(c,next,depth+1);}
 for(const id of graph.keys())visit(id);
});
test('352 unique acceptance-test specifications remain unexecuted',()=>{ensure(scenarios.length===352,'Scenario count');unique(scenarios.map(s=>s.id),'scenario');ensure(scenarios.every(s=>s.status==='specified_not_executed'),'Misstated test result');});
test('Every recipe has three matching test specifications',()=>{
 for(const r of recipes)for(let i=1;i<=3;i++)ensure(scenarioIDs.has(`T-${r.id}-${String(i).padStart(2,'0')}`),`Missing recipe test ${r.id}`);
});
test('All recipes default disabled and preserve protected boundaries',()=>{
 ensure(recipes.every(r=>r.default_activation==='disabled'&&r.protected&&r.evidence&&r.dependencies.length),'Incomplete recipe guardrail');
});
test('26 tickets have valid, acyclic dependencies and acceptance references',()=>{
 ensure(tickets.length===26,'Ticket count');unique(tickets.map(t=>t.id),'ticket');const m=new Map(tickets.map(t=>[t.id,t]));
 function visit(id,active=new Set()){
  ensure(m.has(id),`Unknown ticket ${id}`);ensure(!active.has(id),'Ticket dependency cycle');const t=m.get(id),next=new Set(active).add(id);
  ensure(t.status==='not_started','Unexpected completion claim');
  for(const s of t.crossCuttingTests)ensure(scenarioIDs.has(s),`Unknown acceptance ${s}`);
  for(const d of t.dependsOn)visit(d,next);
 }
 for(const t of tickets)visit(t.id);
});
forms.forEach(f=>test(`${f.formId}: inert, versioned, source-mapped fields`,()=>{
 ensure(f.status==='reference_blueprint'&&f.defaultEnabled===false,'Form must be inert');
 const fields=f.pages.flatMap(p=>p.fields);unique(fields.map(x=>x.id),'form field');const ids=new Set(fields.map(x=>x.id));
 for(const field of fields){ensure(field.mapping.ownerContract&&field.mapping.fieldKey,'Missing source mapping');if(field.visibleWhen)ensure(ids.has(field.visibleWhen.fieldId),'Unknown visibility field');}
}));
const mutant=fn=>{const b=structuredClone(blueprints[0]);fn(b);let failed=false;try{checkBlueprint(b);}catch{failed=true;}ensure(failed,'Malformed blueprint was not rejected');};
test('Negative: reject accidentally enabled fixture',()=>mutant(b=>{b.defaultEnabled=true;}));
test('Negative: reject unbound role',()=>mutant(b=>{b.root.steps.find(n=>n.kind==='task').role='missing-role';}));
test('Negative: reject duplicated node identity',()=>mutant(b=>{b.root.steps[1].id=b.root.steps[0].id;}));
test('Negative: reject missing stage node',()=>mutant(b=>{b.stages[0].nodeIds=['missing-node'];}));
test('Negative: reject absent recipe',()=>mutant(b=>{b.recipeId='GEN-99';}));
test('Negative: reject historical enrollment',()=>mutant(b=>{b.enrollment.historicalMode='enabled';}));
const report={kind:'specification-fixture-verification',scope:'Local artifact structure and reference checks only; no Core runtime, compiler, provider or database tests',nodeVersion:process.version,checks:tests.length,passed:tests.filter(x=>x.status==='passed').length,failed:tests.filter(x=>x.status==='failed').length,results:tests};
fs.writeFileSync(path.join(root,'verification/structural-results.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
process.exitCode=report.failed?1:0;
