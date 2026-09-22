const ALLOWED_PATHS = new Set([
  'sanctum/csrf-cookie',
  'api/v1/auth/login',
  'api/v1/auth/me',
  'api/v1/auth/logout',
  'api/v1/auth/forgot-password',
  'api/v1/auth/reset-password',
  'api/v1/invitations/inspect',
  'api/v1/invitations/accept',
]);

export function normalizedProxyPath(parts = []) {
  const path = parts.map((part) => decodeURIComponent(String(part))).join('/');
  if (!ALLOWED_PATHS.has(path)) throw new Error('PROXY_PATH_NOT_ALLOWED');
  return path;
}

export function forwardedCookies(cookieHeader = '', sessionCookieName = 'mosaiq-session') {
  const allowed = new Set(['XSRF-TOKEN', sessionCookieName]);
  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter((cookie) => allowed.has(cookie.split('=', 1)[0]))
    .join('; ');
}

export function splitSetCookieHeader(value = '') {
  if (!value) return [];
  return value.split(/,(?=\s*[^;,=\s]+=[^;,]*)/g).map((cookie) => cookie.trim()).filter(Boolean);
}

export function localDevelopmentCookie(cookie) {
  return cookie
    .replace(/;\s*Domain=[^;]+/gi, '')
    .replace(/;\s*Secure\b/gi, '');
}

export function upstreamSetCookies(headers) {
  const cookies = typeof headers.getSetCookie === 'function'
    ? headers.getSetCookie()
    : splitSetCookieHeader(headers.get('set-cookie'));
  return cookies.map(localDevelopmentCookie);
}
