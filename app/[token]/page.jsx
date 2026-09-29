import { notFound } from 'next/navigation';
import PublicReportPortal from '../PublicReportPortal';

const TOKEN_PATTERN = /^[a-f0-9]{32}$/;

export const metadata = {
  title: 'MOSAIQ Public Report',
  description: 'Public MOSAIQ client report portal',
};

export default function TokenReportPage({ params }) {
  const token = String(params?.token || '');
  if (!TOKEN_PATTERN.test(token)) notFound();
  return <PublicReportPortal token={token} />;
}
