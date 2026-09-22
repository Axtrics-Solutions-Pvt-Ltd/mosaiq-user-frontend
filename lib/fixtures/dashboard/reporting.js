const round = (value, precision = 2) => Number(value.toFixed(precision));
const scaled = (value, multiplier) => round(value * multiplier);

function reportingDates(range) {
  if (range.key === 'last_90_days') return ['2026-06-21', '2026-07-12', '2026-08-02', '2026-08-23', '2026-09-18'];
  if (range.key === 'previous_30_days') return ['2026-07-21', '2026-07-28', '2026-08-05', '2026-08-12', '2026-08-19'];
  return ['2026-08-20', '2026-08-27', '2026-09-03', '2026-09-10', '2026-09-18'];
}

function emptyReporting(workspace, range) {
  return {
    summary: {
      workspace,
      date_range: range,
      kpis: [],
      performance: [],
      ai_summary: null,
      data_updated_at: null,
    },
    metrics: [],
    campaigns: { data: [], meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 } },
    channels: [],
    audience: [],
    creative: { data: [], meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 } },
    reports: { data: [], meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 } },
  };
}

function completeReporting(workspace, range) {
  const multiplier = range.multiplier;
  const dates = reportingDates(range);
  const spend = scaled(184250, multiplier);
  const revenue = scaled(742680, multiplier);
  const impressions = Math.round(12450000 * multiplier);
  const clicks = Math.round(284650 * multiplier);
  const conversions = Math.round(9360 * multiplier);

  const performance = dates.map((date, index) => ({
    date,
    spend: scaled((spend / dates.length) * (0.9 + index * 0.05), 1),
    impressions: Math.round((impressions / dates.length) * (0.88 + index * 0.06)),
    clicks: Math.round((clicks / dates.length) * (0.9 + index * 0.05)),
    conversions: Math.round((conversions / dates.length) * (0.86 + index * 0.07)),
    revenue: scaled((revenue / dates.length) * (0.84 + index * 0.08), 1),
    roas: round(3.75 + index * 0.14),
  }));

  const campaigns = [
    { id: 101, workspace_id: workspace.id, name: 'Always-on Search', channel: 'Paid Search', status: 'active', start_date: '2026-01-01', end_date: null, budget: scaled(95000, multiplier), spend: scaled(81250, multiplier), impressions: Math.round(3620000 * multiplier), clicks: Math.round(142300 * multiplier), conversions: Math.round(5480 * multiplier), revenue: scaled(356200, multiplier) },
    { id: 102, workspace_id: workspace.id, name: 'Autumn Social Launch', channel: 'Paid Social', status: 'active', start_date: '2026-08-01', end_date: '2026-10-15', budget: scaled(72000, multiplier), spend: scaled(62400, multiplier), impressions: Math.round(6140000 * multiplier), clicks: Math.round(98600 * multiplier), conversions: Math.round(2490 * multiplier), revenue: scaled(216500, multiplier) },
    { id: 103, workspace_id: workspace.id, name: 'Streaming Retargeting', channel: 'Programmatic Video', status: 'active', start_date: '2026-07-15', end_date: null, budget: scaled(50000, multiplier), spend: scaled(40600, multiplier), impressions: Math.round(2690000 * multiplier), clicks: Math.round(43750 * multiplier), conversions: Math.round(1390 * multiplier), revenue: scaled(169980, multiplier) },
  ];

  return {
    summary: {
      workspace,
      date_range: range,
      kpis: [
        { key: 'spend', label: 'Media spend', value: String(spend), formatted_value: `$${spend.toLocaleString('en-US')}`, previous_value: scaled(spend / 1.084, 1), change_percent: 8.4, trend: 'up', unit: 'currency' },
        { key: 'revenue', label: 'Attributed revenue', value: revenue, formatted_value: `$${revenue.toLocaleString('en-US')}`, previous_value: scaled(revenue / 1.126, 1), change_percent: 12.6, trend: 'up', unit: 'currency' },
        { key: 'roas', label: 'ROAS', value: round(revenue / spend), formatted_value: `${round(revenue / spend)}x`, previous_value: 3.89, change_percent: 3.6, trend: 'up', unit: 'ratio' },
        { key: 'conversions', label: 'Conversions', value: conversions, formatted_value: conversions.toLocaleString('en-US'), previous_value: Math.round(conversions / 1.071), change_percent: 7.1, trend: 'up', unit: 'number' },
      ],
      performance,
      ai_summary: {
        headline: 'Search efficiency and stronger social conversion lifted total return.',
        what_worked: ['Brand and shopping search protected high-intent demand.', 'Social prospecting improved conversion volume without increasing CPA.'],
        what_did_not_work: ['Video frequency rose above the preferred range late in the period.'],
        recommendations: ['Shift 6% of retargeting budget into paid search.', 'Refresh high-frequency video creative before the next flight.'],
        generated_at: '2026-09-18T09:30:00Z',
        source: 'seeded',
      },
      data_updated_at: '2026-09-18T08:45:00Z',
    },
    metrics: performance.flatMap((point, index) => campaigns.map((campaign, campaignIndex) => ({
      date: point.date,
      campaign_id: campaign.id,
      campaign: campaign.name,
      channel: campaign.channel,
      spend: scaled(point.spend * [0.44, 0.34, 0.22][campaignIndex]),
      impressions: Math.round(point.impressions * [0.29, 0.49, 0.22][campaignIndex]),
      clicks: Math.round(point.clicks * [0.5, 0.35, 0.15][campaignIndex]),
      conversions: Math.round(point.conversions * [0.58, 0.27, 0.15][campaignIndex]),
      revenue: scaled(point.revenue * [0.48, 0.29, 0.23][campaignIndex]),
      ctr: round(1.8 + campaignIndex * 0.45 + index * 0.03),
      cpc: round(0.56 + campaignIndex * 0.19),
      cpa: round(14.8 + campaignIndex * 4.3),
      roas: round(4.38 - campaignIndex * 0.1),
    }))),
    campaigns: { data: campaigns, meta: { current_page: '1', per_page: '20', total: String(campaigns.length), last_page: '1' } },
    channels: [
      { channel: 'Paid Search', spend: scaled(81250, multiplier), impressions: Math.round(3620000 * multiplier), clicks: Math.round(142300 * multiplier), conversions: Math.round(5480 * multiplier), revenue: scaled(356200, multiplier), share_of_spend: 44.1, contribution_percent: 48, roas: 4.38 },
      { channel: 'Paid Social', spend: scaled(62400, multiplier), impressions: Math.round(6140000 * multiplier), clicks: Math.round(98600 * multiplier), conversions: Math.round(2490 * multiplier), revenue: scaled(216500, multiplier), share_of_spend: 33.9, contribution_percent: 29.2, roas: 3.47 },
      { channel: 'Programmatic Video', spend: scaled(40600, multiplier), impressions: Math.round(2690000 * multiplier), clicks: Math.round(43750 * multiplier), conversions: Math.round(1390 * multiplier), revenue: scaled(169980, multiplier), share_of_spend: 22, contribution_percent: 22.8, roas: 4.19 },
    ],
    audience: [
      { id: 201, name: 'High-intent category shoppers', category: 'Intent', size: 1840000, share_percent: 34.8, impressions: Math.round(4610000 * multiplier), clicks: Math.round(126800 * multiplier), conversions: Math.round(4860 * multiplier), index: 138 },
      { id: 202, name: 'Value-led young families', category: 'Life stage', size: 2310000, share_percent: 29.1, impressions: Math.round(3890000 * multiplier), clicks: Math.round(81200 * multiplier), conversions: Math.round(2780 * multiplier), index: 121 },
      { id: 203, name: 'Recent site visitors', category: 'First party', size: 624000, share_percent: 18.6, impressions: Math.round(2470000 * multiplier), clicks: Math.round(76650 * multiplier), conversions: Math.round(1720 * multiplier), index: 164 },
    ],
    creative: { data: [
      { id: 301, campaign_id: 102, name: 'Autumn value carousel', asset_url: '/creative/ramadan.png', asset_type: 'image', status: 'active', spend: scaled(28200, multiplier), impressions: Math.round(2840000 * multiplier), clicks: Math.round(51200 * multiplier), conversions: Math.round(1420 * multiplier), ctr: 1.8, cpa: 19.86 },
      { id: 302, campaign_id: 103, name: 'Streaming pre-roll 15s', asset_url: '/creative/streaming-pre-roll.png', asset_type: 'video', status: 'active', spend: scaled(24100, multiplier), impressions: Math.round(1650000 * multiplier), clicks: Math.round(26400 * multiplier), conversions: Math.round(810 * multiplier), ctr: 1.6, cpa: 29.75 },
    ], meta: { current_page: 1, per_page: 20, total: 2, last_page: 1 } },
    reports: { data: [
      { id: 401, name: `${range.label} performance`, type: 'performance', status: 'ready', period_start: range.start_date, period_end: range.end_date, created_at: '2026-09-18T09:00:00Z', download_url: '/mock-downloads/performance.pdf' },
      { id: 402, name: 'Channel investment detail', type: 'channel_detail', status: 'processing', period_start: range.start_date, period_end: range.end_date, created_at: '2026-09-18T09:10:00Z', download_url: null },
    ], meta: { current_page: 1, per_page: 20, total: 2, last_page: 1 } },
  };
}

