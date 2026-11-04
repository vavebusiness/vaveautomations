# HANDOFF-003 — Meta WhatsApp / Make readiness review

**Date:** 2026-11-04
**Classification:** Public-safe synthetic technical evidence. **No live Meta/WhatsApp or Make deployment tested.**

## Problem being investigated

A public Make Community requester described real production messages failing to arrive along the **Meta WhatsApp Cloud API → Make webhook → Lovable CRM** path. This is not a client engagement and no credentials or client data have been received. The cause is **unknown** until we can inspect authorized evidence with the requester.

## Existing evidence and gaps

- [Diagnostic playbook](./whatsapp-cloud-make-diagnostic.md) lays out account, webhook, Make scenario and CRM failure points.
- [Offline event harness](../../scripts/test-whatsapp-synthetic.mjs) uses only fabricated identifiers and in-memory records. Its purpose is to test logic for synthetic event extraction, duplicates, unsupported notifications, invalid fields and simulated CRM failures.
- Passing this harness demonstrates basic event-processing logic; **it does not demonstrate a real Meta webhook subscription, signature validation against Meta, public endpoint reliability, production account permissions, Make execution, Lovable CRM write or real WhatsApp delivery**.
- No actual business case study, budget, agreement or paid task exists.

## Offline synthetic QA matrix

| Test | Test inputs | Expected result |
| --- | --- | --- |
| Receive a synthetic text event | Fake WhatsApp-like JSON with one fictional event ID | Extract exactly one normalized event |
| Duplicate delivery | Replay identical fake event ID | No duplicate test record |
| Non-message notification | Fabricated `statuses` change | No inbound-message event |
| Missing message ID | Fake message without `id` | Visible error, no false delivery |
| Missing sender ID | Fake message without `from` | Visible error, no false delivery |
| CRM write error | In-memory write throws | Error visible; event remains pending |
| Controlled retry | Try failed synthetic record after mock store recovers | Exactly one successful record |
| Non-WhatsApp envelope | Fake unrelated `object` | Zero messages, no processing |

The automated script covers these logical conditions without external services; interpret GitHub Actions result before claiming the offline tests have passed.

## Next technical gate before a real job

1. **Clarify scope:** Ask requester to specify whether messages fail before webhook reception, inside Make, or at the Lovable CRM write stage. Request only redacted timestamps/error categories or fictional examples initially.
2. **Account-side evidence:** Under customer's authorized supervision, inspect subscription to the intended WhatsApp Business Account, `messages` events, app mode and configured callback. Meta account permissions and webhook verification requirements vary with the implementation.
3. **Receiver/authentication:** Identify whether Make's webhook receiver validates expected authenticity. If a custom HTTP receiver is involved, verify webhook challenge/signature checks with a secret stored only on the server. Never put secrets in public HQ.
4. **Controlled live test:** Only after clear client authorization, costs and privacy agreed, send a permitted test event using customer-owned test accounts. Trace: Meta → receiver → Make → **test** CRM record.
5. **Error and retry:** Inspect actual Make error handling, duplicate suppression and failure visibility. Avoid silent retries or customer-message logging.
6. **Acceptance:** Fix is proven only if an agreed authorized test event results in one correct test CRM record, with errors visible, rollback available, and unrelated production workflows untouched.

## Sales implication

The current honest claim is **"We can diagnose the flow and have verified offline synthetic event-handling behavior once CI passes."** Do not say **"We have built a working WhatsApp-to-Make integration"** or suggest prior customer success without actual provider evidence.

**Contact rule:** The requester posted on Make Community, whose posting restrictions must be respected. Do not publish AI-generated community outreach, mass-DM or move to unrequested alternate addresses to bypass restrictions. Real buyer conversation and any platform-permitted contact require owner review; no action has been sent.

## Delivery decision

HANDOFF-003 can be marked **Done as a scoped technical research/QA planning assignment** after the guide exists and GitHub CI confirms the offline tests. Live technical feasibility remains **not verified** and is a separate, owner-approved customer-specific work item.
