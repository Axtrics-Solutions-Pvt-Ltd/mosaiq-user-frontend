import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiRequestError, createAuthApi } from '../lib/api.js';

function response(body, init = {}) {
  return new Response(body == null ? null : JSON.stringify(body), {
    status: init.status || 200,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
}

function queuedFetch(responses) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return next;
  };
  return { calls, fetchImpl };
}

const options = {
  apiUrl: 'https://api.mosaiq.test/api/v1',
  laravelUrl: 'https://api.mosaiq.test',
  timeoutMs: 100,
};

test('login initializes CSRF and sends a credentialed Laravel request', async () => {
  const queue = queuedFetch([
    response(null, { status: 204 }),
    response({ data: { id: 1, name: 'User', email: 'user@mosaiq.test', platform_role_code: null, membership: null } }),
  ]);
  const api = createAuthApi({ ...options, fetchImpl: queue.fetchImpl, readCookie: () => 'decoded-token' });
  const result = await api.login('user@mosaiq.test', 'password');

  assert.equal(result.data.id, 1);
  assert.equal(queue.calls.length, 2);
  assert.equal(queue.calls[0].url, 'https://api.mosaiq.test/sanctum/csrf-cookie');
  assert.equal(queue.calls[0].options.credentials, 'include');
  assert.equal(queue.calls[1].url, 'https://api.mosaiq.test/api/v1/auth/login');
  assert.equal(queue.calls[1].options.headers['X-XSRF-TOKEN'], 'decoded-token');
  assert.deepEqual(JSON.parse(queue.calls[1].options.body), { email: 'user@mosaiq.test', password: 'password' });
});

test('204 responses are normalized to null', async () => {
  const queue = queuedFetch([response(null, { status: 204 }), response(null, { status: 204 })]);
  const api = createAuthApi({ ...options, fetchImpl: queue.fetchImpl, readCookie: () => 'token' });
  assert.equal(await api.resetPassword({ email: 'user@mosaiq.test', token: 'token', password: 'LongPassword1', password_confirmation: 'LongPassword1' }), null);
});

test('Laravel validation errors preserve fields, code, status, and request ID', async () => {
  const queue = queuedFetch([response({
    message: 'The given data was invalid.',
    errors: { email: ['The email field is required.'] },
    error_code: 'VALIDATION_ERROR',
    request_id: 'request-123',
  }, { status: 422 })]);
  const api = createAuthApi({ ...options, fetchImpl: queue.fetchImpl });
  await assert.rejects(() => api.me(), (error) => {
    assert.ok(error instanceof ApiRequestError);
    assert.equal(error.status, 422);
    assert.equal(error.code, 'VALIDATION_ERROR');
    assert.equal(error.requestId, 'request-123');
    assert.deepEqual(error.fields, { email: ['The email field is required.'] });
    return true;
  });
});

test('session expiry and network failures receive stable frontend error codes', async () => {
  const expiredQueue = queuedFetch([response({}, { status: 419, headers: { 'X-Request-ID': 'csrf-123' } })]);
  const expiredApi = createAuthApi({ ...options, fetchImpl: expiredQueue.fetchImpl });
  await assert.rejects(() => expiredApi.me(), (error) => error.code === 'CSRF_TOKEN_MISMATCH' && error.requestId === 'csrf-123');

  const offlineQueue = queuedFetch([new TypeError('fetch failed')]);
  const offlineApi = createAuthApi({ ...options, fetchImpl: offlineQueue.fetchImpl });
  await assert.rejects(() => offlineApi.me(), (error) => error.code === 'NETWORK_ERROR' && error.status === 0);
});

test('login maps a generic backend 401 to an actionable credential error', async () => {
  const queue = queuedFetch([
    response(null, { status: 204 }),
    response({ message: 'Authentication is required.' }, { status: 401 }),
  ]);
  const api = createAuthApi({ ...options, fetchImpl: queue.fetchImpl, readCookie: () => 'token' });
  await assert.rejects(
    () => api.login('user@mosaiq.test', 'wrong-password'),
    (error) => error.status === 401 && error.message === 'The provided credentials are incorrect.',
  );
});

test('rejecting an invitation is frontend-only until Laravel exposes a public reject endpoint', async () => {
  const queue = queuedFetch([]);
  const api = createAuthApi({ ...options, fetchImpl: queue.fetchImpl });
  assert.equal(await api.rejectInvitation({ token: 'invitation-token' }), null);
  assert.equal(queue.calls.length, 0);
});
