# 03 — Automation Development

> **Vave Automations operational brief** · Reviewed 2 November 2026 · Owner: Engineering
>
> Public-safe process documentation. The private master CRM and authenticated connected services remain authoritative.

## Mission and outcome

**Mission:** Build safe workflows around verified requirements, prove their behavior, and deliver with ownership and recovery paths.

**Definition of success:** Client-accepted, documented automation with monitored exceptions.

## Current mandate

- RentRoll PDF Underwriter is an independent, inactive prototype
- Google Drive → PDF → Gemini → Parse JSON → Iterator → Sheets
- Four successful historical prototype runs do not prove extraction accuracy
- No expensive testing or activation without permission

## Standard operating procedure

1. **Requirements** — Record current and target process, source schemas, access boundaries, exceptions and expected user action.
2. **Blueprint** — Specify triggers, transformations, validations, fallbacks, idempotency keys and destination ownership.
3. **Prototype** — Use synthetic or client-approved anonymized examples and minimal permissions.
4. **Test** — Compare output to source, verify duplicates, failures, retries, missing fields and safe recovery.
5. **Roll out** — Secure client-owned connections, monitoring, alerts, acceptance and rollback.
6. **Handover** — Provide operating notes, support window, ownership, export and recovery instructions.

## Decision and safety rules

- Do not activate inactive scenarios for dashboard integration
- Never expose API keys or sensitive source files in a public repo
- Document actual test results, not inferred results

## Work queue

| Ref | Priority | Action | State | Trigger/review |
|---|---|---|---|---|
| HQ-009 | P0 | Maintain Make rent-roll scenario inactive until approved | Controlled | Continuous |
| HQ-010 | P1 | Document data schema, retry/idempotency and manual exception path | Ready | Before client pilot |
| HQ-011 | P1 | Validate extraction accuracy against approved test set | Blocked | After approved tests |

Tasks are a **planning view**, not proof that CRM cells were edited. For current status, consult the authoritative Master Checklist.

## Metrics and evidence

- Test cases passed and failed
- Document accuracy by required field
- Duplicate processing incidents
- Error detection and recovery coverage

Metrics are defined here; report them as verified only after checking source timestamps and records.

## Department handoffs

1. Sales scope → Engineering build
2. Engineering acceptance evidence → Sales/client
3. Deployment / failures → Operations monitoring

## Private sources to inspect

- [Safety Audit](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070426) — High-risk controls, exceptions and checkpoints
- [Sales Playbook](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070422) — Discovery, pricing, proposals and follow-ups
- [Master Checklist](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070427) — Operating tasks, owners, status and evidence

## Closure checklist

- [ ] Source information reviewed and timestamped.
- [ ] Current priorities have owners, evidence and next actions.
- [ ] Waiting/blocked work is explicitly separated from completed work.
- [ ] No client, revenue or technical success is reported without evidence.
- [ ] Handoff records have sufficient detail for the next department.
- [ ] Master CRM updated only through authorized, verified changes.

**Important:** This file is a department playbook, not a substitute for its dedicated ChatGPT Project conversation. Those existing chat transcripts cannot be edited through a GitHub commit.
