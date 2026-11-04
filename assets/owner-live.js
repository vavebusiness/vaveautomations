/* Vave Automations — browser-only Google Workspace reader.
   No server, no credential persistence. OAuth tokens remain in JS memory.
   Google APIs are called directly by the authorized user and are never proxied.
*/
(function(){
"use strict";
const el=document.getElementById("owner-live-root");if(!el)return;
const SCOPE_SHEETS="https://www.googleapis.com/auth/spreadsheets.readonly";
const SCOPE_GMAIL="https://www.googleapis.com/auth/gmail.metadata";
const SHEET_ID="1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c";
const MAX_DISPLAY=65;
const sheets=[
 {name:"Dashboard",range:"Dashboard!A1:B32",header:2},
 {name:"Opportunities",range:"Opportunities!A1:G310",header:0},
 {name:"Master Checklist",range:"'Master Checklist'!A3:H100",header:0},
 {name:"HQ Change Queue",range:"'HQ Change Queue'!A1:P150",header:0},
 {name:"Company Event Log",range:"'Company Event Log'!A1:M200",header:0},
 {name:"Company Chat Registry",range:"'Company Chat Registry'!A1:O100",header:0},
 {name:"Department Handoff Queue",range:"'Department Handoff Queue'!A1:L150",header:0},
 {name:"Sent Outreach",range:"'Sent Outreach'!A1:H230",header:0},
 {name:"No Contact",range:"'No Contact'!A1:G180",header:0},
 {name:"Safety Audit",range:"'Safety Audit'!A1:H120",header:0},
 {name:"First Client Sprint",range:"'First Client Sprint'!A1:J150",header:0},
 {name:"Sales Playbook",range:"'Sales Playbook'!A1:H150",header:0},
 {name:"200 Lead Launch Board",range:"'200 Lead Launch Board'!A1:J240",header:0}
];
const state={clientId:"",googleReady:false,sheetsToken:null,gmailToken:null,sheetsUntil:0,gmailUntil:0,rows:null,mail:[],selected:"Management overview",filter:"",lastSheets:0,lastGmail:0,busySheets:false,busyGmail:false,notice:"",noticeType:"neutral"};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function hasSheets(){return !!state.sheetsToken&&Date.now()<state.sheetsUntil-30000}
function hasGmail(){return !!state.gmailToken&&Date.now()<state.gmailUntil-30000}
function readClientId(){try{return localStorage.getItem("vave-google-oauth-client-id")||""}catch(e){return""}}
state.clientId=readClientId();
try{const rememberedView=sessionStorage.getItem("vave-google-last-dataset");if(sheets.some(x=>x.name===rememberedView)||rememberedView==="Management overview")state.selected=rememberedView}catch(e){}

const GRANT_KEY={sheets:"vave-google-sheets-granted",gmail:"vave-google-gmail-granted"};
function hadGrant(which){try{return localStorage.getItem(GRANT_KEY[which])==="1"}catch(e){return false}}
function rememberGrant(which){try{localStorage.setItem(GRANT_KEY[which],"1")}catch(e){}}

function banner(msg,type="neutral"){state.notice=msg;state.noticeType=type;const area=document.getElementById("connection-notice");if(area){area.textContent=msg;area.dataset.type=type}}
function lockSession(message="Private session locked. Reconnect to load authorized records again.") {
 state.sheetsToken=null;state.gmailToken=null;state.sheetsUntil=0;state.gmailUntil=0;
 state.rows=null;state.mail=[];state.filter="";state.lastSheets=0;state.lastGmail=0;
 state.busySheets=false;state.busyGmail=false;state.notice=message;state.noticeType="info";
 render();
}
function statusLabel(active){return active?'<span class="owner-pill connected">● Connected · read only</span>':'<span class="owner-pill">○ Not connected</span>'}
function render(){
const returnVisit=!!state.clientId&&!hasSheets();
const quickRestore=returnVisit?'<section class="owner-restore" aria-label="Reconnect Google Sheets"><div class="owner-restore-mark">↻</div><div class="owner-restore-info"><span class="eyebrow">WELCOME BACK</span><h3>Reconnect your live CRM</h3><p>Your Google application is already configured. For security, refreshing clears your private records and temporary access token. Restore your read-only connection in one click. Google may show an account popup.</p></div><button type="button" id="quick-reconnect-sheets" class="action-button" '+(!state.googleReady?'disabled':'')+'>Reconnect Sheets ↗</button></section>':'';
el.innerHTML=quickRestore+'<div class="owner-privacy"><span class="owner-lock">◈</span><div><strong>Private to your signed-in Google account</strong><p>This page is public HTML, but private records are requested only after you authorize Google access. Records and access tokens stay in this browser session; they are never uploaded to GitHub or saved in site storage.</p></div></div>'+
'<div class="owner-setup"><div class="owner-step-number">01</div><div class="owner-step"><span class="eyebrow">ONE-TIME GOOGLE SETUP</span><h3>'+(state.clientId?'Google application configured':'Connect an OAuth client')+'</h3><p>Use a Google Cloud Web Application OAuth client with <code>https://vavebusiness.github.io</code> as its authorized JavaScript origin. Enable the Sheets API and optionally the Gmail API. Add your account as a test user if Google requires it. This uses no new paid hosting.</p><div class="owner-input-row"><input id="oauth-client-id" type="text" autocomplete="off" spellcheck="false" aria-label="Google OAuth Client ID" placeholder="Your Google OAuth Client ID" value="'+esc(state.clientId)+'"><button type="button" class="action-button" id="save-google-client">Use Client ID</button></div><small>Only the public OAuth Client ID is saved in this browser. <strong>Never paste a client secret, API key, password or refresh token.</strong></small><p class="owner-help"><a href="https://console.cloud.google.com/auth/clients" target="_blank" rel="noopener noreferrer">Google OAuth clients ↗</a><a href="https://console.cloud.google.com/apis/library/sheets.googleapis.com" target="_blank" rel="noopener noreferrer">Enable Sheets API ↗</a><a href="https://console.cloud.google.com/apis/library/gmail.googleapis.com" target="_blank" rel="noopener noreferrer">Enable Gmail API ↗</a></p></div></div>'+
'<div class="owner-connection-grid"><article class="owner-connection"><div class="owner-connection-head"><span class="owner-step-number">02</span><div><h3>Google Sheets · master CRM</h3>'+statusLabel(hasSheets())+'</div></div><p>Read up to thirteen tabs including the private cross-chat handoff queue, opportunity pipeline, nine-chat registry and safety logs.</p><button type="button" id="connect-sheets" class="action-button" '+(!state.clientId||!state.googleReady?"disabled":"")+'>'+(hasSheets()?"Renew Sheets access":hadGrant("sheets")?"Reconnect Sheets":"Authorize Sheets read-only")+'</button><small>Scope: spreadsheets.readonly. No writing is possible.</small></article>'+
'<article class="owner-connection"><div class="owner-connection-head"><span class="owner-step-number">03</span><div><h3>Gmail · inbox metadata</h3>'+statusLabel(hasGmail())+'</div></div><p>Optional separate permission to read the latest inbox message IDs, senders, subjects and dates. No sending, deleting or modification.</p><button type="button" id="connect-gmail" class="outline-button" '+(!state.clientId||!state.googleReady?"disabled":"")+'>'+(hasGmail()?"Renew Gmail access":hadGrant("gmail")?"Reconnect Gmail":"Authorize Gmail read-only")+'</button><small>Gmail permission is restricted by Google and may require app verification; start with Sheets first.</small></article></div>'+
'<div id="connection-notice" data-type="'+esc(state.noticeType)+'" class="owner-notice" role="status">'+esc(state.notice||(!state.googleReady?"Loading Google authorization…":(returnVisit?"Click Reconnect Sheets to restore the private CRM. No private records or Google tokens were saved.":"Connect with Sheets to see real source data.")))+'</div>'+
'<div class="owner-board" id="live-board">'+renderBoard()+'</div>'+
'<div class="owner-security"><span class="eyebrow">SECURITY SHIELD · BROWSER-ONLY PROTECTION</span><h3>Private records stay under your control</h3><p><strong>Current protection:</strong> Google read-only authorization, in-memory tokens, private data cleared on navigation, and automatic idle lock after 15 minutes. This is <strong>not</strong> a private server login; the public page source remains visible.</p><div class="owner-guard-actions"><button type="button" id="owner-lock-session" class="outline-button">Lock private session</button><button type="button" id="owner-forget-browser" class="outline-button">Forget this browser</button></div><p><strong>What is still separate:</strong> Make API access, background sync and audited CRM write-back require a protected backend. ChatGPT chats communicate only through verified shared records, not direct messaging.</p></div>';
attach();
}

function handoffSnapshot(rows){
 const today=new Date(),localToday=[today.getFullYear(),String(today.getMonth()+1).padStart(2,"0"),String(today.getDate()).padStart(2,"0")].join("-");
 const items=(Array.isArray(rows)?rows:[]).slice(1).filter(r=>Array.isArray(r)&&String(r[0]||"").trim())
 .filter(r=>String(r[7]||"").trim().toUpperCase()!=="DEMO ONLY")
 .map(r=>{
  const status=String(r[7]||"").trim(),due=String(r[8]||"").trim();
  const finished=["done","cancelled","canceled"].includes(status.toLowerCase());
  return {id:String(r[0]||""),from:String(r[2]||""),to:String(r[3]||""),
    summary:String(r[4]||""),next:String(r[5]||""),owner:String(r[6]||""),
    status,due,blocked:status.toLowerCase()==="blocked",
    overdue:!finished&&/^\d{4}-\d{2}-\d{2}$/.test(due)&&due<localToday,finished};
 });
 const open=items.filter(x=>!x.finished);
 open.sort((a,b)=>Number(b.blocked)-Number(a.blocked)||Number(b.overdue)-Number(a.overdue)||
    (a.due||"9999").localeCompare(b.due||"9999")||a.id.localeCompare(b.id));
 return {open,blocked:open.filter(x=>x.blocked).length,overdue:open.filter(x=>x.overdue).length};
}
function renderHandoffInbox(rows){
 const q=handoffSnapshot(rows);
 let html='<section class="owner-handoff" aria-label="Private handoff inbox"><div class="owner-handoff-top"><div><span class="eyebrow">PRIVATE / LIVE SHEETS</span><h4>Department handoff inbox</h4><p>Only real assignments are shown. DEMO ONLY items are excluded. Changes happen in the private CRM, not here.</p></div><div class="owner-handoff-totals"><span><strong>'+q.open.length+'</strong> Open</span><span><strong>'+q.blocked+'</strong> Blocked</span><span><strong>'+q.overdue+'</strong> Overdue</span></div></div>';
 if(!q.open.length)html+='<p class="owner-handoff-empty">No active department handoffs in the authorized sheet. Other sales work may still be outstanding.</p>';
 else html+='<div class="owner-handoff-list">'+q.open.slice(0,35).map(x=>
 '<article class="owner-handoff-item"><div class="owner-handoff-meta"><strong>'+esc(x.id)+'</strong><span class="owner-handoff-status">'+esc(x.status||"Unspecified")+'</span>'+
 (x.overdue?'<span class="owner-handoff-alert">Overdue</span>':'')+'</div>'+
 '<div class="owner-handoff-summary">'+esc(x.summary||"No summary supplied")+'</div>'+
 '<p><b>Next:</b> '+esc(x.next||"Not specified")+'</p><div class="owner-handoff-foot"><span><b>Owner:</b> '+esc(x.owner||x.to||"Unassigned")+'</span><span><b>Due:</b> '+esc(x.due||"Not set")+'</span><span><b>From / To:</b> '+esc(x.from||"—")+' → '+esc(x.to||"—")+'</span></div></article>'
 ).join("")+'</div>';
 return html+'<p class="owner-count">Showing '+Math.min(q.open.length,35)+' of '+q.open.length+' active handoffs. <a href="https://docs.google.com/spreadsheets/d/'+SHEET_ID+'/edit#gid=2070434" target="_blank" rel="noopener noreferrer">Open private source queue ↗</a> · Scheduled reviews are periodic, not instant.</p></section>';
}
function renderHandoffShortcut(){
 if(!state.rows)return "";
 const ix=sheets.findIndex(x=>x.name==="Department Handoff Queue");
 const q=handoffSnapshot(state.rows[ix]||[]);
 return '<div class="owner-handoff-shortcut"><div><strong>Department handoffs</strong><span>'+q.open.length+' open · '+q.blocked+' blocked · '+q.overdue+' overdue</span></div><button type="button" class="outline-button" data-dataset="Department Handoff Queue">View handoff inbox</button></div>';
}


function managementSnapshot(){
 const getRows=name=>state.rows?.[sheets.findIndex(x=>x.name===name)]||[];
 const chats=getRows("Company Chat Registry").slice(1).filter(r=>/^(0[0-8])$/.test(String(r[0]||"").trim()));
 const verified=chats.filter(r=>String(r[12]||"").trim());
 const handoffs=handoffSnapshot(getRows("Department Handoff Queue"));
 const changeRows=getRows("HQ Change Queue").slice(1).filter(r=>String(r[0]||"").trim());
 const unresolved=changeRows.filter(r=>!["shipped","done","cancelled","canceled","rejected"].includes(String(r[9]||"").trim().toLowerCase()));
 const important=unresolved.filter(r=>String(r[7]||"").toUpperCase()==="P0");
 return {chats,verified,handoffs,unresolved,important};
}

function connectionTestPrompt(chatNo){
 const ix=sheets.findIndex(x=>x.name==="Company Chat Registry"),rows=state.rows?.[ix]||[];
 if(!/^0[0-8]$/.test(chatNo))return "";
 const record=rows.find(r=>String(r[0]||"").trim()===chatNo);
 if(!record)return "";
 const sheetRow=rows.indexOf(record)+1,role=String(record[1]||"Chat "+chatNo);
 return [
  "ONE-TIME VAVE AUTOMATIONS SHARED-CRM CONNECTION TEST — "+role,
  "This is the EXISTING Project conversation. Do not create a new chat. Do not contact a business.",
  "Use the connected Google Sheets/Drive tool with the private master CRM:",
  "https://docs.google.com/spreadsheets/d/"+SHEET_ID+"/edit",
  "1. Read Company Chat Registry A"+sheetRow+":O"+sheetRow+" and verify that its Chat # equals "+chatNo+".",
  "2. Read Department Handoff Queue A1:L10. Confirm DEMO-001 remains DEMO ONLY. Identify real task IDs assigned to "+chatNo+" without changing their status.",
  "3. Read at least one relevant role source tab listed in your Registry Sources-to-read column, using exact spreadsheet metadata. Avoid broad, unnecessary scans.",
  "4. ONLY if all three reads worked, edit Company Chat Registry cell M"+sheetRow+" (Last chat sync verified). Set its text to: '2026-11-04 — Chat "+chatNo+": Google Sheets source read successful; tested Registry, Handoff Queue and one role source; verified own M"+sheetRow+" readback. TEST ONLY — no external action.'",
  "5. Read M"+sheetRow+" again to verify the exact saved text. If any access or write fails, leave M"+sheetRow+" unchanged or explain precisely what failed. Never claim success without readback.",
  "Do not alter any other cell, including DEMO-001 or existing handoff status. Do not send emails/DMs, run Make, publish private info or change client stages.",
  "Report: access PASS/FAIL, source tab checked, real queue IDs for this chat, M"+sheetRow+" write/readback PASS/FAIL, and blockers. Do not claim other chats communicate automatically."
 ].join("\n");
}

function renderManagementOverview(){
 const q=managementSnapshot();
 let html='<section class="owner-management" aria-label="Private management overview"><div class="owner-management-heading"><span class="eyebrow">PRIVATE · SOURCE-BACKED COMPANY VIEW</span><h4>Management overview</h4><p>One place to see department handoffs and work needing review. Updated when you reconnect or refresh Google Sheets. Scheduled tasks run separately, not continuously.</p></div>';
 html+='<div class="owner-management-metrics">'+[
  [q.chats.length,"Chats registered"],[q.verified.length,"Chat access tested"],[q.handoffs.open.length,"Open handoffs"],[q.important.length,"Priority HQ changes"]
 ].map(([value,label])=>'<div class="owner-management-metric"><strong>'+value+'</strong><span>'+esc(label)+'</span></div>').join("")+'</div>';
 html+='<div class="owner-management-grid"><section class="owner-management-panel"><div class="owner-management-panel-top"><h5>Work for departments</h5><button class="outline-button" type="button" data-dataset="Department Handoff Queue">View all</button></div>';
 if(!q.handoffs.open.length)html+='<p>No active handoffs in the shared queue.</p>';
 else html+='<ul class="owner-management-items">'+q.handoffs.open.slice(0,5).map(item=>
   '<li><strong>'+esc(item.id)+'</strong><span>'+esc(item.owner||item.to||"No owner")+'</span><span>'+esc(item.next||"Next action not entered")+'</span>'+
   '<small>'+esc(item.status||"No status")+' · Due '+esc(item.due||"not set")+'</small></li>').join("")+'</ul>';
 html+='</section><section class="owner-management-panel"><div class="owner-management-panel-top"><h5>Department check</h5><button class="outline-button" type="button" data-dataset="Company Chat Registry">Open registry</button></div>';
 html+='<p>'+q.verified.length+' of '+q.chats.length+' chats have an independent shared-record test recorded. Unverified does not mean disconnected.</p>';
 html+='<ul class="owner-management-departments">'+q.chats.map(r=>
  '<li><span>'+esc(r[0]||"")+' · '+esc(r[1]||"Unnamed department")+'</span><small>'+ (String(r[12]||"").trim()?"Test recorded":"Not yet tested")+'</small></li>').join("")+'</ul>';
 html+='</section></div>';
 const untested=q.chats.filter(r=>!String(r[12]||"").trim());
 html+='<section class="owner-management-activation" aria-label="Connect remaining department chats"><div><span class="eyebrow">ONE-TIME SETUP</span><h5>Connect the remaining chats</h5><p>Open each EXISTING Project chat, paste its copied connection test, and let that chat verify its own access. This is a manual one-time step—not automatic inter-chat messaging.</p></div>';
 if(!untested.length)html+='<p>All nine chats have a recorded source-access test. No further setup messages needed.</p>';
 else html+='<div class="owner-management-activate-list">'+untested.map(r=>
 '<div class="owner-management-activate-row"><span>'+esc(r[0]||"")+' · '+esc(r[1]||"")+'</span><button type="button" class="outline-button" data-connect-chat="'+esc(r[0]||"")+'">Copy connection test</button></div>').join("")+'</div>';
 html+='</section>';
 html+='<div class="owner-management-footer"><span>'+q.unresolved.length+' HQ change requests remain unresolved in the private queue; '+q.important.length+' are marked P0.</span><button type="button" class="outline-button" data-dataset="HQ Change Queue">Review changes</button></div>';
 html+='<p class="owner-count">This is a private, read-only view of Google Sheets. No messages, client contact, Make runs or CRM edits happen when you open it. Work does not automatically transfer between chats.</p></section>';
 return html;
}

function renderBoard(){
if(!state.rows&&!state.mail.length)return '<div class="owner-empty"><div class="owner-empty-icon">▦</div><h3>No live records loaded</h3><p>Connect Google Sheets to read authorized private CRM data into this browser. The public snapshot elsewhere on the website remains unchanged.</p></div>';
const tabs=(state.rows?["Management overview",...sheets.map(x=>x.name)]:[]).concat(state.mail.length?["Gmail Inbox"]:[]);
const active=tabs.includes(state.selected)?state.selected:tabs[0];
state.selected=active;
let body='';
if(active==="Management overview"){
body=renderManagementOverview();
}else if(active==="Gmail Inbox"){
const list=state.mail.filter(x=>[x.from,x.subject,x.date].join(" ").toLowerCase().includes(state.filter.toLowerCase())).slice(0,MAX_DISPLAY);
body='<div class="owner-table-wrap"><table class="owner-table"><thead><tr><th>From</th><th>Subject</th><th>Date</th></tr></thead><tbody>'+list.map(x=>'<tr><td>'+esc(x.from)+'</td><td>'+esc(x.subject)+'</td><td>'+esc(x.date)+'</td></tr>').join("")+'</tbody></table></div>';
}else if(active==="Department Handoff Queue"){
const ix=sheets.findIndex(x=>x.name===active);
body=renderHandoffInbox(state.rows?.[ix]||[]);
}else{
const ix=sheets.findIndex(x=>x.name===active),rows=state.rows?.[ix]||[],offset=sheets[ix]?.header||0;
const header=rows[offset]||[],data=rows.slice(offset+1).filter(row=>row.some(c=>String(c||"").trim()));
const matches=data.filter(r=>r.join(" ").toLowerCase().includes(state.filter.trim().toLowerCase()));
const maxCol=Math.min(16,Math.max(2,header.length));
body='<div class="owner-table-wrap"><table class="owner-table"><thead><tr>'+Array.from({length:maxCol},(_,i)=>'<th>'+esc(header[i]||"Column "+(i+1))+'</th>').join("")+'</tr></thead><tbody>'+matches.slice(0,MAX_DISPLAY).map(r=>'<tr>'+Array.from({length:maxCol},(_,i)=>'<td title="'+esc(r[i]||"")+'">'+esc(r[i]||"")+'</td>').join("")+'</tr>').join("")+'</tbody></table></div><p class="owner-count">Showing '+Math.min(matches.length,MAX_DISPLAY)+' of '+matches.length+' matching rows from bounded read-only API results. For full records, open the authoritative Sheet.</p>';
}
const ts=active==="Gmail Inbox"?state.lastGmail:state.lastSheets;
return '<div class="owner-data-title"><div><span class="eyebrow">AUTHORIZED LIVE READER</span><h3>Private workspace data</h3><small>Last successful fetch: '+(ts?new Date(ts).toLocaleString():"not yet")+' · manual refresh available</small></div><div class="owner-data-actions"><input id="owner-filter" placeholder="Filter loaded records…" type="search" aria-label="Filter loaded records" value="'+esc(state.filter)+'"><button id="owner-refresh" class="outline-button" type="button">↻ Refresh</button><button id="owner-disconnect" class="outline-button" type="button">Disconnect</button></div></div>'+
renderHandoffShortcut()+
'<nav class="owner-tabs" aria-label="Private datasets">'+tabs.map(t=>'<button type="button" class="owner-tab '+(active===t?"selected":"")+'" data-dataset="'+esc(t)+'">'+esc(t)+'</button>').join("")+'</nav>'+
body;
}
async function fetchJson(url,token){
const r=await fetch(url,{headers:{Authorization:"Bearer "+token},cache:"no-store",credentials:"omit",redirect:"error"});
let j={};try{j=await r.json()}catch(e){}
if(!r.ok){const reason=j?.error?.message||"HTTP "+r.status;throw Error(reason)}
return j;
}
async function refreshSheets(){
if(!hasSheets()){banner("Sheets authorization expired or unavailable. Reconnect to continue.","warn");return}
if(state.busySheets)return;
state.busySheets=true;banner("Reading authorized CRM tabs directly from Google Sheets…","info");
try{
const u=new URL("https://sheets.googleapis.com/v4/spreadsheets/"+SHEET_ID+"/values:batchGet");
sheets.forEach(x=>u.searchParams.append("ranges",x.range));
u.searchParams.set("valueRenderOption","FORMATTED_VALUE");
const j=await fetchJson(u.toString(),state.sheetsToken);
const val=Array.isArray(j.valueRanges)?j.valueRanges:[];
if(val.length!==sheets.length)throw Error("Expected "+sheets.length+" source tabs but received "+val.length+".");
state.rows=val.map(x=>Array.isArray(x.values)?x.values:[]);
state.lastSheets=Date.now();
state.selected=state.selected==="Gmail Inbox"?"Gmail Inbox":(sheets.some(x=>x.name===state.selected)||state.selected==="Management overview")?state.selected:"Management overview";
banner("Sheets connected: "+val.length+" private tabs loaded; no data written or uploaded.","success");
}catch(e){banner("Sheets read failed: "+String(e.message||e)+". Check your Google Cloud API settings, sheet permissions, and OAuth scope.","error")}
finally{state.busySheets=false;updateBoard()}
}
async function refreshGmail(){
if(!hasGmail()){banner("Gmail authorization expired. Reconnect Gmail to read messages.","warn");return}
if(state.busyGmail)return;
state.busyGmail=true;banner("Reading recent inbox metadata from your authorized Gmail account…","info");
try{
const p=new URLSearchParams({maxResults:"12"});p.append("labelIds","INBOX");
const j=await fetchJson("https://gmail.googleapis.com/gmail/v1/users/me/messages?"+p,state.gmailToken);
const ids=Array.isArray(j.messages)?j.messages.slice(0,12):[];
const messages=await Promise.all(ids.map(async m=>{
const u=new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages/"+encodeURIComponent(m.id));
u.searchParams.set("format","metadata");["From","Subject","Date"].forEach(x=>u.searchParams.append("metadataHeaders",x));
const x=await fetchJson(u.toString(),state.gmailToken),headers=x.payload?.headers||[],get=n=>headers.find(h=>h.name?.toLowerCase()===n.toLowerCase())?.value||"";
return {from:get("From"),subject:get("Subject"),date:get("Date"),id:x.id};
}));
state.mail=messages;state.lastGmail=Date.now();state.selected="Gmail Inbox";
banner("Gmail metadata loaded for "+messages.length+" recent inbox messages. This is not a verified sales-reply count.","success");
}catch(e){banner("Gmail read failed: "+String(e.message||e)+". Gmail scopes can require separate Google verification.","error")}
finally{state.busyGmail=false;updateBoard()}
}
function authorize(which){
if(!state.googleReady||!window.google?.accounts?.oauth2){banner("Google's authorization library has not loaded. Check blocked scripts or reload.","error");return}
if(!state.clientId){banner("Enter the public Google OAuth Client ID first.","warn");return}
const scope=which==="sheets"?SCOPE_SHEETS:SCOPE_GMAIL;
try{
const client=window.google.accounts.oauth2.initTokenClient({
 client_id:state.clientId,
 scope,
 callback:response=>{
  if(response.error){banner("Google permission was declined or unavailable: "+response.error,"warn");return}
  if(!response.access_token){banner("Google did not provide an access token.","error");return}
  if(!String(response.scope||"").includes(scope)){banner("Requested read-only scope was not granted.","error");return}
  const expires=Date.now()+Math.max(60,Number(response.expires_in||3600))*1000;
  rememberGrant(which);
  if(which==="sheets"){state.sheetsToken=response.access_token;state.sheetsUntil=expires;render();refreshSheets()}
  else{state.gmailToken=response.access_token;state.gmailUntil=expires;render();refreshGmail()}
 },
 error_callback:e=>banner("Google authorization popup issue: "+String(e.type||"unknown")+". Please allow Google sign-in popups.","warn")
});
// Previously granted scopes need not display the full consent screen again.
 // A user click is still required by Google’s browser token model.
 client.requestAccessToken({prompt:""});
}catch(e){banner("Unable to start Google authorization: "+String(e.message||e),"error")}
}
function updateBoard(){const board=document.getElementById("live-board");if(board){board.innerHTML=renderBoard();attachBoard()}}
function attachBoard(){
document.querySelectorAll("#owner-live-root [data-connect-chat]").forEach(b=>b.addEventListener("click",()=>{
 const prompt=connectionTestPrompt(String(b.dataset.connectChat||""));
 if(!prompt){banner("Connection test is unavailable until the private registry is loaded.","warn");return}
 if(typeof navigator==="undefined"||!navigator.clipboard?.writeText){
  banner("Clipboard access is unavailable here. Use the shared connection-test instructions from this chat.","warn");return
 }
 navigator.clipboard.writeText(prompt).then(()=>{
  b.textContent="Copied — paste into existing chat";
  banner("Connection test copied. Open that EXISTING Project chat and paste it there; its own readback will record the result.","success");
 }).catch(()=>banner("Clipboard permission was denied. Try using the existing Project chat directly.","warn"));
}));
document.querySelectorAll("#owner-live-root [data-dataset]").forEach(b=>b.addEventListener("click",()=>{state.selected=b.dataset.dataset;state.filter="";try{if(sheets.some(x=>x.name===state.selected)||state.selected==="Management overview")sessionStorage.setItem("vave-google-last-dataset",state.selected)}catch(e){}updateBoard()}));
document.getElementById("owner-filter")?.addEventListener("input",e=>{const value=e.target.value,pos=e.target.selectionStart;state.filter=value;updateBoard();const search=document.getElementById("owner-filter");search?.focus();search?.setSelectionRange(pos,pos)});
document.getElementById("owner-refresh")?.addEventListener("click",()=>state.selected==="Gmail Inbox"?refreshGmail():refreshSheets());
document.getElementById("owner-disconnect")?.addEventListener("click",()=>{
lockSession("Reader disconnected from this page. Google account permissions can be revoked separately from your Google Account.");

});
}
function attach(){
document.getElementById("save-google-client")?.addEventListener("click",()=>{
const v=document.getElementById("oauth-client-id")?.value.trim()||"";
if(v&&!/^[A-Za-z0-9-]+\.apps\.googleusercontent\.com$/.test(v)){banner("This does not look like a Google Web Application OAuth client ID. Never paste a secret.","error");return}
state.clientId=v;
try{if(v)localStorage.setItem("vave-google-oauth-client-id",v);else localStorage.removeItem("vave-google-oauth-client-id")}catch(e){}
render();banner(v?"OAuth client ID saved in this browser. Authorize Sheets to continue.":"Client ID cleared.","success");
});
document.getElementById("connect-sheets")?.addEventListener("click",()=>authorize("sheets"));
document.getElementById("quick-reconnect-sheets")?.addEventListener("click",()=>authorize("sheets"));
document.getElementById("connect-gmail")?.addEventListener("click",()=>authorize("gmail"));
document.getElementById("owner-lock-session")?.addEventListener("click",()=>lockSession());
document.getElementById("owner-forget-browser")?.addEventListener("click",()=>{
 try{localStorage.removeItem("vave-google-oauth-client-id");localStorage.removeItem(GRANT_KEY.sheets);localStorage.removeItem(GRANT_KEY.gmail);sessionStorage.removeItem("vave-google-last-dataset")}catch(e){}
 state.clientId="";state.selected="Dashboard";
 lockSession("Browser setup cleared. Revoke Google account permissions separately through Google.");
});
attachBoard();
}
if(state.clientId&&hadGrant("sheets"))state.notice="Previously authorized: click Reconnect Sheets to restore your data. Google requires a user click after refresh; no passwords or tokens are stored.";
render();
const script=document.createElement("script");script.src="https://accounts.google.com/gsi/client";script.async=true;script.onload=()=>{state.googleReady=!!window.google?.accounts?.oauth2;render();if(!state.googleReady)banner("Google's sign-in library did not become available.","error")};script.onerror=()=>banner("Unable to load Google's sign-in library. Network settings may be blocking it.","error");document.head.appendChild(script);
let lastActivity=Date.now();
["pointerdown","keydown","touchstart"].forEach(type=>window.addEventListener(type,()=>{lastActivity=Date.now()},{passive:true}));
let timer=setInterval(()=>{
if((hasSheets()||hasGmail()||state.rows||state.mail.length)&&Date.now()-lastActivity>15*60*1000){lockSession("Security Shield: private data automatically locked after 15 minutes of inactivity.");return}
if(document.visibilityState!=="visible")return;
if(hasSheets()&&state.lastSheets&&Date.now()-state.lastSheets>120000)refreshSheets();
if(hasGmail()&&state.lastGmail&&Date.now()-state.lastGmail>120000)refreshGmail();
},30000);
window.addEventListener("pagehide",()=>{clearInterval(timer);lockSession("Private session closed after leaving the page.");},{once:true});
})();