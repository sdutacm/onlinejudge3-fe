/**
 * Per-request context for server-side data fetching.
 *
 * During SSR a single Node worker serves many requests whose render promises
 * interleave, so the "current request" (forwarded cookies, absolute API base,
 * origin) cannot live in a module-level global without leaking across requests.
 * We bind it to the async execution with `AsyncLocalStorage`.
 *
 * This module is import-safe in the browser bundle: it never statically imports
 * `async_hooks` (which webpack cannot resolve for the web target). The require
 * is hidden behind `eval` and a `typeof window` guard, so the browser keeps an
 * inert no-op implementation.
 */

export interface SSRRequestContext {
  /** Absolute API base URL the server should call, e.g. `http://127.0.0.1:7001`. */
  apiBaseURL?: string;
  /** Raw `Cookie` header forwarded from the incoming request (for session/csrf). */
  cookie?: string;
  /** Request origin, e.g. `https://acm.sdut.edu.cn`. */
  origin?: string;
  /** Extra headers to forward to upstream API calls. */
  headers?: Record<string, string>;
}

interface ALSLike {
  getStore(): SSRRequestContext | undefined;
  run<T>(store: SSRRequestContext, callback: () => T): T;
}

let storage: ALSLike | null = null;

if (typeof window === 'undefined') {
  try {
    // Hide from webpack's static analysis so the web bundle never tries to
    // resolve `async_hooks`. Only ever runs in the Node SSR bundle.
    // eslint-disable-next-line no-eval
    const nodeRequire = eval('require') as (id: string) => any;
    const { AsyncLocalStorage } = nodeRequire('async_hooks');
    storage = new AsyncLocalStorage();
  } catch (e) {
    storage = null;
  }
}

/** Run `callback` with the given SSR request context bound to its async scope. */
export function runWithSSRRequestContext<T>(ctx: SSRRequestContext, callback: () => T): T {
  if (storage) {
    return storage.run(ctx, callback);
  }
  return callback();
}

/** Read the SSR request context for the current async scope (undefined in browser). */
export function getSSRRequestContext(): SSRRequestContext | undefined {
  return storage ? storage.getStore() : undefined;
}

/** Whether code is currently executing on the server. */
export const isServerRuntime = typeof window === 'undefined';
