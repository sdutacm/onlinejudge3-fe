'use strict';

/**
 * Pluggable SSR HTML cache, keyed by normalized request URL.
 *
 * Backends:
 *   - 'memory' : in-process Map with TTL + LRU eviction (per worker).
 *   - 'redis'  : shared across workers/machines via the optional `ioredis` dep
 *                (lazy-required so it never affects installs that don't use it).
 *   - 'off'    : no-op.
 *
 * Only anonymous, public SSR output is cached (the first SSR batch renders
 * user-independent content), so a plain URL key is safe to share across users.
 */

function createMemoryCache(opts) {
  var ttlMs = opts.ttlMs || 0;
  var max = opts.max || 500;
  var store = new Map(); // key -> { html, expireAt }

  return {
    backend: 'memory',
    get: function get(key) {
      var entry = store.get(key);
      if (!entry) {
        return Promise.resolve(null);
      }
      if (entry.expireAt && entry.expireAt < Date.now()) {
        store.delete(key);
        return Promise.resolve(null);
      }
      // refresh recency (LRU)
      store.delete(key);
      store.set(key, entry);
      return Promise.resolve(entry.html);
    },
    set: function set(key, html) {
      // Only evict when inserting a NEW key at capacity; overwriting an existing
      // key must not drop an unrelated entry.
      if (!store.has(key) && store.size >= max) {
        var oldest = store.keys().next().value;
        if (oldest !== undefined) {
          store.delete(oldest);
        }
      }
      store.set(key, { html: html, expireAt: ttlMs ? Date.now() + ttlMs : 0 });
      return Promise.resolve();
    },
    clear: function clear() {
      store.clear();
      return Promise.resolve();
    },
  };
}

function createRedisCache(opts) {
  var ttlMs = opts.ttlMs || 60000;
  var prefix = opts.prefix || 'oj3:ssr:';
  var Redis;
  try {
    // Lazy + optional: only loaded when SSR_CACHE=redis.
    Redis = require('ioredis');
  } catch (e) {
    throw new Error(
      'SSR_CACHE=redis requires the optional dependency "ioredis". ' +
        'Install it (`pnpm add ioredis`) or switch to SSR_CACHE=memory.',
    );
  }
  var client = new Redis(opts.redisUrl || 'redis://127.0.0.1:6379');
  client.on('error', function (err) {
    // Never let a cache outage break rendering; just log.
    // eslint-disable-next-line no-console
    console.error('[SSR][cache][redis] error:', err && err.message);
  });
  var ttlSec = Math.max(1, Math.round(ttlMs / 1000));

  return {
    backend: 'redis',
    client: client,
    get: function get(key) {
      return client.get(prefix + key).catch(function () {
        return null;
      });
    },
    set: function set(key, html) {
      return client.set(prefix + key, html, 'EX', ttlSec).catch(function () {
        /* ignore cache write failures */
      });
    },
    clear: function clear() {
      // Scoped clear via SCAN to avoid blocking; best-effort.
      return new Promise(function (resolve) {
        var stream = client.scanStream({ match: prefix + '*', count: 100 });
        stream.on('data', function (keys) {
          if (keys.length) {
            client.del.apply(client, keys);
          }
        });
        stream.on('end', resolve);
        stream.on('error', resolve);
      });
    },
  };
}

function createNoopCache() {
  return {
    backend: 'off',
    get: function () {
      return Promise.resolve(null);
    },
    set: function () {
      return Promise.resolve();
    },
    clear: function () {
      return Promise.resolve();
    },
  };
}

/**
 * @param {{ backend?: string, ttlMs?: number, max?: number, redisUrl?: string, prefix?: string }} opts
 */
function createSSRCache(opts) {
  opts = opts || {};
  var backend = String(opts.backend || 'off').toLowerCase();
  if (backend === 'memory') {
    return createMemoryCache(opts);
  }
  if (backend === 'redis') {
    return createRedisCache(opts);
  }
  return createNoopCache();
}

/**
 * Normalize a request URL into a stable cache key:
 *   - drop the SSR control param `ssr`
 *   - sort remaining query params for order-independence
 *   - keep pathname (including app base)
 * @param {string} reqUrl absolute-ish or path+query
 * @returns {string}
 */
function normalizeCacheKey(reqUrl) {
  var u;
  try {
    u = new URL(reqUrl, 'http://_internal_');
  } catch (e) {
    // Fail safe: never let a malformed URL throw on the hot path. Fall back to
    // the raw path (minus query), which is still a stable, non-leaking key.
    return String(reqUrl || '').split('#')[0].split('?')[0] || '/';
  }
  u.searchParams.delete('ssr');
  var entries = Array.from(u.searchParams.entries());
  entries.sort(function (a, b) {
    if (a[0] === b[0]) {
      return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
    }
    return a[0] < b[0] ? -1 : 1;
  });
  var search = entries.length
    ? '?' +
      entries
        .map(function (e) {
          return encodeURIComponent(e[0]) + '=' + encodeURIComponent(e[1]);
        })
        .join('&')
    : '';
  return u.pathname + search;
}

module.exports = {
  createSSRCache: createSSRCache,
  normalizeCacheKey: normalizeCacheKey,
};
