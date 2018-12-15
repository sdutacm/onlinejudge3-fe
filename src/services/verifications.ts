import { post } from '@/utils/request';
import api from '@/configs/apis';

export function fetchEmailCode(data) {
  return post(api.verifications.code, data);
}
