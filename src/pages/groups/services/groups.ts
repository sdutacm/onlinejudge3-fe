import { del, get, patch, post } from '@/utils/request';
import api from '@/configs/apis';
import limits from '@/configs/limits';
import { urlf } from '@/utils/format';

export function getList(query) {
  const url = urlf(api.groups.base, {
    query: {
      ...query,
      page: query.page || 1,
      limit: query.limit || limits.groups.list,
    },
  });
  return get(url);
}

export function getDetail(id: number) {
  const url = urlf(api.groups.detail, { param: { id } });
  return get(url);
}

export function addGroup(data) {
  const url = urlf(api.groups.base);
  return post(url, data);
}

export function updateGroup(
  id: number,
  data: {
    name: IGroup['name'];
    intro: IGroup['intro'];
    verified?: IGroup['verified'];
    private: IGroup['private'];
    joinChannel: IGroup['joinChannel'];
  },
) {
  const url = urlf(api.groups.detail, { param: { id } });
  return patch(url, data);
}

export function deleteGroup(id: number) {
  const url = urlf(api.groups.detail, { param: { id } });
  return del(url);
}

export function getMembers(id: number) {
  const url = urlf(api.groups.members.base, { param: { id } });
  return get(url);
}

export function addGroupMember(
  id: number,
  data: { userIds?: number[]; usernames?: string[] },
) {
  const url = urlf(api.groups.members.base, { param: { id } });
  return post(url, data);
}

export function joinGroup(id: number) {
  const url = urlf(api.groups.members.base, { param: { id } });
  return post(url, { isApply: true });
}

export function updateGroupMember(
  id: number,
  uid: number,
  data: {
    permission?: IGroupMember['permission'];
    status?: IGroupMember['status'];
  },
) {
  const url = urlf(api.groups.members.detail, { param: { id, uid } });
  return patch(url, data);
}

export function deleteGroupMember(id: number, uid: number) {
  const url = urlf(api.groups.members.base, { param: { id, uid } });
  return del(url);
}
