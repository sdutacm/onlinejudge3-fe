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
