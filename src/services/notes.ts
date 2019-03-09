import { del, get, post } from '@/utils/request';
import api from '@/configs/apis';
import { urlf } from '@/utils/format';

export function getList(userId, query) {
  const url = urlf(api.users.notes, {
    param: {
      id: userId,
    },
    query: {
      ...query,
      page: query.page || 1,
    },
  });
  return get(url);
}

export function addNote(data) {
  const url = urlf(api.notes.base);
  return post(url, data);
}

export function deleteNote(id) {
  const url = urlf(api.notes.detail, {
    param: {
      id,
    },
  });
  return del(url);
}
