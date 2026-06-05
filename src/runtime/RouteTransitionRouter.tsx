import React from 'react';
import { ApplyPluginsType, Router } from 'umi';
import type { History, Location } from 'history';
import { renderRoutes } from '@umijs/renderer-react';
import type { IRoute } from '@umijs/renderer-react';
import { getRoutes } from '@@/core/routes';
import { beginRouteProgress, finishRouteProgress } from '@/runtime/routeProgress';
import { emitRouteCommit } from '@/runtime/routeEvents';
import RouteChunkLoading from '@/components/RouteChunkLoading';
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

interface TransitionErrorState {
  action: string;
  error: Error;
  location: Location;
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
  const [activeRoutes, setActiveRoutes] = React.useState(() => routes);
  const [committedLocation, setCommittedLocation] = React.useState(() => history.location);
  const [commitState, setCommitState] = React.useState<CommitState>(() => ({
    action: 'POP',
    location: history.location,
    seq: 0,
  }));
  const [transitionError, setTransitionError] = React.useState<TransitionErrorState | null>(null);
  const activeRoutesRef = React.useRef(activeRoutes);
  const committedLocationRef = React.useRef(committedLocation);
  const transitionIdRef = React.useRef(0);
  const activeProgressTokenRef = React.useRef<unknown>(null);
  const skipInitialCommitEventRef = React.useRef(true);

  React.useEffect(() => {
    setActiveRoutes(routes);
  }, [routes]);

  React.useEffect(() => {
    activeRoutesRef.current = activeRoutes;
  }, [activeRoutes]);

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

  const startTransition = React.useCallback((
    location: Location,
    action: string,
    transitionRoutes = activeRoutesRef.current,
  ) => {
    const currentLocation = committedLocationRef.current;
    const currentBranch = getMatchedRouteBranch(transitionRoutes, currentLocation.pathname);
    const nextBranch = getMatchedRouteBranch(transitionRoutes, location.pathname);

    transitionIdRef.current += 1;
    const transitionId = transitionIdRef.current;
    setTransitionError(null);
    stopActiveProgress();

    if (
      isHashOnlyChange(currentLocation, location) ||
      hasSameRouteBranch(currentBranch, nextBranch)
    ) {
      commitLocation(location, action);
      return;
    }

    const { promise, taskCount } = collectMatchedRoutePreloads(
      transitionRoutes,
      location.pathname,
    );
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

    promise.then(
      () => {
        if (transitionIdRef.current === transitionId) {
          commitLocation(location, action);
        }
      },
      (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[route-transition] route chunk preload failed', error);
        }
        if (transitionIdRef.current === transitionId) {
          setTransitionError({
            action,
            error,
            location,
          });
        }
      },
    ).finally(() => {
      window.clearTimeout(progressTimer);
      if (activeProgressTokenRef.current === progressToken) {
        stopActiveProgress();
      }
    });
  }, [commitLocation, stopActiveProgress]);

  const retryTransition = React.useCallback(() => {
    if (transitionError) {
      const nextRoutes = getRoutes();
      activeRoutesRef.current = nextRoutes;
      setActiveRoutes(nextRoutes);
      startTransition(transitionError.location, transitionError.action, nextRoutes);
    }
  }, [startTransition, transitionError]);

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
    emitRouteChange(plugin, activeRoutesRef.current, history.location, 'POP', true);

    const unlisten = history.listen((location, action) => {
      const nextRoutes = activeRoutesRef.current;
      emitRouteChange(plugin, nextRoutes, location, action);
      startTransition(location, action, nextRoutes);
    });

    return () => {
      transitionIdRef.current += 1;
      stopActiveProgress();
      unlisten();
    };
  }, [history, plugin, startTransition, stopActiveProgress]);

  React.useEffect(() => installLinkIntentPrefetch(activeRoutes), [activeRoutes]);

  return (
    <>
      <Router history={history}>
        {renderRoutes({ routes: activeRoutes, plugin }, { location: committedLocation })}
      </Router>
      {transitionError && (
        <RouteChunkLoading
          error={transitionError.error}
          isLoading={false}
          retry={retryTransition}
        />
      )}
    </>
  );
}
