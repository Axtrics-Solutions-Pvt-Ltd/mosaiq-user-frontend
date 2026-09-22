import test from 'node:test';
import assert from 'node:assert/strict';
import {
  passwordChecks,
  validateEmail,
  validatePassword,
} from '../lib/validation.js';

test('validateEmail handles required, malformed, and trimmed valid values', () => {
  assert.equal(validateEmail(''), 'Email address is required.');
  assert.equal(validateEmail('not-an-email'), 'Enter a valid email address.');
  assert.equal(validateEmail('  person@mosaiq.test  '), '');
});

test('passwordChecks reports every password requirement independently', () => {
  assert.deepEqual(passwordChecks('short'), { length: false, letter: true, number: false });
  assert.deepEqual(passwordChecks('12345678'), { length: true, letter: false, number: true });
  assert.deepEqual(passwordChecks('Mosaiq1'), { length: false, letter: true, number: true });
  assert.deepEqual(passwordChecks('Mosaiq12'), { length: true, letter: true, number: true });
});

test('validatePassword enforces setup complexity but permits legacy login passwords', () => {
  assert.equal(validatePassword(''), 'Password is required.');
  assert.equal(validatePassword('short'), 'Use at least 8 characters.');
  assert.equal(validatePassword('12345678'), 'Include at least one letter.');
  assert.equal(validatePassword('abcdefgh'), 'Include at least one number.');
  assert.equal(validatePassword('short', { login: true }), '');
  assert.equal(validatePassword('Mosaiq12'), '');
});
