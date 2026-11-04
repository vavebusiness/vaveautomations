# WhatsApp Cloud API → Make webhook → CRM: diagnostic playbook

**Vave Automations internal technical reference · 4 November 2026**

**Verification status:** Research-backed troubleshooting procedure, **not a tested integration or client case study**. No Meta or WhatsApp production account, client data, credentials, scenario or API call has been used in producing this guide. Actual delivery competence must be shown with a controlled demonstration and then confirmed against the client's own approved test environment.

## What we can investigate

Business messages sent to a production WhatsApp number are expected to produce Meta Cloud API webhook notifications, which can be processed by an authorized Make scenario and routed to a CRM. A failing link can occur before Make, inside Make, or at the CRM write step. **Isolate where the message stops before rebuilding anything.**

```text
Customer WhatsApp message
    → Meta WhatsApp Business Account and production phone number
    → Meta app subscribed to WABA and messages events
    → configured HTTPS callback / webhook receiver
    → Make scenario / validation / mapping
    → CRM API / database
    → deduplicated, auditable outcome (or an error queue)
```

This is an architecture description, not evidence of an implementation.

## First conversation: minimal, non-sensitive questions

1. Are **Meta test events** reaching the endpoint? Are **real messages from an authorized test number** reaching it?
2. Is the production phone number attached to the intended WhatsApp Business Account (WABA) and Meta app? Has the app been moved to an approved operating mode for this use?
3. Does the current Meta dashboard callback URL match the receiver that the Make scenario is actually listening on?
4. When a message is sent, does the Make webhook history show an incoming event, a filtered/rejected event, or nothing?
5. If Make receives the event, does the CRM create/update fail, succeed, or duplicate the record? What should a correct result look like?

Ask for **redacted screenshots or synthetic payloads only**. Never request passwords, API tokens, personal WhatsApp conversations, full real phone numbers, customer records, or business verification documents in open chat/email. Access must be granted through approved provider roles only after written scope and permission.

## Diagnostic decision tree

| Observed symptom | First evidence to request | Safe next check |
| --- | --- | --- |
| Meta test webhook works; production message does not arrive | Timestamp of authorized test message; webhook receiver logs; WABA/phone association with sensitive IDs redacted | Check app mode, `messages` field subscription, WABA subscription to app, callback URL, relevant Meta permissions and phone association; do not presume the cause |
| No Meta test webhook at all | Verification result and endpoint status, callback route without secrets | Check required HTTPS reachability, webhook verification GET handshake, callback URL and request processing |
| Event reaches endpoint but not Make scenario | Sanitized receiver event summary and Make webhook history | Confirm current Make webhook URL, scenario enabled state, filter conditions, parsing and error state |
| Event appears in Make but CRM does not update | Sanitized Make execution ID, mapping/error summary | Check recipient/phone identifiers, required CRM fields, API errors, authorization, quotas and failed write routing |
| Repeated messages create duplicate CRM rows | Synthetic duplicate event IDs and result counts | Add an appropriate stable event key and idempotent upsert/skip behavior; verify replays do not duplicate |
| Intermittent delivery failures | Provider and Make timestamps, sanitized error categories | Confirm error routes, retry/backoff behavior, dead-letter/exception handling and alerting |

**Avoid diagnosing from guesses.** More than one cause may coexist, and a client's account settings determine which checks are applicable.

## Account-side checks (configuration review only)

- Confirm correct Meta business app, WABA, phone-number ID and webhook destination are associated. Sensitive identifiers should be viewed only inside authorized admin sessions.
- Confirm the event subscription includes `messages` and that the app is actually subscribed to the intended WABA. A callback configured at app level does not by itself prove that WABA notifications will be delivered.
- Confirm the correct app permissions, business verification and, where required for the provider model, reviewed/approved access. Never attempt to bypass Meta approval requirements.
- Confirm approved mode/status, production-number setup and consent requirements before any real test. Send only owner-authorized test traffic.
- Verify endpoint authenticity: the initial verification challenge must be handled correctly; where a custom server processes POST webhooks, validate Meta's signature against the raw request body using a secret held server-side. Do not paste secrets into Make public links or website source.
- If the receiver is a Make custom webhook, check what authenticity protections and logging are available in that particular integration. Do not claim full signature validation unless it has actually been implemented and tested.
- Confirm Make's chosen scenario and downstream CRM connection before changing production filters or replacing any callback address. Avoid unnecessary runs/credits.

## Controlled test and acceptance

**Before changes:** Agree with the client on one narrow outcome, authorized test accounts, a rollback method, a timeline and who owns API/Make/CRM credentials. No use of live customer content without explicit authorization.

**Test sequence:**

1. Review configuration and record sanitized baseline evidence; make no changes.
2. Prove whether a Meta-authorized test event reaches the current receiver.
3. Prove whether one legitimate, approved test message on the intended production path reaches the same receiver, only when provider terms and client approval permit.
4. Trace one corresponding event through Make and into a synthetic/test CRM record, with no private content saved to logs.
5. Test missing fields, an irrelevant event, and one intentionally duplicated synthetic event, verifying the exception/duplicate behavior.
6. Test one representative failure (e.g. CRM unavailable in a sandbox) and confirm no silent loss or uncontrolled retry loop.
7. Agree what counts as **fixed**, capture redacted outcomes, and provide a short handover with rollback notes. Record actual Make credits, provider charges and any messaging costs if they occur.

**Possible delivery acceptance:** agreed authorized test message arrives in the intended test record exactly once; failures are visible; no unrelated production scenarios modified; rollback and operating notes are supplied. The specific acceptance criteria must be confirmed with the client.

## Suitable offer boundaries

- **Discovery:** clarify one failure path and confirm owner control and permitted testing.
- **Paid diagnostic, if agreed:** configuration/evidence review, source-of-failure report, narrow proposed remediation, possible quote for a fix.
- **Repair, separately approved:** make only the scoped changes, carry out approved tests, provide verifiable outcome and rollback plan.
- Do not promise a repair time, fee, budget saving or completed result before inspecting the actual environment.
- Do not imply that knowledge of the API or this playbook proves historical Meta/WhatsApp client deployments.

## Business and data safety

WhatsApp Business Platform policy, account permission and messaging rules apply. Commercial messaging requires applicable consent and platform-compliant conversation/template handling. Do not send unsolicited messages or use customer data for unapproved tests. Keep tokens in authorized providers' secret storage, use least-privilege connections, respect rate limits, avoid logging real payloads, and never copy client messages or personal contact details into public GitHub or HQ.

## Provider references

- [Meta's WhatsApp Cloud API collection](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api)
- [Meta's WABA subscription API reference](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api?entity=folder-13382743-148258e1-3240-4eed-8a78-049bb1d1fe25)
- [Meta WhatsApp SDK documentation for receiving messages](https://github.com/WhatsApp/WhatsApp-Nodejs-SDK/blob/main/website/docs/receivingMessages.md)
- [Meta WhatsApp business documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/overview/)

**Next practical proof:** Build an isolated, synthetic webhook→Make→test-record demonstration (only after checking costs and consent). No production scenario or customer account has been used yet.
