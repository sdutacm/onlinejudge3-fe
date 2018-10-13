import { get } from '@/utils/request';
import api from '@/configs/apis';
import limits from '@/configs/limits';
import urlf from '@/utils/urlf';

export function getList(query) {
  const url = urlf(api.problems.base, {
    query: {
      ...query,
      page: query.page || 1,
      limit: limits.problems.list,
    },
  });
  return get(url);
}

export function getOne(id) {
  const url = urlf(api.problems.one, {
    param: {
      id,
    },
  });
  return get(url);
}
