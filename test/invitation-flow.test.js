import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { mockAuthApi, mockAuthCredentials } from '../lib/mock-auth.js';

class MemoryStorage {
  #values = new Map();
  getItem(key) { return this.#values.has(key) ? this.#values.get(key) : null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
  clear() { this.#values.clear(); }
}

globalThis.window = { localStorage: new MemoryStorage() };

beforeEach(() => window.localStorage.clear());

test('new-user and existing-user invitations expose their intended modes', async () => {
  const newUser = await mockAuthApi.inspectInvitation('new-user-demo');
  const existingUser = await mockAuthApi.inspectInvitation('existing-user-demo');
  assert.equal(newUser.data.requires_existing_login, false);
  assert.equal(newUser.data.email, 'new.user@mosaiq.test');
  assert.equal(existingUser.data.requires_existing_login, true);
  assert.equal(existingUser.data.email, 'existing@mosaiq.test');
});

test('expired and server-error invitations return stable error codes', async () => {
  await assert.rejects(
    () => mockAuthApi.inspectInvitation('expired-demo'),
    (error) => error.status === 404 && error.code === 'INVITATION_NOT_FOUND',
  );
  await assert.rejects(
    () => mockAuthApi.inspectInvitation('server-error-demo'),
    (error) => error.status === 500 && error.code === 'SERVER_ERROR',
  );
});

test('existing-user invitation requires the invited signed-in account', async () => {
  await assert.rejects(
    () => mockAuthApi.acceptInvitation({ token: 'existing-user-demo' }),
    (error) => error.status === 401 && error.code === 'LOGIN_REQUIRED',
  );
  await mockAuthApi.login('existing@mosaiq.test', mockAuthCredentials.password);
  assert.equal(await mockAuthApi.acceptInvitation({ token: 'existing-user-demo' }), null);
});

test('new-user invitation can be accepted without creating an implicit session', async () => {
  assert.equal(await mockAuthApi.acceptInvitation({
    token: 'new-user-demo',
    name: 'New MOSAIQ User',
    password: mockAuthCredentials.password,
    password_confirmation: mockAuthCredentials.password,
  }), null);
  assert.equal(window.localStorage.getItem('mosaiq.mock.session'), null);
  const login = await mockAuthApi.login('new.user@mosaiq.test', mockAuthCredentials.password);
  assert.equal(login.data.name, 'New MOSAIQ User');
});

test('invitation decline completes for valid invitations and rejects unavailable tokens in mock mode', async () => {
  assert.equal(await mockAuthApi.rejectInvitation({ token: 'new-user-demo' }), null);
  await assert.rejects(
    () => mockAuthApi.rejectInvitation({ token: 'expired-demo' }),
    (error) => error.status === 404 && error.code === 'INVITATION_NOT_FOUND',
  );
});
