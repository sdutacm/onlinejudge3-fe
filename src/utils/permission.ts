import { EPerm, checkPermExpr } from '@/common/configs/perm.config';

// export function isPermissionDog(session: ISessionStatus): boolean {
//   try {
//     return session.user.permission >= 1;
//   } catch (e) {
//     return false;
//   }
// }

// export function isAdminDog(session: ISessionStatus): boolean {
//   try {
//     return session.user.permission >= 3;
//   } catch (e) {
//     return false;
//   }
// }

export function isSelf(session: ISessionStatus, userId: number): boolean {
  if (!session || !userId) {
    return false;
  }
  try {
    return session.user.userId === userId;
  } catch (e) {
    return false;
  }
}

// export function hasPermission(session: ISessionStatus, userId: number): boolean {
//   return isPermissionDog(session) || isSelf(session, userId);
// }

/**
 * 判断当前用户是否有所有指定的权限。
 * @param ...perms 要检查的权限表达式
 */
export function checkPerms(session: ISessionStatus, ...permExpr: (EPerm | EPerm[])[]) {
  return checkPermExpr(permExpr, (session.user?.permissions as EPerm[]) || []);
}
