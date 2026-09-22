# MOSAIQ Authentication Session Layer

## Runtime flow

1. `AuthProvider` calls `authApi.me()` when the application starts.
2. Public authentication routes render without waiting for the session check.
3. Protected routes show the session-loading screen until the request resolves.
4. A `401` redirects to `/login?next=<original path>`.
5. A signed-in account without platform access or membership redirects to `/access-denied`.
6. Successful login updates provider state immediately and returns the user to the safe internal `next` URL.
7. Sign out clears the session and redirects to `/login`.

## Public routes

```text
/login
/forgot-password
/reset-password
/invite/[token]
/invite-invalid
/access-denied
```

All other routes are protected by default.

## Using session state

Client components can use:

```jsx
import { useAuth } from '@/app/AuthProvider';

const { user, status, isAuthenticated, refresh, signIn, signOut } = useAuth();
```

## Access helpers

`lib/access.js` provides:

- `hasActiveAccess(user)`
- `hasPlatformRole(user, role)`
- `hasAgencyRole(user, role)`
- `hasAnyRole(user, roles)`
- `belongsToAgency(user, agencyId)`
- `belongsToClient(user, clientId)`
- `workspaceIdsFor(user)`
- `canAccessWorkspace(user, workspaceId)`
- `getAccessSnapshot(user)`

Workspace checks are deliberately conservative: Super Admin is allowed globally; other users require the workspace ID to be explicitly returned in `membership.workspace_ids`.

## Dashboard integration note

The temporary session control appears outside the existing dashboard as a fixed account dock. This keeps the three-tab dashboard source unchanged. It can later replace the prototype profile menu when dashboard edits are approved.
