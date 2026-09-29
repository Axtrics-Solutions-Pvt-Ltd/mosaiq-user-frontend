import { ApiRequestError } from './api.js';
import { publicEnvironment } from './environment.js';

const DEFAULT_TIMEOUT_MS = 15000;

async function fetchWithTimeout(fetchImpl, url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal });
  } catch (cause) {
    if (cause?.name === 'AbortError') {
      throw new ApiRequestError('The request timed out. Please try again.', { code: 'REQUEST_TIMEOUT', cause });
    }
    throw new ApiRequestError('Unable to reach the report server. Check your connection and try again.', { code: 'NETWORK_ERROR', cause });
  } finally {
    clearTimeout(timer);
  }
}

function errorFromResponse(response, payload) {
  return new ApiRequestError(payload.message || 'Something went wrong. Please try again.', {
    status: response.status,
    fields: payload.errors || {},
    code: payload.error_code || 'REQUEST_FAILED',
    requestId: payload.request_id || response.headers.get('X-Request-ID'),
  });
}

function queryString(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  }
  const value = search.toString();
  return value ? `?${value}` : '';
}

export function createPublicReportApi({
  apiUrl = publicEnvironment.apiUrl,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');

  async function request(path, { method = 'GET', body, accessToken, params } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetchWithTimeout(fetchImpl, `${apiUrl}/public${path}${queryString(params)}`, {
      method,
      cache: 'no-store',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    }, timeoutMs);

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw errorFromResponse(response, payload);
    return payload;
  }

  return Object.freeze({
    getReport: (token, accessToken) => request(`/reports/${encodeURIComponent(token)}`, { accessToken }),
    unlockReport: (token, password) => request(`/reports/${encodeURIComponent(token)}/unlock`, {
      method: 'POST',
      body: { password },
    }),
    getTab: (token, tabCode, { from, to, channel, accessToken } = {}) => request(
      `/reports/${encodeURIComponent(token)}/tabs/${encodeURIComponent(tabCode)}`,
      { accessToken, params: { from, to, channel } },
    ),
  });
}

export const publicReportApi = createPublicReportApi();
