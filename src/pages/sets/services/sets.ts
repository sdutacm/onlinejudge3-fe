import { get } from '@/utils/request';
import api from '@/configs/apis';
import limits from '@/configs/limits';
import { urlf } from '@/utils/format';

export function getList(query) {
  const url = urlf(api.sets.base, {
    query: {
      ...query,
      page: query.page || 1,
      limit: limits.sets.list,
    },
  });
  return get(url);
}

export function getDetail(id) {
  const url = urlf(api.sets.detail, { param: { id } });
  return get(url);
}
