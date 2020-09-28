export enum UserForbidden {
  normal = 0, // 正常
  banned = 1, // 封禁
  closed = 2, // 销号
}

export const userForbiddenMap = {
  [UserForbidden.normal]: {
    name: 'Normal',
  },
  [UserForbidden.banned]: {
    name: 'Banned',
  },
  [UserForbidden.closed]: {
    name: 'Cancelled',
  },
};

const userForbidden = [
  {
    id: UserForbidden.normal,
    name: 'Normal',
  },
  {
    id: UserForbidden.banned,
    name: 'Banned',
  },
  {
    id: UserForbidden.closed,
    name: 'Cancelled',
  },
];

export default userForbidden;
