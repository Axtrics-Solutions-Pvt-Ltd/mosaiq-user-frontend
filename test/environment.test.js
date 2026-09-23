import test from 'node:test';
import assert from 'node:assert/strict';
import { createPublicEnvironment } from '../lib/environment.js';

test('development mock mode uses explicit URLs and normalizes trailing slashes', () => {
  const environment = createPublicEnvironment({
    NODE_ENV: 'development',
    NEXT_PUBLIC_APP_ENV: 'development',
    NEXT_PUBLIC_USE_MOCK_API: 'true',
    NEXT_PUBLIC_API_URL: 'http://localhost:8000/api/v1/',
    NEXT_PUBLIC_LARAVEL_URL: 'http://localhost:8000/',
  });
  assert.deepEqual(environment, {
    appEnvironment: 'development',
    useMockApi: true,
    useLocalApiProxy: false,
    useApiProxy: false,
    apiUrl: 'http://localhost:8000/api/v1',
    laravelUrl: 'http://localhost:8000',
  });
});

test('local proxy mode gives the browser same-origin Laravel URLs', () => {
  const environment = createPublicEnvironment({
    NODE_ENV: 'development',
    NEXT_PUBLIC_USE_MOCK_API: 'false',
    NEXT_PUBLIC_USE_LOCAL_API_PROXY: 'true',
    NEXT_PUBLIC_API_URL: 'https://mosaiq.axtrics.com/api/v1',
  });
  assert.equal(environment.apiUrl, '/api/laravel/api/v1');
  assert.equal(environment.laravelUrl, '/api/laravel');
  assert.equal(environment.useLocalApiProxy, true);
  assert.equal(environment.useApiProxy, true);
});

test('proxy mode is supported in production to avoid browser CORS', () => {
  const environment = createPublicEnvironment({
    NEXT_PUBLIC_APP_ENV: 'production',
    NEXT_PUBLIC_USE_MOCK_API: 'false',
    NEXT_PUBLIC_USE_API_PROXY: 'true',
    NEXT_PUBLIC_API_URL: 'https://mosaiq.axtrics.com/api/v1',
  });
  assert.equal(environment.apiUrl, '/api/laravel/api/v1');
  assert.equal(environment.laravelUrl, '/api/laravel');
  assert.equal(environment.useApiProxy, true);
});

test('Laravel origin is inferred from a conventional versioned API URL', () => {
  const environment = createPublicEnvironment({
    NEXT_PUBLIC_APP_ENV: 'staging',
    NEXT_PUBLIC_USE_MOCK_API: 'false',
    NEXT_PUBLIC_API_URL: 'https://staging-api.mosaiq.test/api/v2',
  });
  assert.equal(environment.laravelUrl, 'https://staging-api.mosaiq.test');
});

test('staging and production reject insecure real API connections', () => {
  assert.throws(() => createPublicEnvironment({
    NEXT_PUBLIC_APP_ENV: 'staging',
    NEXT_PUBLIC_USE_MOCK_API: 'false',
    NEXT_PUBLIC_API_URL: 'http://staging.mosaiq.test/api/v1',
  }), /must use HTTPS/);
});

test('invalid flags, environments, and mismatched backend origins fail early', () => {
  assert.throws(() => createPublicEnvironment({ NEXT_PUBLIC_APP_ENV: 'preview' }), /NEXT_PUBLIC_APP_ENV/);
  assert.throws(() => createPublicEnvironment({ NEXT_PUBLIC_USE_MOCK_API: 'yes' }), /NEXT_PUBLIC_USE_MOCK_API/);
  assert.throws(() => createPublicEnvironment({
    NEXT_PUBLIC_API_URL: 'https://api.mosaiq.test/api/v1',
    NEXT_PUBLIC_LARAVEL_URL: 'https://different.mosaiq.test',
  }), /same backend origin/);
});
