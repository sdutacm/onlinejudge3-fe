import { get, del, post, patch } from '@/utils/request';
import api from '@/configs/apis';
import limits from '@/configs/limits';
import { urlf } from '@/utils/format';

export function getList(query) {
  const url = urlf(api.sets.base, {
    query: {
      ...query,
      page: query.page || 1,
      limit: query.limit || limits.sets.list,
      orderDirection: query.orderDirection || 'DESC',
    },
  });
  return get(url);
}

export function getDetail(id) {
  const url = urlf(api.sets.detail, { param: { id } });
  return get(url);
}

export function addSet(data) {
  const url = urlf(api.sets.base);
  return post(url, data);
}

export function updateSet(id: number, data) {
  const url = urlf(api.sets.detail, { param: { id } });
  return patch(url, data);
}

export function deleteSet(id: number) {
  const url = urlf(api.sets.detail, { param: { id } });
  return del(url);
}
