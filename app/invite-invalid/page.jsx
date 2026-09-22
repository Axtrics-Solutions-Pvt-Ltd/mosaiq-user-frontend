import Link from 'next/link';
import AuthShell from '../AuthShell';
import styles from '../auth.module.css';

export default function InvalidInvite(){return <AuthShell title="Your MOSAIQ workspace is one valid invite away." eyebrow="Invitation help"><div className={styles.icon}>×</div><h1 className={styles.title}>Invitation unavailable</h1><p className={styles.subtitle}>This invitation may have expired, been revoked, already been accepted, or the link may be incomplete.</p><div className={styles.form}><Link className={styles.button} href="/login">Go to sign in</Link><p className={styles.helper}>Ask your agency administrator to send a new invitation if you still need access.</p></div></AuthShell>}
