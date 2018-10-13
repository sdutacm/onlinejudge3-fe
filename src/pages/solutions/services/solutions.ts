import { get, post } from '@/utils/request';
import api from '@/configs/apis';
import limits from '@/configs/limits';
import urlf from '@/utils/urlf';

export function getList(query) {
  const url = urlf(api.solutions.base, {
    query: {
      ...query,
      page: query.page || 1,
      limit: limits.solutions.list,
    },
  });
  return get(url);
}

export function getOne(id) {
  const url = urlf(api.solutions.one, {
    param: {
      id,
    },
  });
  return get(url);
}

export function submit(data) {
  const url = api.solutions.base;
  return post(url, data);
}
