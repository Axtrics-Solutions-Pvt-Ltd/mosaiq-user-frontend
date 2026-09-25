import { hasActiveAccess } from './access.js';

export const PUBLIC_AUTH_ROUTES = Object.freeze([
  '/login',
  '/forgot-password',
  '/reset-password',
  '/invite-invalid',
  '/access-denied',
  '/accept-invitation',
]);

export function isPublicPortalRoute(pathname = '') {
  return pathname === '/' || pathname.startsWith('/userPortal/');
}

export function isPublicAuthRoute(pathname = '') {
  return PUBLIC_AUTH_ROUTES.includes(pathname) || pathname.startsWith('/invite/') || isPublicPortalRoute(pathname);
}

export function protectedRouteRedirect({ pathname = '/', search = '', status, user }) {
  if (isPublicAuthRoute(pathname) || status === 'loading' || status === 'error') return null;
  if (status === 'unauthenticated') {
    const returnPath = `${pathname}${search}`;
    return `/login?next=${encodeURIComponent(returnPath)}`;
  }
  if (status === 'authenticated' && !hasActiveAccess(user)) return '/access-denied';
  return null;
}
