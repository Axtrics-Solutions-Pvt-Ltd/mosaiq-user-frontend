# Laravel Sanctum and CORS Checklist

Use this checklist with the Laravel team before disabling frontend mock mode.

## Frontend behavior already implemented

- All API requests send `Accept: application/json`.
- All API requests use `credentials: 'include'`.
- State-changing authentication requests first call `GET /sanctum/csrf-cookie` on `NEXT_PUBLIC_LARAVEL_URL`.
- The decoded `XSRF-TOKEN` cookie is sent as `X-XSRF-TOKEN` when present.
- API errors preserve HTTP status, Laravel field errors, and stable error codes.

## Laravel environment

- [ ] `APP_URL` is the public HTTPS Laravel origin.
- [ ] `FRONTEND_URL` identifies the exact deployed frontend origin if the backend uses it for redirects or invitation links.
- [ ] `SANCTUM_STATEFUL_DOMAINS` includes every frontend hostname and non-default development port, without schemes.
- [ ] `SESSION_DOMAIN` is correct for the chosen topology. For sibling subdomains, use the shared parent domain such as `.example.com`.
- [ ] `SESSION_SECURE_COOKIE=true` in staging and production.
- [ ] `SESSION_HTTP_ONLY=true` remains enabled for the session cookie.
- [ ] `SESSION_SAME_SITE=lax` is used when frontend and API are same-site sibling subdomains.
- [ ] If the deployment is genuinely cross-site, `SameSite=None; Secure` is configured and browser third-party-cookie restrictions have been evaluated.
- [ ] Trusted proxy settings make Laravel detect HTTPS correctly behind the load balancer or CDN.

## CORS configuration

- [ ] CORS paths include `api/*` and `sanctum/csrf-cookie`.
- [ ] `supports_credentials` is `true`.
- [ ] `allowed_origins` contains exact development, staging, and production frontend origins including schemes and ports.
- [ ] Wildcard origins are not used with credentialed requests.
- [ ] Allowed methods include those used by the API, including `OPTIONS` preflight.
- [ ] Allowed headers include `Accept`, `Content-Type`, `X-XSRF-TOKEN`, `X-Requested-With`, and any request/correlation headers required by Laravel.
- [ ] Responses include a correct `Vary: Origin` header when more than one origin is supported.

## Authentication verification

- [ ] `GET /sanctum/csrf-cookie` returns `204` or another successful response and sets `XSRF-TOKEN` plus the Laravel session cookie.
- [ ] `POST /api/v1/auth/login` succeeds from an allowed frontend origin.
- [ ] `GET /api/v1/auth/me` returns the authenticated user after a full page reload.
- [ ] `POST /api/v1/auth/logout` invalidates the session and a following `/auth/me` returns `401`.
- [ ] Invalid credentials return `401`, validation errors return `422`, denied access returns `403`, and unexpected failures return a traceable `5xx` response.
- [ ] Invitation inspect and accept requests work before and after login as specified by the final backend contract.
- [ ] CSRF failure responses are distinguishable from expired sessions so the frontend can present the right recovery action.

## Browser matrix

Verify at least current Chrome/Edge, Safari, and Firefox. Inspect the browser network panel to confirm cookies, `Origin`, preflight responses, and `X-XSRF-TOKEN`; never copy production cookie values into tickets or logs.

