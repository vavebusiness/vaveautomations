# Vave Automations — Company Headquarters

Live headquarters: https://vavebusiness.github.io/vaveautomations/

A responsive, public-safe operations dashboard for a custom workflow automation business.

## What is actually implemented

- **Seven departments** (00–06) with four subpages each: overview, SOP, work queue, metrics.
- **Nine system screens**: opportunity shortlist, animated draggable clients & projects board, management & improvements, local action board, Make workflow registry, nine source database links, reports, integration center and roadmap.
- **Refined graphite/copper design, accessible scroll and micro-motion, premium kanban interactions, focus-mode navigation, global search, and responsive dashboard layout**.
- **Sanitized CRM snapshot** at `data/overview.json`; metrics are historical and explicitly not live.
- **Anonymized pipeline shortlist**—private buyer details remain in the master CRM.
- **Workflow registry scoped to the real independent RentRoll PDF Underwriter and relevant helpers**, all inactive as of the audit.
- **Local-only action board** with status editing, add-task form and CSV export. No writes back to Sheets.
- **Management event coordination**: private [HQ Change Queue](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070431) and [Company Event Log](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070432). Website shows links only, not private rows.
- **Detailed operating documents**: `docs/tonight-2026-11-02.md`, `docs/architecture.md`, `docs/make-workflow-registry.md` all seven `docs/departments/*.md` briefs, and `docs/management-automation-protocol.md` with role-specific chat instructions.

## Source-of-truth and security

The Google Sheets master CRM is authoritative: https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit

**GitHub Pages is PUBLIC.** It cannot safely access private Gmail/Sheets/Make resources directly. Do not put API keys, private contacts, outreach bodies, client documents, service-account credentials or full suppression lists in HTML, JavaScript, GitHub Actions files or public JSON.

A scheduled ChatGPT HQ management review may inspect authorized sources, but chats do **not** autonomously exchange direct messages. The private CRM is the coordination handoff. Scheduled checks and site QA are **periodic**, not guaranteed second-by-second.

Existing ChatGPT connector access is not equivalent to a working website integration. Private authentication, server-side provider credentials, normalized data, source reconciliation and audited write-back are **not yet deployed**.

## Quality checks

Requires Node.js 20+ (no npm dependencies):

```bash
npm test
```

Test checks JavaScript syntax, **16 site routes**, 7 departments, 9 CRM source tables (plus 2 new coordination registers), snapshot schema, operating procedures, and basic public-data restrictions. Public GitHub Actions also checks the deployed routes every six hours at the existing repository's free public Actions allowance.

## Deploy

GitHub Pages → Deploy from branch `main`, folder `/(root)`. The published URL is the project site listed above.

## Update process

1. Verify CRM numbers from their source and source timestamp.
2. Update sanitized `data/overview.json` only with public-safe aggregate values.
3. Update `assets/hq-data.js` after checking departmental evidence; never write private records there.
4. Run `npm test` and review diffs for secrets and unrelated projects.
5. Commit to `main`, confirm Actions status, then validate Pages from desktop and mobile.

## Free infrastructure decision

GitHub Pages remains the front-end host for free. A secure authenticated backend is not yet provisioned. If required later, Cloudflare Workers Free + D1 (with Cloudflare Access, subject to free limits) is a candidate. Supabase Free is an alternative, but may pause inactive databases. Never subscribe to paid services without separate approval.

## Technical roadmap

See `docs/architecture.md` for private auth, read-only sync, Gmail/Make reconciliation, suppression, error handling, and conflict-safe write-back. No paid Make tests or scenario activation are needed to serve this static site.

**Business scope:** custom client-specific automations and integrations. No unrelated product-store projects.
