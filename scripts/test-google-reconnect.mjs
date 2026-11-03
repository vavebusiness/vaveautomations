import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../assets/owner-live.js",import.meta.url),"utf8");
const CLIENT_ID="0123456789-example.apps.googleusercontent.com";
const fakeToken="TEST_NON_REAL_OAUTH_TOKEN";
const storage=new Map([["vave-google-oauth-client-id",CLIENT_ID]]);
function launch(){
 let html="",renderCount=0;
 const elements=new Map();
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
   querySelectorAll(){return []}
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
 const localStorage={
  getItem(k){return storage.get(k)||null},
  setItem(k,v){storage.set(k,String(v))},
  removeItem(k){storage.delete(k)}
 };
 const context=vm.createContext({
   document,window,localStorage,URL,URLSearchParams,Date,console,setInterval(){return 1},clearInterval(){},
   fetch:async (_url,opts)=>{
     assert.equal(opts.headers.Authorization,"Bearer "+fakeToken);
     return {ok:true,json:async()=>({valueRanges:Array.from({length:13},()=>({values:[["Field","Value"],["Actual","Checked"]]}))})}
   }
 });
 vm.runInContext(source,context,{filename:"assets/owner-live.js"});
 return {root,oauthRequests,document,renderCount:()=>renderCount};
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
const second=launch();
assert.ok(second.root.innerHTML.includes("Reconnect your live CRM"),"Refreshing should show one-click restore");
assert.ok(!second.root.innerHTML.includes(fakeToken),"Reload must not leak access token");
assert.ok(!second.root.innerHTML.includes("Actual"),"Private records must not be cached across reload");
assert.ok(second.document.getElementById("quick-reconnect-sheets")?.handlers.click,"Reconnect must be clickable after reload");
console.log("PASS: OAuth Client ID remembered; one-click reconnect after refresh; Google data and tokens not persisted.");
