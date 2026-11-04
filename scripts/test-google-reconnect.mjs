import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../assets/owner-live.js",import.meta.url),"utf8");
const CLIENT_ID="0123456789-example.apps.googleusercontent.com";
const fakeToken="TEST_NON_REAL_OAUTH_TOKEN";
const storage=new Map([["vave-google-oauth-client-id",CLIENT_ID]]);
function launch(initialView="Department Handoff Queue"){
 let html="",renderCount=0;
 const elements=new Map();
 const copyButtons=new Map(),copyText=[];
 const oauthRequests=[];
 const root={};
 Object.defineProperty(root,"innerHTML",{get:()=>html,set:x=>{html=String(x);elements.clear();renderCount++}});
 const document={
   head:{appendChild(node){if(typeof node.onload==="function")node.onload()}},
   visibilityState:"visible",
   createElement(){return {onload:null,onerror:null,async:false,src:""}},
   getElementById(id){
     if(id==="owner-live-root")return root;
     if(!html.includes('id="'+id+'"'))return null;
     if(!elements.has(id))elements.set(id,{
       dataset:{},value:id==="oauth-client-id"?CLIENT_ID:"",
       handlers:{},addEventListener(name,fn){this.handlers[name]=fn},
       get textContent(){return this._text||""},
       set textContent(v){this._text=v}
     });
     return elements.get(id);
   },
   querySelectorAll(selector){
     if(!String(selector).includes("[data-connect-chat]"))return [];
     const visibleMarkup=elements.get("live-board")?.innerHTML||html;
     return [...visibleMarkup.matchAll(/data-connect-chat="(0[0-8])"/g)].map(match=>{
       const id=match[1];
       if(!copyButtons.has(id))copyButtons.set(id,{
         dataset:{connectChat:id},textContent:"",handlers:{},
         addEventListener(name,fn){this.handlers[name]=fn}
       });
       return copyButtons.get(id);
     });
   }
 };
 const google={accounts:{oauth2:{
   initTokenClient(config){
     assert.equal(config.client_id,CLIENT_ID);
     return {requestAccessToken(opts){
       oauthRequests.push(opts);
       config.callback({access_token:fakeToken,scope:config.scope,expires_in:3600});
     }};
   }
 }}};
 const window={google,addEventListener(){},matchMedia:()=>({matches:false})};
 const sessionStorage={
 getItem(k){return k==="vave-google-last-dataset"?initialView:null},
 setItem(){},removeItem(){}
};
 const localStorage={
  getItem(k){return storage.get(k)||null},
  setItem(k,v){storage.set(k,String(v))},
  removeItem(k){storage.delete(k)}
 };
 const navigator={clipboard:{writeText:async text=>{copyText.push(text)}}};
 const context=vm.createContext({
   document,window,navigator,localStorage,sessionStorage,URL,URLSearchParams,Date,console,setInterval(){return 1},clearInterval(){},
   fetch:async (_url,opts)=>{
     assert.equal(opts.headers.Authorization,"Bearer "+fakeToken);
     return {ok:true,json:async()=>({valueRanges:Array.from({length:13},(_,i)=>({
      values:i===5?[
       ["Chat #","Department","Workstream","Type","Setup state","Role","Purpose","Sources","Handoff","HQ Page","Brief","Link","Verified"],
       ...Array.from({length:9},(_,n)=>[String(n).padStart(2,"0"),"Department "+n,"Workstream","Core","Instructions sent","","","","","","","",n===2||n===7?"Read/write test recorded":""])
      ]:i===3?[
       ["Request ID","Created","Origin","Department","Area","Description","Class","Priority","Risk","Status","Approval"],
       ["HQ-T1","2026-11-04","Test","08","UI","Private dashboard","UI","P0","Low","In review",""]
      ]:i===6?[
       ["Task ID","Related CRM record","From chat","To chat","What happened","What to do next","Responsible chat","Status","Review date","Evidence / source link","Last checked","Notes"],
       ["DEMO-001","training","01","02","A fake training task","Do nothing","02","DEMO ONLY","2020-01-01"],
       ["TEST-SAMPLE-123","test","01 — Acquisition","02 — Sales","<img src=x onerror=alert(1)>","Review synthetic test only","02 — Sales","Blocked","2020-01-01"]
      ]:[["Field","Value"],["Actual","Checked"]]
    }))})}
   }
 });
 vm.runInContext(source,context,{filename:"assets/owner-live.js"});
 return {root,oauthRequests,document,copyButtons,copyText,renderCount:()=>renderCount};
}
assert.ok(!storage.has("vave-google-sheets-granted"));
const first=launch();
assert.ok(first.root.innerHTML.includes("Reconnect your live CRM"),"Previously configured app must offer obvious reconnect UI");
const restore=first.document.getElementById("quick-reconnect-sheets");
assert.ok(restore?.handlers.click,"Reconnect control must be interactive");
restore.handlers.click();
await new Promise(resolve=>setImmediate(resolve));
assert.equal(first.oauthRequests.length,1);
assert.equal(first.oauthRequests[0].prompt,"","Do not force repeated Google consent");
assert.equal(storage.get("vave-google-sheets-granted"),"1");
assert.equal(storage.get("vave-google-oauth-client-id"),CLIENT_ID);
assert.ok(![...storage.values()].includes(fakeToken),"Never persist access tokens");
assert.ok(first.document.getElementById("live-board")?.innerHTML?.includes("AUTHORIZED LIVE READER"),"Authorized reader should render before lock");
assert.ok(first.document.getElementById("live-board")?.innerHTML?.includes("Department handoff inbox"),"Private handoff inbox should render after approved OAuth");
const privateUI=first.document.getElementById("live-board").innerHTML;
assert.ok(privateUI.includes("TEST-SAMPLE-123"),"Verified synthetic assignment must be visible");
assert.ok(!privateUI.includes("DEMO-001"),"DEMO ONLY row must be excluded");
assert.ok(privateUI.includes("1 open · 1 blocked · 1 overdue"),"Handoff counts should be derived from source data");
assert.ok(privateUI.includes("&lt;img"),"Untrusted spreadsheet text must be escaped");
assert.ok(!privateUI.includes("<img src=x"),"No raw HTML from spreadsheet must be rendered");
assert.ok(privateUI.includes("Review synthetic test only"),"Next action should appear");

