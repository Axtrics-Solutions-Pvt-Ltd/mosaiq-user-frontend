'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import InvitationPage from '../InvitationPage';

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  return <InvitationPage token={searchParams.get('token') || ''} />;
}

export default function AcceptInvitationRoute() {
  return <Suspense fallback={null}><AcceptInvitationContent /></Suspense>;
}
