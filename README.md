# Vave Automations — Company Headquarters

Live headquarters: https://vavebusiness.github.io/vaveautomations/

A responsive, public-safe operations dashboard for a custom workflow automation business.

## Operating rules (in priority order)

1. **Discovery first — custom automations only.** Ask every business which repetitive, costly or error-prone process it actually needs solved. Understand the tools, workflow, constraints and desired result, then propose a tailored integration. Never pitch a fixed package or identical workflow to all clients.
2. **Paperless operations.** Prefer digital proposals, approvals, invoices, onboarding and delivery; use legally valid electronic agreements and authorizations when required.
3. **Strict project separation — Vave Automations ≠ Vave Workflow Store.** Vave Automations is a custom client-services business; Vave Workflow Store is a separate automation-product business. Never merge or reuse their clients, contacts, email accounts, outreach, partners, revenue, reporting, CRM/HQ data, product catalogs, content, Make scenarios, code, marketing, or delivery claims. Work in the named project only; do not count assets or results from the other project as this company's. No cross-promotion or shared offer by default. An explicit new owner instruction is required to change this boundary.

**The existing Make document-to-Sheets prototype is optional technical evidence, not a product to sell to every client.**


## What is actually implemented

- **Seven departments** (00–06) with four subpages each: overview, SOP, work queue, metrics.
- **Eleven system screens**: opportunity shortlist, animated draggable clients & projects board, management & improvements, local action board, Make workflow registry, nine source database links, reports, integration center roadmap, owner-authorized Google data reader, and **nine-chat coordination launchpad**.
- **Refined midnight-blue/navy design, accessible scroll and micro-motion, premium kanban interactions, focus-mode navigation, global search, and responsive dashboard layout**.
- **Sanitized CRM snapshot** at `data/overview.json`; metrics are from November 2, 2026 and explicitly not live, even though the website's copy and visual presentation were reviewed November 7.
- **Anonymized pipeline shortlist**—private buyer details remain in the master CRM.
- **Workflow registry scoped to the real independent RentRoll PDF Underwriter and relevant helpers**, all inactive as of the audit.
- **Local-only action board** with status editing, add-task form and CSV export. No writes back to Sheets.
- **All nine ChatGPT roles**: nine newly created conversations with pasted operating instructions, according to the owner; seven core departments and two specialists; [Company Chat Registry](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070433) tracks source responsibilities, user-confirmed setup, outstanding source reviews and handoff verification.
- **Management event coordination**: private [HQ Change Queue](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070431) and [Company Event Log](https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit#gid=2070432). Website shows links only, not private rows.
- **Detailed operating documents**: `docs/tonight-2026-11-02.md`, `docs/architecture.md`, `docs/make-workflow-registry.md`, all seven `docs/departments/*.md` briefs, and `docs/management-automation-protocol.md` with role-specific chat instructions.

## Source-of-truth and security

The Google Sheets master CRM is authoritative: https://docs.google.com/spreadsheets/d/1UE69BCAxQeQthQm7Ja2RyFgGHv-1BZCRxClACRTZl1c/edit

**GitHub Pages is PUBLIC.** It may render private Google Sheets and Gmail records **only inside a user-authorized browser session** using Google's short-lived read-only OAuth grants. Access tokens are never persisted or committed. Make's server-side API credentials and unattended data synchronization still require a protected backend. Do not put API keys, private contacts, outreach bodies, client documents, service-account credentials or full suppression lists in HTML, JavaScript, GitHub Actions files or public JSON.

A scheduled ChatGPT HQ management review may inspect authorized sources, but chats do **not** autonomously exchange direct messages. The private CRM is the coordination handoff. Scheduled checks and site QA are **periodic**, not guaranteed second-by-second.

Existing ChatGPT connector access does not authorize the website. The **Owner Live Data** browser reader is implemented but still requires the user's Google OAuth Client ID and explicit read-only consent. Unattended server-side integration, secure Make access and audited write-back are **not yet deployed**. See [Google setup](docs/google-workspace-browser-setup.md).

## Quality checks

Requires Node.js 20+ (no npm dependencies):

```bash
npm test
```

Test checks JavaScript syntax, **18 site routes**, 7 departments, 9 CRM source tables (plus 2 new coordination registers), snapshot schema, operating procedures, and basic public-data restrictions. Public GitHub Actions also checks the deployed routes every six hours at the existing repository's free public Actions allowance.

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

See `docs/architecture.md` and `docs/google-workspace-browser-setup.md` for browser OAuth, private auth, read-only sync, Gmail/Make reconciliation, suppression, error handling, and conflict-safe write-back. No paid Make tests or scenario activation are needed to serve this static site.

**Business scope:** custom client-specific automations and integrations. No unrelated product-store projects.

## Security Shield checkpoint (3 November 2026)

The browser-only Google owner reader has metadata-only Gmail permissions, a restrictive CSP, temporary in-memory tokens, manual lock/reset controls and automatic idle locking. These browser safeguards do **not** turn GitHub Pages into a private website. A [JWT-verified, owner-only read-only backend prototype](backend/secure-worker/README.md) was prepared with synthetic tests; it is **not deployed** and holds no live provider credentials. A protected runtime/account and explicit owner authorization are required for real server-side Gmail/Sheets/Make status integration.
