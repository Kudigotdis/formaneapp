# Google Drive / OAuth Integration Plan

This document lists steps to set up Drive-based backup/sync for Foromane.

1. Create GCP Project
   - Console: https://console.cloud.google.com
   - New project name: "Foromane App - Sync"

2. Enable APIs
   - Enable: Google Drive API, Google People API (optional), OAuth Consent Screen

3. OAuth Consent Screen
   - Type: External (for public apps) or Internal (if only org users)
   - App name: Foromane Sync
   - Add scopes: `../auth/drive.file` (write files created/opened by the app) and `openid email profile`.

4. Create OAuth 2.0 Credentials
   - Create OAuth Client ID -> Application type: Web application
   - Add authorized redirect URIs (for server side): e.g., `https://your-backend.example.com/oauth2callback`
   - Note Client ID and Client Secret — store securely

5. Token Storage & Refresh
   - On server: exchange code for refresh token & store securely (encrypted at rest). Use refresh tokens to obtain access tokens server-side.
   - If implementing client-only flow (limited): use Google Identity Services for browser and Drive Picker for file selection; prefer server-side for long-lived refresh access.

6. Data model & mapping
   - Each user: create a folder named `foromane_<userId>` in Drive (store folderId in server DB)
   - Use JSON blobs for entities: `profile.json`, `business.json`, `promos/*.json`, `items/*.json`, `notes/*.json`
   - For large images: store images in the Drive folder and reference by Drive fileId or public URL (beware permissions)

7. Sync approach
   - Periodic export: server composes JSON of changed entities and writes to Drive using `drive.files.create` or `drive.files.update`.
   - Import: server reads blobs and reconciles with server DB.

8. Security & Quotas
   - Respect Drive API quotas and implement batching.
   - Validate user ownership before reading/writing files.

9. Local dev notes (user task)
   - Create Drive folder manually and share Folder ID with the backend.
   - Prepare OAuth client credentials and add redirect URI for local test domain.

10. Next steps
   - Provide a small server endpoint that the client can call to request a sync token/url. Implement token refresh on the server.

