# Verified Make workflow inventory — company scope

Reviewed 2 November 2026. The Make organization contains other, unrelated workflows, so the list below is deliberately restricted to the independent document-processing prototype and related helpers.

## Primary: RentRoll PDF Underwriter

- Make scenario ID: **9888191**; status: **inactive**; last edited **1 October 2026**.
- Polling trigger recorded as a 900-second interval while active; currently inactive, so no scheduled runs should occur.
- Module path: **Google Drive Watch → Google Drive Download → Gemini API Call → JSON Parse → Iterator → Google Sheets Add Row**.
- Connection metadata reported accessible/healthy during inspection; this is not a fresh execution test.
- Earlier CRM notes recorded four successful runs on Oct 1. They do not prove financial extraction accuracy, reliability, or client deployment.
- Known risks: financial data errors, missing pages, duplicate units, bad JSON, source/destination mismatches, silent failures, partial reruns and unexpected AI costs.
- **Action:** keep inactive until client scope, data permissions and test budget are approved.

## Helpers

- **9888170 — RentRoll Resource Setup:** inactive; on demand; some setup modules disabled.
- **9888199 — RentRoll Test File Uploader:** inactive; on demand; synthetic/approved samples only.

## Explicit exclusions

Other AI creator, content, social-media product and POS inventory scenarios in the same Make team are not automatically Vave Automations client projects. Do not import their counts, spend or statuses into this company dashboard.

## Client-specific QA protocol

1. Define source document type and canonical output field schema with client.
2. Obtain a small approved anonymized input set, with ground-truth expected data.
3. Freeze test budget and alert thresholds before any run.
4. Run one example; compare every required field and note uncertainty.
5. Test missing data, duplicate rerun, corrupted PDF, unexpected structure and API failures.
6. Verify row-level reconciliation, idempotency and manual review handoff.
7. Document actual test IDs, pass/fail evidence, human review, sign-off and rollback.
8. Only enable live monitoring after customer acceptance and secure access agreement.
