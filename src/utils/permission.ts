export function isPermissionDog(session) {
  return session.user.permission >= 1;
}

export function isAdminDog(session) {
  return session.user.permission >= 3;
}

export function isSelf(session, userId) {
  return session.user.userId === userId;
}

export function hasPermission(session, userId) {
  return isPermissionDog(session) || isSelf(session, userId);
}
