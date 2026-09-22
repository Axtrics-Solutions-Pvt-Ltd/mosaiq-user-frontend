# MOSAIQ Frontend Data Contracts

**Contract version:** `2026-09-18`  
**Status:** Frontend draft for Laravel alignment

The source of truth is split between:

- `lib/contracts/types.d.ts`: complete TypeScript-compatible interfaces.
- `lib/contracts/index.js`: endpoint constants and lightweight runtime guards.

The project can remain JavaScript while editors and future TypeScript modules import these definitions.

## Standard response envelope

Successful record:

```json
{
  "data": {},
  "message": "Request completed successfully",
  "errors": null
}
```

Validation failure:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field": ["Validation message"]
  }
}
```

Other failure:

```json
{
  "message": "Unable to complete the request.",
  "error_code": "STABLE_ERROR_CODE",
  "request_id": "traceable-request-id"
}
```

Lists that require pagination should return `data` plus `meta.current_page`, `meta.per_page`, `meta.total`, and `meta.last_page`.

## Identity and workspace

`CurrentUser` follows the existing documented Laravel response and includes:

- `id`, `name`, `email`
- nullable `platform_role_code`
- nullable `membership`
- membership `agency_id`, `role_code`, nullable `client_id`, and explicit `workspace_ids`

`Agency`, `Client`, and `Workspace` define ownership, active status, currency, timezone, and optional reporting dates. A workspace never infers access from its name; authorization uses IDs returned by Laravel.

## Reporting

| Endpoint | Contract |
|---|---|
| `GET /dashboard/summary` | `ApiEnvelope<DashboardSummary>` |
| `GET /dashboard/metrics` | `ApiEnvelope<DetailedMetricRow[]>` |
| `GET /campaigns` | `ApiEnvelope<PaginatedData<Campaign>>` |
| `GET /channels` | `ApiEnvelope<ChannelPerformance[]>` |
| `GET /audience` | `ApiEnvelope<AudienceSegment[]>` |
| `GET /creative` | `ApiEnvelope<PaginatedData<CreativePerformance>>` |
| `GET /reports` | `ApiEnvelope<PaginatedData<ReportDefinition>>` |

Reporting requests use `ReportingFilters`: workspace, date range, optional channels, campaigns, search, and status.

The summary contract includes workspace metadata, KPI cards, time-series performance, nullable AI summary, and `data_updated_at`.

## Marketing Intelligence

`GET /marketing-intelligence` returns `ApiEnvelope<MarketingIntelligenceResponse>` with:

- Audience Profile
- Demographic Profile
- Geographic Insights
- Behaviour
- Media and Brand Intelligence
- Insights and Comparison findings
- Source/update metadata

Every intelligence metric can carry its source and planning implication. Missing values should be `null`, not fabricated zeroes.

## Media Mix Model

`GET /mmm/results` returns `ApiEnvelope<MmmResults>` with:

- Model status and settings
- Data-readiness checks
- Channel contribution and ROAS
- Carryover and saturation values
- Response curves
- Recommended budget allocation
- Scenario results
- Nullable AI readout
- Model run timestamp

`ScenarioInput` defines the frontend what-if request shape. Production statistical confidence is not implied by these display contracts.

## Runtime guards

The initial runtime guards intentionally validate structure, not every metric value:

```js
const user = assertCurrentUser(unwrapData(response));
const summary = assertDashboardSummary(unwrapData(response));
const intelligence = assertMarketingIntelligence(unwrapData(response));
const mmm = assertMmmResults(unwrapData(response));
```

Deeper normalization belongs to Step 6’s adapter layer.

## Backend decisions still required

- Numeric IDs versus UUID strings
- Exact pagination format for each list
- Whether metric values are JSON numbers or decimal strings
- Currency and timezone ownership when workspace settings are absent
- Final campaign/report status enums
- Marketing Intelligence source vocabulary
- MMM model status and confidence vocabulary
- Scenario calculation endpoint and request method
- AI-readout provenance and generation timestamps

Until these are confirmed, the contracts accept `number | string` identifiers and nullable metric values while keeping required structural fields explicit.
