'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthShell from '../AuthShell';
import { useAuth } from '../AuthProvider';
import { ButtonProgress } from '../components/states';
import PasswordField from '../PasswordField';
import styles from '../auth.module.css';
import { isMockAuthEnabled } from '../../lib/api';
import { firstFieldErrors, safeInternalPath, validateEmail, validatePassword } from '../../lib/validation';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});

  async function submit(event) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const validation = {
      email: validateEmail(email),
      password: validatePassword(password, { login: true }),
    };
    setFields(validation);
    if (Object.values(validation).some(Boolean)) return;

    setBusy(true);
    try {
      await signIn(email, password);
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(safeInternalPath(next));
    } catch (requestError) {
      if (requestError.status === 403 || requestError.code === 'ACCESS_DENIED') {
        router.replace('/access-denied');
        return;
      }
      setError(requestError.message);
      setFields(firstFieldErrors(requestError));
    } finally {
      setBusy(false);
    }
  }

  return <AuthShell>
    <h1 className={styles.title}>Welcome back</h1>
    <p className={styles.subtitle}>Sign in to continue to your MOSAIQ workspace.</p>
    <form className={styles.form} onSubmit={submit} noValidate aria-busy={busy}>
      {isMockAuthEnabled && <div className={styles.notice}>Mock mode: use <strong>success@mosaiq.test</strong> and <strong>MosaiqDemo123</strong>.</div>}
      {error && <div className={styles.error} role="alert">{error}</div>}
      <div className={styles.field}>
        <label htmlFor="email">Email address</label>
        <input className={styles.input} id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" aria-invalid={Boolean(fields.email)} aria-describedby={fields.email ? 'email-help' : undefined} required/>
        {fields.email && <p className={styles.error} id="email-help" role="alert">{fields.email}</p>}
      </div>
      <PasswordField id="password" name="password" label="Password" error={fields.password}/>
      <div className={styles.row}><label className={styles.check}><input type="checkbox" name="remember"/>Remember me</label><Link className={styles.link} href="/forgot-password">Forgot password?</Link></div>
      <button className={styles.button} type="submit" disabled={busy}>{busy ? <ButtonProgress label="Signing in…"/> : 'Sign in'}</button>
    </form>
  </AuthShell>;
}
