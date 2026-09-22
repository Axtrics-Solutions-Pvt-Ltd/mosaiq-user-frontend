import test from 'node:test';
import assert from 'node:assert/strict';
import { firstFieldErrors } from '../lib/validation.js';

test('firstFieldErrors maps Laravel validation arrays to the first message', () => {
  const error = {
    fields: {
      email: ['The email field is required.', 'The email is invalid.'],
      password: ['The password is too short.'],
    },
  };
  assert.deepEqual(firstFieldErrors(error), {
    email: 'The email field is required.',
    password: 'The password is too short.',
  });
});

test('firstFieldErrors tolerates scalar and missing field payloads', () => {
  assert.deepEqual(firstFieldErrors({ fields: { email: 'Invalid email.' } }), { email: 'Invalid email.' });
  assert.deepEqual(firstFieldErrors(new Error('Server failed')), {});
  assert.deepEqual(firstFieldErrors(null), {});
});

