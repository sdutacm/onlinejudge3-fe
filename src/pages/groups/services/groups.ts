import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import limits from '@/configs/limits';
import {
  IGetGroupListReq,
  IGetGroupListResp,
  IGetUserGroupsReq,
  IGetUserGroupsResp,
  IGetGroupDetailReq,
  IGetGroupDetailResp,
  ICreateGroupReq,
  ICreateGroupResp,
  ICreateEmptyGroupReq,
  ICreateEmptyGroupResp,
  IUpdateGroupReq,
  IDeleteGroupReq,
  IGetGroupMemberListReq,
  IGetGroupMemberListResp,
  IBatchAddGroupMembersReq,
  IJoinGroupReq,
  IUpdateGroupMemberReq,
  IDeleteGroupMemberReq,
  IExitGroupReq,
} from '@/common/contracts/group';

export function getList(query) {
  return post<IGetGroupListReq, IGetGroupListResp>(routesBe.getGroupList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.groups.list,
  });
}

export function getUserGroups(userId) {
  return post<IGetUserGroupsReq, IGetUserGroupsResp>(routesBe.getUserGroups.url, {
    userId,
  });
}

export function getDetail(groupId: number) {
  return post<IGetGroupDetailReq, IGetGroupDetailResp>(routesBe.getGroupDetail.url, {
    groupId,
  });
}

export function addGroup(data) {
  return post<ICreateGroupReq, ICreateGroupResp>(routesBe.createGroup.url, data);
}

export function addEmptyGroup(data) {
  return post<ICreateEmptyGroupReq, ICreateEmptyGroupResp>(routesBe.createEmptyGroup.url, data);
}

export function updateGroup(
  groupId: number,
  data: {
    name: IGroup['name'];
    intro: IGroup['intro'];
    verified?: IGroup['verified'];
    private: IGroup['private'];
    joinChannel: IGroup['joinChannel'];
  },
) {
  return post<IUpdateGroupReq, void>(routesBe.updateGroup.url, {
    groupId,
    ...data,
  });
}

export function deleteGroup(groupId: number) {
  return post<IDeleteGroupReq, void>(routesBe.deleteGroup.url, {
    groupId,
  });
}

export function getMembers(groupId: number) {
  return post<IGetGroupMemberListReq, IGetGroupMemberListResp>(routesBe.getGroupMemberList.url, {
    groupId,
  });
}

export function addGroupMember(
  groupId: number,
  data: { userIds?: number[]; usernames?: string[] },
) {
  return post<IBatchAddGroupMembersReq, void>(routesBe.batchAddGroupMembers.url, {
    groupId,
    ...data,
  });
}

export function joinGroup(groupId: number) {
  return post<IJoinGroupReq, void>(routesBe.joinGroup.url, {
    groupId,
  });
}

export function updateGroupMember(
  groupId: number,
  userId: number,
  data: {
    permission?: IGroupMember['permission'];
    status?: IGroupMember['status'];
  },
) {
  return post<IUpdateGroupMemberReq, void>(routesBe.updateGroupMember.url, {
    groupId,
    userId,
    ...data,
  });
}

export function deleteGroupMember(groupId: number, userId: number) {
  return post<IDeleteGroupMemberReq, void>(routesBe.deleteGroupMember.url, {
    groupId,
    userId,
  });
}

export function exitGroup(groupId: number) {
  return post<IExitGroupReq, void>(routesBe.exitGroup.url, {
    groupId,
  });
}
