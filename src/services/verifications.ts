import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';

export function fetchEmailCode(data) {
  return post(routesBe.sendEmailVerification.url, data);
}
