/**
 * Server-side data prefetch helpers.
 *
 * The app fetches page data on the client through dva model `subscriptions`
 * (history.listen → dispatch effect), and every effect self-skips when its slice
 * of state is still fresh (`isStateExpired` + `genTimeFlag`). SSR reuses exactly
 * that: on the server we dispatch the same read effects against the per-request
 * dva store, then serialize the store state for hydration. Because the hydrated
 * slices carry their freshness flags, the client subscription re-dispatch is a
 * no-op — no double request, no content flash.
 *
 * Usage (in a page module):
 *   export default withSSRPrefetch(connect(mapStateToProps)(Page), [
 *     (ctx) => ctx.store.dispatch({ type: 'problems/getDetail', payload: { id: +ctx.match.params.id } }),
 *   ]);
 */

import { runWithSSRRequestContext } from '@/utils/ssrRequestContext';

export interface SSRStore {
  dispatch: (action: { type: string; payload?: any }) => Promise<any> | any;
  getState: () => any;
}

export interface SSRPrefetchContext {
  isServer?: boolean;
  store?: SSRStore;
  app?: any;
  match?: { params?: Record<string, any> };
  route?: { path?: string };
  history?: { location?: { pathname?: string; search?: string; query?: Record<string, any> } };
  [key: string]: any;
}

export type SSRPrefetchTask = (ctx: SSRPrefetchContext) => Promise<any> | any;

// Cap how long a single prefetch read may take so a slow/hanging upstream can't
// stall the whole server render. On timeout we proceed with whatever data is
// already in the store (the client refetches the rest).
const SSR_PREFETCH_TASK_TIMEOUT_MS = 4000;

function withTaskTimeout<T>(p: Promise<T> | T, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`prefetch task timed out after ${ms}ms`));
      }
    }, ms);
    Promise.resolve(p).then(
      (v) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(v);
        }
      },
      (e) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(e);
        }
      },
    );
  });
}

export interface SSRPrefetchOptions {
  /**
   * Extra props merged into the hydration payload (and thus passed to the page
   * component as props on both server and client). Use for pages that keep
   * fetched data in local component state rather than the dva store — seed that
   * state from props so the first client render matches the server markup.
   */
  getProps?: (ctx: SSRPrefetchContext) => Promise<Record<string, any>> | Record<string, any>;
}

/** Parse the query for the current SSR location (umi history exposes `.query`). */
export function getSSRQuery(ctx: SSRPrefetchContext): Record<string, any> {
  const location = ctx && ctx.history && ctx.history.location;
  if (location && location.query) {
    return location.query;
  }
  const search = (location && location.search) || '';
  const query: Record<string, any> = {};
  new URLSearchParams(search.replace(/^\?/, '')).forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

/**
 * Run the given prefetch tasks against the SSR store and return the resulting
 * state for client hydration. Each task is isolated: a single failing read logs
 * and degrades to client-fetched data rather than aborting the whole render.
 */
export async function runSSRPrefetch(
  ctx: SSRPrefetchContext,
  tasks: SSRPrefetchTask[],
  options?: SSRPrefetchOptions,
): Promise<any> {
  if (!ctx || !ctx.isServer || !ctx.store) {
    return {};
  }
  const logWhere = () =>
    (ctx.route && ctx.route.path) ||
    (ctx.history && ctx.history.location && ctx.history.location.pathname) ||
    'unknown route';
  // Bind the per-request upstream context (absolute API base + forwarded
  // cookies) for the duration of the dispatches so the isomorphic request layer
  // can reach the real API. Values arrive from the server via getInitialPropsCtx.
  return runWithSSRRequestContext(
    {
      apiBaseURL: ctx.apiBaseURL,
      cookie: ctx.cookie,
      origin: ctx.origin,
    },
    async () => {
      for (const task of tasks) {
        try {
          await withTaskTimeout(task(ctx), SSR_PREFETCH_TASK_TIMEOUT_MS);
        } catch (e: any) {
          // eslint-disable-next-line no-console
          console.error(`[SSR] prefetch task failed at ${logWhere()}:`, (e && e.message) || e);
        }
      }
      const base = ctx.store!.getState();
      if (options && options.getProps) {
        try {
          const extra = await withTaskTimeout(
            Promise.resolve(options.getProps(ctx)),
            SSR_PREFETCH_TASK_TIMEOUT_MS,
          );
          if (extra && typeof extra === 'object') {
            return { ...base, ...extra };
          }
        } catch (e: any) {
          // eslint-disable-next-line no-console
          console.error(`[SSR] getProps failed at ${logWhere()}:`, (e && e.message) || e);
        }
      }
      return base;
    },
  );
}

/**
 * Attach a server `getInitialProps` to a page component that prefetches data via
 * the given tasks. No-op on the client (data keeps flowing through the existing
 * subscription path).
 */
export function withSSRPrefetch<C>(
  Component: C,
  tasks: SSRPrefetchTask | SSRPrefetchTask[],
  options?: SSRPrefetchOptions,
): C {
  const taskList = Array.isArray(tasks) ? tasks : tasks ? [tasks] : [];
  (Component as any).getInitialProps = (ctx: SSRPrefetchContext) =>
    runSSRPrefetch(ctx, taskList, options);
  return Component;
}
