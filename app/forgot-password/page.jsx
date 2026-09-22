'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthShell from '../AuthShell';
import { ApiErrorState, ButtonProgress, SuccessState } from '../components/states';
import styles from '../auth.module.css';
import { authApi, isMockAuthEnabled } from '../../lib/api';
import { validateEmail } from '../../lib/validation';

export default function ForgotPassword() {
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const [requestError, setRequestError] = useState('');
  const [fieldError, setFieldError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setSuccess('');
    setRequestError('');
    const email = String(new FormData(event.currentTarget).get('email') || '').trim();
    const validation = validateEmail(email);
    setFieldError(validation);
    if (validation) return;
    setBusy(true);
    try {
      const result = await authApi.forgotPassword(email);
      setSuccess(result?.message || 'If an account exists, password reset instructions have been sent.');
    } catch (error) {
      setRequestError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return <AuthShell title="Turn complex data into a clear next move." eyebrow="Secure account recovery">
    <Link className={styles.back} href="/login">← Back to sign in</Link>
    <div className={styles.icon}>↗</div>
    <h1 className={styles.title}>Forgot your password?</h1>
    <p className={styles.subtitle}>Enter your work email and we’ll send password reset instructions.</p>
    <form className={styles.form} onSubmit={submit} noValidate aria-busy={busy}>
      {isMockAuthEnabled && <div className={styles.notice}>Use <strong>server-error@mosaiq.test</strong> to simulate a failed request.</div>}
      {success && <SuccessState compact title="Check your inbox" message={success}/>} 
      {requestError && <ApiErrorState compact title="Reset request failed" message={requestError}/>} 
      <div className={styles.field}>
        <label htmlFor="email">Email address</label>
        <input className={styles.input} id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" aria-invalid={Boolean(fieldError)} aria-describedby={fieldError ? 'forgot-email-help' : undefined} required/>
        {fieldError && <p className={styles.error} id="forgot-email-help" role="alert">{fieldError}</p>}
      </div>
      <button className={styles.button} type="submit" disabled={busy}>{busy ? <ButtonProgress label="Sending…"/> : 'Request reset link'}</button>
      <p className={styles.helper}>For security, we won’t reveal whether an account exists for this email.</p>
    </form>
  </AuthShell>;
}
