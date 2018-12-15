import { get, post, patch } from '@/utils/request';
import api from '@/configs/apis';
import { urlf } from '@/utils/format';

// export function getRegisterVerificationCode(data) {
//   return post(api.session.registerVerificationCode, data);
// }

export function register(data) {
  return post(api.users.base, data);
}

export function forgotPassword(data) {
  return patch(urlf(api.users.password, { param: { id: 0 } }), data);
}
