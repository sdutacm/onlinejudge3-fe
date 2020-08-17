import { get, post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import { urlf } from '@/utils/format';

export function fetch() {
  return get(
    urlf(routesBe.getSession.url, {
      query: { _t: new Date().getTime() },
    }),
  );
}

export function login(data) {
  return post(routesBe.login.url, data);
}

export function logout() {
  return post(routesBe.logout.url);
}
