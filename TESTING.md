# MOSAIQ Frontend Tests

The pre-API suite uses Node’s built-in test runner and requires no additional testing dependency.

Run the complete suite:

```bash
npm test
```

Run one test file:

```bash
node --test test/auth-routing.test.js
```

## Coverage

- `validation.test.js`: email, password, and password-requirement rules.
- `api-error-mapping.test.js`: Laravel field-error normalization.
- `invitation-flow.test.js`: new user, existing user, expired invitation, server error, login requirement, acceptance, and session behavior.
- `auth-routing.test.js`: public routes, protected redirects, access denied, loading/error states, and safe return URLs.
- `adapters.test.js`: all nine dashboard fixture scenarios, normalization, partial/empty data, malformed rows, pagination, and invalid envelopes.
- `environment.test.js`: environment names, URL normalization, HTTPS enforcement, mock flags, and backend-origin consistency.

The invitation tests use an in-memory `localStorage` implementation. They never contact Laravel or modify browser storage.
