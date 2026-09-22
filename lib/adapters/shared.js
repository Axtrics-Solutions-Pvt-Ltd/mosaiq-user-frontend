import { unwrapData } from '../contracts/index.js';

export class AdapterError extends Error {
  constructor(message, path = 'data', cause) {
    super(`${message} at ${path}`, cause ? { cause } : undefined);
    this.name = 'AdapterError';
    this.path = path;
  }
}

export function createAdapterContext() {
  return { warnings: [] };
}

export function addWarning(context, path, message, code = 'INVALID_VALUE') {
  context.warnings.push({ path, message, code });
}

export function requiredRecord(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AdapterError('Expected an object', path);
  return value;
}

export function optionalRecord(value, path, context) {
  if (value == null) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    addWarning(context, path, 'Expected an object; value was discarded.');
    return null;
  }
  return value;
}

export function list(value, path, context) {
  if (value == null) {
    addWarning(context, path, 'Missing collection; an empty collection was used.', 'MISSING_COLLECTION');
    return [];
  }
  if (!Array.isArray(value)) {
    addWarning(context, path, 'Expected an array; an empty collection was used.');
    return [];
  }
  return value;
}

export function requiredString(value, path) {
  if (typeof value !== 'string' || !value.trim()) throw new AdapterError('Expected a non-empty string', path);
  return value.trim();
}

export function optionalString(value, path, context) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') {
    addWarning(context, path, 'Expected a string; value was set to null.');
    return null;
  }
  return value.trim() || null;
}

export function requiredId(value, path) {
  if ((typeof value !== 'number' && typeof value !== 'string') || value === '') throw new AdapterError('Expected an identifier', path);
  return value;
}

export function optionalId(value, path, context) {
  if (value == null || value === '') return null;
  if (typeof value !== 'number' && typeof value !== 'string') {
    addWarning(context, path, 'Expected an identifier; value was set to null.');
    return null;
  }
  return value;
}

export function numberOrNull(value, path, context) {
  if (value == null || value === '') return null;
  const normalized = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(normalized)) {
    addWarning(context, path, 'Expected a finite number; value was set to null.');
    return null;
  }
  return normalized;
}

export function booleanValue(value, path, context, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  addWarning(context, path, `Expected a boolean; ${fallback} was used.`);
  return fallback;
}

export function dateString(value, path, context, { required = false } = {}) {
  if (value == null || value === '') {
    if (required) throw new AdapterError('Expected a date', path);
    return null;
  }
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    if (required) throw new AdapterError('Expected a valid date string', path);
    addWarning(context, path, 'Expected a valid date string; value was set to null.');
    return null;
  }
  return value;
}

export function mapValid(values, path, context, normalizer) {
  return list(values, path, context).flatMap((value, index) => {
    try {
      return [normalizer(value, `${path}[${index}]`, context)];
    } catch (error) {
      addWarning(context, `${path}[${index}]`, error.message, 'ROW_SKIPPED');
      return [];
    }
  });
}

export function adaptEnvelope(payload, normalizer) {
  const context = createAdapterContext();
  let raw;
  try { raw = unwrapData(payload); }
  catch (error) { throw new AdapterError('Invalid API response envelope', 'payload', error); }
  const data = normalizer(raw, 'data', context);
  return { data, warnings: context.warnings };
}

export function adaptCollectionEnvelope(payload, normalizer) {
  return adaptEnvelope(payload, (raw, path, context) => {
    const nested = raw && !Array.isArray(raw) && Array.isArray(raw.data);
    const items = nested ? raw.data : raw;
    const meta = nested ? normalizePagination(raw.meta, `${path}.meta`, context) : normalizePagination(payload.meta, 'meta', context);
    return { items: mapValid(items, nested ? `${path}.data` : path, context, normalizer), meta };
  });
}

export function normalizePagination(value, path, context) {
  if (value == null) return null;
  const meta = optionalRecord(value, path, context);
  if (!meta) return null;
  const normalized = {};
  for (const key of ['current_page', 'per_page', 'total', 'last_page']) normalized[key] = numberOrNull(meta[key], `${path}.${key}`, context);
  return normalized;
}
