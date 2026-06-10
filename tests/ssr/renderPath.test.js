'use strict';

const { test } = require('node:test');
const assert = require('node:assert');

const { getSSRRenderPath } = require('../../server/renderPath');

test('SSR render path keeps the request query string', () => {
  assert.strictEqual(
    getSSRRenderPath({
      originalUrl: '/onlinejudge3/contests?category=0&page=2',
      path: '/onlinejudge3/contests',
    }),
    '/onlinejudge3/contests?category=0&page=2',
  );
});

test('SSR render path falls back to ctx.path', () => {
  assert.strictEqual(
    getSSRRenderPath({
      path: '/onlinejudge3/problems/1000',
    }),
    '/onlinejudge3/problems/1000',
  );
});
