import assert from "node:assert/strict";
const base="https://vavebusiness.github.io/vaveautomations/";
const routes=["","departments/acquisition.html","departments/sales.html","departments/development.html","departments/partnerships.html","departments/portfolio.html","departments/operations.html","systems/pipeline.html","systems/projects.html","systems/management.html","systems/chat-launchpad.html","systems/owner-data.html","systems/tasks.html","systems/workflows.html","systems/databases.html","systems/reports.html","systems/integrations.html","systems/roadmap.html"];
const discoveryRoutes=["work-with-us.html"];
const assets=["assets/work-with-us.css","assets/app.js","assets/hq-data.js","assets/premium.css","assets/motion.js","assets/project-board.js","assets/owner-live.js","assets/chat-launch.js","data/overview.json"];
const errors=[];
for(const path of [...routes,...discoveryRoutes,...assets]){
 try{
  const response=await fetch(base+path,{signal:AbortSignal.timeout(15000),cache:"no-store"});
  if(!response.ok){errors.push(path+": HTTP "+response.status);continue}
  const body=await response.text();
  if((path.endsWith(".html")||path==="")&&!discoveryRoutes.includes(path)){
   if(!body.includes('id="app"'))errors.push(path+": app mount missing");
  }
  if(path==="work-with-us.html"){
   if(!body.includes('class="wrap hero"')||!body.includes('href="assets/work-with-us.css"'))errors.push("Discovery page missing hero or stylesheet");
   if(!body.includes('href="#contact"')||!body.includes('id="contact"'))errors.push("Discovery CTA is not linked to contact options");
   if(!body.includes('https://mail.google.com/mail/?view=cm')||!body.includes('https://outlook.live.com/mail/0/deeplink/compose')||!body.includes('mailto:'))errors.push("Discovery browser/email compose options missing");
  }
  if(path==="assets/work-with-us.css"&&(!body.includes("@keyframes inquiry-enter")||!body.includes("prefers-reduced-motion:reduce")))errors.push("Discovery motion styles not published");
  if(path==="systems/projects.html"&&!body.includes("project-board.js"))errors.push("Project board module not linked");
  if(path==="systems/owner-data.html"&&!body.includes("owner-live.js"))errors.push("Owner OAuth route not published");
  if(path==="systems/chat-launchpad.html"&&!body.includes("chat-launch.js"))errors.push("Chat starter route not published");
  if(path==="systems/management.html"&&!body.includes("Management & Improvements"))errors.push("Management route not published");
 }catch(e){errors.push(path+": "+String(e).slice(0,200))}
}
if(errors.length){for(const error of errors)console.error(error);process.exit(1)}
console.log("LIVE PASS: "+(routes.length+discoveryRoutes.length)+" routes and "+assets.length+" public-safe assets returned HTTP 200");
