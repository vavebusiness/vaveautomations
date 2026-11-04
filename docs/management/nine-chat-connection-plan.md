# Vave Automations — nine-chat coordination plan

**Plan date:** 4 November 2026. **Status:** All nine chats have owner-reported setup, but only 02 and 07 have verified shared-sheet access. The other seven need one independent check each. This is a shared-record operating system, not direct inter-chat messaging.

## One source of truth

- The **private Google Sheets master CRM** is our shared notebook. Every chat reads its current work from there; no one assumes that information moved automatically from a different chat.
- **Department Handoff Queue** holds assigned tasks, with unique task ID, source record/evidence, From/To chat, verified status, next action, owner and review date.
- **Company Chat Registry** holds all nine roles and the evidence that each chat has actually connected. Registry column M is the dated source-test result; column L is the real chat URL when supplied by the owner.
- **Company Event Log** records verified milestones, not drafted plans. **HQ Change Queue** holds proposed and approved management/HQ changes. **Opportunities**, **Sent Outreach** and **No Contact** are authoritative for sales.
- Public HQ contains no private business or personal data. The private owner viewer requests records only after the user authorizes Google Sheets. No production credential belongs in public source.

## Roles and handoffs

| Chat | Owns | Next destination |
| --- | --- | --- |
| 00 Command Center | Verified overall status, priorities and blockers | Assign owners through the private queue |
| 01 Client Acquisition | Find and validate genuine work requests, suppress duplicate/restricted outreach | 02 on a real interested buyer |
| 02 Sales & Conversations | Genuine replies, discovery, proposals, decisions | 03 when scope and approval exist |
| 03 Automation Development | Feasibility, technical QA, safe implementation and delivery | 02 for sales-ready evidence, 06 for risks |
| 04 Partnerships | Real agency partners and referrals | 02 for paid requests and 03 for technical scope |
| 05 Portfolio & Assets | Honest reusable demos and public-facing technical proof | 01/02/04 |
| 06 Strategy & Operations | Operating rules, data quality, process improvements | 07 for changes, 00 for critical risk |
| 07 Management Review | Audit handoffs and review requests | 08 for approved minor HQ work, owner for risky work |
| 08 HQ Engineering | Verified HQ UI/security work, code and release checks | 00 and 07 after a verified release |

## What counts as an actual connection

One **Copy connection test** per untested chat is available inside the private Owner Live Data → Management overview.

The owner opens **the existing chat**, pastes the corresponding test message, and asks that chat to: (a) read its own registry row; (b) read the private handoff queue, keeping DEMO-001 out of real work; (c) read one relevant role source; (d) write a specific dated successful read/write test in its **own** Registry M cell, preserving everything else; (e) read that M cell again to verify. A failed test must leave M blank and report the limitation. Do not invent chat URLs.

The old DEMO-001 exercise was verified across Chat 02 and Chat 07 only. Do **not** overwrite the demo notes or treat it as a real lead.

Only the owner can send a message into each of these existing chats from ChatGPT. No available connection here can remotely awaken all Project conversations. After the one-time test, they can share source data via the common private CRM whenever a relevant task actually runs.

## Standard handoff lifecycle

1. Check whether the source event and related task ID already exist. Avoid duplicate rows.
2. Verify source and write only the real facts to the proper CRM record.
3. Add one queued handoff if another department needs to act, with evidence, owner, next action, date and caveats.
4. Only the receiving department **accepts** its assignment after reading the evidence. It then updates status from Queued to Accepted / In progress / Blocked / Done with a verified note; do not auto-accept on behalf of others.
5. Periodic management checks escalate overdue/blocked items; they cannot make unexecuted work complete.

## Current live queue at drafting time

- **HANDOFF-001 → 01 Acquisition:** Potential future Make/n8n subcontract work; not a funded project.
- **HANDOFF-002 → 01 Acquisition:** Specific Meta WhatsApp webhook troubleshooting request; no contact yet.
- **HANDOFF-003 → 03 Development:** Review technical playbook and design synthetic QA before any tested-build claim.
- **DEMO-001:** Practice only. Never count it as customer work.

These are dated context, not live task statuses. Each chat must read the current private queue again when acting.

## Cadence

**Morning:** Existing daily Gmail/funnel report checks genuine replies, bounces and opt-outs. **Twice daily:** Existing acquisition task researches real prospect needs and checks sent history and No Contact. **Every six hours:** Existing Management Watch checks queue owners, dates, exceptions and verified HQ changes. **As needed:** Chat 03 demonstrates technical competence safely; 05 packages proven examples; 02 handles buyer conversations. **Weekly:** Chat 00 chooses no more than three high-value company priorities.

These are three scheduled tasks, **not nine always-on chat workers**. Do not create redundant schedules unless real work proves they are needed.

## Final readiness gate before scaling acquisition

- [ ] Seven remaining chat connection tests succeeded, or their blockers are recorded.
- [ ] Queued real handoffs have clear owners and dates and are picked up through deliberate chat sessions.
- [ ] Sales respects opt-outs, accepted sends, forum rules and verified buyer status.
- [ ] Portfolio clearly labels design, synthetic demonstration and production deployment.
- [ ] At least one current buyer problem has verifiable scope, permitted contact path, deliverable small pilot and realistic expectations.
- [ ] Payment/contract and client security arrangements are reviewed before a paid live deployment.

**Keep the no-Cloudflare decision.** The shared private-sheet model does not require that provider. Protected unattended backend sync is a separate project and is deferred.

**Stop rebuilding once connected.** From then on, prioritize actual client requests, proposal conversations and reliable delivery.
