export const DASHBOARD_FIXTURE_DATE_RANGES = Object.freeze({
  last_30_days: Object.freeze({
    key: 'last_30_days',
    label: 'Last 30 days',
    start_date: '2026-08-20',
    end_date: '2026-09-18',
    multiplier: 1,
  }),
  previous_30_days: Object.freeze({
    key: 'previous_30_days',
    label: 'Previous 30 days',
    start_date: '2026-07-21',
    end_date: '2026-08-19',
    multiplier: 0.86,
  }),
  last_90_days: Object.freeze({
    key: 'last_90_days',
    label: 'Last 90 days',
    start_date: '2026-06-21',
    end_date: '2026-09-18',
    multiplier: 2.72,
  }),
});

export const DASHBOARD_FIXTURE_WORKSPACES = Object.freeze([
  Object.freeze({
    id: 1,
    agency_id: 1,
    client_id: 1,
    name: 'Northstar Retail',
    status: 'active',
    currency: 'USD',
    timezone: 'America/New_York',
    reporting_start_date: '2025-01-01',
    reporting_end_date: null,
    fixture_profile: 'complete',
  }),
  Object.freeze({
    id: 2,
    agency_id: 1,
    client_id: 2,
    name: 'Horizon Fintech',
    status: 'active',
    currency: 'GBP',
    timezone: 'Europe/London',
    reporting_start_date: '2026-04-01',
    reporting_end_date: null,
    fixture_profile: 'partial',
  }),
  Object.freeze({
    id: 3,
    agency_id: 2,
    client_id: 3,
    name: 'Blank Canvas Launch',
    status: 'active',
    currency: 'SGD',
    timezone: 'Asia/Singapore',
    reporting_start_date: null,
    reporting_end_date: null,
    fixture_profile: 'empty',
  }),
]);

export const DEFAULT_DASHBOARD_FIXTURE_QUERY = Object.freeze({
  workspace_id: 1,
  date_range: 'last_30_days',
});

export function getFixtureWorkspace(workspaceId) {
  return DASHBOARD_FIXTURE_WORKSPACES.find(({ id }) => String(id) === String(workspaceId)) || null;
}

export function getFixtureDateRange(rangeKey) {
  return DASHBOARD_FIXTURE_DATE_RANGES[rangeKey] || null;
}

