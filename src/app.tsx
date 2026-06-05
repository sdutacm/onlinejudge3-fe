import React from 'react';
import RouteTransitionRouter from '@/runtime/RouteTransitionRouter';

export function rootContainer(container: React.ReactNode, opts: any) {
  return (
    <RouteTransitionRouter
      history={opts.history}
      plugin={opts.plugin}
      routes={opts.routes}
    />
  );
}
