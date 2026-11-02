(function(){
"use strict";
const root=document.getElementById("board-root");
if(!root)return;
const D=window.HQ_DATA||{};
const stages=[
{id:"Research",label:"Research",caption:"Evidence & fit"},
{id:"Contacted",label:"Contacted",caption:"Initial dialogue"},
{id:"Replied",label:"Replied",caption:"Confirmed response"},
{id:"Discovery",label:"Discovery",caption:"Requirements & budget"},
{id:"Proposal",label:"Proposal",caption:"Scope & terms"},
{id:"Won",label:"Won",caption:"Paid agreement"}
];
const snapshot=Array.isArray(D.pipeline)?D.pipeline.map(x=>({...x})).filter(x=>x.stage!=="Lost"):[];
let opportunities=snapshot.map(x=>({...x,stage:x.stage==="Nurture"?"Research":x.stage}));
let moved=new Set();
let activeTab="pipeline", selected=opportunities.find(x=>x.stage==="Replied")?.id||null;
let q="", menuExpanded=false;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=id=>document.getElementById(id);
const currency=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);
function currentRecord(){return opportunities.find(x=>x.id===selected)}
function chip(t,type="default"){return '<span class="client-chip '+type+'">'+esc(t)+'</span>'}
function stat(label,value,sub,icon){return '<div class="board-stat"><span class="board-stat-icon" aria-hidden="true">'+icon+'</span><div><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong><span>'+esc(sub)+'</span></div></div>'}
function renderTop(){
return '<div class="board-stats">'+stat("Tracked shortlist",opportunities.length,"Public-safe prospective records","↗")+stat("Confirmed client projects","0","No approved contract","◈")+stat("In active delivery","0","No paid engagements","⌘")+stat("Confirmed payments",currency(0),"No verified receipts","€")+'</div>'+
'<div class="board-tabline" role="tablist" aria-label="Client and project views">'+[
["pipeline","Opportunity flow","01"],["delivery","Client projects","02"],["payments","Payment ledger","03"],["activity","Activity & evidence","04"]
].map(x=>'<button role="tab" aria-selected="'+(activeTab===x[0]?"true":"false")+'" class="board-tab '+(activeTab===x[0]?"active":"")+'" data-tab="'+x[0]+'"><small>'+x[2]+'</small>'+x[1]+'</button>').join("")+'</div>'
}
function visible(){const needle=q.trim().toLowerCase();return opportunities.filter(x=>!needle||[x.account,x.stage,x.signal,x.next,x.id].join(" ").toLowerCase().includes(needle))}
function renderPipeline(){
const cards=visible();
return '<div class="board-heading"><div><span class="board-kicker">OPPORTUNITY BOARD</span><h3>Every stage. One clear picture.</h3><p>Drag cards between stages to preview a potential move. This does not update the CRM.</p></div><div class="board-actions"><input class="board-search" id="board-search" type="search" placeholder="Search opportunities…" value="'+esc(q)+'" aria-label="Search opportunities"><button class="outline-button board-reset" id="board-reset" type="button" '+(moved.size?"":"disabled")+'>↶ Reset preview'+(moved.size?" · "+moved.size:"")+'</button></div></div>'+
'<div class="board-hint"><span class="board-hint-dot"></span><span>LOCAL PREVIEW — card movements are not saved to Google Sheets. Use the private CRM for real stage changes.</span></div>'+
'<div class="board-scroller" id="board-scroller" aria-label="Opportunity stages">'+stages.map((st,i)=>{
const list=cards.filter(x=>x.stage===st.id);
return '<section class="board-column" data-stage="'+esc(st.id)+'" aria-label="'+esc(st.label)+' opportunities"><div class="board-column-head"><div class="board-column-name"><span class="board-stage-index">'+String(i+1).padStart(2,"0")+'</span><strong>'+st.label+'</strong></div><span class="board-column-count">'+list.length+'</span></div><p class="board-column-sub">'+st.caption+'</p><div class="board-card-list">'+(list.length?list.map(x=>renderOpportunity(x)).join(""):'<div class="board-empty">No opportunities<br>at this stage</div>')+'</div></section>'}).join("")+'</div>'+
'<div class="board-bottom"><span><i class="board-signal"></i> Verified CRM snapshot baseline: '+esc(D.sourceAsOf||"Oct 2026")+'</span><span>Drag to explore · Select to inspect · Confirm updates in Google Sheets</span></div>'+
renderDetail();
}
function renderOpportunity(x){
const cls=x.stage==="Replied"?"warm":x.stage==="Won"?"success":"";
return '<button type="button" class="opportunity-card '+cls+(selected===x.id?" selected":"")+(moved.has(x.id)?" moved":"")+'" draggable="true" data-id="'+esc(x.id)+'" aria-label="Inspect opportunity '+esc(x.account)+'">'+
'<div class="opportunity-card-top"><span class="avatar-mark">'+esc(x.account.slice(0,1))+'</span><span class="card-ref">'+esc(x.id)+'</span><span class="grab-indicator" aria-hidden="true">⠿</span></div>'+
'<h4>'+esc(x.account)+'</h4><p>'+esc(x.signal)+'</p>'+
'<div class="opportunity-meta"><span class="mini-priority '+(x.priority==="P0"?"hot":"")+'">'+esc(x.priority)+'</span><span>'+esc(x.last)+'</span></div>'+
'<div class="opportunity-card-footer"><span>Next action</span><span aria-hidden="true">↗</span></div></button>'
}
function renderDetail(){
const x=currentRecord();if(!x)return "";
return '<aside class="board-detail" id="board-detail" aria-label="Selected opportunity"><div class="detail-head"><div><span class="board-kicker">OPPORTUNITY DETAIL</span><h3>'+esc(x.account)+'</h3></div><button id="close-detail" class="detail-close" aria-label="Close details">✕</button></div>'+
'<div class="detail-tags">'+chip(x.type)+chip(x.priority,x.priority==="P0"?"priority":"")+(moved.has(x.id)?chip("Preview moved","preview"):chip("Snapshot state",""))+'</div>'+
'<dl class="detail-grid"><div><dt>Opportunity ID</dt><dd>'+esc(x.id)+'</dd></div><div><dt>Working stage</dt><dd>'+esc(x.stage)+'</dd></div><div><dt>Last touched</dt><dd>'+esc(x.last)+'</dd></div><div><dt>Confirmed payment</dt><dd>'+currency(0)+'</dd></div></dl>'+
'<div class="detail-section"><span class="board-kicker">WHAT IS VERIFIED</span><p>'+esc(x.signal)+'</p></div>'+
'<div class="detail-section"><span class="board-kicker">NEXT ACTION</span><p>'+esc(x.next)+'</p></div>'+
'<div class="detail-section"><span class="board-kicker">CURRENT EVIDENCE</span><p>'+esc(x.confidence||"Read source CRM for full detail")+'</p></div>'+
'<div class="detail-move"><label for="board-stage-select">Preview move to a stage</label><div class="detail-move-row"><select id="board-stage-select" aria-label="Stage preview">'+stages.map(s=>'<option value="'+s.id+'"'+(x.stage===s.id?" selected":"")+'>'+s.label+'</option>').join("")+'</select><button id="board-move" class="action-button" type="button">Preview</button></div><small>Does not change authoritative records.</small></div>'+
'<a class="board-source-link" href="'+esc(D.links?.crm||"#")+'" rel="noopener noreferrer" target="_blank">Open private CRM source <span>↗</span></a></aside>'
}
function emptyPage(title,lead,extra,icon){
return '<div class="board-empty-view"><div class="empty-orbit"><span>'+icon+'</span></div><span class="board-kicker">VERIFIED COMPANY STATUS</span><h3>'+title+'</h3><p>'+lead+'</p><div class="board-empty-action">'+extra+'</div></div>';
}
function renderDelivery(){
return '<div class="board-heading"><div><span class="board-kicker">DELIVERY</span><h3>Client projects</h3><p>Only contractually approved client work belongs here—not research, forum posts, or independent prototypes.</p></div></div>'+
'<div class="delivery-grid"><div class="delivery-column"><header><span class="delivery-dot"></span>Planning <b>0</b></header>'+emptyPage("No scoped projects yet","Once a real buyer agrees to a paid scope, its delivery record will appear here.",'<a href="'+esc(D.links?.pilot||"#")+'" class="outline-button" target="_blank" rel="noopener">Open pilot template ↗</a>',"◇")+'</div><div class="delivery-column"><header><span class="delivery-dot amber"></span>In progress <b>0</b></header>'+emptyPage("No active client builds","The independent RentRoll prototype is not a commissioned client delivery.",'<a href="workflows.html" class="outline-button">View workflow registry ↗</a>',"⌘")+'</div><div class="delivery-column"><header><span class="delivery-dot success"></span>Delivered <b>0</b></header>'+emptyPage("No completed contracts","Deliverables will be recorded only with client acceptance evidence.",'<a href="'+esc(D.links?.qa||"#")+'" class="outline-button" target="_blank" rel="noopener">Review QA standard ↗</a>',"✓")+'</div></div>';
}
function renderPayments(){
return '<div class="board-heading"><div><span class="board-kicker">FINANCIAL OPERATIONS</span><h3>Payment ledger</h3><p>Only verifiable payments and accepted client work. This is not accounting or an invoice generator.</p></div></div>'+
'<div class="finance-hero"><div><span>CONFIRMED REVENUE</span><strong>€0</strong><p>Based on company CRM. No paying clients are verified.</p></div><div class="finance-bars" aria-hidden="true"><span style="height:18%"></span><span style="height:18%"></span><span style="height:18%"></span><span style="height:18%"></span><span style="height:18%"></span><span style="height:18%"></span><span style="height:18%"></span></div></div>'+
'<div class="payment-table"><div class="payment-table-head"><span>PROJECT</span><span>AMOUNT</span><span>STATUS</span><span>VERIFICATION</span></div><div class="payment-empty">No verified payments or outstanding client invoices have been recorded in the inspected CRM snapshot.</div></div>'+
'<div class="board-hint"><span class="board-hint-dot"></span><span>Do not assume income from an inquiry or proposed scope. Paid means payment is verified in the authoritative records.</span></div>';
}
function renderActivity(){
const events=[
{date:"2026-11-02",kind:"HQ",title:"Company project board reviewed",desc:"Project status and payments remain zero; this public board uses a sanitized source snapshot."},
{date:"2026-10-26",kind:"Sales",title:"Buyer check-in already sent",desc:"A genuine accounting-document intake problem was described; wait for reply without repeated chasing."},
{date:"2026-10-23",kind:"Partner",title:"Agency response resolved",desc:"Internal team handles integrations; no external subcontract work currently."},
{date:"2026-10-22",kind:"Partner",title:"Prototype outline discussed",desc:"Potential future collaborator asked for a technical outline; no active project confirmed."},
{date:"2026-10-01",kind:"Development",title:"RentRoll prototype history",desc:"Historical successful Make prototype executions were noted; extraction accuracy and production delivery unverified."}
];
return '<div class="board-heading"><div><span class="board-kicker">TIMELINE</span><h3>What actually happened</h3><p>Illustrative public-safe milestones derived from existing inspected records.</p></div></div>'+
'<div class="activity-track">'+events.map((e,i)=>'<div class="activity-entry"><div class="activity-rail"><span></span></div><div class="activity-date">'+esc(e.date)+'</div><div class="activity-body">'+chip(e.kind,i===0?"preview":"default")+'<h4>'+esc(e.title)+'</h4><p>'+esc(e.desc)+'</p></div></div>').join("")+'</div>'+
'<div class="board-hint"><span class="board-hint-dot"></span><span>This is an evidence summary, not a live Gmail history. See source records for exact timestamps and message details.</span></div>';
}
function html(){
return renderTop()+'<div class="board-content" id="board-content">'+(activeTab==="pipeline"?renderPipeline():activeTab==="delivery"?renderDelivery():activeTab==="payments"?renderPayments():renderActivity())+'</div>';
}
function render(){root.innerHTML=html();attach()}
function move(id,stage){
const rec=opportunities.find(x=>x.id===id);if(!rec||!stages.some(x=>x.id===stage))return;
const card=root.querySelector('[data-id="'+id+'"]');const before=card?.getBoundingClientRect()||null;const scroll=$("board-scroller")?.scrollLeft||0;
rec.stage=stage;moved.add(id);selected=id;render();
const scroller=$("board-scroller");if(scroller)scroller.scrollLeft=scroll;
const after=root.querySelector('[data-id="'+id+'"]');if(after&&before&&window.matchMedia&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
const next=after.getBoundingClientRect();const dx=before.left-next.left,dy=before.top-next.top;if(Math.abs(dx)<900&&Math.abs(dy)<700)after.animate([{transform:"translate("+dx+"px,"+dy+"px)",opacity:.55,scale:.94},{transform:"translate(0,0)",opacity:1,scale:1}],{duration:510,easing:"cubic-bezier(.22,1,.36,1)"});
}
}
function attach(){
root.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{activeTab=b.dataset.tab;selected=null;render()}));
$("board-search")?.addEventListener("input",e=>{const pos=e.target.selectionStart;q=e.target.value;const scroll=$("board-scroller")?.scrollLeft||0;render();const field=$("board-search");field?.focus();field?.setSelectionRange(pos,pos);if($("board-scroller"))$("board-scroller").scrollLeft=scroll});
$("board-reset")?.addEventListener("click",()=>{opportunities=snapshot.map(x=>({...x,stage:x.stage==="Nurture"?"Research":x.stage}));moved.clear();selected=null;render()});
root.querySelectorAll(".opportunity-card").forEach(el=>{
el.addEventListener("click",()=>{selected=el.dataset.id;const s=$("board-scroller")?.scrollLeft||0;render();if($("board-scroller"))$("board-scroller").scrollLeft=s});
el.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",el.dataset.id);e.dataTransfer.effectAllowed="move";el.classList.add("dragging")});
el.addEventListener("dragend",()=>el.classList.remove("dragging"));
});
root.querySelectorAll(".board-column").forEach(col=>{
col.addEventListener("dragover",e=>{e.preventDefault();e.dataTransfer.dropEffect="move";col.classList.add("drag-over")});
col.addEventListener("dragleave",e=>{if(!col.contains(e.relatedTarget))col.classList.remove("drag-over")});
col.addEventListener("drop",e=>{e.preventDefault();col.classList.remove("drag-over");move(e.dataTransfer.getData("text/plain"),col.dataset.stage)});
});
$("board-move")?.addEventListener("click",()=>{const st=$("board-stage-select");if(selected&&st)move(selected,st.value)});
$("close-detail")?.addEventListener("click",()=>{selected=null;const s=$("board-scroller")?.scrollLeft||0;render();if($("board-scroller"))$("board-scroller").scrollLeft=s});
}
render();
})();