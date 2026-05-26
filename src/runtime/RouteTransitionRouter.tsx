import React from 'react';
import { ApplyPluginsType, Router } from 'umi';
import type { History, Location } from 'history';
import { renderRoutes } from '@umijs/renderer-react';
import type { IRoute } from '@umijs/renderer-react';
import { beginRouteProgress, finishRouteProgress } from '@/runtime/routeProgress';
import { emitRouteCommit } from '@/runtime/routeEvents';
import {
  collectMatchedRoutePreloads,
  getMatchedRouteBranch,
  hasSameRouteBranch,
  installLinkIntentPrefetch,
} from '@/runtime/routePreload';

interface Props {
  history: History;
  routes: IRoute[];
  plugin: any;
}

interface CommitState {
  action: string;
  location: Location;
  seq: number;
}

const DEFAULT_TITLE = 'SDUT OnlineJudge';
const PROGRESS_DELAY = 80;

function emitRouteChange(plugin: Props['plugin'], routes: IRoute[], location: Location, action: string, isFirst = false) {
  const matchedRoutes = getMatchedRouteBranch(routes, location.pathname);

  if (typeof document !== 'undefined') {
    document.title = matchedRoutes.length && matchedRoutes[matchedRoutes.length - 1].route.title
      ? matchedRoutes[matchedRoutes.length - 1].route.title
      : DEFAULT_TITLE;
  }

  plugin.applyPlugins({
    key: 'onRouteChange',
    type: ApplyPluginsType.event,
    args: {
      routes,
      matchedRoutes,
      location,
      action,
      isFirst,
    },
  });
}

function isHashOnlyChange(current: Location, next: Location) {
  return current.pathname === next.pathname && current.search === next.search && current.hash !== next.hash;
}

export default function RouteTransitionRouter({ history, routes, plugin }: Props) {
  const [committedLocation, setCommittedLocation] = React.useState(() => history.location);
  const [commitState, setCommitState] = React.useState<CommitState>(() => ({
    action: 'POP',
    location: history.location,
    seq: 0,
  }));
  const committedLocationRef = React.useRef(committedLocation);
  const transitionIdRef = React.useRef(0);
  const activeProgressTokenRef = React.useRef<unknown>(null);
  const skipInitialCommitEventRef = React.useRef(true);

  React.useEffect(() => {
    committedLocationRef.current = committedLocation;
  }, [committedLocation]);

  const stopActiveProgress = React.useCallback(() => {
    if (activeProgressTokenRef.current) {
      finishRouteProgress(activeProgressTokenRef.current);
      activeProgressTokenRef.current = null;
    }
  }, []);

  const commitLocation = React.useCallback((location: Location, action: string) => {
    setCommittedLocation(location);
    setCommitState((state) => ({
      action,
      location,
      seq: state.seq + 1,
    }));
  }, []);

  React.useEffect(() => {
    if (skipInitialCommitEventRef.current) {
      skipInitialCommitEventRef.current = false;
      return;
    }

    emitRouteCommit({
      action: commitState.action,
      location: commitState.location,
    });
  }, [commitState]);

  React.useEffect(() => {
    emitRouteChange(plugin, routes, history.location, 'POP', true);

    const unlisten = history.listen((location, action) => {
      emitRouteChange(plugin, routes, location, action);

      const currentLocation = committedLocationRef.current;
      const currentBranch = getMatchedRouteBranch(routes, currentLocation.pathname);
      const nextBranch = getMatchedRouteBranch(routes, location.pathname);

      transitionIdRef.current += 1;
      const transitionId = transitionIdRef.current;
      stopActiveProgress();

      if (
        isHashOnlyChange(currentLocation, location) ||
        hasSameRouteBranch(currentBranch, nextBranch)
      ) {
        commitLocation(location, action);
        return;
      }

      const { promise, taskCount } = collectMatchedRoutePreloads(routes, location.pathname);
      if (!taskCount) {
        commitLocation(location, action);
        return;
      }

      const progressToken = { transitionId };
      const progressTimer = window.setTimeout(() => {
        if (transitionIdRef.current === transitionId) {
          activeProgressTokenRef.current = progressToken;
          beginRouteProgress(progressToken);
        }
      }, PROGRESS_DELAY);

      promise.catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[route-transition] route chunk preload failed', error);
        }
      }).then(() => {
        if (transitionIdRef.current === transitionId) {
          commitLocation(location, action);
        }
      }).finally(() => {
        window.clearTimeout(progressTimer);
        if (activeProgressTokenRef.current === progressToken) {
          stopActiveProgress();
        }
      });
    });

    return () => {
      transitionIdRef.current += 1;
      stopActiveProgress();
      unlisten();
    };
  }, [commitLocation, history, plugin, routes, stopActiveProgress]);

  React.useEffect(() => installLinkIntentPrefetch(routes), [routes]);

  return (
    <Router history={history}>
      {renderRoutes({ routes, plugin }, { location: committedLocation })}
    </Router>
  );
}
