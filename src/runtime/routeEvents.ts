import type { Location } from 'history';

export const ROUTE_COMMIT_EVENT = 'oj3:route-commit';

export interface RouteCommitEventDetail {
  location: Location;
  action: string;
}

export function emitRouteCommit(detail: RouteCommitEventDetail) {
  window.dispatchEvent(new CustomEvent<RouteCommitEventDetail>(ROUTE_COMMIT_EVENT, { detail }));
}
