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

test('workspace list uses the current-user workspaces endpoint', async () => {
  const queue = queuedFetch([response({ data: [
    { id: 1, name: 'Apex Auto' },
    { id: 2, name: 'Greenline Bank' },
  ] })]);
  const api = createAuthApi({ ...options, fetchImpl: queue.fetchImpl });
  const result = await api.listWorkspacesForUser({
    membership: { agency_id: 10, client_id: 20, workspace_ids: [2] },
  });

  assert.equal(queue.calls[0].url, 'https://api.mosaiq.test/api/v1/auth/workspaces?per_page=100&status=active');
  assert.deepEqual(result.data, [
    { id: 1, name: 'Apex Auto' },
    { id: 2, name: 'Greenline Bank' },
  ]);
});

test('profile update uses updateAgencyUser with the current user agency and id', async () => {
  const queue = queuedFetch([
    response(null, { status: 204 }),
    response({ data: { id: 7, name: 'Updated User' } }),
  ]);
  const api = createAuthApi({ ...options, fetchImpl: queue.fetchImpl, readCookie: () => 'token' });
  const result = await api.updateAgencyUser({ id: 7, membership: { agency_id: 3 } }, { name: 'Updated User' });

  assert.equal(queue.calls[0].url, 'https://api.mosaiq.test/sanctum/csrf-cookie');
  assert.equal(queue.calls[1].url, 'https://api.mosaiq.test/api/v1/agencies/3/users/7');
  assert.equal(queue.calls[1].options.method, 'PUT');
  assert.deepEqual(JSON.parse(queue.calls[1].options.body), { name: 'Updated User' });
  assert.equal(result.data.name, 'Updated User');
});

test('profile update falls back to agency user lookup when current user id is not the agency user id', async () => {
  const queue = queuedFetch([
    response(null, { status: 204 }),
    response({ message: 'Resource not found.' }, { status: 404 }),
    response({ data: [{ id: 42, email: 'user@mosaiq.test', name: 'Old User' }] }),
    response(null, { status: 204 }),
    response({ data: { id: 42, name: 'Updated User' } }),
  ]);
  const api = createAuthApi({ ...options, fetchImpl: queue.fetchImpl, readCookie: () => 'token' });
  const result = await api.updateAgencyUser({ id: 7, email: 'user@mosaiq.test', membership: { agency_id: 3 } }, { name: 'Updated User' });

  assert.equal(queue.calls[1].url, 'https://api.mosaiq.test/api/v1/agencies/3/users/7');
  assert.equal(queue.calls[2].url, 'https://api.mosaiq.test/api/v1/agencies/3/users?search=user%40mosaiq.test&per_page=100');
  assert.equal(queue.calls[3].url, 'https://api.mosaiq.test/sanctum/csrf-cookie');
  assert.equal(queue.calls[4].url, 'https://api.mosaiq.test/api/v1/agencies/3/users/42');
  assert.equal(result.data.name, 'Updated User');
});

test('change password posts the current and confirmed new password', async () => {
  const queue = queuedFetch([
    response(null, { status: 204 }),
    response(null, { status: 204 }),
  ]);
  const api = createAuthApi({ ...options, fetchImpl: queue.fetchImpl, readCookie: () => 'token' });
  const result = await api.changePassword({
    current_password: 'OldPassword123',
    password: 'NewPassword123',
    password_confirmation: 'NewPassword123',
  });

  assert.equal(result, null);
  assert.equal(queue.calls[0].url, 'https://api.mosaiq.test/sanctum/csrf-cookie');
  assert.equal(queue.calls[1].url, 'https://api.mosaiq.test/api/v1/auth/change-password');
  assert.equal(queue.calls[1].options.method, 'POST');
  assert.deepEqual(JSON.parse(queue.calls[1].options.body), {
    current_password: 'OldPassword123',
    password: 'NewPassword123',
    password_confirmation: 'NewPassword123',
  });
});
