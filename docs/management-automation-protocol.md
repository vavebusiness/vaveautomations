# Vave Automations — Multi-Chat Management & HQ Improvement Protocol
**Status:** Operational design and private shared registers implemented; autonomous cross-chat communication and live sync not yet deployed.
**Reviewed:** 2 November 2026
## Purpose
Coordinate the seven existing company workstreams plus two specialist roles:
- **07 — Management Review:** cross-department reliability, opportunities, decisions, priority and risk triage.
- **08 — HQ Engineering:** website design, usability, infrastructure, release QA, safe integration changes.
These are proposed roles/chats. This file does **not** create actual ChatGPT conversations or claim that one chat can message another on its own.
## Authoritative private coordination registers
In the current master Google Sheets CRM:
- [HQ Change Queue](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070431): work proposals, type, risk, approvals, status, GitHub commit and verification.
- [Company Event Log](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070432): verified changes in CRM, Gmail, Make and company operations.
- Existing [Master Checklist](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070427): actionable priorities and owners.
- [Public GitHub source](https://github.com/vavebusiness/vaveautomations): website code and public-safe technical documentation.
## State machine
`Proposed → Approved → Implementing → In review → Shipped` with optional `Deferred` or `Rejected`.
No status is marked shipped until code commit, passing CI and deployed website verification are recorded. Website changes should attach a source, user-impact statement, rollback method and latest release commit. Every update must be checked after writing.
## Coordination runbook
1. **Source event**: a workstream inspects the authoritative provider and verifies a real event (message, proposal, accepted payment, product, workflow run or code change). No invented state.
2. **Event log**: save event ID, source ID, verified timestamp, entity kind, evidence reference, next owner and whether HQ refresh is needed. Never copy secrets or private message bodies into public GitHub.
3. **Management review**: read new events, identify bottleneck/priority, label affected department and propose 0–3 concrete tasks. Do not create duplicate work or re-open suppressed leads.
4. **Classify**: 
   - **Minor / reversible**: typographic spacing, responsive polish, accessibility, safe navigation/link fixes, helpful microanimation, low-impact copy edits. Pre-authorized *only* if no third-party data, external API, business-stage changes, cost, security or new dependency.
   - **Major / approval required**: hosting migration, credentials, authentication, payment handling, client records, stage changes, outbound email, Make scenario activation, API spend, workflow automation, UI redesign that changes the operating model, public release of private records, breaking behavior.
5. **HQ execution**: implement an approved change through GitHub, run route/privacy/javascript tests, check manual interactive behavior and Pages status, then record commit.
6. **Owner report**: notify only meaningful verified changes, blockers or approval needs. Include exact change queue ID, what actually changed, evidence, and rollback instructions.
## No-cost architecture now
GitHub Pages hosts static public-safe UI; GitHub Actions validates each commit. Private Sheets remain source of truth. No live private Gmail/Sheets/Make sync and no new hosting expense have been configured. 
For later authenticated sync, the candidate free-tier stack is Cloudflare Workers + D1 + Access within published quotas; Supabase Free is another candidate, but projects can pause after inactivity. Connecting anything requires user action and security review.
## Events and latency
GitHub/Make/Google provider events can sometimes be near real-time when authorized webhooks and a backend exist. Scheduled ChatGPT reviews are **not nonstop processes** and cannot promise updates in the same second. Without such integrations, sources update only when a scheduled or explicit task reads and writes them. A shared sheet is a handoff channel, not autonomous inter-chat messaging.
## Precise safety rules
- No credentials, tokens, API keys, client bank information, personal emails, full private messages or confidential client files in public GitHub history or static JSON.
- No real outbound email, customer financial actions, Make paid executions or access changes without authorization and stage-specific permission.
- No fake clients, revenue, project delivery, or automatic completion claims.
- Any broken site, failing tests or unexpected data exposure: stop automatic releases, record an incident, notify owner.
## Change request minimum fields
Request ID; date; author/origin; department; area; description; risk; priority; status; owner approval; evidence; review date; commit; verification; next action.
## Priority objective
Make the company easier to operate and better at winning/delivering actual projects. UI improvements should reduce confusion—not just add decoration.
