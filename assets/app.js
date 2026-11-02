(function(){
"use strict";
const D=window.HQ_DATA||{};
const root=document.body.dataset.base||"";
const currentDepartment=document.body.dataset.department||"command";
const currentSystem=document.body.dataset.page||"";
const official=D.links?.crm||"";
const tabs=["Overview","Playbook","Work queue","Metrics"];
const escapeHTML=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const isDept=!currentSystem;
let snapshot=null;
const dlist=D.departments||[];
const dataTasks=Array.isArray(D.tasks)?D.tasks:[];
const navGroups=[
 {title:"Company",links:[["command","00","Command Center",root+"index.html"],["pipeline","","Opportunity pipeline",root+"systems/pipeline.html"],["projects","","Client & project board",root+"systems/projects.html"],["management","","Management & improvements",root+"systems/management.html"],["chatsetup","","Chat launchpad",root+"systems/chat-launchpad.html"],["tasks","","Action board",root+"systems/tasks.html"]]},
 {title:"Departments",links:dlist.filter(x=>x.id!=="command").map(x=>[x.id,x.number,x.name,root+"departments/"+x.id+".html"])},
 {title:"Systems & intelligence",links:[["workflows","","Workflow registry",root+"systems/workflows.html"],["databases","","Data sources",root+"systems/databases.html"],["reports","","Analytics & reports",root+"systems/reports.html"],["integrations","","Integration center",root+"systems/integrations.html"],["ownerdata","","Owner live data",root+"systems/owner-data.html"],["roadmap","","Operating roadmap",root+"systems/roadmap.html"]]}
];
const selected=currentSystem||currentDepartment;
const department=dlist.find(x=>x.id===currentDepartment)||dlist[0];
const sourceCount=Object.keys(D.links||{}).length;
const ICONS={command:"◈",acquisition:"◎",sales:"↗",development:"⌘",partnerships:"◇",portfolio:"▣",operations:"⚙",pipeline:"⥅",projects:"▦",management:"✦",chatsetup:"◫",tasks:"☑",workflows:"⟲",databases:"▤",reports:"▥",integrations:"⊞",ownerdata:"▧",roadmap:"◉"};
let filterTasks={q:"",status:"all",priority:"all",department:"all"};
let filterPipeline={q:"",stage:"all",type:"all"};
let filterWorkflows={q:"",status:"all"};
let saveError=false;
function getLocalTasks(){try{let x=JSON.parse(localStorage.getItem("vave-hq-local-tasks-v3"));if(Array.isArray(x))return x}catch(e){}return dataTasks.map(x=>({...x}));}
let localTasks=getLocalTasks();
function saveLocalTasks(){try{localStorage.setItem("vave-hq-local-tasks-v3",JSON.stringify(localTasks));saveError=false}catch(e){saveError=true}}
function companyLink(id){return root+(id==="command"?"index.html":"departments/"+id+".html")}
function source(name){const x=(D.datasets||[]).find(z=>z.name===name);return x?official+"#gid="+x.gid:official}
function external(label,url){return '<a class="text-link" href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(label)+' <span aria-hidden="true">↗</span></a>'}
function chip(s,type="muted"){return '<span class="chip '+type+'">'+escapeHTML(s)+'</span>'}
function sectionTitle(eyebrow,title,desc=""){return '<div class="section-head"><div><span class="eyebrow">'+escapeHTML(eyebrow)+'</span><h2>'+escapeHTML(title)+'</h2>'+(desc?'<p class="muted">'+escapeHTML(desc)+'</p>':"")+'</div></div>'}
function empty(text){return '<div class="empty">'+escapeHTML(text)+'</div>'}
function card(title,body,kicker){return '<article class="card"><div class="eyebrow">'+escapeHTML(kicker||"WORK AREA")+'</div><h3>'+escapeHTML(title)+'</h3><p>'+escapeHTML(body)+'</p></article>'}
function metric(item){let val=snapshot?.metrics&&Object.prototype.hasOwnProperty.call(snapshot.metrics,item.key)?snapshot.metrics[item.key]:item.value;return '<div class="metric"><span>'+escapeHTML(item.label)+'</span><strong data-metric="'+escapeHTML(item.key)+'">'+escapeHTML(val)+'</strong><small>'+escapeHTML(item.sub)+'</small></div>'}
function renderShell(pageHtml){
const activeSection=selected;
return '<div class="app-shell"><aside class="sidebar" id="sidebar"><a class="brand" href="'+root+'index.html"><span class="brand-symbol">V<span>∕</span>A</span><span><strong>VAVE AUTOMATIONS</strong><small>OPERATIONS HEADQUARTERS</small></span></a><div class="workspace-indicator"><span class="live-dot"></span><span>OPERATIONS WORKSPACE</span>'+chip("Public overview","neutral")+'</div><nav aria-label="Main navigation">'+navGroups.map(g=>'<div class="nav-group"><div class="nav-title">'+g.title+'</div>'+g.links.map(x=>'<a class="nav-link '+(activeSection===x[0]?"active":"")+'" href="'+x[3]+'"><span class="nav-symbol">'+(ICONS[x[0]]||"◦")+'</span><span class="nav-text">'+(x[1]?'<small>'+x[1]+'</small> ':"")+escapeHTML(x[2])+'</span></a>').join("")+'</div>').join("")+'</nav><div class="sidebar-footer"><div>Source of truth</div>'+external("Master CRM",official)+'<div class="foot-note">Public-safe read-only workspace. No client secrets.</div></div></aside><div class="main-column"><header class="topbar"><div class="breadcrumbs"><button class="menu-btn" id="menu-toggle" aria-label="Open departments">☰</button><span>VA</span><span class="chevron">/</span><strong>'+escapeHTML(isDept?department.name:systemTitle(currentSystem))+'</strong></div><div class="top-actions"><button type="button" class="focus-button" id="focus-toggle" aria-pressed="false" title="Reduce sidebar clutter">◉ Focus</button><button type="button" class="subtle-button" id="search-toggle" aria-label="Search headquarters">⌕ <span>Search HQ</span><kbd>⌘ K</kbd></button><span class="top-divider"></span>'+chip("Read-only data","neutral")+'</div></header><main class="page-content" id="main-content">'+pageHtml+'</main><footer class="bottom-footer"><span>VAVE AUTOMATIONS · OPERATIONS HQ</span><span>Public-safe company information · Master CRM remains authoritative</span></footer></div></div><div id="search-layer" class="search-layer" hidden><div class="search-panel" role="dialog" aria-modal="true" aria-label="Search headquarters"><div class="search-top"><input id="global-query" type="search" placeholder="Search departments, workflows, tasks, processes..." autocomplete="off" aria-label="Search"><button type="button" id="search-close" class="icon-button">✕</button></div><div id="global-results" class="search-results"></div></div></div>';
}
function systemTitle(id){return({pipeline:"Opportunity Pipeline",projects:"Client & Project Board",management:"Management & Improvements",chatsetup:"Chat Launchpad",tasks:"Action Board",workflows:"Workflow Registry",databases:"Data Sources",reports:"Analytics & Reports",integrations:"Integration Center",ownerdata:"Owner Live Data",roadmap:"Operating Roadmap"})[id]||"Headquarters"}
function pageHeader(kicker,title,subtitle,actions=""){return '<div class="page-header"><div class="eyebrow">'+escapeHTML(kicker)+'</div><div class="title-row"><div><h1>'+escapeHTML(title)+'</h1><p class="page-subtitle">'+escapeHTML(subtitle)+'</p></div><div class="title-actions">'+actions+'</div></div></div>'}
function stamp(){return '<div class="freshness"><span class="status-dot amber"></span><span>Manual CRM snapshot · source through '+escapeHTML(D.sourceAsOf||"2026-10-31")+' · reviewed '+escapeHTML(D.lastReviewed||"2026-11-02")+'</span></div>'}
function deptTabs(d,view){const options=d.views||[];return '<nav class="tabbar" aria-label="Department subpages">'+options.map(z=>'<a class="tab '+(view===z[0]?"active":"")+'" href="'+companyLink(d.id)+(z[0]==="overview"?"":"?view="+encodeURIComponent(z[0]))+'">'+escapeHTML(z[1])+'</a>').join("")+'</nav>'}
function taskTable(arr,compact=false){return '<div class="table-wrap"><table><thead><tr><th>Task / outcome</th><th>Department</th><th>Priority</th><th>Status</th><th>Review</th></tr></thead><tbody>'+arr.map(t=>'<tr><td><strong>'+escapeHTML(t.title)+'</strong><small>'+escapeHTML(t.id)+'</small></td><td>'+escapeHTML(t.department)+'</td><td>'+chip(t.priority,t.priority==="P0"?"red":"neutral")+'</td><td>'+chip(t.status,t.status==="Blocked"?"red":t.status==="Waiting"?"amber":"muted")+'</td><td>'+escapeHTML(t.due)+'</td></tr>').join("")+'</tbody></table></div>'}
function deptOverview(d){
const relevantKpis=(D.kpis||[]).filter((_,i)=>d.id==="command"?i<8:i<4);
let body='<div class="hero-panel"><div class="hero-light"></div><div class="hero-content"><div class="eyebrow">'+escapeHTML(d.number)+' / DEPARTMENT BRIEF</div><h2>'+escapeHTML(d.name)+'</h2><p>'+escapeHTML(d.purpose)+'</p><div class="hero-actions"><a class="action-button" href="'+companyLink(d.id)+'?view=playbook">Explore operating playbook <span>↗</span></a><a class="outline-button" href="'+companyLink(d.id)+'?view=work">Open work queue</a></div></div><div class="hero-outcome"><span>DEPARTMENT SUCCESS CRITERION</span><strong>'+escapeHTML(d.outcome)+'</strong></div></div>';
body+=stamp();
if(d.id==="command") body+='<div class="metrics-grid">'+(D.kpis||[]).slice(0,8).map(metric).join("")+'</div>'+renderExecutive();
else body+='<div class="metrics-grid">'+relevantKpis.slice(0,4).map(metric).join("")+'</div>';
body+=sectionTitle("CURRENT FOCUS","Operational priorities","Verified scope and active areas of responsibility.")+'<div class="card-grid">'+(d.focus||[]).map((v,i)=>card("Priority "+String(i+1).padStart(2,"0"),v,"FOCUS")).join("")+'</div>';
body+=sectionTitle("DECISIONS","Active controls & decision rules")+'<div class="stack">'+d.decisions.map(v=>'<div class="line-item"><span class="line-icon">✓</span><div>'+escapeHTML(v)+'</div></div>').join("")+'</div>';
body+=sectionTitle("COORDINATION","Handoffs between departments")+'<div class="route-list">'+d.handoffs.map((v,i)=>'<div class="route"><span>'+String(i+1).padStart(2,"0")+'</span><p>'+escapeHTML(v)+'</p></div>').join("")+'</div>';
body+=sectionTitle("REFERENCE","Authoritative records")+'<div class="resource-grid">'+(d.resources||[]).map(name=>'<a class="resource-card" href="'+source(name)+'" target="_blank" rel="noopener noreferrer"><span>▤</span><strong>'+escapeHTML(name)+'</strong><small>Google Sheets · source records ↗</small></a>').join("")+'</div>';
return body}
function renderExecutive(){
return '<section class="executive-section"><div class="feature-grid"><div class="feature-card"><div class="eyebrow">NORTH STAR</div><h3>First paid client, successfully delivered.</h3><p>'+escapeHTML(D.organization.northStar)+'</p><div class="timeline-steps"><div><span>1</span>Confirm buyer need</div><div><span>2</span>Agree paid scope</div><div><span>3</span>Build and test</div><div><span>4</span>Obtain acceptance</div></div></div><div class="feature-card contrast"><div class="eyebrow">OPERATING POSITION</div><h3>No verified paying projects</h3><p>One accounting document-intake buyer described a real problem, and one agency indicated possible future collaboration. Neither is a confirmed customer contract.</p>'+chip("Evidence-first", "amber")+'<p class="foot-note">Do not chase the buyer after the last check-in; monitor inbound replies.</p></div></div></section>'}
function deptPlaybook(d){
return sectionTitle("STANDARD OPERATING PROCEDURE","From input to verified output",d.purpose)+'<div class="process-list">'+d.process.map((p,i)=>'<article class="process-step"><div class="step-number">'+String(i+1).padStart(2,"0")+'</div><div><div class="step-label">STEP '+(i+1)+'</div><h3>'+escapeHTML(p[0])+'</h3><p>'+escapeHTML(p[1])+'</p></div></article>').join("")+'</div>'+sectionTitle("GOVERNANCE","Boundaries that do not change")+'<div class="card-grid">'+d.decisions.map((v,i)=>card("Control "+(i+1),v,"NON-NEGOTIABLE")).join("")+'</div>'+sectionTitle("CHECKLIST","Use the complete process")+'<div class="card"><p class="muted">Copy this process into a private task or client-specific checklist. It is not a production automation and performs no remote actions.</p><button class="action-button" id="copy-process">Copy SOP checklist</button></div>';
}
function deptWork(d){
const tasks=localTasks.filter(t=>t.department===d.name);
return sectionTitle("WORK QUEUE","Actions owned by this department","Local checklist is editable in this browser, but does not update the Google Sheets master checklist.")+'<div class="action-callout"><strong>'+tasks.length+' tracked work items</strong><span>'+escapeHTML(d.outcome)+'</span><a href="'+root+'systems/tasks.html">Open full action board ↗</a></div>'+taskTable(tasks)+sectionTitle("HANDOFF","What the next department needs")+'<div class="stack">'+d.handoffs.map((x,i)=>'<div class="line-item"><span class="line-icon">→</span><div>'+escapeHTML(x)+'</div></div>').join("")+'</div>'+sectionTitle("TASK SOURCE","Master Checklist")+'<div class="card">'+external("Open verified task tracker",source("Master Checklist"))+'<p class="foot-note">Any local task edits on this website are browser-only until secure write-back exists.</p></div>';
}
function deptMetrics(d){
return sectionTitle("MEASUREMENT","How this department measures progress","Metrics are definitions and verified snapshots; no real-time reporting connection is implied.")+'<div class="card-grid">'+d.metrics.map((v,i)=>card("Indicator "+String(i+1).padStart(2,"0"),v,"MEASUREMENT STANDARD")).join("")+'</div>'+sectionTitle("TRACKER","Verified company baselines")+'<div class="metrics-grid">'+(D.kpis||[]).slice(0,8).map(metric).join("")+'</div>'+sectionTitle("DATA CONTRACT","Evidence requirement")+'<div class="card"><h3>Before updating a metric</h3><p>Read the source, timestamp the review, confirm the meaning of each field, and distinguish a verified record from a forecast or working estimate. The CRM owns the actual value.</p></div>';
}
function departmentPage(){
const params=new URLSearchParams(location.search);
const allowed=(department.views||[]).map(v=>v[0]);
const view=allowed.includes(params.get("view"))?params.get("view"):"overview";
let body=pageHeader("COMPANY / "+department.number,department.name,department.short,'<a class="small-link" href="'+source((department.resources||[])[0])+'" target="_blank" rel="noopener">Source records ↗</a> <a class="small-link" href="'+root+'systems/chat-launchpad.html?chat='+encodeURIComponent(department.number)+'">Chat instructions ↗</a>');
body+=deptTabs(department,view);
body+=view==="playbook"?deptPlaybook(department):view==="work"?deptWork(department):view==="metrics"?deptMetrics(department):deptOverview(department);
return body;
}
function filterBar(kind,inputs){
return '<div class="filter-bar"><input id="'+kind+'-search" type="search" placeholder="'+escapeHTML(inputs.placeholder||"Search records...")+'" aria-label="Search records">'+(inputs.selects||[]).map(sel=>'<select id="'+kind+'-'+sel.id+'" aria-label="'+escapeHTML(sel.title)+'"><option value="all">All '+escapeHTML(sel.title)+'</option>'+sel.options.map(o=>'<option value="'+escapeHTML(o)+'">'+escapeHTML(o)+'</option>').join("")+'</select>').join("")+'</div>';
}
function pipelineRows(records){return records.map(p=>'<tr><td><strong>'+escapeHTML(p.id)+'</strong><small>'+escapeHTML(p.type)+'</small></td><td><strong>'+escapeHTML(p.account)+'</strong><small>'+escapeHTML(p.signal)+'</small></td><td>'+chip(p.stage,p.stage==="Lost"?"red":p.stage==="Replied"?"amber":"neutral")+'</td><td>'+chip(p.priority,p.priority==="P0"?"red":"neutral")+'</td><td>'+escapeHTML(p.next)+'</td><td>'+escapeHTML(p.last)+'</td></tr>').join("")}
function pipelinePage(){
const stages=["Research","Qualified","Contacted","Replied","Discovery","Proposal","Negotiation","Won","Lost","Nurture"];
let body=pageHeader("REVENUE / SALES INTELLIGENCE","Opportunity pipeline","An anonymized shortlist of verified CRM-derived statuses. The full private buyer database remains in Google Sheets.",external("Full Opportunities",source("Opportunities")))+stamp();
body+='<div class="notice"><strong>Shortlist, not complete funnel:</strong> Six representative CRM records are shown without contact identities. Stage counts here apply only to this shortlist.</div>';
body+='<div class="stage-strip">'+stages.map(st=>'<div class="stage-mini"><span>'+escapeHTML(st)+'</span><strong>'+(D.pipeline||[]).filter(p=>p.stage===st).length+'</strong></div>').join("")+'</div>';
body+=sectionTitle("OPPORTUNITIES","Decision-ready shortlist","Filter by stage or type. Private addresses and correspondence stay in the CRM.")+filterBar("pipeline",{placeholder:"Search signal, next action or ID",selects:[{id:"stage",title:"stages",options:stages},{id:"type",title:"types",options:[...new Set(D.pipeline.map(p=>p.type))]}]})+'<div id="pipeline-table">'+renderPipelineTable(D.pipeline)+'</div>';
body+=sectionTitle("QUALIFICATION","Minimum sales record")+'<div class="card-grid">'+["Specific buyer problem and evidence","Current tools, inputs, outputs and manual steps","Expected impact and constraints","Contact permission, budget and timing","Next action, owner, review date","Technical feasibility and acceptance criteria"].map((x,i)=>card(String(i+1).padStart(2,"0"),x,"QUALIFICATION")).join("")+'</div>';
return body}
function renderPipelineTable(records){return '<div class="table-wrap"><table class="wide-table"><thead><tr><th>ID</th><th>Problem signal</th><th>Stage</th><th>Priority</th><th>Next action</th><th>Last touched</th></tr></thead><tbody>'+ (records.length?pipelineRows(records):'<tr><td colspan="6">'+empty("No matching opportunities")+'</td></tr>')+'</tbody></table></div>'}
function projectBoardPage(){
return pageHeader("REVENUE / COMMAND BOARD","Clients & projects","A clear view of prospective work, active delivery and payment evidence. No sales wins are invented.",'<a class="outline-button" href="'+root+'systems/pipeline.html">↗ Full CRM shortlist</a>')+
'<div class="board-introduction"><div class="board-kicker">COMPANY WORKFLOW</div><h2>From first conversation to delivered work.</h2><p>Visually track where opportunities belong, then separate genuinely approved projects and verified payments. The cards can be moved for planning, but this public board never modifies Google Sheets.</p><div class="board-pill-row"><span class="board-pill"><i></i> CRM-based starting positions</span><span class="board-pill"><i></i> Local-only moves</span><span class="board-pill"><i></i> Zero verified revenue</span></div></div>'+
'<div id="board-root"><div class="loading-state">Preparing the opportunity board…</div></div>';
}
function managementPage(){
const crm=D.links?.crm||"";
const q=crm+"#gid=2070431",ev=crm+"#gid=2070432",chats=crm+"#gid=2070433";
const statuses=[
["PROPOSE","A specialist chat or scheduled review identifies a meaningful improvement and adds a source-backed request."],
["TRIAGE","Management checks fit, urgency, dependencies, risk, and whether a change is minor or major."],
["APPROVE","Minor reversible cosmetic improvements may be pre-authorized. Major infrastructure, credentials, data edits, spending, or outreach require owner approval."],
["BUILD","HQ development implements the change in a version-controlled branch with automated checks."],
["VERIFY","Validation and live checks must pass before any change is marked shipped. Unexpected failures cause rollback and a visible issue."],
["REPORT","Record commit, evidence and impact in the HQ Change Queue, then summarize meaningful changes to the owner."]
];
return pageHeader("GOVERNANCE / CONTINUOUS IMPROVEMENT","Management & improvements","The coordination layer for all nine project chats, management decisions, HQ design and safe change approvals.",external("Open change queue",q))+
'<div class="management-hero"><span class="eyebrow">THE OPERATING LOOP</span><h2>Every department contributes.<br><em>One verified source of truth.</em></h2><p>Instead of hidden chat-to-chat messages, each workstream writes verified updates to a private shared register. Management prioritizes them; the website team takes approved improvements; the HQ displays only verified, public-safe results.</p><div class="management-hero-actions">'+external("HQ Change Queue",q)+external("Company Event Log",ev)+external("Company Chat Registry",chats)+'</div></div>'+
sectionTitle("COORDINATION","How the chats will work together","Messages in separate ChatGPT chats do not synchronize automatically. The shared CRM is the durable handoff.")+
'<div class="coordination-flow"><div class="coordination-source"><span class="coordination-label">DEPARTMENT SPECIALISTS</span><div class="coordination-nodes">'+(D.departments||[]).map(x=>'<span>'+x.number+' · '+escapeHTML(x.name)+'</span>').join("")+'</div></div><div class="coordination-arrow">↓ verified events & evidence</div><div class="coordination-core"><span class="coordination-label">PRIVATE CONTROL PLANE</span><h3>Master CRM · Event Log · Change Queue</h3><p>Unique IDs, source evidence, owners, approval state, timestamps, delivery checks</p></div><div class="coordination-arrow">↓ approved tasks, not direct chat calls</div><div class="coordination-dest"><div><strong>Management review</strong><p>Priorities, impact and decisions</p></div><div><strong>HQ development</strong><p>UI, integrations and QA</p></div><div><strong>Command Center</strong><p>Executive status and verification</p></div></div></div>'+
sectionTitle("CHANGE CONTROL","What can evolve automatically","Keep momentum while preventing hidden or high-risk changes.")+
'<div class="management-permission-grid"><article class="permission-card allowed"><span class="permission-icon">✓</span><span class="eyebrow">LOW RISK · AFTER TESTS</span><h3>Small reversible improvements</h3><p>Spacing, typography, hover motion, broken-link fixes, clarity, accessibility and small responsive refinements. Record change, commit and test result.</p><span class="permission-tag">Eligible for limited pre-approval</span></article><article class="permission-card approval"><span class="permission-icon">!</span><span class="eyebrow">SIGNIFICANT CHANGE</span><h3>Owner approval required</h3><p>New services, paid tiers, identity or credentials, private data flows, significant redesigns, CRM writes, outbound email, scenario activation, or customer-facing promises.</p><span class="permission-tag">Stop for approval before execution</span></article></div>'+
sectionTitle("RELEASE PROCESS","Six-stage improvement cycle","Each change must be visible in the authoritative private queue.")+
'<div class="management-steps">'+statuses.map((p,i)=>'<article class="management-step"><span>'+String(i+1).padStart(2,"0")+'</span><div><strong>'+p[0]+'</strong><p>'+p[1]+'</p></div></article>').join("")+'</div>'+
sectionTitle("ONGOING REVIEWS","Practical cadence, not fictional nonstop activity")+
'<div class="card-grid">'+[
["Event-driven updates","Where authorized provider webhooks exist, process changed records promptly. Event latency varies; second-by-second delivery is not guaranteed."],
["Scheduled analysis","A recurring management review can evaluate source changes and recommend or implement only approved minor changes."],
["Human visibility","The owner sees verified releases, pending approvals, blockers and source timestamps—not endless status spam."],
["Shared responsibility","Dedicated chats read the same CRM and action queue. Historical chat transcripts are not themselves a realtime shared database."]
].map(x=>card(x[0],x[1],"OPERATING RULE")).join("")+'</div>'+
sectionTitle("SOURCE LINKS","Private coordination records")+
'<div class="resource-grid"><a class="resource-card" href="'+q+'" target="_blank" rel="noopener"><span>▤</span><strong>HQ Change Queue</strong><small>Proposals, approvals, implementation and verification ↗</small></a><a class="resource-card" href="'+ev+'" target="_blank" rel="noopener"><span>▤</span><strong>Company Event Log</strong><small>Verified source updates and HQ refresh requirements ↗</small></a><a class="resource-card" href="'+crm+'#gid=2070427" target="_blank" rel="noopener"><span>☑</span><strong>Master Checklist</strong><small>Company-wide owner and action tracking ↗</small></a><a class="resource-card" href="'+chats+'" target="_blank" rel="noopener"><span>◫</span><strong>Company Chat Registry</strong><small>00–08 responsibilities, setup status and handoff links ↗</small></a></div>'+
'<div class="notice"><strong>Current state:</strong> Shared tabs exist, but unattended multi-agent coordination and second-by-second live synchronization have not been deployed. The protected backend and explicit approval boundaries are still required.</div>';
}
function taskPage(){
let body=pageHeader("EXECUTION / OWNERSHIP","Action board","Plan and review work across all seven departments. This browser board does not write to Google Sheets.",'<button id="export-tasks" class="outline-button">↓ Export local CSV</button>')+'<div class="notice"><strong>Storage:</strong> Task status changes and new items are stored locally in this browser only. The Google Sheets Master Checklist remains authoritative.</div>';
const total=localTasks.length,p0=localTasks.filter(t=>t.priority==="P0").length,blocked=localTasks.filter(t=>t.status==="Blocked").length,waiting=localTasks.filter(t=>t.status==="Waiting").length;
body+='<div class="metrics-grid"><div class="metric"><span>Total local work items</span><strong>'+total+'</strong><small>Includes imported initial task plan</small></div><div class="metric"><span>P0 priority</span><strong>'+p0+'</strong><small>Review first</small></div><div class="metric"><span>Blocked</span><strong>'+blocked+'</strong><small>Dependencies required</small></div><div class="metric"><span>Waiting</span><strong>'+waiting+'</strong><small>Do not chase unnecessarily</small></div></div>';
body+=sectionTitle("WORK MANAGEMENT","Review, update and export","Status edits below only affect this browser.")+filterBar("tasks",{placeholder:"Search task text or evidence",selects:[{id:"department",title:"departments",options:dlist.map(d=>d.name)},{id:"priority",title:"priorities",options:["P0","P1","P2"]},{id:"status",title:"statuses",options:["Ready","In progress","Waiting","Blocked","Recurring","Controlled","Backlog","Done"]}]})+'<div id="task-board">'+renderEditableTasks(localTasks)+'</div>';
body+='<div class="add-panel"><h3>Add local action</h3><form id="task-form"><input id="task-title" required maxlength="160" placeholder="Concrete next action..." aria-label="Task title"><select id="task-dept" aria-label="Task department">'+dlist.map(d=>'<option>'+escapeHTML(d.name)+'</option>').join("")+'</select><select id="task-priority" aria-label="Priority"><option>P1</option><option>P0</option><option>P2</option></select><button class="action-button" type="submit">+ Add action</button></form></div>';
body+='<p class="foot-note">Reset the local board by clearing this site’s browser storage. We do not sync or sell its contents.</p>';
return body}
function renderEditableTasks(records){
if(!records.length)return empty("No tasks match the current filters.");
return '<div class="task-stack">'+records.map(t=>'<article class="task-row"><div class="task-main"><span class="task-id">'+escapeHTML(t.id)+'</span><h3>'+escapeHTML(t.title)+'</h3><div class="task-info">'+chip(t.priority,t.priority==="P0"?"red":"neutral")+' <span>'+escapeHTML(t.department)+'</span> <span>· '+escapeHTML(t.due)+'</span></div><p>'+escapeHTML(t.note||"")+'</p><small>Evidence: '+escapeHTML(t.evidence||"Not linked")+'</small></div><label class="task-status-label">Local status<select class="task-state" data-id="'+escapeHTML(t.id)+'">'+["Ready","In progress","Waiting","Blocked","Recurring","Controlled","Backlog","Done"].map(st=>'<option '+(t.status===st?"selected":"")+'>'+st+'</option>').join("")+'</select></label></article>').join("")+'</div>';
}
function workflowPage(){
let body=pageHeader("ENGINEERING / EXECUTION REGISTRY","Workflow registry","Verified Make scenario inventory for this company only. Unrelated creator and store workflows are excluded.",external("Open Make workspace",D.links.make))+stamp();
body+='<div class="metrics-grid"><div class="metric"><span>Company prototypes and helpers</span><strong>3</strong><small>Verified Make inventory</small></div><div class="metric"><span>Active scenarios</span><strong>0</strong><small>All listed scenarios inactive</small></div><div class="metric"><span>Production deployments</span><strong>0</strong><small>No verified customer rollout</small></div><div class="metric"><span>QA spend tonight</span><strong>0</strong><small>No scenario executed</small></div></div>';
body+=sectionTitle("SYSTEM INVENTORY","Scenario catalog","The registry shows configuration and current inspected state, not live control.")+filterBar("workflow",{placeholder:"Search workflows and modules",selects:[{id:"status",title:"statuses",options:["Inactive","Active","Error"]}]})+'<div id="workflow-cards">'+renderWorkflows(D.workflows||[])+'</div>';
body+=sectionTitle("HANDLING","Scenario operational requirements")+'<div class="card-grid">'+[
["Discovery gate","Never activate or adapt a scenario for a customer without specific requirements and permission."],
["Data safety","Document fields, data retention, PII exposure, exceptions, access boundaries and human review."],
["Idempotency","Use stable document IDs, check-before-create, safe retries and duplicate alerts."],
["QA evidence","Test input-to-output accuracy, failures, repeat handling and rollback before delivery."],
["Cost control","Require a specific test budget before paid Gemini, Make or other API execution."],
["Ownership","Client-owned connections and documented handover on paid delivery."]
].map(x=>card(x[0],x[1],"REQUIRED CONTROL")).join("")+'</div>';
return body}
function renderWorkflows(items){
if(!items.length)return empty("No matching workflows in this registry.");
return '<div class="workflow-list">'+items.map(w=>'<article class="workflow-card"><div class="workflow-top"><div><div class="eyebrow">'+escapeHTML(w.id)+' · '+escapeHTML(w.category)+'</div><h3>'+escapeHTML(w.name)+'</h3><p>'+escapeHTML(w.system)+' scenario #'+escapeHTML(w.scenarioId)+' · '+escapeHTML(w.trigger)+' · Last edit '+escapeHTML(w.lastEdit)+'</p></div>'+chip(w.status,w.status==="Inactive"?"neutral":"amber")+'</div><div class="module-flow">'+w.steps.map((s,i)=>'<div class="module"><span>'+String(i+1).padStart(2,"0")+'</span>'+escapeHTML(s)+'</div>').join("")+'</div><div class="workflow-info"><div><span>Validation</span><p>'+escapeHTML(w.validation)+'</p></div><div><span>Risk</span><p>'+escapeHTML(w.risk)+'</p></div><div><span>Next action</span><p>'+escapeHTML(w.next)+'</p></div></div></article>').join("")+'</div>'}
function databasesPage(){
let body=pageHeader("DATA / GOVERNANCE","Source databases","The Google Sheets master CRM is the initial authoritative operational database.",external("Open master CRM",official));
body+='<div class="notice"><strong>Security boundary:</strong> The links below take authorized users to Google Sheets. This public website does not fetch individual rows, contacts, suppression addresses or private message content.</div>';
body+=sectionTitle("SOURCE OF TRUTH","Nine governed tables","Each source has a defined operational role and primary department.")+'<div class="resource-grid">'+(D.datasets||[]).map((x,i)=>'<a class="resource-card source-detailed" target="_blank" rel="noopener noreferrer" href="'+official+'#gid='+x.gid+'"><span>▤ '+String(i+1).padStart(2,"0")+'</span><strong>'+escapeHTML(x.name)+'</strong><p>'+escapeHTML(x.purpose)+'</p><small>'+escapeHTML(x.owner)+' ↗</small></a>').join("")+'</div>';
body+=sectionTitle("DATA MODEL","Planned private relational model")+'<div class="card-grid">'+["Organizations / verified identity","Contacts / permissions","Opportunities / stage evidence","Messages / sent and reply state","Suppressions / exact and domain","Projects / requirements and acceptance","Tasks / owner and due date","Integrations / sync runs and errors","Audit log / actor and source"].map(x=>card(x.split(" / ")[0],x.split(" / ")[1],"PRIVATE BACKEND TABLE")).join("")+'</div>';
body+=sectionTitle("CHANGE RULES","Integrity before convenience")+'<div class="process-list">'+[
["Source checks","Read header schema and latest values before updates; validate input types."],
["Deduplication","Use source ID plus normalized domain and email keys when relevant."],
["Optimistic writes","Check record version and update only after validating no external change."],
["Suppression guard","Check No Contact and delivery failures before outbound actions."],
["Audit trail","Log actor, timestamp, before/after and evidence for every change."],
["Reconciliation","Compare expected row counts and source timestamps; flag drift."]
].map((p,i)=>'<div class="process-step"><div class="step-number">'+String(i+1).padStart(2,"0")+'</div><div><h3>'+p[0]+'</h3><p>'+p[1]+'</p></div></div>').join("")+'</div>';
return body}
function reportsPage(){
let body=pageHeader("REPORTING / COMPANY INTELLIGENCE","Analytics & reports","Commercial evidence, operating health and data provenance. No estimates are presented as verified revenue.",external("Open Dashboard",source("Dashboard")))+stamp();
body+='<div class="metrics-grid">'+(D.kpis||[]).map(metric).join("")+'</div>';
body+=sectionTitle("FUNNEL QUALITY","What the numbers actually mean")+'<div class="feature-grid"><div class="feature-card"><h3>Opportunity classification</h3><div class="bar-rows">'+[
{label:"Explicit research-only entries",value:174,max:250,color:"var(--amber)"},
{label:"All tracked opportunity records",value:250,max:250,color:"var(--accent)"}
].map(x=>'<div class="bar-line"><div><span>'+x.label+'</span><strong>'+x.value+'</strong></div><div class="bar"><span style="width:'+(100*x.value/x.max)+'%;background:'+x.color+'"></span></div></div>').join("")+'</div><p class="foot-note">250 includes research records and cannot be treated as 250 qualified opportunities.</p></div><div class="feature-card"><h3>Outbound measurement</h3><div class="bar-rows">'+[
{label:"Gmail-accepted messages",value:183,max:200,color:"var(--accent)"},
{label:"Distinct recipient addresses",value:179,max:200,color:"var(--amber)"},
{label:"Historical delivery bounces",value:8,max:200,color:"var(--red)"}
].map(x=>'<div class="bar-line"><div><span>'+x.label+'</span><strong>'+x.value+'</strong></div><div class="bar"><span style="width:'+(100*x.value/x.max)+'%;background:'+x.color+'"></span></div></div>').join("")+'</div><p class="foot-note">Multiple sends can go to one address. Delivery errors are not successful contacts.</p></div></div>';
body+=sectionTitle("REVIEW CADENCE","Recommended reporting rhythm")+'<div class="card-grid">'+[
["Daily","New buyer replies, bounces, suppressions, stage movement and next concrete actions."],
["Twice daily","Qualified prospect search if delivery health and opportunity quality justify it."],
["Weekly","Source reconciliation, deal progression, technical evidence, blockers and follow-up rules."],
["Monthly","Verified collected revenue, costs, wins, losses, customer acceptance and support burden."]
].map(x=>card(x[0],x[1],"REVIEW")).join("")+'</div>';
return body}
function integrationsPage(){
let body=pageHeader("SYSTEMS / CONNECTIVITY","Integration center","Precisely distinguish available ChatGPT connectors from website-integrated services.","");
body+='<div class="notice"><strong>Two free integration paths:</strong> The new Owner Live Data page can fetch private Google Sheets and optional Gmail read-only through a Google sign-in authorized directly in your browser. Unattended synchronization, secure Make API access and audited writes still require a protected backend.</div>';
body+='<div class="integration-quicklink"><a class="action-button" href="'+root+'systems/owner-data.html">◈ Open browser-only Google connection</a><span>No new hosting subscription · OAuth setup required</span></div>';
body+=sectionTitle("CONNECTION HEALTH","Provider access vs website integration")+'<div class="table-wrap"><table><thead><tr><th>System</th><th>Verified access</th><th>Website state</th><th>Next action</th></tr></thead><tbody>'+D.integrations.map(x=>'<tr><td><strong>'+escapeHTML(x.name)+'</strong><small>'+escapeHTML(x.security)+'</small></td><td>'+chip(x.access,"neutral")+'</td><td>'+chip(x.website,x.website.includes("Not")?"red":"amber")+'</td><td>'+escapeHTML(x.action)+'</td></tr>').join("")+'</tbody></table></div>';
body+=sectionTitle("TARGET ARCHITECTURE","Secure system boundaries")+'<div class="architecture"><div class="architecture-layer"><small>PUBLIC PRESENTATION</small><strong>GitHub Pages</strong><span>Navigation, static UI, public-safe aggregate exports</span></div><div class="architecture-arrow">↓ owner-authorized Google OAuth can read directly in the browser</div><div class="architecture-layer protected"><small>FUTURE PRIVATE BACKEND</small><strong>Authenticated API for unattended operations</strong><span>Required only for background sync, Make secrets, access control and audited writes</span></div><div class="architecture-arrow">↓ future server-managed tokens, separate from temporary owner browser grants</div><div class="architecture-row"><div class="architecture-layer"><small>DATA</small><strong>Google Sheets CRM</strong><span>Read-only first, audited writes later</span></div><div class="architecture-layer"><small>COMMUNICATION</small><strong>Gmail</strong><span>Threads, delivery and suppression</span></div><div class="architecture-layer"><small>EXECUTION</small><strong>Make</strong><span>Scenario status, not automatic activation</span></div></div></div>';
body+=sectionTitle("SECURITY CHECKS","Required before a production integration")+'<div class="card-grid">'+[
["Authentication","No private CRM or email data before logged-in access control."],
["Least privilege","Browser OAuth uses temporary read-only user grants. Any backend credentials must stay server-side."],
["No side-effect sync","Read-only provider sync initially; no emails or workflow runs triggered."],
["Consent","Respect opt-outs, authorization boundaries and message retention."],
["Write integrity","Audit logs, dedupe, conflict checks, backoff, idempotency and rollback."],
["Cost limits","Explicit ceilings and alerts for Make, LLM and API usage."]
].map(x=>card(x[0],x[1],"RELEASE GATE")).join("")+'</div>';
return body}
const roadmap=[
{phase:"01",title:"Information architecture",status:"Implemented in GitHub",owner:"Website",gate:"All seven departments and system routes resolve",items:["Deploy multi-page department navigation","Create unique departmental overview/playbook/work/metrics views","Integrate data registry and action board"],result:"Public-safe operating website with useful navigable workspaces"},
{phase:"02",title:"Source reconciliation",status:"Partially implemented",owner:"Operations",gate:"CRM figures and Make inventory inspected with timestamp and provenance",items:["Verify all nine spreadsheet tabs and source identifiers","Reconcile Gmail accepted, replies, bounces and opt-outs","Confirm Make scenario ownership; exclude unrelated projects"],result:"Audited CRM baseline and correctly scoped workflow inventory"},
{phase:"03",title:"Protected identity and backend",status:"Blocked on hosting/auth",owner:"Infrastructure",gate:"User login and server endpoints work without exposing secrets",items:["Choose protected provider and identity platform","Restrict record access to authorized users","Store tokens only in server environment","Add session controls and logs"],result:"Private dashboard infrastructure"},
{phase:"04",title:"Read-only live connectors",status:"Not started",owner:"Infrastructure",gate:"Source data reconciles under test and freshness is displayed",items:["Pull Sheets data into normalized private tables","Reconcile Gmail threads, status, and suppressions","Poll Make scenario status under appropriate scope","Show drift, errors and source timestamps"],result:"Accurate operational screens using live private data"},
{phase:"05",title:"Controlled operational actions",status:"Not started",owner:"Operations + Engineering",gate:"Permission tests, conflict simulation and audit review pass",items:["Add CRM task and stage editing with row version checks","Require permission review for outbound actions","Add change history and idempotent webhook processing","Verify rollback, alerts and rate limits"],result:"Safe centralized operations"},
{phase:"06",title:"Delivery intelligence",status:"Not started",owner:"Company-wide",gate:"At least one complete real project cycle validated",items:["Track requirements and customer acceptance tests","Record project milestones and actual costs","Generate verified executive reporting","Review workflows for quality and maintenance"],result:"Company management platform grounded in delivery evidence"}
];
function chatSetupPage(){return pageHeader("COMPANY / TEAM COORDINATION","Chat launchpad","All nine Project chats are created and their instructions sent, as confirmed by the owner. Verify shared CRM access and handoffs next.",'<a href="https://chatgpt.com/" class="outline-button" target="_blank" rel="noopener noreferrer">Open ChatGPT ↗</a>')+'<div id="chat-launch-root"><div class="notice">Loading verified chat role instructions…</div></div>';}
function ownerDataPage(){return pageHeader("PRIVATE ACCESS / GOOGLE WORKSPACE","Owner live data","Read-only Google Workspace information, fetched directly with your own Google authorization. No tokens or rows are stored on GitHub.",external("Master CRM",D.links?.crm||"#"))+'<div id="owner-live-root"><div class="notice">Loading private connection options. No private data is accessed until you authorize it.</div></div>';}
function roadmapPage(){
let body=pageHeader("DELIVERY / SYSTEM PLAN","Operating roadmap","Dependency-led execution plan. Implemented, blocked and planned work are labeled separately.");
body+='<div class="notice"><strong>Tonight’s practical boundary:</strong> The public site, verified source audit and detailed department procedures can be completed without new credentials. Authenticated live CRM/Gmail functionality requires private hosting and permissions.</div>';
body+='<div class="roadmap-stack">'+roadmap.map(p=>'<article class="roadmap-row"><div class="roadmap-marker">'+p.phase+'</div><div class="roadmap-detail"><div class="roadmap-top"><div><div class="eyebrow">WORKSTREAM '+p.phase+' · '+escapeHTML(p.owner)+'</div><h3>'+escapeHTML(p.title)+'</h3></div>'+chip(p.status,p.status.includes("Implemented")?"success":p.status.includes("Blocked")?"red":"neutral")+'</div><p class="muted">Exit criterion: '+escapeHTML(p.gate)+'</p><ul>'+p.items.map(x=>'<li>'+escapeHTML(x)+'</li>').join("")+'</ul><div class="deliverable"><strong>Deliverable</strong><span>'+escapeHTML(p.result)+'</span></div></div></article>').join("")+'</div>';
body+=sectionTitle("ACCOUNTABILITY","Acceptance requirements")+'<div class="card-grid">'+[
["Website","All links, routes and interactive controls tested; mobile layout checked."],
["CRM","Correct schema, timestamps, record counts, no contact data in public exports."],
["Gmail","Accepted/rejected/replied states distinguished; suppressed addresses protected."],
["Make","Only company scenarios inventoried; no surprise credits or activation."],
["Sales","Specific buyer need and owner tracked; outreach logged only when accepted."],
["Operations","Every change linked to evidence, actor, timestamp and rollback plan."]
].map(x=>card(x[0],x[1],"DEFINITION OF DONE")).join("")+'</div>';
return body}
function getPage(){
switch(currentSystem){
case "pipeline":return pipelinePage();
case "projects":return projectBoardPage();
case "management":return managementPage();
case "chatsetup":return chatSetupPage();
case "tasks":return taskPage();
case "workflows":return workflowPage();
case "databases":return databasesPage();
case "reports":return reportsPage();
case "integrations":return integrationsPage();
case "ownerdata":return ownerDataPage();
case "roadmap":return roadmapPage();
default:return departmentPage();
}
}
function applyTaskFilters(){
const q=filterTasks.q.toLowerCase(),status=filterTasks.status,dep=filterTasks.department,pr=filterTasks.priority;
const list=localTasks.filter(t=>(status==="all"||t.status===status)&&(pr==="all"||t.priority===pr)&&(dep==="all"||t.department===dep)&&[t.title,t.note,t.department,t.evidence,t.id].join(" ").toLowerCase().includes(q));
const el=document.getElementById("task-board");if(el)el.innerHTML=renderEditableTasks(list);
}
function applyPipelineFilters(){
const q=filterPipeline.q.toLowerCase(),list=(D.pipeline||[]).filter(p=>(filterPipeline.stage==="all"||p.stage===filterPipeline.stage)&&(filterPipeline.type==="all"||p.type===filterPipeline.type)&&[p.id,p.account,p.signal,p.next,p.stage].join(" ").toLowerCase().includes(q));const el=document.getElementById("pipeline-table");if(el)el.innerHTML=renderPipelineTable(list);
}
function applyWorkflowFilters(){
const q=filterWorkflows.q.toLowerCase(),list=(D.workflows||[]).filter(w=>(filterWorkflows.status==="all"||w.status===filterWorkflows.status)&&[w.id,w.name,...w.steps,w.risk].join(" ").toLowerCase().includes(q));const el=document.getElementById("workflow-cards");if(el)el.innerHTML=renderWorkflows(list);
}
function setupInteractions(){
const focus=document.getElementById("focus-toggle");
if(focus){let active=false;try{active=localStorage.getItem("vave-hq-focus")==="1"}catch(e){}document.body.classList.toggle("focus-mode",active);focus.setAttribute("aria-pressed",String(active));focus.textContent=active?"◉ All sections":"◉ Focus";focus.addEventListener("click",()=>{active=!document.body.classList.contains("focus-mode");document.body.classList.toggle("focus-mode",active);focus.setAttribute("aria-pressed",String(active));focus.textContent=active?"◉ All sections":"◉ Focus";try{localStorage.setItem("vave-hq-focus",active?"1":"0")}catch(e){}})}
const menu=document.getElementById("menu-toggle");if(menu)menu.addEventListener("click",()=>document.getElementById("sidebar")?.classList.toggle("open"));
const search=document.getElementById("search-toggle"),close=document.getElementById("search-close"),layer=document.getElementById("search-layer"),query=document.getElementById("global-query");
const openSearch=()=>{layer.hidden=false;query.focus();showSearch("")},hideSearch=()=>{layer.hidden=true};
search?.addEventListener("click",openSearch);close?.addEventListener("click",hideSearch);layer?.addEventListener("click",e=>{if(e.target===layer)hideSearch()});
query?.addEventListener("input",e=>showSearch(e.target.value));
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();layer.hidden?openSearch():hideSearch()}if(e.key==="Escape"&&!layer.hidden)hideSearch()});
document.getElementById("copy-process")?.addEventListener("click",()=>{const list=department.process.map((p,i)=>(i+1)+". "+p[0]+": "+p[1]).join("\n");navigator.clipboard?.writeText(list).then(()=>{const b=document.getElementById("copy-process");b.textContent="Copied checklist"}).catch(()=>{alert("Copy not available in this browser.")})});
for(const key of ["stage","type"]){document.getElementById("pipeline-"+key)?.addEventListener("change",e=>{filterPipeline[key]=e.target.value;applyPipelineFilters()})}
document.getElementById("pipeline-search")?.addEventListener("input",e=>{filterPipeline.q=e.target.value;applyPipelineFilters()});
for(const key of ["status","department","priority"]){document.getElementById("tasks-"+key)?.addEventListener("change",e=>{filterTasks[key]=e.target.value;applyTaskFilters()})}
document.getElementById("tasks-search")?.addEventListener("input",e=>{filterTasks.q=e.target.value;applyTaskFilters()});
document.getElementById("task-board")?.addEventListener("change",e=>{if(!e.target.classList.contains("task-state"))return;const t=localTasks.find(x=>x.id===e.target.dataset.id);if(t){t.status=e.target.value;saveLocalTasks();applyTaskFilters()}});
document.getElementById("task-form")?.addEventListener("submit",e=>{e.preventDefault();const title=document.getElementById("task-title").value.trim();if(!title)return;localTasks.unshift({id:"LOCAL-"+Date.now(),department:document.getElementById("task-dept").value,title,priority:document.getElementById("task-priority").value,status:"Ready",due:"Unscheduled",evidence:"Local only",note:"Created in this browser; not synchronized."});saveLocalTasks();filterTasks={q:"",status:"all",priority:"all",department:"all"};render()});
document.getElementById("export-tasks")?.addEventListener("click",()=>{const fields=["id","department","title","priority","status","due","evidence","note"];const csv=[fields.join(","),...localTasks.map(t=>fields.map(f=>'"'+String(t[f]??"").replace(/"/g,'""')+'"').join(","))].join("\r\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="vave-hq-local-tasks.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
document.getElementById("workflow-search")?.addEventListener("input",e=>{filterWorkflows.q=e.target.value;applyWorkflowFilters()});
document.getElementById("workflow-status")?.addEventListener("change",e=>{filterWorkflows.status=e.target.value;applyWorkflowFilters()});
}
function searchEntries(){
const s=[];dlist.forEach(d=>{s.push({name:d.name,subtitle:d.short,url:companyLink(d.id)});d.views.forEach(v=>s.push({name:d.name+" · "+v[1],subtitle:d.purpose,url:companyLink(d.id)+"?view="+v[0]}));d.process.forEach(p=>s.push({name:p[0]+" · "+d.name,subtitle:p[1],url:companyLink(d.id)+"?view=playbook"}))});
navGroups.flatMap(g=>g.links).filter(x=>!dlist.some(d=>d.id===x[0])).forEach(x=>s.push({name:x[2],subtitle:"Operational system",url:x[3]}));
(D.workflows||[]).forEach(w=>s.push({name:w.name,subtitle:w.steps.join(" → "),url:root+"systems/workflows.html"}));
localTasks.forEach(t=>s.push({name:t.title,subtitle:t.department,url:root+"systems/tasks.html"}));
return s;
}
function showSearch(q){
const el=document.getElementById("global-results");if(!el)return;
const tokens=q.trim().toLowerCase().split(/\s+/).filter(Boolean);
const hits=searchEntries().filter(e=>tokens.length===0||tokens.every(t=>[e.name,e.subtitle].join(" ").toLowerCase().includes(t))).slice(0,18);
el.innerHTML=(hits.length?hits.map(e=>'<a class="search-hit" href="'+escapeHTML(e.url)+'"><strong>'+escapeHTML(e.name)+'</strong><span>'+escapeHTML(e.subtitle)+'</span></a>').join(""):empty("No matching pages or actions"))+'<div class="search-tip">Searches public-safe page content and local tasks only. Private CRM rows are not indexed here.</div>';
}
function render(){
const app=document.getElementById("app");if(!app)return;app.innerHTML=renderShell(getPage());setupInteractions();
}
render();
if(typeof fetch==="function")fetch(root+"data/overview.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(x=>{if(x&&x.metrics&&x.mode==="manual-read-only-snapshot"){snapshot=x;document.querySelectorAll("[data-metric]").forEach(el=>{const key=el.dataset.metric;if(Object.prototype.hasOwnProperty.call(snapshot.metrics,key))el.textContent=String(snapshot.metrics[key])})}}).catch(()=>{});
})();