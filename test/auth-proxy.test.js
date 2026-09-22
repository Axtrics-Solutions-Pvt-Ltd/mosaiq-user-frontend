import test from 'node:test';
import assert from 'node:assert/strict';
import {
  forwardedCookies,
  localDevelopmentCookie,
  normalizedProxyPath,
  splitSetCookieHeader,
} from '../lib/auth-proxy.js';

test('authentication proxy only permits its explicit endpoint allowlist', () => {
  assert.equal(normalizedProxyPath(['api', 'v1', 'auth', 'login']), 'api/v1/auth/login');
  assert.equal(normalizedProxyPath(['api', 'v1', 'auth', 'workspaces']), 'api/v1/auth/workspaces');
  assert.equal(normalizedProxyPath(['api', 'v1', 'auth', 'change-password']), 'api/v1/auth/change-password');
  assert.equal(normalizedProxyPath(['api', 'v1', 'agencies', '3', 'users']), 'api/v1/agencies/3/users');
  assert.equal(normalizedProxyPath(['api', 'v1', 'agencies', '3', 'users', '7']), 'api/v1/agencies/3/users/7');
  assert.throws(() => normalizedProxyPath(['api', 'v1', 'users']), /PROXY_PATH_NOT_ALLOWED/);
  assert.throws(() => normalizedProxyPath(['api', 'v1', 'agencies', '1', 'workspaces']), /PROXY_PATH_NOT_ALLOWED/);
});

test('only Sanctum cookies are forwarded upstream', () => {
  assert.equal(
    forwardedCookies('theme=dark; XSRF-TOKEN=abc; mosaiq-session=xyz; analytics=123'),
    'XSRF-TOKEN=abc; mosaiq-session=xyz',
  );
});

test('upstream cookies are made usable by localhost HTTP development', () => {
  assert.equal(
    localDevelopmentCookie('XSRF-TOKEN=abc; Path=/; Domain=mosaiq.axtrics.com; Secure; SameSite=Lax'),
    'XSRF-TOKEN=abc; Path=/; SameSite=Lax',
  );
});

test('combined Set-Cookie values are separated without splitting Expires dates', () => {
  const cookies = splitSetCookieHeader('first=a; Expires=Wed, 21 Oct 2026 07:28:00 GMT; Path=/, second=b; Path=/');
  assert.equal(cookies.length, 2);
  assert.match(cookies[0], /Expires=Wed, 21 Oct/);
  assert.match(cookies[1], /^second=b/);
});
