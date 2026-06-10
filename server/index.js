'use strict';

// Must load before the umi server bundle: decorated classes (`@memoize`) are
// compiled with `emitDecoratorMetadata`, which calls `Reflect.metadata(...)`.
// The browser gets this from core-js; Node needs the polyfill explicitly.
require('reflect-metadata');

/**
 * Production SSR server.
 *
 * This is a thin wrapper around the renderer umi generates (`umi.server.js`):
 * umi does the actual React render + data prefetch; this process only adds
 * request routing, static asset serving, the per-page SSR gate (+ `?ssr=0`),
 * URL-keyed caching, and graceful CSR fallback with logging.
 *
 * Run multiple workers per machine via pm2 cluster mode (see ecosystem.config.js).
 */

var path = require('path');
var fs = require('fs');
var Koa = require('koa');
var serve = require('koa-static');
var mount = require('koa-mount');

var apiProxy = require('./apiProxy');
var log = require('./logger');
var renderPath = require('./renderPath');
var requestOrigin = require('./requestOrigin');
var ssrCache = require('./ssrCache');
var ssrPolicy = require('../src/configs/ssr');

// ---------------------------------------------------------------------------
// Config (all overridable via env)
// ---------------------------------------------------------------------------
var PORT = parseInt(process.env.SSR_PORT || process.env.PORT || '8102', 10);
var HOST = process.env.SSR_HOST || '0.0.0.0';
var BASE = process.env.OJ3_BASE || '/onlinejudge3/';
var OUTPUT_DIR = process.env.OJ3_OUTPUT_DIR
  ? path.resolve(process.env.OJ3_OUTPUT_DIR)
  : path.join(__dirname, '..', BASE.replace(/^\/|\/$/g, '') || 'onlinejudge3');

// Absolute upstream API base for server-side fetches, e.g.
//   http://127.0.0.1:7001
var SSR_API_BASE_URL = process.env.SSR_API_BASE_URL || '';

var RENDER_TIMEOUT_MS = parseInt(process.env.SSR_RENDER_TIMEOUT_MS || '5000', 10);

// Cookie forwarding is OFF by default: cacheable SSR renders ANONYMOUSLY so the
// output is provably user-independent and the URL-keyed cache can never serve one
// user's HTML to another. Personalization (favorites, AC badges, unread counts)
// hydrates on the client. Enable `SSR_FORWARD_COOKIES=1` only if the backend
// needs cookies for public reads (e.g. CSRF) — when on, authenticated renders are
// never cached (see `isPrivateRender`).
var FORWARD_COOKIES = process.env.SSR_FORWARD_COOKIES === '1';

// Cookie names that indicate a logged-in session. Used (only when forwarding is
// on) to mark a render private and skip caching it. Override per deployment.
var SESSION_COOKIE_NAMES = (process.env.SSR_SESSION_COOKIE_NAMES ||
  'EGG_SESS,koa.sess,connect.sid,ssid,sid,SESSION')
  .split(',')
  .map(function (s) { return s.trim(); })
  .filter(Boolean);

var cache = ssrCache.createSSRCache({
  backend: process.env.SSR_CACHE || 'off',
  ttlMs: parseInt(process.env.SSR_CACHE_TTL_MS || '60000', 10),
  max: parseInt(process.env.SSR_CACHE_MAX || '500', 10),
  redisUrl: process.env.SSR_CACHE_REDIS_URL || 'redis://127.0.0.1:6379',
  prefix: process.env.SSR_CACHE_PREFIX || 'oj3:ssr:',
});

var SERVER_BUNDLE = path.join(OUTPUT_DIR, 'umi.server.js');
var HTML_TEMPLATE_PATH = path.join(OUTPUT_DIR, 'index.html');

// ---------------------------------------------------------------------------
// Load the umi-generated renderer + the CSR shell once at boot.
// ---------------------------------------------------------------------------
function loadServerRender() {
  if (!fs.existsSync(SERVER_BUNDLE)) {
    throw new Error(
      'umi.server.js not found at ' +
        SERVER_BUNDLE +
        '. Build with `OJ3_SSR=1 umi build` first (see `pnpm build:ssr`).',
    );
  }
  // eslint-disable-next-line import/no-dynamic-require, global-require
  var mod = require(SERVER_BUNDLE);
  return mod && mod.default ? mod.default : mod;
}

var serverRender = loadServerRender();
var htmlTemplate = fs.existsSync(HTML_TEMPLATE_PATH)
  ? fs.readFileSync(HTML_TEMPLATE_PATH, 'utf-8')
  : '';

