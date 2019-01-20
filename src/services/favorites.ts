import { del, get, post } from '@/utils/request';
import api from '@/configs/apis';
import { urlf } from '@/utils/format';

export function getList(userId, query) {
  const url = urlf(api.users.favorites, {
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

export function addFavorite(data) {
  const url = urlf(api.favorites.base);
  return post(url, data);
}

export function deleteFavorite(id) {
  const url = urlf(api.favorites.detail, {
    param: {
      id,
    },
  });
  return del(url);
}
