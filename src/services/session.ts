import { del, get, post } from '@/utils/request';
import api from '@/configs/apis';

export function fetch() {
  return get(api.session.base);
}

export function login(data) {
  return post(api.session.base, data);
}

export function logout() {
  return del(api.session.base);
}
