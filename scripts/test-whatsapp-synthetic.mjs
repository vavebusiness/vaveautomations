// Offline synthetic test only: no network, Meta credentials, WhatsApp traffic or Make runs.
// Demonstrates the shape of a safe event normalizer and basic processing outcomes.
import assert from "node:assert/strict";

function extractSyntheticMessages(payload) {
  if (!payload || payload.object !== "whatsapp_business_account") return [];
  const items=[];
  for(const entry of Array.isArray(payload.entry)?payload.entry:[]){
    for(const change of Array.isArray(entry.changes)?entry.changes:[]){
      if(change.field!=="messages")continue;
      for(const msg of Array.isArray(change.value?.messages)?change.value.messages:[]){
        if(typeof msg.id!=="string" || !msg.id.trim())throw new Error("Missing event identifier");
        if(typeof msg.from!=="string" || !msg.from.trim())throw new Error("Missing sender identifier");
        items.push({id:msg.id,from:msg.from,type:msg.type||"unknown"});
      }
    }
  }
  return items;
}
function processInMemory(messages,{store,write}) {
  const result={created:0,duplicates:0,failed:[]};
  for(const msg of messages){
    if(store.has(msg.id)){result.duplicates++;continue;}
    try{write(msg);store.add(msg.id);result.created++}
    catch(error){result.failed.push({eventId:msg.id,reason:String(error.message||error)})}
  }
  return result;
}
const payload={object:"whatsapp_business_account",entry:[{
 id:"WABA_TEST_PLACEHOLDER",changes:[{field:"messages",value:{messages:[
  {id:"wamid.TEST.001",from:"TEST_SENDER_001",type:"text",text:{body:"synthetic example only"}}
 ]}}]
}]};
const events=extractSyntheticMessages(payload);
assert.equal(events.length,1,"Synthetic message should be extracted exactly once");
assert.equal(events[0].id,"wamid.TEST.001");
const store=new Set(),records=[];
const first=processInMemory(events,{store,write:x=>records.push({eventId:x.id})});
assert.deepEqual(first,{created:1,duplicates:0,failed:[]},"One synthetic CRM write should succeed");
const duplicate=processInMemory(events,{store,write:()=>{throw new Error("A duplicate must not be written")}});
assert.equal(duplicate.duplicates,1,"Repeated synthetic delivery should not create another row");
assert.equal(records.length,1);
assert.deepEqual(extractSyntheticMessages({object:"whatsapp_business_account",entry:[{changes:[{field:"statuses",value:{}}]}]}),[],"Delivery-status events are not inbound messages");
assert.throws(()=>extractSyntheticMessages({object:"whatsapp_business_account",entry:[{changes:[{field:"messages",value:{messages:[{from:"TEST_SENDER"}]}}]}]}),/Missing event identifier/);
assert.throws(()=>extractSyntheticMessages({object:"whatsapp_business_account",entry:[{changes:[{field:"messages",value:{messages:[{id:"TEST_TWO"}]}}]}]}),/Missing sender identifier/);
const store2=new Set();
const failed=processInMemory(events,{store:store2,write:()=>{throw new Error("Synthetic CRM unavailable")}});
assert.equal(failed.failed.length,1,"CRM failure must be visible");
assert.equal(store2.size,0,"Failed write should not be marked delivered");
const recovered=processInMemory(events,{store:store2,write:()=>{}});
assert.equal(recovered.created,1,"Controlled replay can succeed after synthetic CRM recovers");
assert.equal(store2.size,1);
assert.deepEqual(extractSyntheticMessages({object:"not_whatsapp",entry:[]}),[]);
console.log("PASS: 7 offline synthetic WhatsApp event cases; no provider calls, no real messaging, no Make credits.");
