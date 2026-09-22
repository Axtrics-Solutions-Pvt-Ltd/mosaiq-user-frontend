import Link from 'next/link';
import AuthShell from '../AuthShell';
import { PermissionDeniedState } from '../components/states';
import styles from '../auth.module.css';

export default function InvalidInvite() {
  return (
    <AuthShell title="Your MOSAIQ workspace is one valid invite away." eyebrow="Invitation help">
      <PermissionDeniedState
        title="Invitation unavailable"
        message="This invitation may have expired, been revoked, already been accepted, or the link may be incomplete."
        compact
      />
      <div className={`${styles.form} ${styles.stateActionGroup}`}>
        <Link className={styles.button} href="/login">Go to sign in</Link>
        <p className={styles.helper}>Ask your agency administrator to send a new invitation if you still need access.</p>
      </div>
    </AuthShell>
  );
}