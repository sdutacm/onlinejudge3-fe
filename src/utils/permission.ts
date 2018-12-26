export function isPermissionDog(session: ISessionStatus): boolean {
  try {
    return session.user.permission >= 1;
  }
  catch (e) {
    return false;
  }
}

export function isAdminDog(session: ISessionStatus): boolean {
  try {
    return session.user.permission >= 3;
  }
  catch (e) {
    return false;
  }
}

export function isSelf(session: ISessionStatus, userId: number): boolean {
  try {
    return session.user.userId === userId;
  }
  catch (e) {
    return false;
  }
}

export function hasPermission(session: ISessionStatus, userId: number): boolean {
  return isPermissionDog(session) || isSelf(session, userId);
}
