'use strict';

const { test } = require('node:test');
const assert = require('node:assert');

const { getAPIProxyTarget } = require('../../server/apiProxy');

test('api proxy maps app api paths to the upstream base', () => {
  assert.strictEqual(
    getAPIProxyTarget('/onlinejudge3/api/getSession?_t=1', '/onlinejudge3/', 'http://127.0.0.1:7001'),
    'http://127.0.0.1:7001/getSession?_t=1',
  );
});

test('api proxy ignores non-api app paths', () => {
  assert.strictEqual(
    getAPIProxyTarget('/onlinejudge3/sets/16', '/onlinejudge3/', 'http://127.0.0.1:7001'),
    null,
  );
});

test('api proxy is disabled without an upstream base', () => {
  assert.strictEqual(getAPIProxyTarget('/onlinejudge3/api/getSession', '/onlinejudge3/', ''), null);
});
