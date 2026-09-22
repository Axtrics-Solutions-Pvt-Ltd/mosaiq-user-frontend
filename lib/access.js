export const PLATFORM_ROLES = Object.freeze({ SUPER_ADMIN: 'SUPER_ADMIN' });

export const AGENCY_ROLES = Object.freeze({
  AGENCY_ADMIN: 'AGENCY_ADMIN',
  MANAGER: 'MANAGER',
  ANALYST: 'ANALYST',
  VIEWER: 'VIEWER',
  CLIENT_USER: 'CLIENT_USER',
});

function sameId(left, right) {
  return String(left) === String(right);
}

export function hasPlatformRole(user, role) {
  return Boolean(user && user.platform_role_code === role);
}

export function hasAgencyRole(user, role) {
  return Boolean(user?.membership && user.membership.role_code === role);
}

export function hasAnyRole(user, roles = []) {
  return roles.some((role) => hasPlatformRole(user, role) || hasAgencyRole(user, role));
}

export function hasActiveAccess(user) {
  return hasPlatformRole(user, PLATFORM_ROLES.SUPER_ADMIN) || Boolean(user?.membership);
}

export function belongsToAgency(user, agencyId) {
  if (hasPlatformRole(user, PLATFORM_ROLES.SUPER_ADMIN)) return true;
  return Boolean(user?.membership && sameId(user.membership.agency_id, agencyId));
}

export function belongsToClient(user, clientId) {
  if (hasPlatformRole(user, PLATFORM_ROLES.SUPER_ADMIN)) return true;
  return Boolean(user?.membership?.client_id != null && sameId(user.membership.client_id, clientId));
}

export function workspaceIdsFor(user) {
  return Array.isArray(user?.membership?.workspace_ids) ? user.membership.workspace_ids : [];
}

export function canAccessWorkspace(user, workspaceId) {
  if (hasPlatformRole(user, PLATFORM_ROLES.SUPER_ADMIN)) return true;
  return workspaceIdsFor(user).some((id) => sameId(id, workspaceId));
}

export function getAccessSnapshot(user) {
  return {
    isAuthenticated: Boolean(user),
    hasActiveAccess: hasActiveAccess(user),
    platformRole: user?.platform_role_code || null,
    agencyRole: user?.membership?.role_code || null,
    agencyId: user?.membership?.agency_id || null,
    clientId: user?.membership?.client_id || null,
    workspaceIds: workspaceIdsFor(user),
  };
}
