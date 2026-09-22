import './globals.css';
import { AuthProvider } from './AuthProvider';
import AuthBoundary from './AuthBoundary';
import { NetworkStatusBanner } from './components/states';

export const metadata = {
  title: 'MOSAIQ',
  description: 'MOSAIQ user frontend'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body><AuthProvider><NetworkStatusBanner/><AuthBoundary>{children}</AuthBoundary></AuthProvider></body>
    </html>
  );
}
