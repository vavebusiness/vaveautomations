import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {join,dirname,resolve} from "node:path";
const root=resolve(import.meta.dirname,"..");
const read=p=>readFileSync(join(root,p),"utf8");
const departmentIds=["command","acquisition","sales","development","partnerships","portfolio","operations"];
const systemIds=["pipeline","projects","management","tasks","workflows","databases","reports","integrations","roadmap"];
const htmls=["index.html",...departmentIds.filter(x=>x!=="command").map(x=>"departments/"+x+".html"),...systemIds.map(x=>"systems/"+x+".html")];
const text=read("assets/hq-data.js").replace(/^window\.HQ_DATA = /,"").trim().replace(/;\s*$/,"");
const model=JSON.parse(text);
assert.equal(model.departments.length,7);
assert.equal(model.datasets.length,9);
assert.equal(model.workflows.length,3);
assert.equal(model.kpis.length,8);
assert.equal(new Set(model.departments.map(x=>x.id)).size,7);
for(const d of model.departments){
 assert.equal(d.views.length,4,"Four views required for "+d.id);
 assert.ok(d.process.length>=5,"At least five SOP steps required");
 assert.ok(d.handoffs.length>=2,"Handoff definition missing");
 assert.ok(d.resources.length>=3,"Source refs missing");
}
const metricKeys=new Set(model.kpis.map(x=>x.key));
const snapshot=JSON.parse(read("data/overview.json"));
assert.equal(snapshot.mode,"manual-read-only-snapshot");
for(const key of metricKeys)assert.ok(Object.hasOwn(snapshot.metrics,key),"Missing metric "+key);
for(const page of htmls){
 assert.ok(existsSync(join(root,page)),"Missing page "+page);
 const h=read(page);
 for(const asset of ["assets/hq-data.js","assets/app.js","assets/style.css","assets/premium.css","assets/motion.js"]){
 const rel=page==="index.html"?asset:"../"+asset;
 assert.ok(h.includes(rel),"Page "+page+" missing "+rel);
 }
 assert.ok(h.includes('id="app"'),"App mount missing in "+page);
}
const allPublic=[...htmls,"assets/app.js","assets/hq-data.js","assets/style.css","assets/premium.css","assets/motion.js","assets/project-board.js","data/overview.json","README.md"].map(read).join("\n");
for(const restricted of ["rooxemillions@", "Gumroad", "AIza", "sk-proj-", "ghp_", "Bearer eyJ"]){
 assert.equal(allPublic.includes(restricted),false,"Forbidden public token/project reference: "+restricted);
}
assert.ok(!model.pipeline.some(x=>/[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/.test(JSON.stringify(x))),"Pipeline has private emails");
assert.ok(read("systems/projects.html").includes("assets/project-board.js"),"Project board missing UI module");
assert.ok(read("assets/project-board.js").includes("LOCAL PREVIEW"),"Project board needs clear non-synced label");
assert.ok(read("systems/management.html").includes("assets/motion.js"),"Management hub missing motion");
console.log("PASS: 16 site routes, 7 department playbooks, 9 source tabs, 3 company workflows, premium UI and sanitized snapshot");
