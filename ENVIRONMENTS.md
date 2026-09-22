# MOSAIQ Frontend Environments

All `NEXT_PUBLIC_*` values are embedded into the browser bundle during `next build`. Set them before building; changing them only on the running server does not update an existing client bundle.

## Variables

| Variable | Allowed values | Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_ENV` | `development`, `staging`, `production`, `test` | Names the target environment independently of Next.js build mode |
| `NEXT_PUBLIC_USE_MOCK_API` | `true`, `false` | Selects deterministic frontend mocks or Laravel |
| `NEXT_PUBLIC_API_URL` | Absolute HTTP(S) URL | Laravel versioned API base, such as `/api/v1` |
| `NEXT_PUBLIC_LARAVEL_URL` | Absolute HTTP(S) URL | Laravel origin used for `/sanctum/csrf-cookie` |

These values are public. Never store passwords, private keys, bearer tokens, database credentials, or other secrets in a `NEXT_PUBLIC_*` variable.

## Recommended configurations

### Local mocks

```env
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_API_URL=https://mosaiq.axtrics.com/api/v1
NEXT_PUBLIC_LARAVEL_URL=https://mosaiq.axtrics.com
```

The URLs are validated but no Laravel request is made while mock mode is enabled.

### Local Laravel

```env
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_LARAVEL_URL=http://localhost:8000
```

### Staging

```env
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=https://api-staging.example.com/api/v1
NEXT_PUBLIC_LARAVEL_URL=https://api-staging.example.com
```

### Production

```env
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
NEXT_PUBLIC_LARAVEL_URL=https://api.example.com
```

Staging and production real-API configurations reject HTTP. The API and Laravel URLs must have the same origin so CSRF cookies are requested from the backend serving the API.

For local-only overrides, use `.env.local`. Do not commit it. CI and hosting platforms should inject staging or production values directly into the build job.

