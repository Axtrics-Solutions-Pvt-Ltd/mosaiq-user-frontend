# Laravel Authentication Integration

**Frontend client status:** Implemented and verified  
**Live authenticated smoke test:** Passed end-to-end in the localhost browser for both supplied test accounts

## Integrated endpoints

- `GET /sanctum/csrf-cookie`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/invitations/inspect`
- `POST /api/v1/invitations/accept`

The API docs do not expose a public invitee-side reject endpoint. The frontend provides a decline confirmation state without calling Laravel. Server-side revocation remains the documented admin endpoint, `DELETE /api/v1/admin/agencies/{agency}/invitations/{invitation}`, and is not wired into the end-user app.

The frontend initializes CSRF before every state-changing request, includes credentials, sends `Accept: application/json` and `X-Requested-With: XMLHttpRequest`, and sends the decoded `XSRF-TOKEN` value as `X-XSRF-TOKEN` when available.

## Error handling

The client normalizes:

- `401` expired or unauthenticated sessions
- `403` permission failures
- `419` CSRF/session expiry
- `422` Laravel field validation
- `429` rate limiting
- Stable backend `error_code` and `request_id` values
- Network failures and 15-second request timeouts
- `204 No Content` responses

## Enable the live client

Set the following build-time values and restart Next.js:

```env
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_USE_LOCAL_API_PROXY=true
NEXT_PUBLIC_API_URL=https://mosaiq.axtrics.com/api/v1
NEXT_PUBLIC_LARAVEL_URL=https://mosaiq.axtrics.com
LARAVEL_UPSTREAM_URL=https://mosaiq.axtrics.com
LARAVEL_STATEFUL_ORIGIN=http://localhost:3000
```

Local development uses the allowlisted `/api/laravel/[...path]` Next.js proxy. It keeps browser requests same-origin, forwards only authentication and invitation routes, and rewrites Laravel's development cookies for localhost. Deployed environments should disable the local proxy and use an approved HTTPS frontend subdomain under `axtrics.com`.

## Current live checks

- CSRF route: `204`
- Protected routes with browser headers: `401 UNAUTHENTICATED` as documented
- Login: `200` for both supplied test accounts
- Authenticated `/auth/me`: `200`
- Logout with a refreshed CSRF cookie: `204`
- `/auth/me` after logout: `401`
- Browser login: `200` for both supplied accounts through the localhost proxy
- Browser reload/session restoration: `200`
- Browser logout: `204`, followed by protected-route redirect to login
- Invalid password: `401`, displayed as a login-specific credential error

Real API mode and the local proxy are enabled in `.env.local`.
