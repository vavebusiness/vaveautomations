/* Vave Automations: protected read-only connector prototype (NOT DEPLOYED).
 * Requires a Cloudflare Access application, verified JWT, an exact owner identity,
 * and secret credentials stored ONLY in Worker runtime bindings.
 * This source contains no production secrets and exposes no write endpoints.
 */
const JSON_HEADERS={
  "Content-Type":"application/json; charset=utf-8",
  "Cache-Control":"private, no-store, max-age=0",
  "Pragma":"no-cache",
  "X-Content-Type-Options":"nosniff",
  "Referrer-Policy":"no-referrer",
  "X-Frame-Options":"DENY",
  "Content-Security-Policy":"default-src 'none'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'; form-action 'none'"
};
function reply(body,status=200){
  return new Response(JSON.stringify(body),{status,headers:JSON_HEADERS});
}
function decode64url(s){
  if(typeof s!=="string"||s.length>12000||!/^[A-Za-z0-9_-]+$/.test(s))throw Error("bad_base64url");
  const pad=s.replace(/-/g,"+").replace(/_/g,"/");
  return Uint8Array.from(atob(pad+"=".repeat((4-pad.length%4)%4)),x=>x.charCodeAt(0));
}
function json64url(s){return JSON.parse(new TextDecoder().decode(decode64url(s)))}
function configOk(env){
  return !!(env&&typeof env.ACCESS_TEAM_DOMAIN==="string"&&
    /^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN)&&
    typeof env.ACCESS_AUD==="string"&&env.ACCESS_AUD.length>=8&&
    typeof env.OWNER_EMAIL==="string"&&/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(env.OWNER_EMAIL));
}
async function verifyAccess(request,env,transport=fetch){
  if(!configOk(env))return false;
  const raw=request.headers.get("Cf-Access-Jwt-Assertion")||"";
  if(raw.length>10000||raw.length<50)return false;
  const parts=raw.split(".");
  if(parts.length!==3)return false;
  try{
    const header=json64url(parts[0]),claims=json64url(parts[1]);
    if(header.alg!=="RS256"||typeof header.kid!=="string"||header.kid.length>200)return false;
    const now=Math.floor(Date.now()/1000);
    if(!Number.isFinite(claims.exp)||claims.exp<=now||
       (claims.nbf&&claims.nbf>now+30)||
       (claims.iat&&claims.iat>now+30))return false;
    if(claims.iss!=="https://"+env.ACCESS_TEAM_DOMAIN)return false;
    if(!Array.isArray(claims.aud)||!claims.aud.includes(env.ACCESS_AUD))return false;
    if(typeof claims.email!=="string"||claims.email.trim().toLowerCase()!==env.OWNER_EMAIL.trim().toLowerCase())return false;
    const r=await transport("https://"+env.ACCESS_TEAM_DOMAIN+"/cdn-cgi/access/certs",{
      method:"GET",redirect:"error",cache:"no-store"
    });
    if(!r.ok)return false;
    const jwks=await r.json();
    const key=Array.isArray(jwks.keys)?jwks.keys.find(k=>k.kid===header.kid&&k.kty==="RSA"):null;
    if(!key)return false;
    const imported=await crypto.subtle.importKey("jwk",key,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
    const bytes=new TextEncoder().encode(parts[0]+"."+parts[1]);
    return await crypto.subtle.verify("RSASSA-PKCS1-v1_5",imported,decode64url(parts[2]),bytes);
  }catch{return false}
}
function googleConfigured(env){return !!(env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET&&env.GOOGLE_REFRESH_TOKEN&&env.CRM_SHEET_ID)}
function makeConfigured(env){return !!(env.MAKE_API_TOKEN&&env.MAKE_TEAM_ID&&env.MAKE_SCENARIO_IDS)}
async function googleToken(env,transport){
  if(!googleConfigured(env))throw Error("not_configured");
  const body=new URLSearchParams({
    client_id:env.GOOGLE_CLIENT_ID,
    client_secret:env.GOOGLE_CLIENT_SECRET,
    refresh_token:env.GOOGLE_REFRESH_TOKEN,
    grant_type:"refresh_token"
  });
  const r=await transport("https://oauth2.googleapis.com/token",{
    method:"POST",redirect:"error",cache:"no-store",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body
  });
  if(!r.ok)throw Error("provider_authorization_failed");
  const j=await r.json();
  if(!j.access_token||typeof j.access_token!=="string")throw Error("provider_authorization_failed");
  return j.access_token;
}
async function providerJson(url,token,transport,prefix="Bearer "){
  const r=await transport(url,{
    method:"GET",headers:{Authorization:prefix+token,Accept:"application/json"},
    redirect:"error",cache:"no-store"
  });
  if(!r.ok)throw Error("provider_request_failed");
  return r.json();
}
async function handoffs(env,transport){
  const token=await googleToken(env,transport);
  const url=new URL("https://sheets.googleapis.com/v4/spreadsheets/"+encodeURIComponent(env.CRM_SHEET_ID)+"/values/"+encodeURIComponent("'Department Handoff Queue'!A2:L100"));
  const j=await providerJson(url.toString(),token,transport);
  const rows=Array.isArray(j.values)?j.values:[];
  return {asOf:new Date().toISOString(),source:"Google Sheets",items:rows
    .filter(r=>Array.isArray(r)&&r[0]&&r[7]!=="DEMO ONLY")
    .slice(0,75).map(r=>({id:String(r[0]||""),from:String(r[2]||""),to:String(r[3]||""),
       summary:String(r[4]||""),nextAction:String(r[5]||""),owner:String(r[6]||""),
       status:String(r[7]||""),reviewDate:String(r[8]||"")}))};
}
async function recentMail(env,transport){
  const token=await googleToken(env,transport);
  const listUrl="https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&labelIds=INBOX";
  const list=await providerJson(listUrl,token,transport);
  const ids=Array.isArray(list.messages)?list.messages.slice(0,10):[];
  const items=[];
  for(const m of ids){
    if(typeof m.id!=="string"||!/^[a-zA-Z0-9_-]+$/.test(m.id))continue;
    const u=new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages/"+encodeURIComponent(m.id));
    u.searchParams.set("format","metadata");
    for(const field of ["From","Subject","Date"])u.searchParams.append("metadataHeaders",field);
    const msg=await providerJson(u.toString(),token,transport);
    const headers=Array.isArray(msg.payload?.headers)?msg.payload.headers:[];
    const head=n=>String(headers.find(h=>String(h.name).toLowerCase()===n.toLowerCase())?.value||"");
    items.push({id:m.id,from:head("From"),subject:head("Subject"),date:head("Date")});
  }
  return {asOf:new Date().toISOString(),source:"Gmail metadata only",items};
}
async function makeScenarios(env,transport){
  if(!makeConfigured(env))throw Error("not_configured");
  const allowed=new Set(String(env.MAKE_SCENARIO_IDS).split(",").map(s=>Number(s.trim())).filter(n=>Number.isSafeInteger(n)&&n>0));
  const team=Number(env.MAKE_TEAM_ID);
  if(!allowed.size||!Number.isSafeInteger(team)||team<=0)throw Error("not_configured");
  // Zone and path are fixed, never derived from user input.
  const zones=new Set(["eu1.make.com","eu2.make.com","us1.make.com","us2.make.com"]);
  const zone=env.MAKE_ZONE||"eu2.make.com";
  if(!zones.has(zone))throw Error("not_configured");
  const u=new URL("https://"+zone+"/api/v2/scenarios");
  u.searchParams.set("teamId",String(team));
  const j=await providerJson(u.toString(),env.MAKE_API_TOKEN,transport,"Token ");
  const scenarios=Array.isArray(j.scenarios)?j.scenarios:[];
  return {asOf:new Date().toISOString(),source:"Make API",items:scenarios
     .filter(x=>allowed.has(Number(x.id))).slice(0,50)
     .map(x=>({id:Number(x.id),name:String(x.name||""),active:!!x.isActive,
       invalid:!!x.isinvalid,paused:!!x.isPaused,lastEdit:String(x.lastEdit||"")}))};
}
export async function handle(request,env={},transport=fetch){
  // No public data endpoint is offered. Nothing is returned if Access is not configured.
  if(!configOk(env))return reply({error:"security_not_configured"},503);
  if(request.method!=="GET")return reply({error:"read_only_service"},405);
  if(!(await verifyAccess(request,env,transport)))return reply({error:"unauthorized"},403);
  const path=new URL(request.url).pathname;
  try{
    if(path==="/api/status")return reply({
      status:"protected_read_only",asOf:new Date().toISOString(),
      connections:{sheets:googleConfigured(env),gmail:googleConfigured(env),make:makeConfigured(env)},
      note:"Credentials configured does not prove live API access."
    });
    if(path==="/api/handoffs")return reply(await handoffs(env,transport));
    if(path==="/api/mail")return reply(await recentMail(env,transport));
    if(path==="/api/make")return reply(await makeScenarios(env,transport));
    return reply({error:"not_found"},404);
  }catch(e){
    // Never reveal provider response bodies, private messages, credentials or raw errors.
    return reply({error:e?.message==="not_configured"?"connector_not_configured":"provider_unavailable"},
      e?.message==="not_configured"?503:502);
  }
}
export default {fetch(request,env){return handle(request,env,fetch)}};
