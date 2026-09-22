'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthShell from './AuthShell';
import { useAuth } from './AuthProvider';
import { ButtonProgress } from './components/states';
import PasswordField from './PasswordField';
import styles from './auth.module.css';
import { authApi } from '../lib/api';
import { passwordChecks, userFriendlyFieldErrors, validatePassword } from '../lib/validation';

function expiryLabel(value) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not provided';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function InvitationPage({ token }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const [checks, setChecks] = useState(passwordChecks(''));

  useEffect(() => {
    if (!token) {
      router.replace('/invite-invalid');
      return undefined;
    }

    let live = true;
    authApi.inspectInvitation(token)
      .then((result) => { if (live) setInvite(result.data); })
      .catch((requestError) => {
        if (requestError.status === 404) router.replace('/invite-invalid');
        else if (live) setError(requestError.message);
      })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [router, token]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') || '');
    const confirmation = String(form.get('confirmation') || '');
    const validation = invite.requires_existing_login
      ? { password: validatePassword(password, { login: true }) }
      : {
          name: String(form.get('name') || '').trim() ? '' : 'Full name is required.',
          password: validatePassword(password),
          confirmation: password === confirmation ? '' : 'Passwords do not match.',
        };
    setFields(validation);
    if (Object.values(validation).some(Boolean)) return;

    setBusy(true);
    try {
      if (invite.requires_existing_login) {
        await signIn(invite.email, password);
        await authApi.acceptInvitation({ token });
        router.replace('/');
      } else {
        await authApi.acceptInvitation({
          token,
          name: String(form.get('name')).trim(),
          password,
          password_confirmation: confirmation,
        });
        router.replace('/login?invitation=accepted');
      }
    } catch (requestError) {
      setError(requestError.message);
      setFields(userFriendlyFieldErrors(requestError));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <AuthShell title="A clearer view of marketing starts here." eyebrow="Workspace invitation"><div className={styles.center} role="status" aria-live="polite" aria-busy="true"><div className={styles.spinner} aria-hidden="true"/><h1 className={styles.title}>Checking your invitation</h1><p className={styles.subtitle}>We’re confirming the workspace and access assigned to you.</p></div></AuthShell>;
  }

  if (!invite) {
    return <AuthShell><div className={styles.icon}>!</div><h1 className={styles.title}>We couldn’t check this invitation</h1><p className={styles.subtitle}>{error}</p><button className={styles.button} onClick={() => location.reload()}>Try again</button></AuthShell>;
  }

  const passwordHint = `${checks.length ? '✓' : '○'} 8+ characters  ${checks.letter ? '✓' : '○'} letter  ${checks.number ? '✓' : '○'} number`;
  return <AuthShell title="Join the team turning marketing data into confident decisions." eyebrow="You're invited">
    <h1 className={styles.title}>{invite.requires_existing_login ? 'Sign in to accept' : 'Set up your account'}</h1>
    <p className={styles.subtitle}>{invite.requires_existing_login ? 'Use your existing MOSAIQ password to join this workspace.' : 'Create your credentials to join the workspace below.'}</p>
    <dl className={styles.meta} aria-label="Invitation details">
      <div className={styles.metaRow}><dt>Workspace</dt><dd>{invite.agency_name}</dd></div>
      <div className={styles.metaRow}><dt>Email</dt><dd>{invite.email}</dd></div>
      <div className={styles.metaRow}><dt>Role</dt><dd>{invite.role_code.replaceAll('_', ' ')}</dd></div>
      <div className={styles.metaRow}><dt>Expires</dt><dd>{expiryLabel(invite.expires_at)}</dd></div>
    </dl>
    <form className={styles.form} onSubmit={submit} noValidate aria-busy={busy}>
      {error && <div className={styles.error} role="alert">{error}</div>}
      {!invite.requires_existing_login && <div className={styles.field}><label htmlFor="name">Full name</label><input className={styles.input} id="name" name="name" placeholder="Your full name" autoComplete="name" aria-invalid={Boolean(fields.name)} aria-describedby={fields.name ? 'invite-name-help' : undefined} required/>{fields.name && <p className={styles.error} id="invite-name-help" role="alert">{fields.name}</p>}</div>}
      <PasswordField id="invite-password" name="password" label={invite.requires_existing_login ? 'Your password' : 'Create password'} autoComplete={invite.requires_existing_login ? 'current-password' : 'new-password'} minLength={invite.requires_existing_login ? undefined : 8} error={fields.password} hint={invite.requires_existing_login ? undefined : passwordHint} onChange={invite.requires_existing_login ? undefined : (event) => setChecks(passwordChecks(event.target.value))}/>
      {!invite.requires_existing_login && <PasswordField id="invite-confirmation" name="confirmation" label="Confirm password" autoComplete="new-password" minLength={8} error={fields.confirmation}/>}
      <button className={styles.button} type="submit" disabled={busy}>{busy ? <ButtonProgress label="Accepting invitation..."/> : 'Accept invitation'}</button>
      <Link className={styles.back} href="/login">Cancel and return to sign in</Link>
    </form>
  </AuthShell>;
}
