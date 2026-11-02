/* Vave Automations / Motion Engine
   Native browser animations, no external runtime or tracking. */
(function(){
"use strict";
if(!document.body)return;
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
const supported=typeof IntersectionObserver==="function"&&!reduced.matches;
const SCROLL_SELECTOR=".hero-panel,.metric,.card,.feature-card,.section-head,.resource-card,.route,.process-step,.workflow-card,.roadmap-row,.board-introduction,.board-stat,.board-heading,.delivery-column,.finance-hero,.activity-entry";
let observer=null;
let pending=new WeakSet();
if(supported){
 observer=new IntersectionObserver(entries=>{
  for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}}
 },{threshold:.06,rootMargin:"0px 0px 35px 0px"});
 document.body.classList.add("motion-ready");
}
function reveal(){
 if(!observer)return;
 const all=document.querySelectorAll(SCROLL_SELECTOR);
 let prior=null,order=0;
 for(const el of all){
  if(pending.has(el))continue;
  pending.add(el);
  const group=el.parentElement;
  if(group!==prior){prior=group;order=0}else order++;
  el.style.setProperty("--reveal-delay",Math.min(order,4)*55+"ms");
  el.classList.add("motion-reveal");
  const rect=el.getBoundingClientRect();
  if(rect.bottom<0){el.classList.add("is-visible");continue}
  observer.observe(el);
 }
}
requestAnimationFrame(reveal);
let scheduled=false;
const mo=new MutationObserver(records=>{
 if(records.every(r=>r.addedNodes.length===0))return;
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;reveal();wireCounters()});
});
mo.observe(document.getElementById("app")||document.body,{childList:true,subtree:true});
/* Accessible subtle counter transition for source-verified numerical metrics.
   Only animates how values are painted, not the underlying data. */
const counted=new WeakSet();
function wireCounters(){
 if(reduced.matches||typeof IntersectionObserver==="undefined")return;
 document.querySelectorAll(".metric strong[data-metric],.board-stat strong").forEach(el=>{
  if(counted.has(el))return;counted.add(el);
  const text=el.textContent.trim();
  if(!/^\d{1,5}$/.test(text))return;
  const target=Number(text);
  if(!Number.isFinite(target)||target===0||target>10000)return;
  el.setAttribute("aria-label",text);
  const start=performance.now()+180,duration=800;
  function tick(now){
   const t=Math.min(1,Math.max(0,(now-start)/duration));
   const eased=1-Math.pow(1-t,4);
   el.textContent=String(Math.round(target*eased));
   if(t<1)requestAnimationFrame(tick);
   else el.textContent=text;
  }
  requestAnimationFrame(tick);
 });
}
wireCounters();
/* Scroll position indicator, 2px warm copper, no oversized animation. */
const header=document.querySelector(".topbar");
if(header){
 const line=document.createElement("div");
 line.className="scroll-progress";
 line.setAttribute("aria-hidden","true");
 header.appendChild(line);
 let queued=false;
 function update(){
  queued=false;
  const maximum=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
  line.style.transform="scaleX("+Math.min(1,Math.max(0,window.scrollY/maximum))+")";
 }
 window.addEventListener("scroll",()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});
 update();
}
/* Premium micro-interactions on real controls. No fake actions. */
document.addEventListener("pointerdown",ev=>{
 if(reduced.matches||ev.pointerType!=="mouse")return;
 const el=ev.target.closest(".action-button,.outline-button,.nav-link,.board-tab,.subtle-button");
 if(!el||el.disabled)return;
 const bounds=el.getBoundingClientRect();
 const ripple=document.createElement("span");
 ripple.className="motion-ripple";
 ripple.style.left=(ev.clientX-bounds.left)+"px";
 ripple.style.top=(ev.clientY-bounds.top)+"px";
 el.appendChild(ripple);
 ripple.addEventListener("animationend",()=>ripple.remove(),{once:true});
},{passive:true});
/* Keyboard and reduced-motion behavior are never dependent on animation. */
reduced.addEventListener?.("change",()=>{
 if(reduced.matches){
  document.body.classList.remove("motion-ready");
  document.querySelectorAll(".motion-reveal").forEach(el=>el.classList.add("is-visible"));
  observer?.disconnect();observer=null;
 }
});
})();