import { mockAuthApi } from './mock-auth.js';
import { publicEnvironment } from './environment.js';

const DEFAULT_TIMEOUT_MS = 15000;

export const isMockAuthEnabled = publicEnvironment.useMockApi;

export class ApiRequestError extends Error {
  constructor(message, { status = 0, fields = {}, code = 'REQUEST_FAILED', requestId = null, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'ApiRequestError';
    this.status = status;
    this.fields = fields;
    this.code = code;
    this.requestId = requestId;
  }
}

function browserCookie(name) {
  if (typeof document === 'undefined') return '';
  const part = document.cookie.split('; ').find((value) => value.startsWith(`${name}=`));
  if (!part) return '';
  try { return decodeURIComponent(part.slice(name.length + 1)); }
  catch { return ''; }
}

async function fetchWithTimeout(fetchImpl, url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal });
  } catch (cause) {
    if (cause?.name === 'AbortError') {
      throw new ApiRequestError('The request timed out. Please try again.', { code: 'REQUEST_TIMEOUT', cause });
    }
    throw new ApiRequestError('Unable to reach the server. Check your connection and try again.', { code: 'NETWORK_ERROR', cause });
  } finally {
    clearTimeout(timer);
  }
}

function errorFromResponse(response, payload) {
  const defaults = {
    401: 'Your session has expired. Please sign in again.',
    403: 'You do not have permission to complete this action.',
    419: 'Your secure session has expired. Refresh the page and try again.',
    429: 'Too many requests. Please wait and try again.',
  };
  return new ApiRequestError(payload.message || defaults[response.status] || 'Something went wrong. Please try again.', {
    status: response.status,
    fields: payload.errors || {},
    code: payload.error_code || (response.status === 419 ? 'CSRF_TOKEN_MISMATCH' : 'REQUEST_FAILED'),
    requestId: payload.request_id || response.headers.get('X-Request-ID'),
  });
}

export function createAuthApi({
  apiUrl = publicEnvironment.apiUrl,
  laravelUrl = publicEnvironment.laravelUrl,
  fetchImpl = globalThis.fetch,
  readCookie = browserCookie,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');

  async function csrf() {
    const response = await fetchWithTimeout(fetchImpl, `${laravelUrl}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    }, timeoutMs);
    if (!response.ok && response.status !== 204) {
      const payload = await response.json().catch(() => ({}));
      throw errorFromResponse(response, payload);
    }
  }

  async function request(path, { method = 'GET', body, stateful = false, errorMessages = {} } = {}) {
    if (stateful) await csrf();
    const headers = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    const token = readCookie('XSRF-TOKEN');
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers['X-XSRF-TOKEN'] = token;

    const response = await fetchWithTimeout(fetchImpl, `${apiUrl}${path}`, {
      method,
      credentials: 'include',
      cache: 'no-store',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    }, timeoutMs);

    if (response.status === 204) return null;
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (errorMessages[response.status]) payload.message = errorMessages[response.status];
      throw errorFromResponse(response, payload);
    }
    return payload;
  }

  return Object.freeze({
    login: (email, password) => request('/auth/login', {
      method: 'POST',
      body: { email, password },
      stateful: true,
      errorMessages: { 401: 'The provided credentials are incorrect.' },
    }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST', stateful: true }),
    inspectInvitation: (token) => request('/invitations/inspect', { method: 'POST', body: { token }, stateful: true }),
    acceptInvitation: (body) => request('/invitations/accept', { method: 'POST', body, stateful: true }),
    rejectInvitation: async () => null,
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email }, stateful: true }),
    resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body, stateful: true }),
  });
}

export const realAuthApi = createAuthApi();
export const authApi = isMockAuthEnabled ? mockAuthApi : realAuthApi;
