import test from 'node:test';
import assert from 'node:assert/strict';
import { isPublicAuthRoute, protectedRouteRedirect } from '../lib/auth-routing.js';
import { safeInternalPath } from '../lib/validation.js';

const activeUser = {
  id: 1,
  platform_role_code: null,
  membership: { agency_id: 1, role_code: 'CLIENT_USER', client_id: 1, workspace_ids: [1] },
};

test('public authentication and invitation routes never redirect', () => {
  for (const pathname of ['/login', '/forgot-password', '/reset-password', '/invite-invalid', '/access-denied', '/accept-invitation', '/invite/demo-token']) {
    assert.equal(isPublicAuthRoute(pathname), true);
    assert.equal(protectedRouteRedirect({ pathname, status: 'unauthenticated', user: null }), null);
  }
  assert.equal(isPublicAuthRoute('/reporting'), false);
});

test('unauthenticated protected routes preserve path and query in next', () => {
  assert.equal(
    protectedRouteRedirect({ pathname: '/reporting', search: '?workspace=2&range=30d', status: 'unauthenticated', user: null }),
    '/login?next=%2Freporting%3Fworkspace%3D2%26range%3D30d',
  );
});

test('authenticated users without active membership are denied', () => {
  assert.equal(protectedRouteRedirect({ pathname: '/', status: 'authenticated', user: { id: 2, platform_role_code: null, membership: null } }), '/access-denied');
  assert.equal(protectedRouteRedirect({ pathname: '/', status: 'authenticated', user: activeUser }), null);
});

test('loading and recoverable session errors do not trigger redirects', () => {
  assert.equal(protectedRouteRedirect({ pathname: '/', status: 'loading', user: null }), null);
  assert.equal(protectedRouteRedirect({ pathname: '/', status: 'error', user: null }), null);
});

test('safeInternalPath accepts local routes and rejects redirect attacks', () => {
  assert.equal(safeInternalPath('/reporting?workspace=2#summary'), '/reporting?workspace=2#summary');
  assert.equal(safeInternalPath('https://attacker.test/path'), '/');
  assert.equal(safeInternalPath('//attacker.test/path'), '/');
  assert.equal(safeInternalPath('/safe\\attacker'), '/');
  assert.equal(safeInternalPath(null, '/login'), '/login');
});
