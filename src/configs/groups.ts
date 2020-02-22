// join channel

export enum GroupJoinChannel {
  Any = 0,
  Audit = 1,
  Invitation = 2,
}

export const groupJoinChannelnMap = {
  [GroupJoinChannel.Any]: {
    name: 'Any',
  },
  [GroupJoinChannel.Audit]: {
    name: 'Audit Required',
  },
  [GroupJoinChannel.Invitation]: {
    name: 'Invitation',
  },
};

export const groupJoinChannels = [
  {
    id: GroupJoinChannel.Any,
    name: 'Any',
  },
  {
    id: GroupJoinChannel.Audit,
    name: 'Audit',
  },
  {
    id: GroupJoinChannel.Invitation,
    name: 'Invitation',
  },
];

// member permission

export enum GroupMemberPermission {
  Member = 0,
  Admin = 1,
  Master = 3,
}

export const groupMemberPermissionMap = {
  [GroupMemberPermission.Member]: {
    name: '',
  },
  [GroupMemberPermission.Admin]: {
    name: 'Admin',
  },
  [GroupMemberPermission.Master]: {
    name: 'Master',
  },
};

export const groupMemberPermissions = [
  {
    id: GroupMemberPermission.Member,
    name: 'Member',
  },
  {
    id: GroupMemberPermission.Admin,
    name: 'Admin',
  },
  {
    id: GroupMemberPermission.Master,
    name: 'Master',
  },
];

// member status

export enum GroupMemberStatus {
  Normal = 0,
  Auditing = 1,
}

export const groupMemberStatuses = [
  {
    id: GroupMemberStatus.Normal,
    name: 'Normal',
  },
  {
    id: GroupMemberStatus.Auditing,
    name: 'Auditing',
  },
];
