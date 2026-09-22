import { adaptEnvelope, mapValid, numberOrNull, optionalId, optionalString, requiredId, requiredRecord, requiredString, dateString } from './shared.js';

function intelligenceMetric(value, path, context) {
  const item = requiredRecord(value, path);
  const rawValue = item.value;
  return {
    key: requiredString(item.key, `${path}.key`),
    label: requiredString(item.label, `${path}.label`),
    value: typeof rawValue === 'string' || typeof rawValue === 'number' ? rawValue : null,
    category: optionalString(item.category, `${path}.category`, context),
    source: optionalString(item.source, `${path}.source`, context),
    planning_implication: optionalString(item.planning_implication, `${path}.planning_implication`, context),
  };
}

function profileSection(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    title: requiredString(item.title, `${path}.title`),
    summary: optionalString(item.summary, `${path}.summary`, context),
    metrics: mapValid(item.metrics, `${path}.metrics`, context, intelligenceMetric),
    insights: mapValid(item.insights, `${path}.insights`, context, (entry, entryPath) => requiredString(entry, entryPath)),
  };
}

function demographic(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    dimension: requiredString(item.dimension, `${path}.dimension`),
    segments: mapValid(item.segments, `${path}.segments`, context, (segment, segmentPath, segmentContext) => {
      const entry = requiredRecord(segment, segmentPath);
      return {
        label: requiredString(entry.label, `${segmentPath}.label`),
        value: numberOrNull(entry.value, `${segmentPath}.value`, segmentContext),
        percent: numberOrNull(entry.percent, `${segmentPath}.percent`, segmentContext),
        index: numberOrNull(entry.index, `${segmentPath}.index`, segmentContext),
      };
    }),
  };
}

function geography(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    geography: requiredString(item.geography, `${path}.geography`),
    geography_type: optionalString(item.geography_type, `${path}.geography_type`, context),
    value: numberOrNull(item.value, `${path}.value`, context),
    share_percent: numberOrNull(item.share_percent, `${path}.share_percent`, context),
    index: numberOrNull(item.index, `${path}.index`, context),
    planning_implication: optionalString(item.planning_implication, `${path}.planning_implication`, context),
  };
}

function behaviour(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    category: requiredString(item.category, `${path}.category`),
    behaviour: requiredString(item.behaviour, `${path}.behaviour`),
    affinity: numberOrNull(item.affinity, `${path}.affinity`, context),
    index: numberOrNull(item.index, `${path}.index`, context),
    source: optionalString(item.source, `${path}.source`, context),
    planning_implication: optionalString(item.planning_implication, `${path}.planning_implication`, context),
  };
}

function mediaBrand(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    category: requiredString(item.category, `${path}.category`),
    brand_or_platform: requiredString(item.brand_or_platform, `${path}.brand_or_platform`),
    reach_percent: numberOrNull(item.reach_percent, `${path}.reach_percent`, context),
    affinity: numberOrNull(item.affinity, `${path}.affinity`, context),
    index: numberOrNull(item.index, `${path}.index`, context),
    source: optionalString(item.source, `${path}.source`, context),
  };
}

function finding(value, path, context) {
  const item = requiredRecord(value, path);
  return {
    id: optionalId(item.id, `${path}.id`, context),
    type: requiredString(item.type, `${path}.type`),
    title: requiredString(item.title, `${path}.title`),
    description: requiredString(item.description, `${path}.description`),
    implication: optionalString(item.implication, `${path}.implication`, context),
    priority: optionalString(item.priority, `${path}.priority`, context),
  };
}

export function adaptMarketingIntelligence(payload) {
  return adaptEnvelope(payload, (raw, path, context) => {
    const item = requiredRecord(raw, path);
    return {
      workspace_id: requiredId(item.workspace_id, `${path}.workspace_id`),
      audience_profile: mapValid(item.audience_profile, `${path}.audience_profile`, context, profileSection),
      demographic_profile: mapValid(item.demographic_profile, `${path}.demographic_profile`, context, demographic),
      geographic_insights: mapValid(item.geographic_insights, `${path}.geographic_insights`, context, geography),
      behaviour: mapValid(item.behaviour, `${path}.behaviour`, context, behaviour),
      media_and_brand: mapValid(item.media_and_brand, `${path}.media_and_brand`, context, mediaBrand),
      findings: mapValid(item.findings, `${path}.findings`, context, finding),
      data_updated_at: dateString(item.data_updated_at, `${path}.data_updated_at`, context),
      source_label: optionalString(item.source_label, `${path}.source_label`, context),
    };
  });
}
