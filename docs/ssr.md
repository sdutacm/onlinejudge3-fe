# Server-Side Rendering (SSR)

onlinejudge3-fe runs on **umi 3.5.43**, which ships built-in SSR. This document
describes the SSR setup added on top of the existing custom routing/runtime, with
**no framework version changes**. New dependencies are limited to the deploy /
optional layer: `koa` + `koa-static` + `koa-mount` (prod server), `pm2`
(deployment, devDep), and `ioredis` (optional, only for the redis cache backend).

## TL;DR

```bash
# build the SSR bundle (emits dist incl. umi.server.js)
OJ3_SSR=1 pnpm build:ssr

# run it (single process)
SSR_API_BASE_URL=http://127.0.0.1:7001/onlinejudge3/api SSR_CACHE=memory pnpm serve:ssr

# or run the multi-worker cluster with pm2
SSR_API_BASE_URL=... pnpm start:ssr        # pm2 start ecosystem.config.js
pnpm reload:ssr                            # zero-downtime reload after a rebuild
```

## How it works

```
                         ┌──────────────────────── server/index.js (Koa) ───────────────────────┐
 request ──▶ static?  ──▶│ ssr=0 / policy-denied? ──▶ serve CSR shell (index.html)               │
            (koa-static) │ cache hit? ─────────────▶ serve cached HTML                            │
                         │ else ─▶ umi.server.js render() ─▶ ok? cache + serve  /  error? CSR     │
                         └──────────────────────────────────────────────────────────────────────┘
```

1. **Renderer**: enabling `ssr` in `.umirc.js` (gated by `OJ3_SSR=1`) makes umi
   emit `umi.server.js` — a self-contained `render({ path, ... }) => { html, error }`.
   The Koa server is a *thin wrapper*: it does routing, static files, the SSR
   gate, caching and fallback; **umi does the actual React render + data prefetch.**
2. **Per-page switch** (`src/configs/ssr.js`): SSR is **on by default**; a denylist
   of path patterns is rendered CSR-only. Single source of truth, shared by the
   server and the tests.
3. **Data prefetch** (`src/utils/ssr.ts`): SSR-enabled pages declare what to fetch
   via `withSSRPrefetch`, which adds a server `getInitialProps` that dispatches the
   page's existing dva read-effects against the per-request store and returns the
   state for hydration. The effects' existing freshness guards (`isStateExpired` /
   `genTimeFlag`) mean the client subscription re-dispatch after hydration is a
   no-op — **no double fetch, no content flash**. Client route transitions and
   loading feedback (nprogress) are unchanged (handled by `RouteTransitionRouter`).
4. **Isomorphic request layer**: `src/utils/request.ts` + `src/utils/ssrRequestContext.ts`
   thread the absolute API base + forwarded cookies through `AsyncLocalStorage`
   so server-side fetches reach the real API without leaking state across the
   concurrent renders a single worker handles.
5. **Fallback**: any render error / timeout / empty output → the server logs a
   structured `[SSR]` error and serves the CSR shell. SSR can never 500 the user.
6. **Cache** (optional): successful, public SSR HTML is cached by normalized URL.

## The per-page SSR switch

Edit `src/configs/ssr.js`. SSR is enabled unless a request pathname (base
stripped) matches `SSR_DENY_PATTERNS`.

Currently **CSR-only** (denied): `admin/*`, contest **detail** `/contests/:id*`,
competition **detail** `/competitions/:id*` (note: `/competitions-public/*` is a
different path and stays enabled), `topics/*`, `solutions/*`, `favorites`,
`messages`, `notes`, `stats/*`, `beta`, `OJBK`.

> The contest/competition **list** pages (`/contests`, `/competitions`) stay SSR
> enabled; only their detail families are denied. The patterns use `[^/]+` so they
> match both concrete ids (`/contests/123`) and route patterns (`/contests/:id`).

To disable SSR for a new page, add a pattern. To re-enable one, remove its pattern.
Covered by `tests/ssr/ssrPolicy.test.js`.

## Adding server prefetch to a page

For a `connect()`-based page that reads from the dva store, wrap the export:

```tsx
import { withSSRPrefetch, getSSRQuery } from '@/utils/ssr';

export default withSSRPrefetch(connect(mapStateToProps)(MyPage), [
  (ctx) => ctx.store.dispatch({ type: 'mymodel/getDetail', payload: { id: +ctx.match.params.id } }),
  (ctx) => ctx.store.dispatch({ type: 'mymodel/getList', payload: getSSRQuery(ctx) }),
]);
```

