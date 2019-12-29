import { get } from '@/utils/request';
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
