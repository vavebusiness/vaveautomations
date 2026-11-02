/* Vave Automations — browser-only Google Workspace reader.
   No server, no credential persistence. OAuth tokens remain in JS memory.
   Google APIs are called directly by the authorized user and are never proxied.
*/
(function(){
"use strict";
const el=document.getElementById("owner-live-root");if(!el)return;
const SCOPE_SHEETS="https://www.googleapis.com/auth/spreadsheets.readonly";
const SCOPE_GMAIL="https://www.googleapis.com/auth/gmail.readonly";
const SHEET_ID="1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c";
const MAX_DISPLAY=65;
const sheets=[
 {name:"Dashboard",range:"Dashboard!A1:B32",header:3},
 {name:"Opportunities",range:"Opportunities!A1:G310",header:0},
 {name:"Master Checklist",range:"'Master Checklist'!A3:H100",header:0},
 {name:"HQ Change Queue",range:"'HQ Change Queue'!A1:P150",header:0},
 {name:"Company Event Log",range:"'Company Event Log'!A1:M200",header:0},
 {name:"Sent Outreach",range:"'Sent Outreach'!A1:H230",header:0},
 {name:"No Contact",range:"'No Contact'!A1:G180",header:0},
 {name:"Safety Audit",range:"'Safety Audit'!A1:H120",header:0},
 {name:"First Client Sprint",range:"'First Client Sprint'!A1:J150",header:0},
 {name:"Sales Playbook",range:"'Sales Playbook'!A1:H150",header:0},
 {name:"200 Lead Launch Board",range:"'200 Lead Launch Board'!A1:J240",header:0}
];
const state={clientId:"",googleReady:false,sheetsToken:null,gmailToken:null,sheetsUntil:0,gmailUntil:0,rows:null,mail:[],selected:"Dashboard",filter:"",lastSheets:0,lastGmail:0,busySheets:false,busyGmail:false,notice:"",noticeType:"neutral"};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function hasSheets(){return !!state.sheetsToken&&Date.now()<state.sheetsUntil-30000}
function hasGmail(){return !!state.gmailToken&&Date.now()<state.gmailUntil-30000}
function readClientId(){try{return localStorage.getItem("vave-google-oauth-client-id")||""}catch(e){return""}}
state.clientId=readClientId();
function banner(msg,type="neutral"){state.notice=msg;state.noticeType=type;const area=document.getElementById("connection-notice");if(area){area.textContent=msg;area.dataset.type=type}}
function statusLabel(active){return active?'<span class="owner-pill connected">● Connected · read only</span>':'<span class="owner-pill">○ Not connected</span>'}
function render(){
el.innerHTML='<div class="owner-privacy"><span class="owner-lock">◈</span><div><strong>Private to your signed-in Google account</strong><p>This page is public HTML, but private records are requested only after you authorize Google access. Records and access tokens stay in this browser session; they are never uploaded to GitHub or saved in site storage.</p></div></div>'+
'<div class="owner-setup"><div class="owner-step-number">01</div><div class="owner-step"><span class="eyebrow">ONE-TIME GOOGLE SETUP</span><h3>Connect an OAuth client</h3><p>Use a Google Cloud Web Application OAuth client with <code>https://vavebusiness.github.io</code> as its authorized JavaScript origin. Enable the Sheets API and optionally the Gmail API. Add your account as a test user if Google requires it. This uses no new paid hosting.</p><div class="owner-input-row"><input id="oauth-client-id" type="text" autocomplete="off" spellcheck="false" aria-label="Google OAuth Client ID" placeholder="Your Google OAuth Client ID" value="'+esc(state.clientId)+'"><button type="button" class="action-button" id="save-google-client">Use Client ID</button></div><small>Only the public OAuth Client ID is saved in this browser. <strong>Never paste a client secret, API key, password or refresh token.</strong></small><p class="owner-help"><a href="https://console.cloud.google.com/auth/clients" target="_blank" rel="noopener noreferrer">Google OAuth clients ↗</a><a href="https://console.cloud.google.com/apis/library/sheets.googleapis.com" target="_blank" rel="noopener noreferrer">Enable Sheets API ↗</a><a href="https://console.cloud.google.com/apis/library/gmail.googleapis.com" target="_blank" rel="noopener noreferrer">Enable Gmail API ↗</a></p></div></div>'+
'<div class="owner-connection-grid"><article class="owner-connection"><div class="owner-connection-head"><span class="owner-step-number">02</span><div><h3>Google Sheets · master CRM</h3>'+statusLabel(hasSheets())+'</div></div><p>Read up to eleven tabs including the private opportunity pipeline, checklist, suppression registry and HQ improvement logs.</p><button type="button" id="connect-sheets" class="action-button" '+(!state.clientId||!state.googleReady?"disabled":"")+'>'+(hasSheets()?"Reconnect Sheets":"Authorize Sheets read-only")+'</button><small>Scope: spreadsheets.readonly. No writing is possible.</small></article>'+
'<article class="owner-connection"><div class="owner-connection-head"><span class="owner-step-number">03</span><div><h3>Gmail · inbox metadata</h3>'+statusLabel(hasGmail())+'</div></div><p>Optional separate permission to read the latest inbox message IDs, senders, subjects and dates. No sending, deleting or modification.</p><button type="button" id="connect-gmail" class="outline-button" '+(!state.clientId||!state.googleReady?"disabled":"")+'>'+(hasGmail()?"Reconnect Gmail":"Authorize Gmail read-only")+'</button><small>Gmail permission is restricted by Google and may require app verification; start with Sheets first.</small></article></div>'+
'<div id="connection-notice" data-type="'+esc(state.noticeType)+'" class="owner-notice" role="status">'+esc(state.notice||(!state.googleReady?"Loading Google authorization…":"Connect with Sheets to see real source data."))+'</div>'+
'<div class="owner-board" id="live-board">'+renderBoard()+'</div>'+
'<div class="owner-security"><h3>What remains separate</h3><p><strong>Make:</strong> a Make API key cannot safely be placed on a public site. The workflow registry remains a verified configuration snapshot until a protected connector is deployed. <strong>ChatGPT chats:</strong> workstreams coordinate through private Google Sheets and scheduled reviews, not immediate chat-to-chat messaging.</p></div>';
attach();
}
function renderBoard(){
if(!state.rows&&!state.mail.length)return '<div class="owner-empty"><div class="owner-empty-icon">▦</div><h3>No live records loaded</h3><p>Connect Google Sheets to read authorized private CRM data into this browser. The public snapshot elsewhere on the website remains unchanged.</p></div>';
const tabs=(state.rows?sheets.map(x=>x.name):[]).concat(state.mail.length?["Gmail Inbox"]:[]);
const active=tabs.includes(state.selected)?state.selected:tabs[0];
state.selected=active;
let body='';
if(active==="Gmail Inbox"){
const list=state.mail.filter(x=>[x.from,x.subject,x.date].join(" ").toLowerCase().includes(state.filter.toLowerCase())).slice(0,MAX_DISPLAY);
body='<div class="owner-table-wrap"><table class="owner-table"><thead><tr><th>From</th><th>Subject</th><th>Date</th></tr></thead><tbody>'+list.map(x=>'<tr><td>'+esc(x.from)+'</td><td>'+esc(x.subject)+'</td><td>'+esc(x.date)+'</td></tr>').join("")+'</tbody></table></div>';
}else{
const ix=sheets.findIndex(x=>x.name===active),rows=state.rows?.[ix]||[],offset=sheets[ix]?.header||0;
const header=rows[offset]||[],data=rows.slice(offset+1).filter(row=>row.some(c=>String(c||"").trim()));
const matches=data.filter(r=>r.join(" ").toLowerCase().includes(state.filter.trim().toLowerCase()));
const maxCol=Math.min(16,Math.max(2,header.length));
body='<div class="owner-table-wrap"><table class="owner-table"><thead><tr>'+Array.from({length:maxCol},(_,i)=>'<th>'+esc(header[i]||"Column "+(i+1))+'</th>').join("")+'</tr></thead><tbody>'+matches.slice(0,MAX_DISPLAY).map(r=>'<tr>'+Array.from({length:maxCol},(_,i)=>'<td title="'+esc(r[i]||"")+'">'+esc(r[i]||"")+'</td>').join("")+'</tr>').join("")+'</tbody></table></div><p class="owner-count">Showing '+Math.min(matches.length,MAX_DISPLAY)+' of '+matches.length+' matching rows from bounded read-only API results. For full records, open the authoritative Sheet.</p>';
}
const ts=active==="Gmail Inbox"?state.lastGmail:state.lastSheets;
return '<div class="owner-data-title"><div><span class="eyebrow">AUTHORIZED LIVE READER</span><h3>Private workspace data</h3><small>Last successful fetch: '+(ts?new Date(ts).toLocaleString():"not yet")+' · manual refresh available</small></div><div class="owner-data-actions"><input id="owner-filter" placeholder="Filter loaded records…" type="search" aria-label="Filter loaded records" value="'+esc(state.filter)+'"><button id="owner-refresh" class="outline-button" type="button">↻ Refresh</button><button id="owner-disconnect" class="outline-button" type="button">Disconnect</button></div></div>'+
'<nav class="owner-tabs" aria-label="Private datasets">'+tabs.map(t=>'<button type="button" class="owner-tab '+(active===t?"selected":"")+'" data-dataset="'+esc(t)+'">'+esc(t)+'</button>').join("")+'</nav>'+
body;
}
async function fetchJson(url,token){
const r=await fetch(url,{headers:{Authorization:"Bearer "+token},cache:"no-store",credentials:"omit",redirect:"follow"});
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
state.selected=state.selected==="Gmail Inbox"?"Gmail Inbox":sheets.some(x=>x.name===state.selected)?state.selected:"Dashboard";
banner("Sheets connected: "+val.length+" private tabs loaded; no data written or uploaded.","success");
}catch(e){banner("Sheets read failed: "+String(e.message||e)+". Check your Google Cloud API settings, sheet permissions, and OAuth scope.","error")}
finally{state.busySheets=false;updateBoard()}
}
async function refreshGmail(){
if(!hasGmail()){banner("Gmail authorization expired. Reconnect Gmail to read messages.","warn");return}
if(state.busyGmail)return;
state.busyGmail=true;banner("Reading recent inbox metadata from your authorized Gmail account…","info");
try{
const p=new URLSearchParams({maxResults:"12",q:"in:inbox newer_than:14d -category:promotions"});
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
  if(which==="sheets"){state.sheetsToken=response.access_token;state.sheetsUntil=expires;render();refreshSheets()}
  else{state.gmailToken=response.access_token;state.gmailUntil=expires;render();refreshGmail()}
 },
 error_callback:e=>banner("Google authorization popup issue: "+String(e.type||"unknown")+". Please allow Google sign-in popups.","warn")
});
client.requestAccessToken({prompt:"consent"});
}catch(e){banner("Unable to start Google authorization: "+String(e.message||e),"error")}
}
function updateBoard(){const board=document.getElementById("live-board");if(board){board.innerHTML=renderBoard();attachBoard()}}
function attachBoard(){
document.querySelectorAll("#owner-live-root [data-dataset]").forEach(b=>b.addEventListener("click",()=>{state.selected=b.dataset.dataset;state.filter="";updateBoard()}));
document.getElementById("owner-filter")?.addEventListener("input",e=>{const value=e.target.value,pos=e.target.selectionStart;state.filter=value;updateBoard();const search=document.getElementById("owner-filter");search?.focus();search?.setSelectionRange(pos,pos)});
document.getElementById("owner-refresh")?.addEventListener("click",()=>state.selected==="Gmail Inbox"?refreshGmail():refreshSheets());
document.getElementById("owner-disconnect")?.addEventListener("click",()=>{
state.sheetsToken=null;state.gmailToken=null;state.sheetsUntil=0;state.gmailUntil=0;state.rows=null;state.mail=[];state.filter="";
banner("Reader disconnected from this page. Previously granted Google account permissions can be revoked in Google's account settings.","info");render();
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
document.getElementById("connect-gmail")?.addEventListener("click",()=>authorize("gmail"));
attachBoard();
}
render();
const script=document.createElement("script");script.src="https://accounts.google.com/gsi/client";script.async=true;script.onload=()=>{state.googleReady=!!window.google?.accounts?.oauth2;render();if(!state.googleReady)banner("Google's sign-in library did not become available.","error")};script.onerror=()=>banner("Unable to load Google's sign-in library. Network settings may be blocking it.","error");document.head.appendChild(script);
let timer=setInterval(()=>{
if(document.visibilityState!=="visible")return;
if(hasSheets()&&state.lastSheets&&Date.now()-state.lastSheets>120000)refreshSheets();
if(hasGmail()&&state.lastGmail&&Date.now()-state.lastGmail>120000)refreshGmail();
},30000);
window.addEventListener("pagehide",()=>clearInterval(timer),{once:true});
})();