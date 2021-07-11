import { get, post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import { urlf } from '@/utils/format';
import {
  ILoginReq,
  ILoginResp,
  IGetSessionListResp,
  IClearSessionReq,
} from '@/common/contracts/user';

export function fetch() {
  return get(
    urlf(routesBe.getSession.url, {
      query: { _t: new Date().getTime() },
    }),
  );
}

export function login(data) {
  return post<ILoginReq, ILoginResp>(routesBe.login.url, data);
}

export function logout() {
  return post<void, void>(routesBe.logout.url);
}

export function getSessionList() {
  return post<void, IGetSessionListResp>(routesBe.getSessionList.url);
}

export function clearSession(sessionId) {
  return post<IClearSessionReq, void>(routesBe.clearSession.url, {
    sessionId,
  });
}
