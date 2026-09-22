# MOSAIQ Mock Dashboard Data

The mock dashboard layer supplies Laravel-shaped responses before the reporting APIs are available. It is intentionally separate from the existing dashboard tabs.

## Fixture catalogue

Three workspace profiles are available:

| Workspace ID | Workspace | State | Purpose |
|---|---|---|---|
| `1` | Northstar Retail | Complete | All Reporting, Marketing Intelligence, and MMM sections populated |
| `2` | Horizon Fintech | Partial | Limited reporting history, sparse intelligence, and an MMM model that is not ready |
| `3` | Blank Canvas Launch | Empty | Valid workspace with no imported dashboard data |

Every workspace supports these date-range keys:

- `last_30_days`
- `previous_30_days`
- `last_90_days`

The catalogue therefore exposes nine selectable scenarios.

## Mock client

Use the mock client with endpoint-shaped methods:

```js
import { mockDashboardApi } from '@/lib/mock-dashboard.js';
import { adaptDashboardSummary } from '@/lib/adapters/index.js';

const response = await mockDashboardApi.summary({
  workspace_id: 1,
  date_range: 'last_30_days',
});

const { data, warnings } = adaptDashboardSummary(response);
```

Available methods are `workspaces`, `dateRanges`, `scenarios`, `summary`, `metrics`, `campaigns`, `channels`, `audience`, `creative`, `reports`, `marketingIntelligence`, and `mmmResults`.

Use `createMockDashboardApi({ delay: 0 })` for tests that should not wait for simulated latency.

## Error states

Any data method accepts a `mock_state` query value:

```js
await mockDashboardApi.summary({
  workspace_id: 1,
  date_range: 'last_30_days',
  mock_state: 'server_error', // or "offline"
});
```

Errors include `status` and `code` fields compatible with the shared application-state components.

## Direct fixture access

`createDashboardFixtureBundle(query)` returns all domain datasets for a scenario. `listDashboardFixtureScenarios()` returns the complete scenario catalogue. Both are exported from `lib/fixtures/dashboard/index.js` for stories, tests, and future development-only fixture tooling.

