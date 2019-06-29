import { del, get, patch, post } from '@/utils/request';
import api from '@/configs/apis';
import limits from '@/configs/limits';
import { urlf } from '@/utils/format';

export function getList(query) {
  const url = urlf(api.groups.base, {
    query: {
      ...query,
      page: query.page || 1,
      limit: limits.groups.list,
    },
  });
  return get(url);
}

export function getDetail(id: string) {
  const url = urlf(api.groups.detail, { param: { id } });
  return get(url);
}

export function addGroup(data) {
  const url = urlf(api.groups.base);
  return post(url, data);
}

export function addGroupMember(id: string, userIds: number[]) {
  const url = urlf(api.groups.members.base, { param: { id } });
  return post(url, { userIds });
}

export function deleteGroupMember(id: string, userIds: number[]) {
  const url = urlf(api.groups.members.base, { param: { id } });
  return del(url, { userIds });
}

export function updateGroupMember(id: string, uid: number, data) {
  const url = urlf(api.groups.members.detail, { param: { id, uid } });
  return patch(url, data);
}