function partialReporting(workspace, range) {
  const multiplier = range.multiplier;
  const dates = reportingDates(range).slice(-3);
  return {
    summary: {
      workspace,
      date_range: range,
      kpis: [
        { key: 'spend', label: 'Media spend', value: scaled(42600, multiplier), formatted_value: `£${scaled(42600, multiplier).toLocaleString('en-GB')}`, previous_value: null, change_percent: null, trend: null, unit: 'currency' },
        { key: 'leads', label: 'Qualified leads', value: null, formatted_value: '—', previous_value: null, change_percent: null, trend: null, unit: 'number' },
      ],
      performance: dates.map((date, index) => ({ date, spend: scaled((11800 + index * 2400) * multiplier), impressions: Math.round((720000 + index * 80000) * multiplier), clicks: null, conversions: null, revenue: null, roas: null })),
      ai_summary: null,
      data_updated_at: '2026-09-18T07:15:00Z',
    },
    metrics: dates.map((date, index) => ({ date, campaign_id: 501, campaign: 'Current Account Search', channel: 'Paid Search', spend: scaled((11800 + index * 2400) * multiplier), impressions: Math.round((720000 + index * 80000) * multiplier), clicks: null, conversions: null, revenue: null, ctr: null, cpc: null, cpa: null, roas: null })),
    campaigns: { data: [{ id: 501, workspace_id: workspace.id, name: 'Current Account Search', channel: 'Paid Search', status: 'active', start_date: '2026-08-01', end_date: null, budget: 60000, spend: scaled(42600, multiplier), impressions: Math.round(2310000 * multiplier), clicks: null, conversions: null, revenue: null }], meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 } },
    channels: [{ channel: 'Paid Search', spend: scaled(42600, multiplier), impressions: Math.round(2310000 * multiplier), clicks: null, conversions: null, revenue: null, share_of_spend: 100, contribution_percent: null, roas: null }],
    audience: [],
    creative: { data: [], meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 } },
    reports: { data: [], meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 } },
  };
}

export function createReportingFixture(workspace, range, profile = workspace.fixture_profile) {
  if (profile === 'empty') return emptyReporting(workspace, range);
  if (profile === 'partial') return partialReporting(workspace, range);
  return completeReporting(workspace, range);
}
