const SESSION_KEY = 'mosaiq.mock.session';
const PASSWORD = 'MosaiqDemo123';

const users = {
  'success@mosaiq.test': {
    id: 101,
    name: 'Morgan Lee',
    email: 'success@mosaiq.test',
    platform_role_code: null,
    membership: { agency_id: 1, role_code: 'CLIENT_USER', client_id: 1, workspace_ids: [1, 2] },
  },
  'existing@mosaiq.test': {
    id: 102,
    name: 'Alex Morgan',
    email: 'existing@mosaiq.test',
    platform_role_code: null,
    membership: { agency_id: 2, role_code: 'ANALYST', client_id: null, workspace_ids: [3] },
  },
};

const invitations = {
  'new-user-demo': {
    email: 'new.user@mosaiq.test',
    agency_name: 'Vibrant Reach Media',
    role_code: 'CLIENT_USER',
    expires_at: '2026-10-03T18:30:00.000Z',
    requires_existing_login: false,
  },
  'existing-user-demo': {
    email: 'existing@mosaiq.test',
    agency_name: 'Northstar Media Group',
    role_code: 'ANALYST',
    expires_at: '2026-10-03T18:30:00.000Z',
    requires_existing_login: true,
  },
  'long-content-demo': {
    email: 'alexandra.montgomery.international.marketing@customer-experience-partners.mosaiq.test',
    agency_name: 'International Customer Experience and Performance Marketing Partnership',
    role_code: 'CLIENT_USER',
    expires_at: '2026-10-03T18:30:00.000Z',
    requires_existing_login: false,
  },
};

const workspaces = [
  { id: 1, agency_id: 1, client_id: 1, name: 'Northstar Retail', status: 'active', currency: 'USD', timezone: 'America/New_York' },
  { id: 2, agency_id: 1, client_id: 2, name: 'Horizon Fintech', status: 'active', currency: 'GBP', timezone: 'Europe/London' },
  { id: 3, agency_id: 2, client_id: 3, name: 'Blank Canvas Launch', status: 'active', currency: 'SGD', timezone: 'Asia/Singapore' },
];

function wait(ms = 650) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockError(message, status, fields = {}, code = 'MOCK_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.fields = fields;
  error.code = code;
  return error;
}

function readSession() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(window.localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

function writeSession(user) {
  if (typeof window !== 'undefined') window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(SESSION_KEY);
}

function serverFailure() {
  return mockError('The mock server is temporarily unavailable. Please try again.', 500, {}, 'SERVER_ERROR');
}

export const mockAuthApi = {
  async login(email, password) {
    await wait();
    const normalized = String(email).trim().toLowerCase();
    if (normalized === 'server-error@mosaiq.test') throw serverFailure();
    if (normalized === 'denied@mosaiq.test') throw mockError('Your account does not have an active workspace.', 403, {}, 'ACCESS_DENIED');
    const user = users[normalized];
    if (!user || password !== PASSWORD) throw mockError('The provided credentials are incorrect.', 401, {}, 'INVALID_CREDENTIALS');
    writeSession(user);
    return { data: user };
  },

  async me() {
    await wait(350);
    const user = readSession();
    if (!user) throw mockError('Unauthenticated.', 401, {}, 'UNAUTHENTICATED');
    return { data: user };
  },

  async logout() {
    await wait(350);
    clearSession();
    return null;
  },

  async inspectInvitation(token) {
    await wait();
    if (token === 'server-error-demo') throw serverFailure();
    if (token === 'expired-demo' || !invitations[token]) throw mockError('Invitation unavailable.', 404, {}, 'INVITATION_NOT_FOUND');
    return { data: invitations[token] };
  },

  async acceptInvitation(body) {
    await wait();
    if (body.token === 'server-error-demo') throw serverFailure();
    const invitation = invitations[body.token];
    if (!invitation) throw mockError('Invitation unavailable.', 404, {}, 'INVITATION_NOT_FOUND');
    if (invitation.requires_existing_login && readSession()?.email !== invitation.email) {
      throw mockError('Sign in with the invited account before accepting.', 401, {}, 'LOGIN_REQUIRED');
    }
    if (!invitation.requires_existing_login) {
      const user = {
        id: 103,
        name: body.name,
        email: invitation.email,
        platform_role_code: null,
        membership: { agency_id: 1, role_code: invitation.role_code, client_id: 1, workspace_ids: [1] },
      };
      users[user.email] = user;
    }
    return null;
  },

  async rejectInvitation({ token }) {
    await wait(350);
    if (token === 'server-error-demo') throw serverFailure();
    if (token === 'expired-demo' || !invitations[token]) throw mockError('Invitation unavailable.', 404, {}, 'INVITATION_NOT_FOUND');
    return null;
  },

  async listWorkspacesForUser(user) {
    await wait(250);
    const ids = user?.membership?.workspace_ids;
    if (!Array.isArray(ids) || ids.length === 0) return { data: [] };
    const allowed = new Set(ids.map((id) => String(id)));
    return { data: workspaces.filter((workspace) => allowed.has(String(workspace.id))) };
  },

  async updateAgencyUser(user, body) {
    await wait(350);
    const normalizedEmail = String(user?.email || '').toLowerCase();
    const existing = users[normalizedEmail];
    if (!existing) throw mockError('Profile cannot be updated because the account was not found.', 404, {}, 'USER_NOT_FOUND');
    if (!String(body?.name || '').trim()) throw mockError('The given data was invalid.', 422, { name: ['Please enter your name.'] }, 'VALIDATION_ERROR');
    const updated = { ...existing, name: String(body.name).trim() };
    users[normalizedEmail] = updated;
    writeSession(updated);
    return { data: updated };
  },
  async changePassword(body) {
    await wait(350);
    if (body.current_password !== PASSWORD) throw mockError('The current password is incorrect.', 422, { current_password: ['The current password is incorrect.'] }, 'VALIDATION_ERROR');
    const nextPassword = String(body.password || '');
    if (nextPassword.length < 8 || !/[A-Za-z]/.test(nextPassword) || !/\d/.test(nextPassword)) {
      throw mockError('The given data was invalid.', 422, { password: ['Password must include at least 8 characters, one letter, and one number.'] }, 'VALIDATION_ERROR');
    }
    if (body.password !== body.password_confirmation) throw mockError('The given data was invalid.', 422, { password_confirmation: ['Passwords do not match.'] }, 'VALIDATION_ERROR');
    return null;
  },
  async forgotPassword(email) {
    await wait();
    if (String(email).toLowerCase() === 'server-error@mosaiq.test') throw serverFailure();
    return { message: 'If an account exists, password reset instructions have been sent.' };
  },

  async resetPassword({ token, email }) {
    await wait();
    if (token === 'server-error-demo' || String(email).toLowerCase() === 'server-error@mosaiq.test') throw serverFailure();
    if (token === 'expired-demo') throw mockError('This password reset link has expired.', 422, { token: ['Request a new password reset link.'] }, 'RESET_TOKEN_EXPIRED');
    return { message: 'Your password has been reset successfully.' };
  },
};

export const mockAuthCredentials = { password: PASSWORD };
