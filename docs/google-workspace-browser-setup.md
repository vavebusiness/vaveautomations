# Connect private Google data to GitHub Pages at no new hosting cost

**Prepared:** 2 November 2026 · **Integration status:** Browser reader built; Google OAuth client and owner authorization still required.

## How it works

The HQ stays on public GitHub Pages. Its [Owner Live Data](https://vavebusiness.github.io/vaveautomations/systems/owner-data.html) screen asks Google directly for an approved, temporary read-only access token using Google Identity Services. The token stays only in page memory and is sent to Google's API, not to GitHub or an unrelated backend. The browser displays records only if the signed-in account has access to the private Google Sheet or Gmail.

The Google OAuth **Client ID** is a public application identifier, not a secret. **Never enter the Client Secret, API key, password, or refresh token.**

This is an interactive browser session, not an unattended synchronization service. The page reload requires a new short-lived grant; reads refresh about every two minutes while the page is visible and the token remains valid.

## One-time setup — requires authorized Google account and permitted Cloud access

1. Open [Google Cloud Console](https://console.cloud.google.com/). Use an eligible account that is authorized to configure this application; observe age, organization, and platform eligibility requirements.
2. Create or select a Google Cloud project for the Vave Automations HQ. Do **not** enable paid products or attach billing without explicit approval.
3. In **APIs & Services → Library**, enable the **Google Sheets API**.
4. In **Google Auth Platform**, configure the OAuth consent screen for your intended users. For a private test app, use the testing audience/test-user controls provided by Google.
5. In **Google Auth Platform → Clients**, create an OAuth Client ID of type **Web application**.
6. Under **Authorized JavaScript origins**, add exactly `https://vavebusiness.github.io` (the origin only, **not** `/vaveautomations/`).
7. Copy the **Client ID** (ends in `.apps.googleusercontent.com`). Don't copy or share the client secret.
8. Open [Owner Live Data](https://vavebusiness.github.io/vaveautomations/systems/owner-data.html), paste the Client ID in the setup box and choose **Use Client ID**. This public identifier is saved only in this browser's local storage.
9. Click **Authorize Sheets read-only**. In the genuine Google prompt, grant only the intended read-only access. The HQ then requests the eleven source ranges directly from Google Sheets and displays the results locally.
10. If you also want Gmail read-only, enable the Gmail API and consider its OAuth scope restrictions. Choose **Authorize Gmail read-only** separately. Google may require app verification or restrict testing access; do not work around that.

## Expected Sheets datasets

- Dashboard; Opportunities; Master Checklist; HQ Change Queue; Company Event Log
- Sent Outreach; No Contact; Safety Audit; First Client Sprint; Sales Playbook; 200 Lead Launch Board

Each source tab is a bounded, authorized read. Google Sheets remains the authoritative database. No website action edits or sends.

## What it does not yet do

- No sign-in or provider connection is created automatically merely by committing this code.
- No background refresh while the browser is closed; no guaranteed same-second updates.
- No source write-back; it does not send mail, change leads, or run Make.
- Make scenario details remain a verified public-safe snapshot. A private server connection is required for unattended Make polling because its API key cannot be placed in public JavaScript.
- Dedicated ChatGPT conversations are set up via the ChatGPT interface using the [chat launchpad](https://vavebusiness.github.io/vaveautomations/systems/chat-launchpad.html). Separate chats do not auto-message each other.

## Security controls

- Client ID is not a secret and may live in browser storage. Google access tokens are never stored in localStorage, sessionStorage or GitHub source.
- The browser sends access tokens only in Authorization headers to official Google API endpoints. No Google data is written to public files.
- All tab cells are HTML-escaped before rendering to prevent HTML injection through spreadsheet values.
- Gmail reader requests metadata only (From/Subject/Date), not full message bodies. Do not interpret all inbox messages as buyer replies.
- Disconnect clears tokens and loaded records from the current page; Google's persistent account grant can be revoked from your Google account permissions.
- Use an account and device you control. Anyone using your **unlocked, authorized browser** may see private records.
- Never publish tokens, customer financial data, client files, private correspondence or suppression addresses in a GitHub commit.

## Usage and billing

Google's Sheets API supports standard usage without additional cost, but has request quotas and potential future billing-policy changes. This implementation makes one batch read request per refresh, and doesn't enable paid services. Do not attach a billing account unless you separately decide to.

## Sources

- [Google Identity Services token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Google Sheets API batchGet](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchGet)
- [Gmail messages list](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list)
- [Sheets API quotas and costs](https://developers.google.com/workspace/sheets/api/limits)