if (!htmlTemplate) {
  log.warn('CSR shell index.html not found; CSR fallback will be empty', {
    path: HTML_TEMPLATE_PATH,
  });
}
if (!SSR_API_BASE_URL) {
  log.warn('SSR_API_BASE_URL is not set; server-side data prefetch will not reach the API');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function baseNoTrailing() {
  return BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
}

/** Strip the app base prefix from a pathname, yielding the in-app path. */
function stripBase(pathname) {
  var b = baseNoTrailing();
  if (!b) {
    return pathname;
  }
  if (pathname === b) {
    return '/';
  }
  if (pathname.indexOf(b + '/') === 0) {
    return pathname.slice(b.length) || '/';
  }
  return pathname;
}

function isUnderBase(pathname) {
  var b = baseNoTrailing();
  return !b || pathname === b || pathname.indexOf(b + '/') === 0;
}

/** Whether the request carries a session cookie (i.e. a logged-in user). */
function hasSessionCookie(ctx) {
  var raw = ctx.headers.cookie;
  if (!raw) {
    return false;
  }
  return SESSION_COOKIE_NAMES.some(function (name) {
    // match `name=` with a non-empty value, anywhere in the Cookie header
    var re = new RegExp('(?:^|;\\s*)' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=[^;\\s]');
    return re.test(raw);
  });
}

// Mark generated HTML as never shared by browsers/CDNs/proxies — our in-process
// (or redis) cache is the only place a render is ever stored, and only when it is
// known to be user-independent.
function setHtmlCacheHeaders(ctx) {
  ctx.type = 'text/html; charset=utf-8';
  ctx.set('Cache-Control', 'private, no-store');
  ctx.set('Vary', 'Cookie');
}

function serveCSR(ctx, reason, fields) {
  ctx.status = 200;
  setHtmlCacheHeaders(ctx);
  ctx.set('X-SSR', '0');
  ctx.set('X-SSR-Reason', reason);
  ctx.body = htmlTemplate;
  log.info('served CSR', Object.assign({ url: ctx.originalUrl, reason: reason }, fields || {}));
}

function withTimeout(promise, ms, label) {
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () {
      reject(new Error((label || 'operation') + ' timed out after ' + ms + 'ms'));
    }, ms);
    Promise.resolve(promise).then(
      function (v) {
        clearTimeout(timer);
        resolve(v);
      },
      function (e) {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
var app = new Koa();

// Never serve build internals as static files: the server bundle is attack
// surface / information disclosure, and the raw `index.html` would bypass the
// SSR gate. Sourcemaps and the asset manifest are noise we don't expose either.
var BLOCKED_STATIC = /(?:^|\/)(umi\.server\.js|umi\.server\.d\.ts|index\.html|asset-manifest\.json)$|\.map$/;
app.use(async function blockSensitiveStatic(ctx, next) {
  if ((ctx.method === 'GET' || ctx.method === 'HEAD') && BLOCKED_STATIC.test(ctx.path)) {
    ctx.status = 404;
    ctx.body = 'Not Found';
    return;
  }
  await next();
});

// In SSR dev mode this Koa process often replaces the old CSR dev server on the
// same port. Preserve the old `/onlinejudge3/api/* -> backend /*` proxy shape so
// browser-only state such as session can refresh after hydration.
app.use(async function proxyAPI(ctx, next) {
  var target = apiProxy.getAPIProxyTarget(ctx.originalUrl || ctx.url, BASE, SSR_API_BASE_URL);
  if (!target) {
    await next();
    return;
  }
  try {
    await apiProxy.proxyAPIRequest(ctx, target);
  } catch (e) {
    log.error('API proxy failed', {
      url: ctx.originalUrl,
      target: target,
      err: e && e.message,
      stack: e && e.stack,
    });
    ctx.status = 502;
    ctx.body = 'Bad Gateway';
  }
});

// Static assets (js/css/img/manifest...) under the app base. `index: false`
// so directory requests fall through to the SSR/CSR handler below.
app.use(
  mount(baseNoTrailing() || '/', serve(OUTPUT_DIR, {
    index: false,
    maxage: parseInt(process.env.SSR_STATIC_MAXAGE_MS || '86400000', 10),
    gzip: true,
    brotli: true,
    setHeaders: function (res, filePath) {
      // umi hashes asset filenames, so they are safe to cache immutably; the
      // entry HTML is never served from here.
      if (/\.(js|css|woff2?|ttf|png|jpe?g|svg|gif|ico)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })),
);

app.use(async function handler(ctx) {
  if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
    ctx.status = 405;
    ctx.body = 'Method Not Allowed';
    return;
  }

  var pathname = ctx.path;

  // Root convenience redirect to the app base.
  if (pathname === '/' && baseNoTrailing()) {
    ctx.redirect(BASE);
    return;
  }

  if (!isUnderBase(pathname)) {
    ctx.status = 404;
    ctx.body = 'Not Found';
    return;
  }

  var appPath = stripBase(pathname);
  var forceCSR = String(ctx.query.ssr) === '0';

  // Per-page SSR gate.
  if (forceCSR) {
    serveCSR(ctx, 'ssr=0');
    return;
  }
  if (!ssrPolicy.isSSREnabledForPath(appPath)) {
    serveCSR(ctx, 'policy-denied', { appPath: appPath });
    return;
  }

  var startedAt = Date.now();
  var cacheKey = ssrCache.normalizeCacheKey(ctx.url);
  // A render is "private" (must not be cached / shared) only when we forward the
  // user's cookies AND a session cookie is present. With forwarding off (default)
  // every render is anonymous → public → cacheable.
  var isPrivateRender = FORWARD_COOKIES && hasSessionCookie(ctx);

  // Cache lookup — skip entirely for private (authenticated) renders.
  try {
    var cached = isPrivateRender ? null : await cache.get(cacheKey);
    if (cached) {
      ctx.status = 200;
      setHtmlCacheHeaders(ctx);
      ctx.set('X-SSR', '1');
      ctx.set('X-SSR-Cache', 'HIT');
      ctx.body = cached;
      log.info('served SSR (cache hit)', {
        url: ctx.originalUrl,
        ms: Date.now() - startedAt,
        backend: cache.backend,
      });
      return;
    }
  } catch (e) {
    log.warn('cache get failed', { url: ctx.originalUrl, err: e && e.message });
  }

  // Render via umi's server bundle.
  try {
    var origin = requestOrigin.getRequestOrigin(ctx, PORT);
    var path = renderPath.getSSRRenderPath(ctx);
    var result = await withTimeout(
      serverRender({
        path: path,
        origin: origin,
        htmlTemplate: htmlTemplate,
        mountElementId: 'root',
        // React Router v5's StaticRouter mishandles a trailing-slash basename
        // (the stripped path loses its leading slash → no route matches → empty
        // render), so pass the base WITHOUT the trailing slash.
        basename: baseNoTrailing() || '/',
        getInitialPropsCtx: {
          apiBaseURL: SSR_API_BASE_URL,
          cookie: FORWARD_COOKIES ? ctx.headers.cookie || '' : '',
          origin: origin,
        },
      }),
      RENDER_TIMEOUT_MS,
      'SSR render',
    );

    // umi catches internal render errors and returns them on `result.error`.
    if (result && result.error) {
      log.error('SSR render error -> CSR fallback', {
        url: ctx.originalUrl,
        ms: Date.now() - startedAt,
        err: (result.error && result.error.message) || String(result.error),
        stack: result.error && result.error.stack,
      });
      serveCSR(ctx, 'render-error');
      return;
    }

    if (!result || !result.html || !result.rootContainer) {
      log.error('SSR produced empty output -> CSR fallback', {
        url: ctx.originalUrl,
        ms: Date.now() - startedAt,
      });
      serveCSR(ctx, 'empty-output');
      return;
    }

    ctx.status = 200;
    setHtmlCacheHeaders(ctx);
    ctx.set('X-SSR', '1');
    ctx.set('X-SSR-Cache', isPrivateRender ? 'PRIVATE' : 'MISS');
    ctx.body = result.html;

    // Only cache user-independent (anonymous) renders.
    if (!isPrivateRender) {
      cache.set(cacheKey, result.html).catch(function (e) {
        log.warn('cache set failed', { url: ctx.originalUrl, err: e && e.message });
      });
    }

    log.info('served SSR', {
      url: ctx.originalUrl,
      ms: Date.now() - startedAt,
      backend: cache.backend,
    });
  } catch (e) {
    // Timeout or unexpected throw -> never 500 the user, downgrade to CSR.
    log.error('SSR threw -> CSR fallback', {
      url: ctx.originalUrl,
      ms: Date.now() - startedAt,
      err: e && e.message,
      stack: e && e.stack,
    });
    serveCSR(ctx, 'exception');
  }
});

app.on('error', function (err, ctx) {
  log.error('koa error', {
    url: ctx && ctx.originalUrl,
    err: err && err.message,
    stack: err && err.stack,
  });
});

app.listen(PORT, HOST, function () {
  log.info('SSR server listening', {
    host: HOST,
    port: PORT,
    base: BASE,
    outputDir: OUTPUT_DIR,
    apiBase: SSR_API_BASE_URL || '(unset)',
    cache: cache.backend,
    worker: process.env.NODE_APP_INSTANCE || process.pid,
  });
});

module.exports = app;
