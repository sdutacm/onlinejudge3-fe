import { get } from '@/utils/request';
import api from '@/configs/apis';
import limits from '@/configs/limits';
import { urlf } from '@/utils/format';

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

export function getDetail(id) {
  const url = urlf(api.problems.detail, {
    param: {
      id,
    },
  });
  return get(url, 1000);
}

export function getTagList() {
  const url = urlf(api.tags.base);
  return get(url);
}
