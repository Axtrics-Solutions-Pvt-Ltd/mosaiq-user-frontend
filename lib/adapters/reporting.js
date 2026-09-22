import {
  adaptCollectionEnvelope,
  adaptEnvelope,
  dateString,
  mapValid,
  numberOrNull,
  optionalId,
  optionalRecord,
  optionalString,
  requiredId,
  requiredRecord,
  requiredString,
} from './shared.js';

function workspace(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    id: requiredId(item.id, `${path}.id`),
    agency_id: requiredId(item.agency_id, `${path}.agency_id`),
    client_id: optionalId(item.client_id, `${path}.client_id`, context),
    name: requiredString(item.name, `${path}.name`),
    status: requiredString(item.status, `${path}.status`),
    currency: requiredString(item.currency, `${path}.currency`),
    timezone: requiredString(item.timezone, `${path}.timezone`),
    reporting_start_date: dateString(item.reporting_start_date, `${path}.reporting_start_date`, context),
    reporting_end_date: dateString(item.reporting_end_date, `${path}.reporting_end_date`, context),
  };
}

function dateRange(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    start_date: dateString(item.start_date, `${path}.start_date`, context, { required: true }),
    end_date: dateString(item.end_date, `${path}.end_date`, context, { required: true }),
    label: optionalString(item.label, `${path}.label`, context),
  };
}

function kpi(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    key: requiredString(item.key, `${path}.key`),
    label: requiredString(item.label, `${path}.label`),
    value: numberOrNull(item.value, `${path}.value`, context),
    formatted_value: typeof item.formatted_value === 'string' ? item.formatted_value : '—',
    previous_value: numberOrNull(item.previous_value, `${path}.previous_value`, context),
    change_percent: numberOrNull(item.change_percent, `${path}.change_percent`, context),
    trend: optionalString(item.trend, `${path}.trend`, context),
    unit: optionalString(item.unit, `${path}.unit`, context),
  };
}

function timePoint(value, path, context) {
  const item = requiredRecord(value, path);
  const point = { date: dateString(item.date, `${path}.date`, context, { required: true }) };
  for (const key of ['spend', 'impressions', 'clicks', 'conversions', 'revenue', 'roas']) point[key] = numberOrNull(item[key], `${path}.${key}`, context);
  return point;
}

function aiSummary(value, path, context) {
  const item = optionalRecord(value, path, context);
  if (!item) return null;
  return {
    headline: requiredString(item.headline, `${path}.headline`),
    what_worked: mapValid(item.what_worked, `${path}.what_worked`, context, (entry, entryPath) => requiredString(entry, entryPath)),
    what_did_not_work: mapValid(item.what_did_not_work, `${path}.what_did_not_work`, context, (entry, entryPath) => requiredString(entry, entryPath)),
    recommendations: mapValid(item.recommendations, `${path}.recommendations`, context, (entry, entryPath) => requiredString(entry, entryPath)),
    generated_at: dateString(item.generated_at, `${path}.generated_at`, context),
    source: optionalString(item.source, `${path}.source`, context),
  };
}

export function adaptDashboardSummary(payload) {
  return adaptEnvelope(payload, (raw, path, context) => {
    const item = requiredRecord(raw, path);
    return {
      workspace: workspace(item.workspace, `${path}.workspace`, context),
      date_range: dateRange(item.date_range, `${path}.date_range`, context),
      kpis: mapValid(item.kpis, `${path}.kpis`, context, kpi),
      performance: mapValid(item.performance, `${path}.performance`, context, timePoint),
      ai_summary: aiSummary(item.ai_summary, `${path}.ai_summary`, context),
      data_updated_at: dateString(item.data_updated_at, `${path}.data_updated_at`, context),
    };
  });
}

function metricRow(value, path, context) {
  const item = requiredRecord(value, path);
  const row = {
    date: dateString(item.date, `${path}.date`, context, { required: true }),
    campaign_id: optionalId(item.campaign_id, `${path}.campaign_id`, context),
    campaign: requiredString(item.campaign, `${path}.campaign`),
    channel: requiredString(item.channel, `${path}.channel`),
  };
  for (const key of ['spend', 'impressions', 'clicks', 'conversions', 'revenue', 'ctr', 'cpc', 'cpa', 'roas']) row[key] = numberOrNull(item[key], `${path}.${key}`, context);
  return row;
}

export const adaptDetailedMetrics = (payload) => adaptCollectionEnvelope(payload, metricRow);

function campaign(value, path, context) {
  const item = requiredRecord(value, path);
  const normalized = {
    id: requiredId(item.id, `${path}.id`),
    workspace_id: requiredId(item.workspace_id, `${path}.workspace_id`),
    name: requiredString(item.name, `${path}.name`),
    channel: requiredString(item.channel, `${path}.channel`),
    status: requiredString(item.status, `${path}.status`),
    start_date: dateString(item.start_date, `${path}.start_date`, context),
    end_date: dateString(item.end_date, `${path}.end_date`, context),
  };
  for (const key of ['budget', 'spend', 'impressions', 'clicks', 'conversions', 'revenue']) normalized[key] = numberOrNull(item[key], `${path}.${key}`, context);
  return normalized;
}

export const adaptCampaigns = (payload) => adaptCollectionEnvelope(payload, campaign);

function channel(value, path, context) {
  const item = requiredRecord(value, path);
  const normalized = { channel: requiredString(item.channel, `${path}.channel`) };
  for (const key of ['spend', 'impressions', 'clicks', 'conversions', 'revenue', 'share_of_spend', 'contribution_percent', 'roas']) normalized[key] = numberOrNull(item[key], `${path}.${key}`, context);
  return normalized;
}

export const adaptChannels = (payload) => adaptCollectionEnvelope(payload, channel);

function audience(value, path, context) {
  const item = requiredRecord(value, path);
  const normalized = { id: optionalId(item.id, `${path}.id`, context), name: requiredString(item.name, `${path}.name`), category: optionalString(item.category, `${path}.category`, context) };
  for (const key of ['size', 'share_percent', 'impressions', 'clicks', 'conversions', 'index']) normalized[key] = numberOrNull(item[key], `${path}.${key}`, context);
  return normalized;
}

export const adaptAudience = (payload) => adaptCollectionEnvelope(payload, audience);

function creative(value, path, context) {
  const item = requiredRecord(value, path);
  const normalized = {
    id: requiredId(item.id, `${path}.id`), campaign_id: optionalId(item.campaign_id, `${path}.campaign_id`, context),
    name: requiredString(item.name, `${path}.name`), asset_url: optionalString(item.asset_url, `${path}.asset_url`, context),
    asset_type: optionalString(item.asset_type, `${path}.asset_type`, context), status: optionalString(item.status, `${path}.status`, context),
  };
  for (const key of ['spend', 'impressions', 'clicks', 'conversions', 'ctr', 'cpa']) normalized[key] = numberOrNull(item[key], `${path}.${key}`, context);
  return normalized;
}

export const adaptCreative = (payload) => adaptCollectionEnvelope(payload, creative);

function report(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    id: requiredId(item.id, `${path}.id`), name: requiredString(item.name, `${path}.name`), type: requiredString(item.type, `${path}.type`),
    status: requiredString(item.status, `${path}.status`), period_start: dateString(item.period_start, `${path}.period_start`, context, { required: true }),
    period_end: dateString(item.period_end, `${path}.period_end`, context, { required: true }), created_at: dateString(item.created_at, `${path}.created_at`, context, { required: true }),
    download_url: optionalString(item.download_url, `${path}.download_url`, context),
  };
}

export const adaptReports = (payload) => adaptCollectionEnvelope(payload, report);
