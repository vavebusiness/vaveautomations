(function(){
"use strict";
const mount=document.getElementById("chat-launch-root");if(!mount)return;
const roles=Array.isArray(window.VAVE_CHAT_ROLES)?window.VAVE_CHAT_ROLES:[];
const projectUrl="https://chatgpt.com/";
const crm="https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit";
const registry=crm+"#gid=2070433",events=crm+"#gid=2070432",queue=crm+"#gid=2070431";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let status="";
let query=(new URLSearchParams(location.search).get("chat")||"").slice(0,30);
let filter=/^0[0-6]$/.test(query)?"core":/^0[7-8]$/.test(query)?"specialist":"all";
const KEY="vave-hq-chat-role-setup-v1";
function loadProgress(){try{const x=JSON.parse(localStorage.getItem(KEY));return x&&typeof x==="object"?x:{}}catch(e){return{}}}
let progress=loadProgress();
function saveProgress(){try{localStorage.setItem(KEY,JSON.stringify(progress))}catch(e){status="Browser storage unavailable. The setup checkmarks may not persist."}}
function isDone(id){return progress[id]===true}
function totals(){
return {all:roles.length,done:roles.filter(x=>isDone(x.number)).length,core:roles.filter(x=>x.state==="core").length,specialist:roles.filter(x=>x.state==="specialist").length};
}
function tile(r){
const applied=isDone(r.number);
const isCore=r.state==="core";
const note=r.number==="05"?'<div class="chat-remap"><strong>Company department:</strong> '+esc(r.original)+'<br><strong>Current company remit:</strong> Portfolio & Assets, excluding unrelated store work.</div>':"";
return '<article class="chat-role-card '+(applied?"is-setup":"")+'" data-role-card="'+esc(r.number)+'">'+
'<div class="chat-role-top"><div class="chat-role-number">'+esc(r.number)+'</div><div class="chat-role-title"><div class="eyebrow">'+(isCore?"CORE DEPARTMENT · CHAT CREATED":"SPECIALIST · CHAT CREATED")+'</div><h3>'+esc(r.name)+'</h3><span class="chat-role-origin">'+esc(r.original)+'</span></div><span class="chat-role-state '+(applied?"setup":"")+'">'+(applied?"✓ Source reviewed locally":"✓ Instructions sent")+'</span></div>'+
'<p class="chat-role-purpose">'+esc(r.purpose)+'</p>'+
note+
'<div class="chat-role-evidence"><span>AUTHORITY</span><div>'+r.sources.slice(0,4).map(x=>'<span class="chat-source-tag">'+esc(x)+'</span>').join("")+'</div></div>'+
'<div class="chat-role-handoff"><span>HANDOFF</span><p>'+esc(r.handoff)+'</p></div>'+
'<div class="chat-role-controls"><button class="action-button chat-copy" data-copy="'+esc(r.number)+'" type="button">'+"Copy role instructions again"+'</button><a class="outline-button" href="'+esc(r.hqUrl)+'" target="_blank" rel="noopener noreferrer">HQ section ↗</a></div>'+
'<div class="chat-role-minor"><a href="'+esc(r.sourceDoc)+'" target="_blank" rel="noopener noreferrer">Read operating brief ↗</a><label><input type="checkbox" data-check="'+esc(r.number)+'" '+(applied?"checked":"")+'><span>Source review completed (local check)</span></label></div>'+
'</article>';
}
function group(title,subtitle,data){
return '<section class="chat-role-group"><div class="chat-role-group-head"><div><span class="eyebrow">'+esc(subtitle)+'</span><h2>'+esc(title)+'</h2></div><span>'+data.length+' workstreams</span></div><div class="chat-role-grid">'+(data.length?data.map(tile).join(""):'<div class="chat-role-zero">No matching chats. Clear the search or change the filter.</div>')+'</div></section>';
}
function render(){
const t=totals();
const match=r=>(filter==="all"||r.state===filter)&&[r.number,r.name,r.original,r.purpose,r.department,r.handoff,...r.sources].join(" ").toLowerCase().includes(query.trim().toLowerCase());
const existing=roles.filter(r=>r.state==="core"&&match(r)),newOnes=roles.filter(r=>r.state==="specialist"&&match(r));
mount.innerHTML='<div class="chatlaunch-intro chatlaunch-all"><span class="eyebrow">COMPANY COMMUNICATION ARCHITECTURE</span><h2>All nine chats. One company operating system.</h2><p>The owner created all nine conversations and pasted their operating instructions. The next stage is verifying that each chat can read its sources and write an evidence-backed handoff to the private CRM.</p><div class="chatlaunch-stats"><span><strong>'+t.core+'</strong> core departments</span><span><strong>'+t.specialist+'</strong> specialists</span><span><strong>'+t.done+'/'+t.all+'</strong> source reviews checked locally</span></div></div>'+
'<div class="chat-control-bar"><div class="chat-control-title"><span class="eyebrow">WORKSTREAM SETUP</span><h3>All nine chats are created. Verify their source access next.</h3><p>Instructions were sent according to the owner. Mark source review only after the chat has actually inspected its assigned records. This local checklist is not synchronized to the CRM.</p></div><div class="chat-control-inputs"><input type="search" id="chat-role-search" placeholder="Search chat, source or responsibility…" value="'+esc(query)+'" aria-label="Search chats"><div class="chat-role-filter" role="group" aria-label="Filter chats">'+[["all","All 9"],["core","Core 7"],["specialist","Specialists 2"]].map(([id,label])=>'<button type="button" data-role-filter="'+id+'" class="'+(filter===id?"active":"")+'">'+label+'</button>').join("")+'</div></div></div>'+
'<div class="chat-step-guide"><div><span>01</span><p>Open each of the nine newly created Project conversations.</p></div><div><span>02</span><p>Instructions have been sent. Ask each chat to read its assigned CRM sources.</p></div><div><span>03</span><p>Verify at least one evidence-backed result and a next action.</p></div><div><span>04</span><p>Record actual chat URLs and source-review status privately in Chat Registry.</p></div></div>'+
(filter!=="specialist"?group("Seven core departments","NEW CHATS · SOURCE REVIEW PENDING",existing):"")+
(filter!=="core"?group("Two coordination specialists","NEW CHATS · SOURCE REVIEW PENDING",newOnes):"")+
'<div class="chat-coordination-summary"><div><span class="eyebrow">SHARED SOURCE OF TRUTH</span><h3>No disconnected departmental silos.</h3><p>The CRM holds status and evidence. ChatGPT conversations do not automatically message or update one another. The recurring management review uses the same records, and HQ Engineering acts on approved change requests.</p></div><div><a class="outline-button" href="'+registry+'" target="_blank" rel="noopener noreferrer">Private Chat Registry ↗</a><a class="outline-button" href="'+events+'" target="_blank" rel="noopener noreferrer">Company Event Log ↗</a><a class="outline-button" href="'+queue+'" target="_blank" rel="noopener noreferrer">HQ Change Queue ↗</a></div></div>'+
'<div class="chatlaunch-how"><span class="eyebrow">ACCEPTANCE CHECK</span><div class="chatlaunch-steps"><div><b>01</b><h3>Chat creation confirmed</h3><p>All nine conversations and instructions are owner-confirmed. Do not recreate them.</p></div><div><b>02</b><h3>Verify source access</h3><p>Each chat should read relevant CRM and provider records before reporting progress.</p></div><div><b>03</b><h3>Verify the handoffs</h3><p>Each chat should review its sources and log verified actions in the CRM. Add its URL to the private Chat Registry; status is not automatically synchronized.</p></div></div></div>'+
'<div class="notice">This launchpad provides nine distinct role instructions and a browser-local setup checklist. It cannot programmatically edit conversations or read their complete histories. Major integrations, secrets, spending, production changes and actual outreach remain approval-controlled.</div>'+
'<div id="chat-launch-status" role="status" aria-live="polite" class="chatlaunch-status">'+esc(status)+'</div>';
wire();
}
function wire(){
mount.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",async()=>{
 const r=roles.find(x=>x.number===b.dataset.copy);if(!r)return;
 const label=b.textContent,feedback=mount.querySelector("#chat-launch-status");
 try{
  await navigator.clipboard.writeText(r.prompt);
  status="Copied the "+r.number+" operating instructions. Your chat was already created; paste only if you need to replace the instructions. Next verify source access and update the private registry.";
  feedback.textContent=status;b.textContent="Copied ✓";b.setAttribute("aria-label",status);
  setTimeout(()=>{if(b.isConnected){b.textContent=label;b.removeAttribute("aria-label")}},1700);
 }catch(e){
  status="Clipboard unavailable. Select and copy the instructions below manually.";
  feedback.textContent=status;
  const area=document.createElement("textarea");area.className="chatlaunch-copyarea";area.value=r.prompt;area.setAttribute("aria-label","Instructions for chat "+r.number);feedback.appendChild(area);area.focus();area.select();
 }
}));
mount.querySelectorAll("[data-check]").forEach(el=>el.addEventListener("change",()=>{
progress[el.dataset.check]=el.checked;saveProgress();render();
}));
mount.querySelectorAll("[data-role-filter]").forEach(b=>b.addEventListener("click",()=>{filter=b.dataset.roleFilter;render()}));
mount.querySelector("#chat-role-search")?.addEventListener("input",e=>{
query=e.target.value;
const pos=e.target.selectionStart;
render();
const field=mount.querySelector("#chat-role-search");
field?.focus();field?.setSelectionRange(pos,pos);
});
}
render();
})();