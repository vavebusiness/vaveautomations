# Vave Automations — Company Headquarters

Live site (once GitHub Pages finishes deploying): https://vavebusiness.github.io/vaveautomations/

A responsive, public-safe operations dashboard for a custom workflow automation business.

## What is actually implemented

- **Seven departments** (00–06) with four subpages each: overview, SOP, work queue, metrics.
- **Seven system screens**: opportunity shortlist, local action board, Make workflow registry, nine source database links, reports, integration center and roadmap.
- **Shared navigation, global search, responsive layout and lightweight reporting UI**.
- **Sanitized CRM snapshot** at `data/overview.json`; metrics are historical and explicitly not live.
- **Anonymized pipeline shortlist**—private buyer details remain in the master CRM.
- **Workflow registry scoped to the real independent RentRoll PDF Underwriter and relevant helpers**, all inactive as of the audit.
- **Local-only action board** with status editing, add-task form and CSV export. No writes back to Sheets.
- **Detailed operating documents**: `docs/tonight-2026-11-02.md`, `docs/architecture.md`, `docs/make-workflow-registry.md` and all seven `docs/departments/*.md` briefs.

## Source-of-truth and security

The Google Sheets master CRM is authoritative: https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit

**GitHub Pages is PUBLIC.** It cannot safely access private Gmail/Sheets/Make resources directly. Do not put API keys, private contacts, outreach bodies, client documents, service-account credentials or full suppression lists in HTML, JavaScript, GitHub Actions files or public JSON.

Existing ChatGPT connector access is not equivalent to a working website integration. Private authentication, server-side provider credentials, normalized data, source reconciliation and audited write-back are **not yet deployed**.

## Quality checks

Requires Node.js 20+ (no npm dependencies):

```bash
npm test
```

Test checks JavaScript syntax, expected route files, 7 departments, 9 CRM source tabs, snapshot schema, operating procedures and basic public-data restrictions.

## Deploy

GitHub Pages → Deploy from branch `main`, folder `/(root)`. The published URL is the project site listed above.

## Update process

1. Verify CRM numbers from their source and source timestamp.
2. Update sanitized `data/overview.json` only with public-safe aggregate values.
3. Update `assets/hq-data.js` after checking departmental evidence; never write private records there.
4. Run `npm test` and review diffs for secrets and unrelated projects.
5. Commit to `main`, confirm Actions status, then validate Pages from desktop and mobile.

## Technical roadmap

See `docs/architecture.md` for private auth, read-only sync, Gmail/Make reconciliation, suppression, error handling, and conflict-safe write-back. No paid Make tests or scenario activation are needed to serve this static site.

**Business scope:** custom client-specific automations and integrations. No unrelated product-store projects.
