export enum UserPermission {
  normal = 0, // 普通用户
  teacher = 1, // 教师
  admin = 2, // 管理员
  su = 3, // 超级管理员
  master = 4, // ？
}

export const userPermissionMap = {
  [UserPermission.normal]: {
    name: 'Normal',
  },
  [UserPermission.teacher]: {
    name: 'Teacher',
  },
  [UserPermission.admin]: {
    name: 'Admin',
  },
  [UserPermission.su]: {
    name: 'Super Admin',
  },
};

const userPermission = [
  {
    id: UserPermission.normal,
    name: 'Normal',
  },
  {
    id: UserPermission.teacher,
    name: 'Teacher',
  },
  // {
  //   id: UserPermission.admin,
  //   name: 'Admin',
  // },
  {
    id: UserPermission.su,
    name: 'Super Admin',
  },
];

export default userPermission;
