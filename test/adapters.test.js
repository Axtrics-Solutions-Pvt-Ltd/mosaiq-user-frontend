import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AdapterError,
  adaptAudience,
  adaptCampaigns,
  adaptChannels,
  adaptCreative,
  adaptDashboardSummary,
  adaptDetailedMetrics,
  adaptMarketingIntelligence,
  adaptMmmResults,
  adaptReports,
} from '../lib/adapters/index.js';
import { createDashboardFixtureBundle, listDashboardFixtureScenarios } from '../lib/fixtures/dashboard/index.js';

test('every dashboard scenario satisfies all frontend adapters', () => {
  const scenarios = listDashboardFixtureScenarios();
  assert.equal(scenarios.length, 9);
  for (const scenario of scenarios) {
    const bundle = createDashboardFixtureBundle(scenario);
    adaptDashboardSummary({ data: bundle.reporting.summary });
    adaptDetailedMetrics({ data: bundle.reporting.metrics });
    adaptCampaigns({ data: bundle.reporting.campaigns });
    adaptChannels({ data: bundle.reporting.channels });
    adaptAudience({ data: bundle.reporting.audience });
    adaptCreative({ data: bundle.reporting.creative });
    adaptReports({ data: bundle.reporting.reports });
    adaptMarketingIntelligence({ data: bundle.marketing_intelligence });
    adaptMmmResults({ data: bundle.mmm });
  }
});

test('reporting adapters normalize numbers and pagination', () => {
  const bundle = createDashboardFixtureBundle({ workspace_id: 1, date_range: 'last_30_days' });
  const summary = adaptDashboardSummary({ data: bundle.reporting.summary });
  const campaigns = adaptCampaigns({ data: bundle.reporting.campaigns });
  assert.equal(typeof summary.data.kpis[0].value, 'number');
  assert.equal(campaigns.data.meta.total, 3);
  assert.equal(typeof campaigns.data.meta.total, 'number');
});

test('partial and empty fixtures retain nulls and valid empty collections', () => {
  const partial = createDashboardFixtureBundle({ workspace_id: 2, date_range: 'last_30_days' });
  const empty = createDashboardFixtureBundle({ workspace_id: 3, date_range: 'last_30_days' });
  assert.equal(adaptDashboardSummary({ data: partial.reporting.summary }).data.kpis[1].value, null);
  assert.deepEqual(adaptMarketingIntelligence({ data: empty.marketing_intelligence }).data.findings, []);
  assert.equal(adaptMmmResults({ data: empty.mmm }).data.model_status, 'not_started');
});

test('malformed collection rows are skipped with structured warnings', () => {
  const result = adaptCampaigns({ data: {
    data: [
      { id: 1, workspace_id: 1, name: 'Valid', channel: 'Search', status: 'active', spend: '20' },
      { id: 2, workspace_id: 1, name: '', channel: 'Social', status: 'active' },
    ],
    meta: { current_page: '1', per_page: '20', total: '2', last_page: '1' },
  } });
  assert.equal(result.data.items.length, 1);
  assert.equal(result.data.items[0].spend, 20);
  assert.ok(result.warnings.some(({ code }) => code === 'ROW_SKIPPED'));
});

test('invalid API envelopes fail with AdapterError', () => {
  assert.throws(() => adaptDashboardSummary({ message: 'missing data' }), AdapterError);
});

