import assert from "node:assert/strict";
import {webcrypto} from "node:crypto";
import {handle} from "../src/index.js";
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const pair=await crypto.subtle.generateKey({
  name:"RSASSA-PKCS1-v1_5",modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"
},true,["sign","verify"]);
const jwk=await crypto.subtle.exportKey("jwk",pair.publicKey);
jwk.kid="test-key";
const env={
 ACCESS_TEAM_DOMAIN:"vave-test.cloudflareaccess.com",
 ACCESS_AUD:"test-audience",
 OWNER_EMAIL:"owner@example.com",
 GOOGLE_CLIENT_ID:"test-client-id",GOOGLE_CLIENT_SECRET:"test-client-secret",
 GOOGLE_REFRESH_TOKEN:"test-refresh-token",CRM_SHEET_ID:"test-sheet-id",
 MAKE_API_TOKEN:"test-make-token",MAKE_TEAM_ID:"123",MAKE_ZONE:"eu2.make.com",
 MAKE_SCENARIO_IDS:"15,16"
};
const now=Math.floor(Date.now()/1000);
const b64=v=>(Buffer.isBuffer(v)?v:Buffer.from(typeof v==="string"?v:JSON.stringify(v))).toString("base64url");
async function makeJwt(overrides={}){
 const header=b64({alg:"RS256",kid:jwk.kid});
 const payload=b64({iss:"https://"+env.ACCESS_TEAM_DOMAIN,aud:[env.ACCESS_AUD],
   email:env.OWNER_EMAIL,iat:now,exp:now+300,...overrides});
 const signed=await crypto.subtle.sign("RSASSA-PKCS1-v1_5",pair.privateKey,new TextEncoder().encode(header+"."+payload));
 return header+"."+payload+"."+b64(Buffer.from(signed));
}
let calls=[];
async function mockFetch(url,options={}){
 const u=String(url);calls.push({url:u,method:options.method||"GET",headers:options.headers||{}});
 if(u.endsWith("/cdn-cgi/access/certs"))return Response.json({keys:[jwk]});
 if(u==="https://oauth2.googleapis.com/token"){
   assert.equal(options.method,"POST");
   assert.equal(options.body.get("refresh_token"),"test-refresh-token");
   return Response.json({access_token:"fake-access-token"});
 }
 if(u.includes("sheets.googleapis.com")){
   assert.equal(options.headers.Authorization,"Bearer fake-access-token");
   return Response.json({values:[
      ["DEMO-001","","01","02","training","ignore","02","DEMO ONLY"],
      ["HANDOFF-123","","01","02","needs buyer review","verify recent reply","02","Queued","2026-11-04"]
   ]});
 }
 if(u.includes("gmail.googleapis.com/gmail/v1/users/me/messages?")){
   assert.equal(options.headers.Authorization,"Bearer fake-access-token");
   assert.ok(u.includes("labelIds=INBOX")&&!u.includes("q="),"Metadata scope must not use q");
   return Response.json({messages:[{id:"a1"}]});
 }
 if(u.includes("gmail.googleapis.com/gmail/v1/users/me/messages/a1")){
   assert.equal(options.headers.Authorization,"Bearer fake-access-token");
   assert.ok(u.includes("format=metadata"));
   return Response.json({payload:{headers:[
     {name:"From",value:"Example Sender"},{name:"Subject",value:"Example subject"},{name:"Date",value:"Tue, 03 Nov 2026"}
   ]}});
 }
 if(u.includes("eu2.make.com/api/v2/scenarios")){
   assert.equal(options.headers.Authorization,"Token test-make-token");
   return Response.json({scenarios:[{id:15,name:"Company scenario",isActive:false},
     {id:99,name:"Unrelated project",isActive:true}]});
 }
 throw Error("Unexpected network call "+u);
}
const request=(path,jwt,method="GET")=>new Request("https://protected.example.net"+path,{
 method,headers:jwt?{"Cf-Access-Jwt-Assertion":jwt}:{}
});
const okJwt=await makeJwt();
let r=await handle(request("/api/status",okJwt),{},mockFetch);
assert.equal(r.status,503,"Not configured must fail closed");
r=await handle(request("/api/status"),env,mockFetch);
assert.equal(r.status,403,"Missing Access token must be denied");
r=await handle(request("/api/status",okJwt+"bad"),env,mockFetch);
assert.equal(r.status,403,"Tampered JWT must be denied");
r=await handle(request("/api/status",await makeJwt({email:"someone-else@example.com"})),env,mockFetch);
assert.equal(r.status,403,"Non-owner must be denied");
r=await handle(request("/api/status",await makeJwt({aud:["wrong-aud"]})),env,mockFetch);
assert.equal(r.status,403,"Wrong audience must be denied");
r=await handle(request("/api/status",await makeJwt({exp:now-60})),env,mockFetch);
assert.equal(r.status,403,"Expired token must be denied");
r=await handle(request("/api/status",okJwt,"POST"),env,mockFetch);
assert.equal(r.status,405,"Writes are forbidden even for owner");
r=await handle(request("/api/status",okJwt),env,mockFetch);
assert.equal(r.status,200);
assert.equal(r.headers.get("cache-control"),"private, no-store, max-age=0");
const status=await r.json();assert.equal(status.status,"protected_read_only");
assert.ok(!JSON.stringify(status).includes(env.GOOGLE_CLIENT_SECRET));
assert.ok(!JSON.stringify(status).includes(env.MAKE_API_TOKEN));
r=await handle(request("/api/handoffs",okJwt),env,mockFetch);
assert.equal(r.status,200);
const handoffs=await r.json();assert.equal(handoffs.items.length,1);
assert.equal(handoffs.items[0].id,"HANDOFF-123");
r=await handle(request("/api/mail",okJwt),env,mockFetch);
assert.equal(r.status,200);
const mail=await r.json();assert.equal(mail.items.length,1);
assert.equal(mail.items[0].subject,"Example subject");
assert.ok(!JSON.stringify(mail).includes("body"));
r=await handle(request("/api/make",okJwt),env,mockFetch);
assert.equal(r.status,200);
const make=await r.json();assert.deepEqual(make.items.map(x=>x.id),[15]);
r=await handle(request("/api/no-such-route",okJwt),env,mockFetch);
assert.equal(r.status,404);
const blocked=await handle(request("/api/make",okJwt),{...env,MAKE_SCENARIO_IDS:""},mockFetch);
assert.equal(blocked.status,503);
assert.ok(!calls.some(x=>/\/start$|\/run$|\/stop$/.test(x.url)),"No Make execution endpoints allowed");
assert.ok(calls.every(x=>!x.url.includes("test-refresh-token")&&!x.url.includes("test-make-token")),"Secrets must not appear in URLs");
console.log("PASS: strict Access JWT verification, exact owner, no public access/writes, read-only Google/Make, demo suppression, no secrets leaked.");
