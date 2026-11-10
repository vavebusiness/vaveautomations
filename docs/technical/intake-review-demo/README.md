# Vave Automations — Synthetic Document Intake Review Gate

**Independent technical demonstration · Not a client project · Not a Make scenario · Not a product-store item**

This is small original JavaScript code used as a transparent proof of basic workflow safety patterns. It is not evidence of production invoice extraction, accounting integration, a paid customer, or a live deployment. Vave Workflow Store is separate.

## What it actually demonstrates

- Check required fields, document types, file extensions, UTC timestamps and supplied synthetic file fingerprints.
- Detect duplicate events and duplicate file fingerprints scoped to the same sample client reference.
- Hold incomplete/invalid inputs for human review; never auto-send or auto-import.
- Require named reviewer action before producing an **approved_for_manual_export** state.
- Return deterministic counts and optional in-memory seen-key state to illustrate safe batch retries.
- Automated tests cover duplicates, missing data, invalid extensions, reviewer gates, normalization and non-mutating processing.

## Verify it

From repository root:

```bash
node --test docs/technical/intake-review-demo/test.mjs
```

No packages, credentials, Make credits, API calls or customer records. The test files use synthetic "DEMO" labels and fake hashes.

## What this does NOT do

- No actual PDF/OCR reading. The file metadata and hash are synthetic inputs.
- No Google Drive, Gmail, CRM, Make, n8n or accounting-platform integrations.
- No persisted database or multi-worker concurrency guarantee: seen-key state is in memory only and supplied by the caller.
- No delivered client solution, sending or billing.
- File extension checks are only a lightweight demo guard, not content or malware validation.

## Client-specific pilot gate

Before suggesting a build, ask: What incoming documents and tools are involved? What is the current manual process? What volumes and exceptions occur? Which import mechanism is officially supported? Who approves each output? Can the client provide redacted examples and agreed expected values?

Only then agree a custom fixed scope and price with permissions, error handling, a real database idempotency strategy, privacy/security review, tests using approved sample records, customer acceptance and a handover. If there is no authorized import route, do not promise one.
