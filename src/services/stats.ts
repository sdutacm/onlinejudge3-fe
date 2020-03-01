import { get, post } from '@/utils/request';
import api from '@/configs/apis';
import { urlf } from '@/utils/format';

export function getUserACRank(type: 'day' | 'week' | 'month') {
  const url = urlf(api.stats.userACRank, {
    query: {
      type,
    },
  });
  return get(url);
}

export function getUserAcceptedProblems(userIds: number[]) {
  const url = api.stats.userAcceptedProblems;
  return post(url, { userIds });
}