const management=launch("Management overview");
const overviewReconnect=management.document.getElementById("quick-reconnect-sheets");
assert.ok(overviewReconnect?.handlers.click,"Management session must be connectable with existing Google OAuth");
overviewReconnect.handlers.click();
await new Promise(resolve=>setImmediate(resolve));
const overview=management.document.getElementById("live-board")?.innerHTML||"";
assert.ok(overview.includes("Management overview"),"Private management summary must render after login");
assert.ok(overview.includes("Chat access tested"),"Verified-chat metric must display");
assert.ok(overview.includes("9</strong><span>Chats registered"),"Count registered chats from live CRM");
assert.ok(overview.includes("2</strong><span>Chat access tested"),"Count only independently verified chats");
assert.ok(overview.includes("TEST-SAMPLE-123"),"Active handoffs should appear in management summary");
assert.ok(!overview.includes("DEMO-001"),"DEMO ONLY must never appear in active management summary");
assert.ok(overview.includes("Priority HQ changes"),"High-priority HQ change metric must display");
assert.ok(!overview.includes(fakeToken),"Tokens must never appear in management summary");
assert.ok(overview.includes('data-connect-chat="00"'),"Untested chat 00 must have a connection-test button");
assert.ok(overview.includes('data-connect-chat="01"'),"Untested chat 01 must have a connection-test button");
assert.ok(!overview.includes('data-connect-chat="02"'),"Already verified chat 02 must not have an activation button");
assert.ok(!overview.includes('data-connect-chat="07"'),"Already verified chat 07 must not have an activation button");
assert.equal(management.copyButtons.size,7,"Exactly seven unverified chats must have activation buttons");
const activation=management.copyButtons.get("01");
assert.ok(activation?.handlers.click,"Activation button must have a click listener");
activation.handlers.click();
await new Promise(resolve=>setImmediate(resolve));
assert.equal(management.copyText.length,1,"Click must write a single test prompt to browser clipboard");
const copiedPrompt=management.copyText[0];
assert.ok(copiedPrompt.includes("A3:O3"),"Chat 01 must target its exact private registry row");
assert.ok(copiedPrompt.includes("M3"),"Chat 01 must verify only its own column M cell");
assert.ok(copiedPrompt.includes("DEMO-001 remains DEMO ONLY"),"Practice task must stay excluded from live work");
assert.ok(copiedPrompt.includes("Do not send emails/DMs, run Make"),"Copied test must forbid real-world provider actions");
assert.ok(!copiedPrompt.includes(fakeToken),"Activation message must not contain private OAuth tokens");


const manualLock=first.document.getElementById("owner-lock-session");
assert.ok(manualLock?.handlers.click,"Manual lock must be clickable");
manualLock.handlers.click();
assert.ok(first.root.innerHTML.includes("No live records loaded"),"Lock must clear private CRM rows");
assert.ok(first.root.innerHTML.includes("Reconnect your live CRM"),"Lock must offer safe reconnect");

const second=launch();
assert.ok(second.root.innerHTML.includes("Reconnect your live CRM"),"Refreshing should show one-click restore");
assert.ok(!second.root.innerHTML.includes(fakeToken),"Reload must not leak access token");
assert.ok(!second.root.innerHTML.includes("Actual"),"Private records must not be cached across reload");
assert.ok(second.document.getElementById("quick-reconnect-sheets")?.handlers.click,"Reconnect must be clickable after reload");
assert.ok(source.includes("gmail.metadata"),"Use Gmail metadata-only scope");
assert.ok(!source.includes("auth/gmail.readonly"),"Do not request full read-only Gmail body access");
assert.ok(source.includes('p.append("labelIds","INBOX")'),"Gmail metadata scope must not use unsupported q searches");
assert.ok(source.includes('redirect:"error"'),"Do not follow API redirects with OAuth tokens");
assert.ok(second.document.getElementById("owner-lock-session")?.handlers.click,"Security lock control must be interactive");
assert.ok(second.document.getElementById("owner-forget-browser")?.handlers.click,"Forget-browser control must be interactive");
second.document.getElementById("owner-forget-browser").handlers.click();
assert.ok(!storage.has("vave-google-oauth-client-id"),"Forget this browser must remove public OAuth client setup");
assert.ok(!storage.has("vave-google-sheets-granted"),"Forget this browser must remove stored grant flag");

console.log("PASS: OAuth Client ID remembered; one-click reconnect after refresh; Google data and tokens not persisted.");
