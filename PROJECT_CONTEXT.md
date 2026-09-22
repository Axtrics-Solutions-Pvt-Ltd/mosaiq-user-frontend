# MOSAIQ User Frontend Context

This note preserves the key planning and authentication context from the original `E:\MOSAIQ` workspace for continued development in the separate Next.js project at `E:\mosaiq-user-frontend`.

## Project Location

- Active user frontend project: `E:\mosaiq-user-frontend`
- Framework: React + Next.js
- Original prototype source: React + Vite in `E:\MOSAIQ`
- The Next.js project was created as a separate project and should be used for future frontend development.

## Run The Project

```powershell
cd E:\mosaiq-user-frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

If port `3000` is busy, use the URL shown by Next.js in the terminal.

## API Documentation

- API docs URL: `https://mosaiq.axtrics.com/docs/api#/`
- The URL was reachable and returned `200 OK`.
- The embedded OpenAPI spec currently exposes Phase 1 authentication and invitation APIs.

## Current API Base

The docs currently show:

```text
http://mosaiq.axtrics.com/api/v1
```

Confirm the final production API base URL and whether HTTPS should be used before integration.

## Authentication Model

MOSAIQ uses Laravel Sanctum session-cookie authentication.

Important details:

- Auth is session-cookie based.
- API bearer tokens are not accepted for these routes.
- First-party SPAs use the Laravel `web` session cookie.
- State-changing requests require a CSRF cookie first.
- Frontend requests must include credentials.

Before state-changing requests, call:

```http
GET /sanctum/csrf-cookie
```

Then send requests with:

```text
Accept: application/json
credentials: include
X-XSRF-TOKEN: decoded XSRF-TOKEN cookie value
```

The backend also expects an allowed `Origin` or `Referer`.

## Available Auth / Invitation APIs

```text
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
POST /api/v1/invitations/inspect
POST /api/v1/invitations/accept
```

## Login

Endpoint:

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:

```json
{
  "data": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "platform_role_code": null,
    "membership": {
      "agency_id": 1,
      "role_code": "CLIENT_USER",
      "client_id": 1,
      "workspace_ids": []
    }
  }
}
```

Login can fail if credentials are invalid or the account has no permitted access.

## Current User

Endpoint:

```http
GET /api/v1/auth/me
```

Use this on app load / route guard initialization.

Expected behavior:

- `200`: user is authenticated; route to dashboard.
- `401`: user is not authenticated; route to login.

## Logout

Endpoint:

```http
POST /api/v1/auth/logout
```

Returns:

```text
204 No Content
```

After logout, redirect to `/login`.

## Invitation Flow

Invitation tokens are single-use and expire after seven days.

Inspect endpoint:

```http
POST /api/v1/invitations/inspect
```

Request:

```json
{
  "token": "64_character_token"
}
```

Response includes:

```json
{
  "data": {
    "email": "user@example.com",
    "agency_name": "Agency Name",
    "role_code": "CLIENT_USER",
    "expires_at": "date-time",
    "requires_existing_login": false
  }
}
```

If the token is unknown, expired, revoked, or already accepted, the API returns the same `404` response.

Accept endpoint:

```http
POST /api/v1/invitations/accept
```

For a new account, send:

```json
{
  "token": "64_character_token",
  "name": "User Name",
  "password": "minimum_12_characters",
  "password_confirmation": "minimum_12_characters"
}
```

For an existing account:

1. User must sign in first with current password.
2. Then call invitation accept with the token.

Accept returns:

```text
204 No Content
```

## Pre-Dashboard Screens To Build

Required:

1. `/login`
2. `/forgot-password`
3. `/reset-password`
4. `/invite/[token]`
5. Invitation setup screen for new users
6. Invitation login/accept flow for existing users
7. Auth loading/session check guard
8. `/access-denied`
9. Invalid or expired invitation screen
10. Post-logout redirect behavior

## Suggested Auth Flow

```text
Open app
  -> GET /api/v1/auth/me
    -> 200: dashboard
    -> 401: login

Open invitation link
  -> POST /api/v1/invitations/inspect
    -> 404: invalid/expired invitation screen
    -> requires_existing_login = false: setup account screen
    -> requires_existing_login = true: login existing user, then accept invitation
```

## Missing APIs To Confirm With Backend

The current docs did not show password reset endpoints.

Ask backend to confirm:

- Forgot password request endpoint
- Reset password submit endpoint
- Whether accepting a new-user invitation should log the user in automatically
- Final HTTPS API base URL
- Sanctum/CORS allowed frontend domains
- Any email verification or resend-invitation behavior

Suggested endpoints if backend adds them:

```text
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

## Error Shapes

Validation error:

```json
{
  "message": "Errors overview.",
  "errors": {
    "field": ["Validation message"]
  }
}
```

Other API errors:

```json
{
  "message": "Error message",
  "error_code": "ERROR_CODE",
  "request_id": "request-id"
}
```

## Implementation Guidance

- Keep public auth screens separate from authenticated dashboard layout.
- Use a small API client wrapper that always sends `Accept: application/json` and `credentials: include`.
- Add a CSRF helper before login, logout, invitation accept, and future state-changing requests.
- Build screens with mocked behavior until APIs are complete.
- Preserve the existing MOSAIQ dashboard visual design while adding real routes and auth screens.
- Avoid changing the old Vite project unless explicitly requested.

## Notes From Migration

- The original Vite dashboard design was copied into the Next.js app.
- Current Next route is `app/page.jsx`.
- Global CSS is `app/globals.css`.
- Public assets are under `public/`.
- `npm run build` completes successfully.
- NPM currently reports two audit findings from dependencies; do not run `npm audit fix --force` without reviewing possible breaking changes.
