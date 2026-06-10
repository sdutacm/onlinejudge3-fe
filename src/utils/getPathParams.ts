import { matchPath } from 'react-router';

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return pathname;
  }
  let normalized = String(pathname);
  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(normalized)) {
    try {
      normalized = new URL(normalized).pathname;
    } catch (e) {
      // Keep the original value and let matchPath fail naturally.
    }
  }
  normalized = normalized.split('?')[0].split('#')[0] || '/';

  const base = ((process.env.BASE || '') as string).replace(/\/$/, '');
  if (base && base !== '/') {
    if (normalized === base) {
      return '/';
    }
    if (normalized.indexOf(`${base}/`) === 0) {
      return normalized.slice(base.length) || '/';
    }
  }
  return normalized;
}

export function getPathParams(pathname: string, scheme: string, exact: boolean = false): any {
  const match = matchPath(normalizePathname(pathname), {
    path: scheme,
    exact,
  });
  return match ? match.params : null;
}

export function getPathParamId(pathname: string, scheme: string, exact: boolean = false): number {
  const params = getPathParams(pathname, scheme, exact);
  return params && params.id ? ~~params.id : 0;
}
