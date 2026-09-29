import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiRequestError } from '../lib/api.js';
import { createPublicReportApi } from '../lib/public-report-api.js';

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
  timeoutMs: 100,
};

test('public report metadata uses the public endpoint without credentials', async () => {
  const queue = queuedFetch([response({ data: { requires_password: false } })]);
  const api = createPublicReportApi({ ...options, fetchImpl: queue.fetchImpl });
  const result = await api.getReport('d38e87426008cac9d37b06c15551604e');

  assert.equal(result.data.requires_password, false);
  assert.equal(queue.calls[0].url, 'https://api.mosaiq.test/api/v1/public/reports/d38e87426008cac9d37b06c15551604e');
  assert.equal(queue.calls[0].options.credentials, undefined);
  assert.equal(queue.calls[0].options.headers.Accept, 'application/json');
});

test('unlock posts the password and tab requests include bearer token and filters', async () => {
  const queue = queuedFetch([
    response({ data: { access_token: 'public-access' } }),
    response({ data: { tab: 'executive_summary', widgets: [] } }),
  ]);
  const api = createPublicReportApi({ ...options, fetchImpl: queue.fetchImpl });

  await api.unlockReport('d38e87426008cac9d37b06c15551604e', 'secret');
  await api.getTab('d38e87426008cac9d37b06c15551604e', 'executive_summary', {
    from: '2026-08-25',
    to: '2026-09-23',
    channel: 'meta_ads',
    accessToken: 'public-access',
  });

  assert.equal(queue.calls[0].url, 'https://api.mosaiq.test/api/v1/public/reports/d38e87426008cac9d37b06c15551604e/unlock');
  assert.equal(queue.calls[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(queue.calls[0].options.body), { password: 'secret' });
  assert.equal(queue.calls[1].url, 'https://api.mosaiq.test/api/v1/public/reports/d38e87426008cac9d37b06c15551604e/tabs/executive_summary?from=2026-08-25&to=2026-09-23&channel=meta_ads');
  assert.equal(queue.calls[1].options.headers.Authorization, 'Bearer public-access');
});

test('public report errors preserve backend code and request id', async () => {
  const queue = queuedFetch([response({
    message: 'This link has expired.',
    error_code: 'LINK_EXPIRED',
    request_id: 'req-123',
  }, { status: 410 })]);
  const api = createPublicReportApi({ ...options, fetchImpl: queue.fetchImpl });

  await assert.rejects(() => api.getReport('d38e87426008cac9d37b06c15551604e'), (error) => {
    assert.ok(error instanceof ApiRequestError);
    assert.equal(error.status, 410);
    assert.equal(error.code, 'LINK_EXPIRED');
    assert.equal(error.requestId, 'req-123');
    return true;
  });
});
