# MOSAIQ Mock Authentication

Enable the mock layer by copying `.env.example` to `.env.local`, or set:

```env
NEXT_PUBLIC_USE_MOCK_API=true
```

Restart `npm run dev` after changing environment variables.

## Login scenarios

All successful mock accounts use this password:

```text
MosaiqDemo123
```

| Scenario | Email |
|---|---|
| Successful login | `success@mosaiq.test` |
| Existing invited user | `existing@mosaiq.test` |
| Access denied | `denied@mosaiq.test` |
| Simulated server error | `server-error@mosaiq.test` |
| Invalid credentials | Any other valid email |

## Invitation scenarios

| Scenario | URL |
|---|---|
| New account | `/invite/new-user-demo` |
| Existing account | `/invite/existing-user-demo` |
| Long workspace and email | `/invite/long-content-demo` |
| Expired invitation | `/invite/expired-demo` |
| Simulated server error | `/invite/server-error-demo` |

The existing-account invitation uses `existing@mosaiq.test` and the shared mock password.

## Password recovery scenarios

- Any normal email returns the privacy-safe success response.
- `server-error@mosaiq.test` returns a simulated server error.
- `/reset-password?token=expired-demo&email=success@mosaiq.test` returns an expired-token validation error.
- `/reset-password?token=server-error-demo&email=success@mosaiq.test` returns a simulated server error.
- Any other reset token succeeds.

Mock sessions are stored only in browser `localStorage` under `mosaiq.mock.session`. Disable mock mode to use the real Laravel/Sanctum client.
