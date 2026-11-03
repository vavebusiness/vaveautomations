# Private Connector — Security Shield (UNDEPLOYED)

**State 2026-11-03:** Source code and synthetic safety tests prepared. This is NOT an online endpoint, protected owner login, enabled Make integration, or continuous synchronization. Public HQ remains at GitHub Pages.

## Threat boundary

Public GitHub Pages can show public safe information and can present a browser-authorized Google read-only viewer. It cannot safely store private Make API keys, Google refresh tokens, CRM rows, Gmail data or client communications.

This Worker is designed for a **separate, authenticated owner-side origin**. Configure Cloudflare Zero Trust Access for the entire Worker route before using any provider credentials. Browser traffic to the private origin must be protected by that provider's login policy; GitHub Pages does not become private merely by linking to it.

The Worker **also verifies the Access JWT cryptographically**: RS256 signature against the configured team's JWKS, expected audience and issuer, expiry and exact approved owner email. Missing configuration, wrong claims and invalid signatures fail closed. No endpoint trusts a bare user-supplied email header.

## Restricted API contract

All endpoints require a valid owner Access JWT. They accept **GET only** and send `Cache-Control: private, no-store`; there are no write, payment, email-send, Make-run, Make-start or Make-stop routes.

| Endpoint | Returned | Provider permission |
| --- | --- | --- |
| `/api/status` | Whether secret bindings exist (not whether consent or source reads work) | Cloudflare Access |
| `/api/handoffs` | Live, bounded shared handoffs; excludes DEMO ONLY row | Google Sheets read-only OAuth |
| `/api/mail` | Up to 10 inbox From/Subject/Date headers only | Gmail metadata-only OAuth |
| `/api/make` | Only allowlisted scenario ID, name, active/paused/invalid and last edit | Make `scenarios:read` only |

The API is for owner-side first-party use. It does **not** allow browser CORS access from the public GitHub Pages site. A separate protected owner interface will be needed when the Worker is deployed; do not expose these endpoints publicly or permit wildcard CORS.

## Secret management — do not put values in public GitHub

Cloudflare runtime secret bindings: `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `MAKE_API_TOKEN`. Public identifiers such as Google Client ID, CRM ID, team ID and approved scenario allowlist may also be kept as protected runtime configuration rather than committed.

Google OAuth refresh consent must be obtained through an owner-controlled setup that grants only the intended readonly Sheets and Gmail metadata scopes. A consented token for `gmail.readonly` is broader than the metadata-only requirement; do not silently reuse a privileged token. **Rotate any Google OAuth Client Secret previously exposed in screenshots or messages** before enabling a backend. Do not send credentials or tokens in ChatGPT.

Make's API key must be limited to `scenarios:read`; no `scenarios:write` or `scenarios:run` permission. Set `MAKE_SCENARIO_IDS` to only the verified Vave Automations service scenarios, excluding unrelated store/product projects.

## Deployment safety checklist

1. Establish an eligible Cloudflare account and verify any usage limits, terms and necessary adult/organization authorization. Do not attach billing or provision paid resources without explicit owner approval.
2. Protect the entire Worker hostname/route using Access with an owner-only email allowlist and appropriate account security (strong account sign-in and MFA).
3. Obtain exact `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` and `OWNER_EMAIL` from the configured Access application. Verify the signed-token issuer and JWKS before deploying; deny all if validation fails.
4. Configure secrets **only inside protected runtime settings**; never paste them in public source, issues, logs or assistant chat.
5. Test with synthetic data; ensure missing, expired, wrong-audience, wrong-email and forged tokens are rejected. Confirm no provider data is accessible anonymously.
6. Test one real authorized owner login and bounded read for each provider; confirm all data is appropriate, no write endpoints and no confidential values in public GitHub.
7. Build the private first-party owner panel and link to it from public HQ only after the private route is verified. Do not add public CORS as a shortcut.
8. Review daily or hourly polling cost/quotas before adding cron or other background jobs. This repository creates **no scheduled Worker execution** and incurs **no Make run credits**.

## Development validation

```sh
node backend/secure-worker/test/security.test.mjs
```

Synthetic tests validate Access JWT signature/claims, deny-by-default responses, GET-only routes, token hygiene, Gmail metadata, Make scenario allowlist and absence of Make execution calls. They cannot prove a real Cloudflare Access setup, Google consent, Make API permission or production security until deployment and controlled owner testing.

Official references: Cloudflare Access JWT/JWKS documentation; Google Gmail metadata scope and messages API; Make API `GET /scenarios` with `scenarios:read`.
