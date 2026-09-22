# MOSAIQ Dashboard Adapters

The adapter layer converts Laravel response envelopes into stable frontend data before a screen renders them. It lives in `lib/adapters` and does not change the existing dashboard tabs.

## Usage

Choose the adapter that matches the endpoint and pass it the complete API response, including its `data` envelope:

```js
import { adaptDashboardSummary } from '@/lib/adapters/index.js';

const response = await api.get('/dashboard/summary');
const { data, warnings } = adaptDashboardSummary(response);
```

`data` follows the contracts in `lib/contracts/types.d.ts`. `warnings` is an array of recoverable normalization issues:

```js
{
  path: 'data.kpis[2].value',
  message: 'Expected a finite number; value was set to null.',
  code: 'INVALID_VALUE'
}
```

Warnings are intended for development logging or telemetry. They should not be shown directly to users.

## Available adapters

### Reporting

- `adaptDashboardSummary`
- `adaptDetailedMetrics`
- `adaptCampaigns`
- `adaptChannels`
- `adaptAudience`
- `adaptCreative`
- `adaptReports`

### Marketing Intelligence

- `adaptMarketingIntelligence`

### Media Mix Modelling

- `adaptMmmResults`
- `adaptScenarioInput`

## Normalization rules

- Numeric strings become numbers.
- Missing, empty, or invalid optional numeric values become `null`.
- Laravel-style boolean values such as `1`, `0`, `"1"`, and `"0"` become booleans.
- Optional invalid dates and strings become `null` and emit a warning.
- Missing collections become empty arrays and emit a `MISSING_COLLECTION` warning.
- Malformed collection rows are skipped and emit a `ROW_SKIPPED` warning.
- Pagination metadata is normalized to numeric values when present.

An `AdapterError` is thrown only when the response envelope or a field required to identify and safely render the resource is invalid. Screens should send that error to the shared API-error state and expose its retry action.

## Integration boundary

Screens should consume adapter output instead of reading raw Laravel payloads. When the final Laravel contracts arrive, endpoint-specific changes can remain inside this layer while screen components continue using the frontend contracts unchanged.
