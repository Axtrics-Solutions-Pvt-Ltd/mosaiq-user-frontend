'use client';

import { useRouter } from 'next/navigation';
import AuthShell from '../AuthShell';
import { PermissionDeniedState } from '../components/states';

export default function AccessDenied() {
  const router = useRouter();
  return <AuthShell title="The right insight, for the right workspace." eyebrow="Protected workspace">
    <PermissionDeniedState
      compact
      headingLevel="h1"
      title="You don’t have access"
      message="Your account is valid, but it doesn’t currently have an active MOSAIQ workspace or permission for this page. Contact your agency administrator if you believe this is a mistake."
      actionLabel="Return to sign in"
      onAction={() => router.replace('/login')}
    />
  </AuthShell>;
}
