import { matchPath } from 'react-router';

export function getPathParams(pathname: string, scheme: string, exact: boolean = false): any {
  const match = matchPath(pathname, {
    path: scheme,
    exact,
  });
  return match ? match.params : null;
}

export function getPathParamId(pathname: string, scheme: string, exact: boolean = false): number {
  const params = getPathParams(pathname, scheme, exact);
  return params && params.id ? ~~params.id : 0;
}
