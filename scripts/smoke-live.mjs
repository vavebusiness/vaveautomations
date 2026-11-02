import assert from "node:assert/strict";
const base="https://vavebusiness.github.io/vaveautomations/";
const routes=["","departments/acquisition.html","departments/sales.html","departments/development.html","departments/partnerships.html","departments/portfolio.html","departments/operations.html","systems/pipeline.html","systems/projects.html","systems/management.html","systems/tasks.html","systems/workflows.html","systems/databases.html","systems/reports.html","systems/integrations.html","systems/roadmap.html"];
const assets=["assets/app.js","assets/hq-data.js","assets/premium.css","assets/motion.js","assets/project-board.js","data/overview.json"];
const errors=[];
for(const path of [...routes,...assets]){
 try{
  const response=await fetch(base+path,{signal:AbortSignal.timeout(15000),cache:"no-store"});
  if(!response.ok){errors.push(path+": HTTP "+response.status);continue}
  const body=await response.text();
  if(path.endsWith(".html")||path===""){
   if(!body.includes('id="app"'))errors.push(path+": app mount missing");
  }
  if(path==="systems/projects.html"&&!body.includes("project-board.js"))errors.push("Project board module not linked");
  if(path==="systems/management.html"&&!body.includes("Management & Improvements"))errors.push("Management route not published");
 }catch(e){errors.push(path+": "+String(e).slice(0,200))}
}
if(errors.length){for(const error of errors)console.error(error);process.exit(1)}
console.log("LIVE PASS: "+routes.length+" routes and "+assets.length+" public-safe assets returned HTTP 200");
