import { matchPath } from 'umi';
import type { IRoute } from '@umijs/renderer-react';

interface RouteMatchEntry {
  route: IRoute;
  match: ReturnType<typeof matchPath>;
}

interface RoutePreloadPlan {
  promise: Promise<void>;
  taskCount: number;
}

const loadedComponents = new WeakSet<object>();
const pendingComponents = new WeakMap<object, Promise<void>>();
const prefetchedPathnames = new Map<string, Promise<void>>();

export function getMatchedRouteBranch(routes: IRoute[], pathname: string): RouteMatchEntry[] {
  for (const route of routes) {
    const path = route.path;
    const match = path
      ? matchPath(pathname, {
        exact: route.exact,
        path,
        sensitive: route.sensitive,
        strict: route.strict,
      })
      : null;

    if (match) {
      const childMatches = route.routes ? getMatchedRouteBranch(route.routes, pathname) : [];
      return [{ route, match }, ...childMatches];
    }
  }

  return [];
}

export function hasSameRouteBranch(a: RouteMatchEntry[], b: RouteMatchEntry[]) {
  return a.length === b.length && a.every((entry, index) => entry.route === b[index].route);
}

function getRouteComponentPreload(route: IRoute): Promise<void> | null {
  const component = route.component;
  if (!component || typeof component === 'string' || typeof component.preload !== 'function') {
    return null;
  }
  if (loadedComponents.has(component)) {
    return null;
  }

  const pending = pendingComponents.get(component);
  if (pending) {
    return pending;
  }

  const preload = Promise.resolve(component.preload()).then(
    () => {
      loadedComponents.add(component);
      pendingComponents.delete(component);
    },
    (error) => {
      pendingComponents.delete(component);
      throw error;
    },
  );

  pendingComponents.set(component, preload);
  return preload;
}

export function collectMatchedRoutePreloads(routes: IRoute[], pathname: string): RoutePreloadPlan {
  const tasks = getMatchedRouteBranch(routes, pathname)
    .map(({ route }) => getRouteComponentPreload(route))
    .filter((task): task is Promise<void> => !!task);

  return {
    taskCount: tasks.length,
    promise: Promise.all(tasks).then(() => undefined),
  };
}

function normalizeBase(base: string) {
  if (!base || base === '/') {
    return '';
  }
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

export function normalizeInternalHref(href: string): string | null {
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) {
    return null;
  }

  const bases = Array.from(new Set([
    normalizeBase(process.env.BASE || '/'),
    '/onlinejudge3',
    '/onlinejudge3_cs',
  ].filter(Boolean)));

  for (const base of bases) {
    if (url.pathname === base) {
      return '/';
    }
    if (url.pathname.startsWith(`${base}/`)) {
      return url.pathname.slice(base.length) || '/';
    }
  }

  if ((process.env.BASE || '/') === '/') {
    return url.pathname || '/';
  }

  return null;
}

export function prefetchRoute(routes: IRoute[], pathname: string) {
  if (prefetchedPathnames.has(pathname)) {
    return prefetchedPathnames.get(pathname);
  }

  const { promise } = collectMatchedRoutePreloads(routes, pathname);
  const cached = promise.catch((error) => {
    prefetchedPathnames.delete(pathname);
    throw error;
  });
  prefetchedPathnames.set(pathname, cached);
  return cached;
}

function findAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) {
    return null;
  }
  return target.closest('a[href]');
}

export function installLinkIntentPrefetch(routes: IRoute[]) {
  const handleIntent = (event: Event) => {
    const anchor = findAnchor(event.target);
    if (!anchor || anchor.target && anchor.target !== '_self' || anchor.hasAttribute('download')) {
      return;
    }

    const pathname = normalizeInternalHref(anchor.href);
    if (!pathname) {
      return;
    }

    prefetchRoute(routes, pathname)?.catch(() => undefined);
  };

  document.addEventListener('mouseover', handleIntent, true);
  document.addEventListener('focusin', handleIntent, true);
  document.addEventListener('touchstart', handleIntent, true);

  return () => {
    document.removeEventListener('mouseover', handleIntent, true);
    document.removeEventListener('focusin', handleIntent, true);
    document.removeEventListener('touchstart', handleIntent, true);
  };
}
