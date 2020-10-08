export enum ContestUserStatus {
  waiting = 0, // 待审核
  accepted = 1, // 已接受
  return = 2, // 等待修改
  rejected = 3, // 已拒绝
}

export const contestUserStatusMap = {
  [ContestUserStatus.waiting]: {
    name: 'Pending',
  },
  [ContestUserStatus.accepted]: {
    name: 'Accepted',
  },
  [ContestUserStatus.return]: {
    name: 'Modification Required',
  },
  [ContestUserStatus.rejected]: {
    name: 'Rejected',
  },
};

const contestUserStatus = [
  {
    id: ContestUserStatus.waiting,
    name: 'Pending',
  },
  {
    id: ContestUserStatus.accepted,
    name: 'Accepted',
  },
  {
    id: ContestUserStatus.return,
    name: 'Modification Required',
  },
  {
    id: ContestUserStatus.rejected,
    name: 'Rejected',
  },
];

export default contestUserStatus;
