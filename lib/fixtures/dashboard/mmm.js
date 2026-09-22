const round = (value, precision = 2) => Number(value.toFixed(precision));

function settings(workspace) {
  return {
    outcome_metric: 'revenue',
    date_granularity: 'weekly',
    currency: workspace.currency,
    include_seasonality: '1',
    include_promotions: '1',
    model_version: 'seed-1.0',
  };
}

function emptyMmm(workspace) {
  return {
    workspace_id: workspace.id,
    model_status: 'not_started',
    data_readiness: [
      { key: 'history', label: 'Historical coverage', status: 'error', message: 'No media history has been imported.', affected_rows: 0 },
      { key: 'outcome', label: 'Outcome metric', status: 'error', message: 'No outcome series is available.', affected_rows: 0 },
    ],
    settings: settings(workspace),
    channel_contributions: [],
    response_curves: [],
    recommended_budget: [],
    scenarios: [],
    ai_readout: null,
    model_run_at: null,
  };
}

function completeMmm(workspace, range) {
  const channels = [
    { channel: 'Paid Search', spend: 81250, contribution: 318400, contribution_percent: 45.8, incremental_outcome: 318400, roas: 3.92, carryover_percent: 8, saturation_percent: 74, confidence: 'high' },
    { channel: 'Paid Social', spend: 62400, contribution: 201500, contribution_percent: 29, incremental_outcome: 201500, roas: 3.23, carryover_percent: 21, saturation_percent: 61, confidence: 'high' },
    { channel: 'Programmatic Video', spend: 40600, contribution: 175300, contribution_percent: 25.2, incremental_outcome: 175300, roas: 4.32, carryover_percent: 38, saturation_percent: 52, confidence: 'medium' },
  ];
  const response_curves = channels.flatMap((item) => [0.5, 0.75, 1, 1.25, 1.5].map((factor) => ({
    channel: item.channel,
    spend: round(item.spend * factor),
    predicted_outcome: round(item.contribution * Math.pow(factor, 0.72)),
    marginal_return: round(item.roas * Math.pow(factor, -0.38)),
  })));
  const allocations = [
    { channel: 'Paid Search', current_budget: 81250, recommended_budget: 86500, change_percent: 6.46, expected_outcome_change: 4.2 },
    { channel: 'Paid Social', current_budget: 62400, recommended_budget: 56750, change_percent: -9.05, expected_outcome_change: -3.1 },
    { channel: 'Programmatic Video', current_budget: 40600, recommended_budget: 41000, change_percent: 0.99, expected_outcome_change: 0.8 },
  ];
  return {
    workspace_id: workspace.id,
    model_status: 'ready',
    data_readiness: [
      { key: 'history', label: 'Historical coverage', status: 'ready', message: '104 complete weekly observations are available.', affected_rows: '104' },
      { key: 'outcome', label: 'Outcome metric', status: 'ready', message: 'Revenue coverage aligns with media history.', affected_rows: 104 },
      { key: 'variation', label: 'Spend variation', status: 'ready', message: 'All modelled channels contain sufficient variation.', affected_rows: 0 },
    ],
    settings: settings(workspace),
    channel_contributions: channels,
    response_curves,
    recommended_budget: allocations,
    scenarios: [
      { name: 'Current plan', total_budget: 184250, predicted_outcome: 695200, predicted_roas: 3.77, outcome_change_percent: 0, allocations: channels.map((item) => ({ channel: item.channel, current_budget: item.spend, recommended_budget: item.spend, change_percent: 0, expected_outcome_change: 0 })) },
      { name: 'Efficiency recommendation', total_budget: 184250, predicted_outcome: 723700, predicted_roas: 3.93, outcome_change_percent: 4.1, allocations },
    ],
    ai_readout: {
      outcome_story: 'Paid Search remains the largest contributor, while Programmatic Video retains the strongest marginal headroom.',
      channel_diagnosis: ['Paid Search is productive but approaching saturation.', 'Paid Social can release budget with limited outcome loss.', 'Programmatic Video benefits from carryover and remains below its saturation point.'],
      recommendations: ['Move 6–9% of Paid Social investment into Paid Search and Programmatic Video.', 'Re-run the model after the next eight weekly observations.'],
      caveats: ['Results are directional and depend on the quality of imported spend and revenue data.', `The fixture run represents data through ${range.end_date}.`],
    },
    model_run_at: `${range.end_date}T10:00:00Z`,
  };
}

function partialMmm(workspace) {
  return {
    workspace_id: workspace.id,
    model_status: 'processing',
    data_readiness: [
      { key: 'history', label: 'Historical coverage', status: 'warning', message: 'Only 18 weekly observations are available; 52 are recommended.', affected_rows: 18 },
      { key: 'outcome', label: 'Outcome metric', status: 'warning', message: 'Qualified-lead coverage is incomplete for four weeks.', affected_rows: 4 },
      { key: 'variation', label: 'Spend variation', status: 'error', message: 'Only one channel currently has usable spend variation.', affected_rows: 1 },
    ],
    settings: { ...settings(workspace), outcome_metric: 'qualified_leads', include_promotions: '0' },
    channel_contributions: [],
    response_curves: [],
    recommended_budget: [],
    scenarios: [],
    ai_readout: null,
    model_run_at: null,
  };
}

export function createMmmFixture(workspace, range, profile = workspace.fixture_profile) {
  if (profile === 'empty') return emptyMmm(workspace);
  if (profile === 'partial') return partialMmm(workspace);
  return completeMmm(workspace, range);
}
