const ENVIRONMENTS = new Set(['development', 'staging', 'production', 'test']);
const DEFAULT_API_URL = 'https://mosaiq.axtrics.com/api/v1';

function booleanValue(value, name, fallback = false) {
  if (value == null || value === '') return fallback;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  throw new Error(`${name} must be either "true" or "false".`);
}

function normalizedUrl(value, name) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(`${name} must use HTTP or HTTPS.`);
  if (parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error(`${name} cannot contain credentials, a query string, or a fragment.`);
  return parsed.toString().replace(/\/$/, '');
}

function inferLaravelUrl(apiUrl) {
  const parsed = new URL(apiUrl);
  parsed.pathname = parsed.pathname.replace(/\/api\/v\d+\/?$/, '') || '/';
  return parsed.toString().replace(/\/$/, '');
}

export function createPublicEnvironment(source = {}) {
  const appEnvironment = source.NEXT_PUBLIC_APP_ENV || (source.NODE_ENV === 'production' ? 'production' : 'development');
  if (!ENVIRONMENTS.has(appEnvironment)) throw new Error('NEXT_PUBLIC_APP_ENV must be development, staging, production, or test.');

  const useMockApi = booleanValue(source.NEXT_PUBLIC_USE_MOCK_API, 'NEXT_PUBLIC_USE_MOCK_API');
  const useLocalApiProxy = booleanValue(source.NEXT_PUBLIC_USE_LOCAL_API_PROXY, 'NEXT_PUBLIC_USE_LOCAL_API_PROXY');
  const directApiUrl = normalizedUrl(source.NEXT_PUBLIC_API_URL || DEFAULT_API_URL, 'NEXT_PUBLIC_API_URL');
  const directLaravelUrl = normalizedUrl(source.NEXT_PUBLIC_LARAVEL_URL || inferLaravelUrl(directApiUrl), 'NEXT_PUBLIC_LARAVEL_URL');
  const api = new URL(directApiUrl);
  const laravel = new URL(directLaravelUrl);

  if (api.origin !== laravel.origin) throw new Error('NEXT_PUBLIC_API_URL and NEXT_PUBLIC_LARAVEL_URL must use the same backend origin.');
  if (!useMockApi && ['staging', 'production'].includes(appEnvironment) && (api.protocol !== 'https:' || laravel.protocol !== 'https:')) {
    throw new Error('Staging and production Laravel connections must use HTTPS.');
  }
  if (useLocalApiProxy && appEnvironment !== 'development' && appEnvironment !== 'test') {
    throw new Error('NEXT_PUBLIC_USE_LOCAL_API_PROXY is only supported in development and test.');
  }

  return Object.freeze({
    appEnvironment,
    useMockApi,
    useLocalApiProxy,
    apiUrl: useLocalApiProxy ? '/api/laravel/api/v1' : directApiUrl,
    laravelUrl: useLocalApiProxy ? '/api/laravel' : directLaravelUrl,
  });
}

export const publicEnvironment = createPublicEnvironment({
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
  NEXT_PUBLIC_USE_LOCAL_API_PROXY: process.env.NEXT_PUBLIC_USE_LOCAL_API_PROXY,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_LARAVEL_URL: process.env.NEXT_PUBLIC_LARAVEL_URL,
  NODE_ENV: process.env.NODE_ENV,
});
