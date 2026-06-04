import React from 'react';
import RouteTransitionRouter from '@/runtime/RouteTransitionRouter';

export function rootContainer(container: React.ReactNode, opts: any) {
  // Under SSR, umi's renderServer applies this hook with `opts.type === 'ssr'`
  // and hands us a fully server-renderable tree (StaticRouter + renderRoutes,
  // already populated with prefetched dva state). Our client-only transition
  // router — history.listen, route-chunk preloading, link-intent prefetch,
  // nprogress — must not run there, so we pass the server tree through untouched.
  // dva's own rootContainer still wraps this in `_DvaContainer` afterwards.
  if (opts && opts.type === 'ssr') {
    return container;
  }
  return (
    <RouteTransitionRouter
      history={opts.history}
      plugin={opts.plugin}
      routes={opts.routes}
    />
  );
}
