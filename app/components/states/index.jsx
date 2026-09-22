'use client';

import { useEffect, useState } from 'react';
import styles from './states.module.css';

function StateView({ title, message, icon, tone = 'default', actionLabel, onAction, secondaryLabel, onSecondary, compact = false, role = 'status', headingLevel = 'h2' }) {
  const iconClass = tone === 'danger' ? styles.dangerIcon : tone === 'success' ? styles.successIcon : tone === 'warning' ? styles.warningIcon : '';
  const Heading = headingLevel;
  const body = <div className={compact ? styles.compact : styles.panel} role={role} aria-live={role === 'alert' ? 'assertive' : 'polite'}>
    <div className={`${styles.icon} ${iconClass}`} aria-hidden="true">{icon}</div>
    <Heading className={styles.title}>{title}</Heading>
    {message && <p className={styles.message}>{message}</p>}
    {(actionLabel || secondaryLabel) && <div className={styles.actions}>
      {actionLabel && <button className={styles.primary} type="button" onClick={onAction}>{actionLabel}</button>}
      {secondaryLabel && <button className={styles.secondary} type="button" onClick={onSecondary}>{secondaryLabel}</button>}
    </div>}
  </div>;
  return compact ? body : <main className={styles.fullPage}>{body}</main>;
}

export function FullPageLoader({ title = 'Loading', message = 'Please wait while we prepare this page.' }) {
  return <main className={styles.fullPage} aria-busy="true" aria-live="polite"><div className={styles.panel}><span className={styles.spinner} aria-hidden="true"/><h1 className={styles.title}>{title}</h1><p className={styles.message}>{message}</p></div></main>;
}

export function InlineLoader({ label = 'Loading…' }) {
  return <span className={styles.inline} role="status"><span className={styles.spinner} aria-hidden="true"/><span>{label}</span></span>;
}

export function ButtonProgress({ label = 'Working…' }) {
  return <span className={styles.buttonProgress}><span className={styles.spinner} aria-hidden="true"/><span>{label}</span></span>;
}

export function EmptyState({ title = 'Nothing here yet', message = 'There is no data to display.', actionLabel, onAction, compact = false }) {
  return <StateView title={title} message={message} icon="○" actionLabel={actionLabel} onAction={onAction} compact={compact}/>;
}

export function ApiErrorState({ title = 'We couldn’t load this data', message = 'Something went wrong while contacting the server.', onRetry, retryLabel = 'Try again', compact = false }) {
  return <StateView title={title} message={message} icon="!" tone="danger" actionLabel={onRetry ? retryLabel : undefined} onAction={onRetry} compact={compact} role="alert"/>;
}

export function PermissionDeniedState({ title = 'You don’t have access', message = 'Your account does not have permission to view this content.', actionLabel, onAction, compact = false, headingLevel = 'h2' }) {
  return <StateView title={title} message={message} icon="×" tone="warning" actionLabel={actionLabel} onAction={onAction} compact={compact} role="alert" headingLevel={headingLevel}/>;
}

export function OfflineState({ onRetry, compact = false }) {
  return <StateView title="You’re offline" message="Reconnect to the internet, then try again. Any unsent changes remain on this device." icon="↯" tone="warning" actionLabel={onRetry ? 'Try again' : undefined} onAction={onRetry} compact={compact} role="alert"/>;
}

export function SuccessState({ title = 'Completed successfully', message, actionLabel, onAction, compact = false }) {
  return <StateView title={title} message={message} icon="✓" tone="success" actionLabel={actionLabel} onAction={onAction} compact={compact}/>;
}

export function NetworkStatusBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  if (!offline) return null;
  return <div className={styles.banner} role="alert">↯ You’re offline. Some MOSAIQ data may be unavailable.</div>;
}

export function CardSkeleton({ count = 3 }) {
  return <div className={styles.skeletonGrid} style={{ '--columns': Math.min(count, 4) }} aria-hidden="true">{Array.from({ length: count }, (_, index) => <div className={styles.skeletonCard} key={index}><div className={`${styles.skeletonLine} ${styles.short}`}/><div className={`${styles.skeletonLine} ${styles.medium}`}/><div className={styles.skeletonBlock}/></div>)}</div>;
}

export function TableSkeleton({ rows = 5, columns = 4, label = 'Loading table data' }) {
  return <div className={styles.tableSkeleton} aria-busy="true"><span className={styles.srOnly}>{label}</span>{Array.from({ length: rows + 1 }, (_, row) => <div className={styles.tableRow} style={{ '--columns': columns }} key={row} aria-hidden="true">{Array.from({ length: columns }, (_, column) => <div className={styles.tableCell} key={column}/>)}</div>)}</div>;
}
