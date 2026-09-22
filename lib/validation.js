export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

export function validateEmail(value) {
  const email = String(value || '').trim();
  if (!email) return 'Email address is required.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  return '';
}

export function passwordChecks(value) {
  const password = String(value || '');
  return {
    length: password.length >= PASSWORD_MIN_LENGTH,
    letter: /[A-Za-z]/.test(password),
    number: /\d/.test(password),
  };
}

export function validatePassword(value, { login = false } = {}) {
  const password = String(value || '');
  if (!password) return 'Password is required.';
  if (login) return '';
  const checks = passwordChecks(password);
  if (!checks.length) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (!checks.letter) return 'Include at least one letter.';
  if (!checks.number) return 'Include at least one number.';
  return '';
}

export function safeInternalPath(value, fallback = '/') {
  if (!value || typeof value !== 'string') return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  try {
    const parsed = new URL(value, 'https://mosaiq.local');
    return parsed.origin === 'https://mosaiq.local' ? `${parsed.pathname}${parsed.search}${parsed.hash}` : fallback;
  } catch {
    return fallback;
  }
}

export function firstFieldErrors(error) {
  return Object.fromEntries(
    Object.entries(error?.fields || {}).map(([field, messages]) => [field, Array.isArray(messages) ? messages[0] : String(messages)])
  );
}

export function userFriendlyFieldErrors(error) {
  const fields = firstFieldErrors(error);
  if (fields.password) {
    fields.password = `Password must include at least ${PASSWORD_MIN_LENGTH} characters, one letter, and one number.`;
  }
  if (fields.password_confirmation) {
    fields.password_confirmation = 'Passwords do not match.';
  }
  return fields;
}
