'use strict';

const { test } = require('node:test');
const assert = require('node:assert');

const { createSSRCache, normalizeCacheKey } = require('../../server/ssrCache');

test('normalizeCacheKey drops the ssr control param and sorts query', () => {
  assert.strictEqual(normalizeCacheKey('/onlinejudge3/problems'), '/onlinejudge3/problems');
  // ssr param removed
  assert.strictEqual(
    normalizeCacheKey('/onlinejudge3/problems?ssr=0'),
    '/onlinejudge3/problems',
  );
  // remaining params sorted, order-independent
  assert.strictEqual(
    normalizeCacheKey('/onlinejudge3/problems?page=2&category=dp&ssr=0'),
    normalizeCacheKey('/onlinejudge3/problems?category=dp&page=2'),
  );
  assert.strictEqual(
    normalizeCacheKey('/onlinejudge3/problems?b=2&a=1'),
    '/onlinejudge3/problems?a=1&b=2',
  );
});

test('memory cache stores and retrieves by key', async () => {
  const cache = createSSRCache({ backend: 'memory', ttlMs: 1000, max: 10 });
  assert.strictEqual(cache.backend, 'memory');
  assert.strictEqual(await cache.get('/a'), null);
  await cache.set('/a', '<html>A</html>');
  assert.strictEqual(await cache.get('/a'), '<html>A</html>');
});

test('memory cache expires entries after TTL', async () => {
  const cache = createSSRCache({ backend: 'memory', ttlMs: 20, max: 10 });
  await cache.set('/a', 'X');
  assert.strictEqual(await cache.get('/a'), 'X');
  await new Promise((r) => setTimeout(r, 35));
  assert.strictEqual(await cache.get('/a'), null);
});

test('normalizeCacheKey never throws on malformed input (fail-safe)', () => {
  // A bare malformed string still yields a stable, non-throwing key.
  assert.doesNotThrow(() => normalizeCacheKey('http://%%%bad'));
  assert.strictEqual(normalizeCacheKey('/onlinejudge3/x?ssr=0#frag'), '/onlinejudge3/x');
  // even a value that fails URL parsing returns the path portion
  const k = normalizeCacheKey('not a url ?a=1');
  assert.strictEqual(typeof k, 'string');
  assert.ok(k.length > 0);
});

test('memory cache does NOT evict an unrelated entry when overwriting at capacity', async () => {
  const cache = createSSRCache({ backend: 'memory', ttlMs: 0, max: 2 });
  await cache.set('/a', 'A');
  await cache.set('/b', 'B'); // at capacity
  await cache.set('/a', 'A2'); // overwrite existing key — must not drop /b
  assert.strictEqual(await cache.get('/b'), 'B');
  assert.strictEqual(await cache.get('/a'), 'A2');
});

test('memory cache evicts the oldest entry past max size (LRU)', async () => {
  const cache = createSSRCache({ backend: 'memory', ttlMs: 0, max: 2 });
  await cache.set('/a', 'A');
  await cache.set('/b', 'B');
  // touch /a so /b becomes the least-recently-used
  await cache.get('/a');
  await cache.set('/c', 'C'); // should evict /b
  assert.strictEqual(await cache.get('/b'), null);
  assert.strictEqual(await cache.get('/a'), 'A');
  assert.strictEqual(await cache.get('/c'), 'C');
});

test('off backend is a no-op cache', async () => {
  const cache = createSSRCache({ backend: 'off' });
  assert.strictEqual(cache.backend, 'off');
  await cache.set('/a', 'A');
  assert.strictEqual(await cache.get('/a'), null);
});
