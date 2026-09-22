# MOSAIQ Frontend Deployment

## Runtime baseline

- Node.js 20 LTS or a compatible supported version
- Clean install using `npm ci`
- HTTPS for the deployed frontend and Laravel backend
- Build-time injection of the variables documented in `ENVIRONMENTS.md`

## Release pipeline

```bash
npm ci
npm test
npm run build
```

Deploy only when tests, lint/type validation inside the Next.js build, and static-page generation all succeed.

For a self-hosted Node deployment, retain `package.json`, `package-lock.json`, `next.config.js`, `public`, and the generated `.next` directory, then run:

```bash
npm run start
```

The platform should provide its own process supervision, health checks, log collection, and zero-downtime replacement strategy.

## Pre-deployment checks

- [ ] Set `NEXT_PUBLIC_APP_ENV` to the target environment.
- [ ] Set `NEXT_PUBLIC_USE_MOCK_API=false` for a real Laravel deployment.
- [ ] Confirm the final HTTPS API and Laravel URLs with the backend team.
- [ ] Complete `SANCTUM_CORS_CHECKLIST.md` for the exact frontend origin.
- [ ] Confirm invitation and password-reset emails link to the deployed frontend origin.
- [ ] Ensure source maps, browser logs, and monitoring do not expose credentials, cookies, or invitation/reset tokens.
- [ ] Verify `/login`, `/forgot-password`, `/invite-invalid`, and a protected route through the deployed load balancer.
- [ ] Verify mobile and desktop layouts against the deployed bundle.

## Post-deployment smoke test

1. Open `/login` in a private browser window.
2. Confirm unauthenticated access to `/` redirects to login with a safe `next` value.
3. Sign in with a non-production smoke-test account.
4. Reload and confirm `/auth/me` restores the session.
5. Confirm permitted workspace access and access-denied behavior.
6. Sign out and confirm the protected page is no longer accessible.
7. Test one new-user invitation and one existing-user invitation owned by the smoke-test environment.

## Rollback

Keep the previously verified frontend artifact and its environment configuration available. If authentication, routing, or rendering smoke tests fail, restore that artifact as one unit; do not mix its `.next` output with files from a different build. Backend schema or contract changes should remain backward-compatible for at least the rollback window.

