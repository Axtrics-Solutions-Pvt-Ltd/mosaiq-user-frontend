import {
  createDashboardFixtureBundle,
  DASHBOARD_FIXTURE_DATE_RANGES,
  DASHBOARD_FIXTURE_WORKSPACES,
  listDashboardFixtureScenarios,
} from './fixtures/dashboard/index.js';
import { publicEnvironment } from './environment.js';

export const isMockDashboardEnabled = publicEnvironment.useMockApi;

function copy(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockDashboardError(message, status, code) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function envelope(data) {
  return { data: copy(data), message: null, errors: null };
}

function paginatedEnvelope(value) {
  return { data: copy(value), message: null, errors: null };
}

function requestedState(query) {
  return query?.mock_state ?? query?.mockState ?? null;
}

export function createMockDashboardApi({ delay = 250 } = {}) {
  async function load(query, select) {
    await wait(delay);
    const state = requestedState(query);
    if (state === 'server_error') throw mockDashboardError('The mock dashboard server is temporarily unavailable.', 500, 'SERVER_ERROR');
    if (state === 'offline') throw mockDashboardError('The mock dashboard request could not reach the network.', 0, 'NETWORK_ERROR');
    return select(createDashboardFixtureBundle(query));
  }

  return Object.freeze({
    async workspaces() {
      await wait(delay);
      return envelope(DASHBOARD_FIXTURE_WORKSPACES.map((fixtureWorkspace) => {
        const workspace = { ...fixtureWorkspace };
        delete workspace.fixture_profile;
        return workspace;
      }));
    },
    async dateRanges() {
      await wait(delay);
      return envelope(Object.values(DASHBOARD_FIXTURE_DATE_RANGES).map(({ multiplier, ...range }) => range));
    },
    async scenarios() {
      await wait(delay);
      return envelope(listDashboardFixtureScenarios());
    },
    summary: (query) => load(query, (bundle) => envelope(bundle.reporting.summary)),
    metrics: (query) => load(query, (bundle) => envelope(bundle.reporting.metrics)),
    campaigns: (query) => load(query, (bundle) => paginatedEnvelope(bundle.reporting.campaigns)),
    channels: (query) => load(query, (bundle) => envelope(bundle.reporting.channels)),
    audience: (query) => load(query, (bundle) => envelope(bundle.reporting.audience)),
    creative: (query) => load(query, (bundle) => paginatedEnvelope(bundle.reporting.creative)),
    reports: (query) => load(query, (bundle) => paginatedEnvelope(bundle.reporting.reports)),
    marketingIntelligence: (query) => load(query, (bundle) => envelope(bundle.marketing_intelligence)),
    mmmResults: (query) => load(query, (bundle) => envelope(bundle.mmm)),
  });
}

export const mockDashboardApi = createMockDashboardApi();
