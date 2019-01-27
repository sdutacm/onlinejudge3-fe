import { get, patch, post } from '@/utils/request';
import api from '@/configs/apis';
import { urlf } from '@/utils/format';

export function getList(query) {
  const url = urlf(api.messages.base, {
    query: {
      ...query,
      page: query.page || 1,
    },
  });
  return get(url);
}

export function markRead(id, read) {
  const url = urlf(api.messages.detail, {
    param: {
      id,
    },
  });
  return patch(url, { read });
}

export function send(data) {
  return post(api.messages.base, data);
}
