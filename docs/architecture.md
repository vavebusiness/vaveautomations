# Headquarters infrastructure and integration design

**Scope:** Vave Automations service business only. Public GitHub Pages site serves the frontend and sanitized company information; sensitive client operations are private.

## Threat boundary

| Layer | Current state | Allowed information |
|---|---|---|
| GitHub repository / Pages | Public, source visible | Department procedures, sanitized counts, safe workflow summaries, links to protected sources, and a user-authorized Google read-only data viewer |
| Google Sheets master CRM | Private, authoritative | Prospects, contacts, outreach logs, suppression ledger, stages, tasks |
| Gmail / Make | Connected to ChatGPT; Gmail browser reader implemented but not authorized | Gmail metadata may appear after explicit user OAuth consent; Make API credentials still require a server |
| Authenticated backend | Not yet configured | Server-side tokens, private normalized records, scoped sync, secure writes and audit logs |

### Two distinct secure access patterns

**User-present read-only Google access (implemented, pending OAuth setup):** The Owner Live Data page uses Google Identity Services to request temporary read-only grants for Sheets and, optionally, Gmail. The Google Client ID is public and may be saved locally. Access tokens are held in browser memory and sent only to Google APIs. This enables private source viewing while the authorized user is present; no live backend or new hosting service is needed. Google OAuth configuration, permission and any required verification remain outstanding. See [setup guide](google-workspace-browser-setup.md).

**Unattended background processing or Make access (not implemented):** Any API token, refresh token, Google service-account credential, Gmail private key, Make API key, webhook secret or sensitive customer record embedded in JavaScript, static JSON or the public repository can be copied by anyone. For continuous synchronization, audited writes and Make status polling, use an authenticated backend with server-side secrets. Never put secrets in Pages assets.

## Recommended architecture

1. **Frontend:** keep GitHub Pages hosting. Show sanitized public data universally and authorized private Google data inside a short-lived, user-controlled browser session.
2. **Identity:** currently defer private OAuth permission to Google's consent screen and resource ACL. Any future unattended private API requires server-side identity, MFA, session controls and role-based access.
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

Keep GitHub Pages as hosting. Use manual sanitized snapshot exports for public summaries. The browser-only Google OAuth reader is implemented and can refresh protected source ranges while an authorized user has the page open, once Google OAuth setup is completed. Google Cloud Client ID is not a secret; never paste client secrets. Private Make integration and unattended synchronized updates require a protected backend. Do not run Make or spend Gemini credits solely to refresh the public site.
