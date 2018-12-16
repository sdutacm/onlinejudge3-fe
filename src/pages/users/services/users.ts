import { get, post, patch } from '@/utils/request';
import api from '@/configs/apis';
import { urlf } from '@/utils/format';
import limits from '@/configs/limits';

// export function getRegisterVerificationCode(data) {
//   return post(api.session.registerVerificationCode, data);
// }

export function register(data) {
  return post(api.users.base, data);
}

export function forgotPassword(data) {
  return patch(urlf(api.users.password, { param: { id: 0 } }), data);
}

export function getList(query) {
  const url = urlf(api.users.base, {
    query: {
      ...query,
      page: query.page || 1,
      limit: limits.users.list,
    },
  });
  return get(url);
}

export function getDetail(id) {
  const url = urlf(api.users.detail, {
    param: {
      id,
    },
  });
  return get(url);
}
