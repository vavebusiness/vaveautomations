# 06 — Strategy & Operations

> **Vave Automations operational brief** · Reviewed 2 November 2026 · Owner: Operations
>
> Public-safe process documentation. The private master CRM and authenticated connected services remain authoritative.

## Mission and outcome

**Mission:** Keep the business coherent, secure, auditable and commercially focused.

**Definition of success:** One reliable source of truth and predictable operational execution.

## Current mandate

- Nine-tab Google Sheets master CRM is initial authoritative source
- Public Pages frontend must not access private Gmail or CRM directly
- No duplicate outreach or unsupported stage moves
- Use gated, audited backend writes only after read-only verification

## Standard operating procedure

1. **Govern** — Maintain definitions and owners for CRM, departments, outreach and delivery.
2. **Observe** — Reconcile Gmail, Sheets and Make from authenticated providers without silent overwrites.
3. **Protect** — Apply suppression, least privilege, secret storage, privacy controls and backup discipline.
4. **Automate** — Start with read-only sync; test on sample data before enabling audited write-back.
5. **Validate** — Check data counts, IDs, conflict resolution, missing rows and retries.
6. **Review** — Escalate spending, access, identity and data-integrity exceptions with clear next actions.

## Decision and safety rules

- Public repo code is never a secure credential store
- Do not claim live sync just because ChatGPT connectors work
- Preserve old records and link all updates to evidence

## Work queue

| Ref | Priority | Action | State | Trigger/review |
|---|---|---|---|---|
| HQ-016 | P0 | Finish public-safe HQ information architecture and navigation | In progress | Tonight |
| HQ-017 | P0 | Configure private backend, login and least-privilege permissions | Blocked | After hosting authorization |
| HQ-018 | P0 | Build read-only CRM sync with freshness/error indicators | Blocked | After private backend |
| HQ-019 | P1 | Connect Gmail thread reconciliation and suppression logic | Blocked | After secure OAuth |
| HQ-020 | P1 | Add audit-logged CRM write-back and safe Make status sync | Backlog | After read-only QA |

Tasks are a **planning view**, not proof that CRM cells were edited. For current status, consult the authoritative Master Checklist.

## Metrics and evidence

- Source freshness and errors
- Suppression compliance
- Sync validation and audit coverage
- Tool spending and unapproved runs

Metrics are defined here; report them as verified only after checking source timestamps and records.

## Department handoffs

1. Every workstream → shared authoritative records
2. Safety exceptions → stop and investigate
3. Verified milestones → Command Center reporting

## Private sources to inspect

- [Dashboard](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070423) — Executive KPIs, funnel counts, priority actions
- [No Contact](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070425) — Suppression ledger for addresses and domains
- [Safety Audit](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070426) — High-risk controls, exceptions and checkpoints
- [Master Checklist](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070427) — Operating tasks, owners, status and evidence

## Closure checklist

- [ ] Source information reviewed and timestamped.
- [ ] Current priorities have owners, evidence and next actions.
- [ ] Waiting/blocked work is explicitly separated from completed work.
- [ ] No client, revenue or technical success is reported without evidence.
- [ ] Handoff records have sufficient detail for the next department.
- [ ] Master CRM updated only through authorized, verified changes.

**Important:** This file is a department playbook, not a substitute for its dedicated ChatGPT Project conversation. Those existing chat transcripts cannot be edited through a GitHub commit.