Only prefetch **public** data — session-gated extras (favorites, solve status,
unread counts) should keep loading on the client. Each task is isolated: a failing
read logs and degrades to client-fetched data rather than aborting the render.

For a page that keeps fetched data in **local component state** (e.g. the home
page's recent-competitions widget) use the `getProps` option and seed state from
props so server markup matches the first client render:

```tsx
export default withSSRPrefetch(connect(mapStateToProps)(Home), [], {
  getProps: async (ctx) => {
    const ret = await ctx.store.dispatch({ type: 'competitions/getListData', payload: { limit: 3 } });
    return { recentCompetitions: ret && ret.success ? ret.data : undefined };
  },
});
// ...and in the constructor: seed this.state from props.recentCompetitions
```

Pages with SSR prefetch wired: home `/`, problems list+detail, contests list,
competitions list, competition intro (`/competitions-public/:id/intro`), users
list+detail, posts list+detail, sets list+detail, groups list+detail.

> Pages that are SSR-enabled but not yet wired for prefetch still server-render
> their shell/chrome; their data loads on the client.

## Deployment (pm2, multi-worker)

`ecosystem.config.js` runs `server/index.js` in **cluster** mode — pm2
load-balances across workers on one port. Tune workers with `SSR_WORKERS`
(default: one per CPU).

```bash
OJ3_SSR=1 pnpm build:ssr
SSR_API_BASE_URL=http://127.0.0.1:7001/onlinejudge3/api SSR_CACHE=memory pnpm start:ssr
pnpm reload:ssr   # after each rebuild, zero-downtime
pnpm logs:ssr     # (pm2 logs oj3-ssr) structured [SSR] lines
```

Put this behind your existing reverse proxy so it receives `/onlinejudge3/*`
(or set `OJ3_BASE`). Static assets are served by the node process from the build
output; you may alternatively let nginx serve them and proxy only HTML routes.

The competition-side build/serve mirrors this: `pnpm build:ssr:competition-side`
and the `env_competition_side` block (`OJ3_BASE=/onlinejudge3_cs/`).

## Configuration (environment variables)

| Var | Default | Meaning |
|-----|---------|---------|
| `OJ3_SSR` | – | set to `1` at **build** time to emit `umi.server.js` |
| `SSR_PORT` / `PORT` | `7002` | listen port |
| `SSR_HOST` | `0.0.0.0` | listen host |
| `OJ3_BASE` | `/onlinejudge3/` | app base path |
| `OJ3_OUTPUT_DIR` | `<base>` dir | built output dir (contains `umi.server.js`, `index.html`). **Must match umi's `outputPath`** — `.umirc.js` builds to `./onlinejudge3` (and `./onlinejudge3_cs`), and the default is derived from `OJ3_BASE`; set this explicitly if you customize the base/outputPath. |
| `SSR_API_BASE_URL` | – | **absolute** upstream API base for server fetches, e.g. `http://127.0.0.1:7001/onlinejudge3/api`. Without it, prefetch can't reach the API. |
| `SSR_FORWARD_COOKIES` | `0` | forward the incoming `Cookie` header to upstream during prefetch. **Off by default so cacheable renders are anonymous** (see Caching). Turn on only if the backend needs cookies for public reads (CSRF); authenticated renders are then never cached. |
| `SSR_SESSION_COOKIE_NAMES` | `EGG_SESS,koa.sess,connect.sid,ssid,sid,SESSION` | cookie names that mark a logged-in session; used (only when forwarding is on) to flag a render private and skip caching it. Set to your backend's actual session cookie name. |
| `SSR_RENDER_TIMEOUT_MS` | `5000` | render timeout → CSR fallback |
| `SSR_CACHE` | `off` | `memory` \| `redis` \| `off` |
| `SSR_CACHE_TTL_MS` | `60000` | cache TTL |
| `SSR_CACHE_MAX` | `500` | memory cache max entries (LRU) |
| `SSR_CACHE_REDIS_URL` | `redis://127.0.0.1:6379` | redis connection (redis backend) |
| `SSR_CACHE_PREFIX` | `oj3:ssr:` | redis key prefix |
| `SSR_LOG_LEVEL` | `info` | `debug` \| `info` \| `warn` \| `error` |
| `SSR_WORKERS` | `max` | pm2 cluster worker count |

## Caching

`SSR_CACHE=memory` caches per worker; `SSR_CACHE=redis` shares across workers/
machines (requires the optional `ioredis`; install with `pnpm add ioredis` if not
present). The key is the **normalized URL**: the `ssr` control param is dropped and
remaining query params are sorted, so `?b=2&a=1` and `?a=1&b=2` share an entry.

**Cache safety (no cross-user leak).** Because cookie forwarding is off by default,
SSR renders are anonymous → user-independent → a URL key can safely be shared across
users. If you enable `SSR_FORWARD_COOKIES=1`, a render carrying a session cookie
(`SSR_SESSION_COOKIE_NAMES`) is treated as **private**: it is neither read from nor
written to the cache (`X-SSR-Cache: PRIVATE`). All generated HTML is sent with
`Cache-Control: private, no-store` + `Vary: Cookie`, so browsers/CDNs/proxies never
store a render — the in-process/redis cache is the only place a render is kept.

> Keep prefetch tasks reading **public, user-independent data only**. If an endpoint
> ever personalizes by session (an "AC" badge, follow state, unread count in shared
> chrome) it would land in the shared cache for anonymous renders — render it on the
> client instead, or move the page behind the denylist.

Response headers for debugging: `X-SSR: 1|0`, `X-SSR-Cache: HIT|MISS|PRIVATE`,
`X-SSR-Reason: ssr=0|policy-denied|render-error|empty-output|exception`.

## Forcing CSR for one request

Append `?ssr=0` to any URL to bypass SSR (the param is stripped from the cache
key). Useful for debugging hydration or isolating SSR-specific issues.

## Fallback & logging

If `umi.server.js` returns `result.error`, produces empty output, or the render
exceeds `SSR_RENDER_TIMEOUT_MS`, the server logs a structured `[SSR][...][error]`
line (url, ms, message, stack) and serves the CSR shell. The user always gets a
working page; the only difference is first paint + SEO for that request.

## Tests

```bash
pnpm test:ssr      # node --test tests/ssr/*.test.js
```

- `ssrPolicy.test.js` — the per-page switch (list-on / detail-off asymmetry,
  competitions-public exclusion, denied modules, normalization).
- `ssrCache.test.js` — cache-key normalization (incl. malformed-URL fail-safe) +
  memory backend (hit/miss/TTL/LRU, eviction only on new keys).

**Manual QA (do before merge — needs a browser, can't be unit-tested):** build
(`OJ3_SSR=1 pnpm build:ssr`), `SSR_API_BASE_URL=… pnpm serve:ssr`, open a wired page
(e.g. `/onlinejudge3/problems`) with the devtools console open and confirm **zero**
React "did not match"/hydration warnings, and that `?ssr=0` on the same URL renders
identically via CSR.

## Troubleshooting

- **Every page renders an empty `#root` (CSR fallback, no error in logs).** The app
  base passed to umi `render()` must NOT have a trailing slash — React Router v5's
  `StaticRouter` mishandles `/onlinejudge3/` and matches no route. The server already
  strips it (`baseNoTrailing()`); keep it that way if you customize the render call.
- **A page falls back with `window is not defined`.** Some component in that page's
  tree reads a browser global during `render()`. Common one: the server-client clock
  offset `window._t_diff` — guard reads as
  `(typeof window !== 'undefined' ? (window as any)._t_diff : 0) || 0`. The `[SSR]`
  error log includes the stack offset into `umi.server.js`.
- **A wired page hangs ~4s then falls back.** Its prefetch couldn't reach the API
  (`SSR_API_BASE_URL` wrong/unreachable). Each prefetch task is capped at 4s, then the
  render proceeds with partial data; fix the API base to render fully.

## Known limitations / risks

- **Anonymous reads & CSRF**: the API uses POST for reads. For a first-visit
  anonymous request there is no csrf token; if the backend enforces csrf on these
  reads, the prefetch returns no data — the page still SSRs its shell and the
  client refetches with proper cookies. Forwarding cookies (default) covers
  logged-in/returning visitors.
- **Render-time browser globals**: a page that touches `window`/`document` during
  `render()` will throw on the server; this is caught and that request degrades to
  CSR (logged). Eager, server-loaded modules (dva models, the layout, the request
  layer, localStorage/effectInterceptor) have been made server-safe.
- Pages holding data in local component state need the `getProps` pattern (see
  above) to be fully server-rendered.
