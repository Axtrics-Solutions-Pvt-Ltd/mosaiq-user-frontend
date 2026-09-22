import {
  DASHBOARD_FIXTURE_DATE_RANGES,
  DASHBOARD_FIXTURE_WORKSPACES,
  DEFAULT_DASHBOARD_FIXTURE_QUERY,
  getFixtureDateRange,
  getFixtureWorkspace,
} from './catalog.js';
import { createReportingFixture } from './reporting.js';
import { createIntelligenceFixture } from './intelligence.js';
import { createMmmFixture } from './mmm.js';

export {
  DASHBOARD_FIXTURE_DATE_RANGES,
  DASHBOARD_FIXTURE_WORKSPACES,
  DEFAULT_DASHBOARD_FIXTURE_QUERY,
} from './catalog.js';

export const DASHBOARD_FIXTURE_STATES = Object.freeze(['complete', 'partial', 'empty']);

export class DashboardFixtureError extends Error {
  constructor(message, code = 'FIXTURE_NOT_FOUND') {
    super(message);
    this.name = 'DashboardFixtureError';
    this.code = code;
  }
}

function publicWorkspace(workspace) {
  const contractWorkspace = { ...workspace };
  delete contractWorkspace.fixture_profile;
  return contractWorkspace;
}

export function resolveDashboardFixtureQuery(query = {}) {
  const workspaceId = query.workspace_id ?? query.workspaceId ?? DEFAULT_DASHBOARD_FIXTURE_QUERY.workspace_id;
  const rangeInput = query.date_range ?? query.dateRange ?? DEFAULT_DASHBOARD_FIXTURE_QUERY.date_range;
  const rangeKey = typeof rangeInput === 'string'
    ? rangeInput
    : Object.values(DASHBOARD_FIXTURE_DATE_RANGES).find((range) => range.start_date === rangeInput?.start_date && range.end_date === rangeInput?.end_date)?.key;
  const workspace = getFixtureWorkspace(workspaceId);
  const range = getFixtureDateRange(rangeKey);

  if (!workspace) throw new DashboardFixtureError(`No dashboard fixture workspace exists for ${workspaceId}.`, 'UNKNOWN_WORKSPACE');
  if (!range) throw new DashboardFixtureError(`No dashboard fixture date range exists for ${String(rangeKey)}.`, 'UNKNOWN_DATE_RANGE');

  return { workspace, range };
}

export function createDashboardFixtureBundle(query = {}) {
  const { workspace, range } = resolveDashboardFixtureQuery(query);
  const contractWorkspace = publicWorkspace(workspace);
  const contractRange = { start_date: range.start_date, end_date: range.end_date, label: range.label };
  return {
    query: { workspace_id: workspace.id, date_range: range.key },
    fixture_state: workspace.fixture_profile,
    workspace: contractWorkspace,
    date_range: contractRange,
    reporting: createReportingFixture(contractWorkspace, { ...contractRange, key: range.key, multiplier: range.multiplier }, workspace.fixture_profile),
    marketing_intelligence: createIntelligenceFixture(contractWorkspace, { ...contractRange, key: range.key }, workspace.fixture_profile),
    mmm: createMmmFixture(contractWorkspace, { ...contractRange, key: range.key }, workspace.fixture_profile),
  };
}

export function listDashboardFixtureScenarios() {
  return DASHBOARD_FIXTURE_WORKSPACES.flatMap((workspace) => Object.values(DASHBOARD_FIXTURE_DATE_RANGES).map((range) => ({
    workspace_id: workspace.id,
    workspace_name: workspace.name,
    date_range: range.key,
    date_range_label: range.label,
    fixture_state: workspace.fixture_profile,
  })));
}
