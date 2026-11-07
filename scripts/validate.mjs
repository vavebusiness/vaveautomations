import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {join,dirname,resolve} from "node:path";
const root=resolve(import.meta.dirname,"..");
const read=p=>readFileSync(join(root,p),"utf8");
const departmentIds=["command","acquisition","sales","development","partnerships","portfolio","operations"];
const systemIds=["pipeline","projects","management","chatsetup","ownerdata","tasks","workflows","databases","reports","integrations","roadmap"];
const htmls=["index.html",...departmentIds.filter(x=>x!=="command").map(x=>"departments/"+x+".html"),...systemIds.map(x=>"systems/"+({chatsetup:"chat-launchpad",ownerdata:"owner-data"}[x]||x)+".html")];
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
const inquiryPage=read("work-with-us.html");
const inquiryStyles=read("assets/work-with-us.css");
assert.ok(inquiryPage.includes('class="wrap hero"'),"Discovery page needs hero");
assert.ok(inquiryPage.includes('href="assets/work-with-us.css"'),"Discovery stylesheet not linked");
assert.ok(inquiryPage.includes('href="#contact"'),"Discovery main CTA must navigate to contact options");
assert.ok(inquiryPage.includes('id="contact"'),"Contact section anchor missing");
assert.ok(inquiryPage.includes('https://mail.google.com/mail/?view=cm'),"Browser Gmail compose option missing");
assert.ok(inquiryPage.includes('https://outlook.live.com/mail/0/deeplink/compose'),"Browser Outlook compose option missing");
assert.ok(inquiryPage.includes('mailto:'),"Email app fallback missing");
assert.ok(inquiryPage.includes("vaveautomations@outlook.com"),"Verified contact destination missing");
assert.ok(inquiryPage.includes("press <strong>Send</strong> there"),"Must disclose provider-send step");
assert.ok(!inquiryPage.includes("<form"),"Public discovery page must not collect data");
assert.ok(inquiryStyles.includes("@keyframes inquiry-enter"),"Discovery entrance motion missing");
assert.ok(inquiryStyles.includes("@media(prefers-reduced-motion:reduce)"),"Reduced-motion fallback missing");
assert.ok(inquiryStyles.includes("@supports(animation-timeline:view())"),"Progressive scroll reveal missing");
const allPublic=[...htmls,"work-with-us.html","assets/work-with-us.css","assets/app.js","assets/hq-data.js","assets/chat-roles.js","assets/chat-launch.js","assets/style.css","assets/premium.css","assets/motion.js","assets/project-board.js","data/overview.json","README.md"].map(read).join("\n");
for(const restricted of ["rooxemillions@", "Gumroad", "AIza", "sk-proj-", "ghp_", "Bearer eyJ"]){
 assert.equal(allPublic.includes(restricted),false,"Forbidden public token/project reference: "+restricted);
}
assert.ok(!model.pipeline.some(x=>/[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/.test(JSON.stringify(x))),"Pipeline has private emails");
assert.ok(read("systems/projects.html").includes("assets/project-board.js"),"Project board missing UI module");
assert.ok(read("assets/project-board.js").includes("LOCAL PREVIEW"),"Project board needs clear non-synced label");
assert.ok(read("systems/management.html").includes("assets/motion.js"),"Management hub missing motion");
assert.ok(read("systems/owner-data.html").includes("assets/owner-live.js"),"Owner OAuth reader module missing");
assert.ok(read("systems/chat-launchpad.html").includes("assets/chat-launch.js"),"Chat starter module missing");
assert.ok(read("systems/chat-launchpad.html").includes("assets/chat-roles.js"),"Nine chat roles module not linked");
const roles=JSON.parse(read("assets/chat-roles.js").replace(/^window\.VAVE_CHAT_ROLES = /,"").trim().replace(/;\s*$/,""));
assert.equal(roles.length,9,"All nine original and new chats must be listed");
assert.equal(new Set(roles.map(x=>x.number)).size,9,"Chat numbers must be unique");
assert.equal(roles.filter(x=>x.state==="core").length,7,"Seven core department roles");
assert.equal(roles.filter(x=>x.state==="specialist").length,2,"Two management specialist roles");
assert.ok(roles.every(x=>x.conversationOrigin==="newly_created_owner_reported"),"All nine conversations must reflect owner-reported new creation");
assert.ok(roles.every(x=>x.instructions==="sent_owner_reported"),"Instruction setup is owner-confirmed, not silently inferred");
assert.ok(roles.every(x=>x.reviewStatus==="not_verified"),"Do not invent provider sync or source review");
assert.equal(roles.find(x=>x.number==="05")?.name,"Portfolio & Assets","Keep 05 in company portfolio scope");
for(const role of roles){
 assert.ok(role.prompt.includes("Company Chat Registry"),"Missing shared register in chat "+role.number);
 assert.ok(role.sourceDoc.startsWith("https://github.com/vavebusiness/vaveautomations/blob/main/"),"Missing instruction source "+role.number);
 const relative=role.sourceDoc.split("/blob/main/")[1];
 assert.ok(existsSync(join(root,relative)),"Missing chat instruction reference "+relative);
}
assert.ok(read("assets/owner-live.js").includes("Company Chat Registry"),"Owner reader must load the chat registry");
assert.ok(read("assets/app.js").includes("chat-launchpad.html?chat="),"Department chat deep links missing");

assert.ok(read("assets/owner-live.js").includes("spreadsheets.readonly"),"Owner reader must use read-only Sheets scope");
const ownerPage=read("systems/owner-data.html");
assert.ok(ownerPage.includes('http-equiv="Content-Security-Policy"'),"Owner data page needs local CSP");
assert.ok(ownerPage.includes('name="referrer" content="no-referrer"'),"Private reader must not leak referring URL");
assert.ok(ownerPage.includes("connect-src 'self' https://accounts.google.com https://sheets.googleapis.com https://gmail.googleapis.com"),"CSP must restrict data API origins");
assert.ok(ownerPage.includes("object-src 'none'"),"CSP must disable browser plugins");
assert.ok(read("assets/owner-live.js").includes("auth/gmail.metadata"),"Gmail reader must use metadata-only scope");
assert.ok(!read("assets/owner-live.js").includes("auth/gmail.readonly"),"Disallow broad Gmail read scope");
assert.ok(read("assets/owner-live.js").includes("owner-lock-session"),"Owner reader needs manual session lock");
assert.ok(read("assets/owner-live.js").includes("15*60*1000"),"Owner reader needs 15-minute idle lock");

assert.ok(!read("assets/owner-live.js").includes("localStorage.setItem(\"googleAccessToken\""),"OAuth token cannot be stored");
console.log("PASS: 18 routes, 7 core chat roles, 2 specialist roles; all 9 newly created and instructed per owner, 9 source instructions and read-only chat registry");
