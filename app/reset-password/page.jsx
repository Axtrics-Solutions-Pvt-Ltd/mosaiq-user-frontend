'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthShell from '../AuthShell';
import { ApiErrorState, ButtonProgress, SuccessState } from '../components/states';
import PasswordField from '../PasswordField';
import styles from '../auth.module.css';
import { authApi, isMockAuthEnabled } from '../../lib/api';
import { firstFieldErrors, passwordChecks, validateEmail, validatePassword } from '../../lib/validation';

function resetLinkParams() {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return {
    email: queryParams.get('email') || hashParams.get('email') || '',
    token: queryParams.get('token') || hashParams.get('token') || '',
  };
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function resetPasswordMessage(error) {
  const fieldErrors = firstFieldErrors(error);
  if (fieldErrors.token) return 'This reset link is invalid or expired. Please request a new password reset link.';
  if (fieldErrors.email) return fieldErrors.email;
  return error.message;
}

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [linkEmail, setLinkEmail] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const [requestError, setRequestError] = useState('');
  const [fields, setFields] = useState({});
  const [checks, setChecks] = useState(passwordChecks(''));

  useEffect(() => {
    const params = resetLinkParams();
    setEmail(params.email);
    setLinkEmail(params.email);
    setToken(params.token);
  }, []);

  async function submit(event) {
    event.preventDefault();
    setSuccess('');
    setRequestError('');
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') || '');
    const confirmation = String(data.get('confirmation') || '');
    const validation = {
      email: validateEmail(email),
      token: token ? '' : 'This reset link is invalid or expired. Please request a new password reset link.',
      password: validatePassword(password),
      confirmation: password === confirmation ? '' : 'Passwords do not match.',
    };
    if (!validation.email && linkEmail && normalizeEmail(email) !== normalizeEmail(linkEmail)) {
      validation.email = 'Use the email address from your password reset link.';
    }
    setFields(validation);
    if (Object.values(validation).some(Boolean)) return;
    setBusy(true);
    try {
      const result = await authApi.resetPassword({ token, email, password, password_confirmation: confirmation });
      setSuccess(result?.message || 'Your password has been reset successfully.');
    } catch (error) {
      setRequestError(resetPasswordMessage(error));
      setFields((current) => ({ ...current, ...firstFieldErrors(error) }));
    } finally {
      setBusy(false);
    }
  }

  const passwordHint = `${checks.length ? '✓' : '○'} 8+ characters  ${checks.letter ? '✓' : '○'} letter  ${checks.number ? '✓' : '○'} number`;
  return <AuthShell title="A secure reset. A quick return to insight." eyebrow="Account security">
    <Link className={styles.back} href="/login">← Back to sign in</Link>
    <h1 className={styles.title}>Create a new password</h1>
    <p className={styles.subtitle}>Choose a secure password with at least 8 characters, one letter, and one number.</p>
    <form className={styles.form} onSubmit={submit} noValidate aria-busy={busy}>
      {isMockAuthEnabled && <div className={styles.notice}>Use token <strong>expired-demo</strong> or <strong>server-error-demo</strong> in the URL to test failures.</div>}
      {success && <SuccessState compact title="Password updated" message={success}/>} 
      {requestError && <ApiErrorState compact title="Password reset failed" message={requestError}/>} 
      <div className={styles.field}>
        <label htmlFor="email">Email address</label>
        <input className={styles.input} id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" readOnly={Boolean(linkEmail)} aria-invalid={Boolean(fields.email)} aria-describedby={fields.email ? 'reset-email-help' : undefined} required/>
        {fields.email && <p className={styles.error} id="reset-email-help" role="alert">{fields.email}</p>}
      </div>
      {fields.token && <div className={styles.error} role="alert">{fields.token}</div>}
      <PasswordField id="new-password" name="password" label="New password" autoComplete="new-password" minLength={8} error={fields.password} hint={passwordHint} onChange={(event) => setChecks(passwordChecks(event.target.value))}/>
      <PasswordField id="confirmation" name="confirmation" label="Confirm new password" autoComplete="new-password" minLength={8} error={fields.confirmation}/>
      <button className={styles.button} type="submit" disabled={busy}>{busy ? <ButtonProgress label="Resetting…"/> : 'Reset password'}</button>
    </form>
  </AuthShell>;
}
