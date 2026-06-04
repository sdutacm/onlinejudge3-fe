import { ROUTE_COMMIT_EVENT } from '@/runtime/routeEvents';
import type { RouteCommitEventDetail } from '@/runtime/routeEvents';

const initialState = {};

const scrollToTopIgnoreList = [
  /^\/topics\/\d/,
  /^\/groups\/\d/,
];

export default {
  state: initialState,
  reducers: {
  },
  effects: {
  },
  subscriptions: {
    setup() {
      // dva starts the app (and runs subscriptions) on the server too; this one
      // is a browser-only scroll/route-commit listener.
      if (typeof window === 'undefined') {
        return;
      }
      const handleRouteCommit = (event: Event) => {
        const { action, location } = (event as CustomEvent<RouteCommitEventDetail>).detail || {};
        if (!location) {
          return;
        }

        let ignored = false;
        for (const r of scrollToTopIgnoreList) {
          if (r.test(location.pathname)) {
            ignored = true;
            break;
          }
        }
        if (!ignored && (action === 'PUSH' || action === 'REPLACE')) {
          window.scrollTo(0, 0);
        }
      };

      window.addEventListener(ROUTE_COMMIT_EVENT, handleRouteCommit);
      return () => window.removeEventListener(ROUTE_COMMIT_EVENT, handleRouteCommit);
    },
  },
};
