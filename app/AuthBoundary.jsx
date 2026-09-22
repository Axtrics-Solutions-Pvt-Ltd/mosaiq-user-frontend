'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { hasActiveAccess } from '../lib/access';
import { isPublicAuthRoute, protectedRouteRedirect } from '../lib/auth-routing';
import { ApiErrorState, FullPageLoader } from './components/states';

export default function AuthBoundary({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user, refresh } = useAuth();
  const isPublic = isPublicAuthRoute(pathname);

  useEffect(() => {
    const redirect = protectedRouteRedirect({
      pathname: window.location.pathname,
      search: window.location.search,
      status,
      user,
    });
    if (redirect) router.replace(redirect);
  }, [isPublic, pathname, router, status, user]);

  if (isPublic) return children;
  if (status === 'loading' || status === 'unauthenticated') return <FullPageLoader title="Opening your workspace" message="We’re confirming your secure MOSAIQ session."/>;
  if (status === 'error') return <ApiErrorState title="We couldn’t verify your session" message="Check your connection and try again. Your dashboard data has not been changed." onRetry={refresh}/>;
  if (!hasActiveAccess(user)) return <FullPageLoader title="Checking access" message="We’re confirming your workspace permissions."/>;
  return children;
}