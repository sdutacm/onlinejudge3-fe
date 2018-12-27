import { get, patch, post } from '@/utils/request';
import api from '@/configs/apis';
import limits from '@/configs/limits';
import { urlf } from '@/utils/format';

export function getList(query) {
  const url = urlf(api.solutions.base, {
    query: {
      ...query,
      page: query.page || 1,
      limit: limits.solutions.list,
      orderDirection: 'DESC',
    } as ListQuery,
  });
  return get(url);
}

export function getListByIds(query) {
  const url = urlf(api.solutions.base, {
    query,
  });
  return get(url);
}

export function getDetail(id) {
  const url = urlf(api.solutions.detail, {
    param: { id },
  });
  return get(url, 1000);
}

export function submit(data) {
  const url = api.solutions.base;
  return post(url, data);
}

export function changeShared(id, shared) {
  const url = urlf(api.solutions.shared, {
    param: { id },
  });
  return patch(url, { shared });
}
