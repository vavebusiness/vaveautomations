# Headquarters infrastructure and integration design

**Scope:** Vave Automations service business only. Public GitHub Pages site serves the frontend and sanitized company information; sensitive client operations are private.

## Threat boundary

| Layer | Current state | Allowed information |
|---|---|---|
| GitHub repository / Pages | Public, source visible | Department procedures, sanitized aggregate counts, public-safe workflow descriptions, links to protected sources |
| Google Sheets master CRM | Private, authoritative | Prospects, contacts, outreach logs, suppression ledger, stages, tasks |
| Gmail / Make | Connected to ChatGPT, not the website | Thread content and connected workflow configuration, under existing permissions |
| Authenticated backend | Not yet configured | Server-side tokens, private normalized records, scoped sync, secure writes and audit logs |

### Why static GitHub Pages cannot securely connect directly

Any token included in the browser's JavaScript, a bundled JSON file or public GitHub source can be read by anyone. Do not embed a Google OAuth refresh token, Gmail token, Make API key, webhook URL, service-account key or personally identifying CRM rows in the public source.

## Recommended architecture

1. **Frontend:** keep versioned static frontend in GitHub; when a protected app provider is chosen, redirect private routes to authenticated hosting.
2. **Identity:** secure login with MFA where available, allowlist membership, session expiry, CSRF protections and appropriate role-based access.
3. **Backend API:** server-only token exchange, input validation and output filtering. No side effects in GET endpoints.
4. **Private data:** relational storage with entities organizations, contacts, opportunities, communications, suppressions, tasks, projects, integrations, audit_events.
5. **Source sync:** per-source incremental cursors, retries and reconciliation to Google Sheets/Gmail/Make.
6. **Monitoring:** sync-run status, freshness, error counts, source references, alert routing and backup checks.

## Candidate API routes (not deployed)

| Route | Mode | Responsibility |
|---|---|---|
| GET /api/overview | Read-only | Verified aggregates, source timestamps and health |
| GET /api/opportunities | Authenticated read | Filtered opportunity records scoped by user rights |
| GET /api/tasks | Authenticated read | Owner, status and due date from authoritative source |
| GET /api/communications | Authenticated read | Thread metadata; private body only by explicit permission |
| GET /api/workflows | Authenticated read | Company-owned Make scenario status only |
| POST /api/tasks/:id | Audited write | Version-check target, validate action, preserve history |
| POST /api/sync/sheets | Privileged | Trigger idempotent read-only refresh (not publicly exposed) |
| POST /api/webhooks/make | Signed input | Event intake after webhook signature and replay validation |

## Synchronization contract

For every source row: `source_system`, `source_id`, `source_updated_at`, `sync_observed_at`, `normalized_status`, `record_version`, `source_url`, `last_error`. Use row source IDs rather than treating display order as stable.

- **Sheets:** read only by default, preserve trailing historical status and duplicate recipients; enforce typed schemas and agreed stage vocabulary.
- **Gmail:** reconcile by immutable message ID and thread ID; mark draft/accepted/rejected/replied distinctly; preserve opt-outs and bounces.
- **Make:** read scenario metadata and executions; do not automatically activate scenarios or replay runs in the act of viewing status.
- **CRM write-back:** optimistic concurrency, append audit record, validate before commit, detect conflicts, bounded retry and backup.

## Release gates

- [ ] Private provider connected and user authenticated.
- [ ] No secrets or customer records in publicly served assets or commit history.
- [ ] Read-only reconciliation matches authoritative record counts in controlled samples.
- [ ] Invalid scopes, expired tokens and 429/5xx have safe failure UI.
- [ ] No duplicate contact/outreach conditions can bypass suppression.
- [ ] Write functions enforce role checks, audit log, version conflict handling and test rollback.
- [ ] Sensitive data retention and client privacy requirements reviewed before client use.

## No-cost first phase

Continue maintaining public-safe snapshot exports manually from verified CRM; provide source links and visible freshness. This is not live sync. Do not run Make or spend Gemini credits solely to refresh the public site.
