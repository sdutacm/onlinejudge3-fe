import { get, post } from '@/utils/request';
import api from '@/configs/apis';

// export function getRegisterVerificationCode(data) {
//   return post(api.session.registerVerificationCode, data);
// }

export function register(data) {
  return post(api.users.base, data);
}
