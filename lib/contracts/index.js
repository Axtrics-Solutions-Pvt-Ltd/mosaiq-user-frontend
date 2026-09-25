export const CONTRACT_VERSION = '2026-09-18';

export const ROLE_CODES = Object.freeze({
  platform: ['SUPER_ADMIN'],
  agency: ['AGENCY_ADMIN', 'MANAGER', 'ANALYST', 'VIEWER', 'CLIENT_USER'],
});

export const API_ENDPOINTS = Object.freeze({
  auth: Object.freeze({ login: '/auth/login', me: '/auth/me', logout: '/auth/logout', workspaces: '/auth/workspaces', updateAgencyUser: '/agencies/{agency}/users/{user}', forgotPassword: '/auth/forgot-password', resetPassword: '/auth/reset-password', changePassword: '/auth/change-password' }),
  invitations: Object.freeze({ inspect: '/invitations/inspect', accept: '/invitations/accept', reject: null }),
  workspaces: '/auth/workspaces',
  campaigns: '/campaigns',
  channels: '/channels',
  audience: '/audience',
  creative: '/creative',
  reports: '/reports',
  marketingIntelligence: '/marketing-intelligence',
  mmmResults: '/mmm/results',
});

export class ContractError extends Error {
  constructor(message, path = 'payload') {
    super(`${message} at ${path}`);
    this.name = 'ContractError';
    this.path = path;
  }
}

export function assertRecord(value, path = 'payload') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ContractError('Expected an object', path);
  return value;
}

export function assertArray(value, path = 'payload') {
  if (!Array.isArray(value)) throw new ContractError('Expected an array', path);
  return value;
}

export function unwrapData(payload) {
  const envelope = assertRecord(payload);
  if (!Object.prototype.hasOwnProperty.call(envelope, 'data')) throw new ContractError('Missing required data envelope');
  return envelope.data;
}

export function assertCurrentUser(value) {
  const user = assertRecord(value, 'data');
  for (const field of ['id', 'name', 'email', 'platform_role_code', 'membership']) {
    if (!Object.prototype.hasOwnProperty.call(user, field)) throw new ContractError(`Missing required field ${field}`, `data.${field}`);
  }
  if (typeof user.name !== 'string' || typeof user.email !== 'string') throw new ContractError('User name and email must be strings', 'data');
  if (user.membership !== null) {
    const membership = assertRecord(user.membership, 'data.membership');
    for (const field of ['agency_id', 'role_code', 'client_id', 'workspace_ids']) {
      if (!Object.prototype.hasOwnProperty.call(membership, field)) throw new ContractError(`Missing required field ${field}`, `data.membership.${field}`);
    }
    assertArray(membership.workspace_ids, 'data.membership.workspace_ids');
  }
  return user;
}

export function assertDashboardSummary(value) {
  const summary = assertRecord(value, 'data');
  assertRecord(summary.workspace, 'data.workspace');
  assertRecord(summary.date_range, 'data.date_range');
  assertArray(summary.kpis, 'data.kpis');
  assertArray(summary.performance, 'data.performance');
  return summary;
}

export function assertMarketingIntelligence(value) {
  const intelligence = assertRecord(value, 'data');
  for (const field of ['audience_profile', 'demographic_profile', 'geographic_insights', 'behaviour', 'media_and_brand', 'findings']) {
    assertArray(intelligence[field], `data.${field}`);
  }
  return intelligence;
}

export function assertMmmResults(value) {
  const results = assertRecord(value, 'data');
  for (const field of ['data_readiness', 'channel_contributions', 'response_curves', 'recommended_budget', 'scenarios']) {
    assertArray(results[field], `data.${field}`);
  }
  assertRecord(results.settings, 'data.settings');
  return results;
}
