import { adaptEnvelope, booleanValue, dateString, mapValid, numberOrNull, optionalString, requiredId, requiredRecord, requiredString } from './shared.js';

function readiness(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    key: requiredString(item.key, `${path}.key`),
    label: requiredString(item.label, `${path}.label`),
    status: requiredString(item.status, `${path}.status`),
    message: requiredString(item.message, `${path}.message`),
    affected_rows: item.affected_rows == null
      ? undefined
      : numberOrNull(item.affected_rows, `${path}.affected_rows`, context),
  };
}

function settings(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    outcome_metric: requiredString(item.outcome_metric, `${path}.outcome_metric`),
    date_granularity: requiredString(item.date_granularity, `${path}.date_granularity`),
    currency: requiredString(item.currency, `${path}.currency`),
    include_seasonality: booleanValue(item.include_seasonality, `${path}.include_seasonality`, context),
    include_promotions: booleanValue(item.include_promotions, `${path}.include_promotions`, context),
    model_version: optionalString(item.model_version, `${path}.model_version`, context),
  };
}

function contribution(value, path, context) {
  const item = requiredRecord(value, path);
  const normalized = { channel: requiredString(item.channel, `${path}.channel`) };
  for (const key of ['spend', 'contribution', 'contribution_percent', 'incremental_outcome', 'roas', 'carryover_percent', 'saturation_percent']) normalized[key] = numberOrNull(item[key], `${path}.${key}`, context);
  normalized.confidence = optionalString(item.confidence, `${path}.confidence`, context);
  return normalized;
}

function curvePoint(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    channel: requiredString(item.channel, `${path}.channel`),
    spend: numberOrNull(item.spend, `${path}.spend`, context),
    predicted_outcome: numberOrNull(item.predicted_outcome, `${path}.predicted_outcome`, context),
    marginal_return: numberOrNull(item.marginal_return, `${path}.marginal_return`, context),
  };
}

function allocation(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    channel: requiredString(item.channel, `${path}.channel`),
    current_budget: numberOrNull(item.current_budget, `${path}.current_budget`, context),
    recommended_budget: numberOrNull(item.recommended_budget, `${path}.recommended_budget`, context),
    change_percent: numberOrNull(item.change_percent, `${path}.change_percent`, context),
    expected_outcome_change: numberOrNull(item.expected_outcome_change, `${path}.expected_outcome_change`, context),
  };
}

function scenario(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    name: requiredString(item.name, `${path}.name`),
    total_budget: numberOrNull(item.total_budget, `${path}.total_budget`, context),
    predicted_outcome: numberOrNull(item.predicted_outcome, `${path}.predicted_outcome`, context),
    predicted_roas: numberOrNull(item.predicted_roas, `${path}.predicted_roas`, context),
    outcome_change_percent: numberOrNull(item.outcome_change_percent, `${path}.outcome_change_percent`, context),
    allocations: mapValid(item.allocations, `${path}.allocations`, context, allocation),
  };
}

function aiReadout(value, path, context) {
  if (value == null) return null;
  const item = requiredRecord(value, path);
  return {
    outcome_story: requiredString(item.outcome_story, `${path}.outcome_story`),
    channel_diagnosis: mapValid(item.channel_diagnosis, `${path}.channel_diagnosis`, context, (entry, entryPath) => requiredString(entry, entryPath)),
    recommendations: mapValid(item.recommendations, `${path}.recommendations`, context, (entry, entryPath) => requiredString(entry, entryPath)),
    caveats: mapValid(item.caveats, `${path}.caveats`, context, (entry, entryPath) => requiredString(entry, entryPath)),
  };
}

export function adaptMmmResults(payload) {
  return adaptEnvelope(payload, (raw, path, context) => {
    const item = requiredRecord(raw, path);
    return {
      workspace_id: requiredId(item.workspace_id, `${path}.workspace_id`),
      model_status: requiredString(item.model_status, `${path}.model_status`),
      data_readiness: mapValid(item.data_readiness, `${path}.data_readiness`, context, readiness),
      settings: settings(item.settings, `${path}.settings`, context),
      channel_contributions: mapValid(item.channel_contributions, `${path}.channel_contributions`, context, contribution),
      response_curves: mapValid(item.response_curves, `${path}.response_curves`, context, curvePoint),
      recommended_budget: mapValid(item.recommended_budget, `${path}.recommended_budget`, context, allocation),
      scenarios: mapValid(item.scenarios, `${path}.scenarios`, context, scenario),
      ai_readout: aiReadout(item.ai_readout, `${path}.ai_readout`, context),
      model_run_at: dateString(item.model_run_at, `${path}.model_run_at`, context),
    };
  });
}

export function adaptScenarioInput(value) {
  const context = { warnings: [] };
  const item = requiredRecord(value, 'scenario');
  const data = {
    name: optionalString(item.name, 'scenario.name', context),
    total_budget: numberOrNull(item.total_budget, 'scenario.total_budget', context),
    allocations: mapValid(item.allocations, 'scenario.allocations', context, (allocationValue, path, allocationContext) => {
      const allocationItem = requiredRecord(allocationValue, path);
      return { channel: requiredString(allocationItem.channel, `${path}.channel`), budget: numberOrNull(allocationItem.budget, `${path}.budget`, allocationContext) };
    }),
  };
  return { data, warnings: context.warnings };
}
