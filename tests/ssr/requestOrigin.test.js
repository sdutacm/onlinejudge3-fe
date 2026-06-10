'use strict';

const { test } = require('node:test');
const assert = require('node:assert');

const { getRequestOrigin } = require('../../server/requestOrigin');

test('request origin falls back to Host when Koa origin is null', () => {
  const ctx = {
    origin: null,
    protocol: 'http',
    headers: {
      host: '127.0.0.1:8102',
    },
  };

  assert.strictEqual(getRequestOrigin(ctx, 8102), 'http://127.0.0.1:8102');
});

test('request origin keeps a truthy Koa origin', () => {
  const ctx = {
    origin: 'https://oj.example.com',
    protocol: 'http',
    headers: {
      host: '127.0.0.1:8102',
    },
  };

  assert.strictEqual(getRequestOrigin(ctx, 8102), 'https://oj.example.com');
});

test('request origin honors forwarded proxy headers', () => {
  const ctx = {
    origin: null,
    protocol: 'http',
    headers: {
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'oj.example.com',
      host: '127.0.0.1:8102',
    },
  };

  assert.strictEqual(getRequestOrigin(ctx, 8102), 'https://oj.example.com');
});

test('forwarded proxy headers override local Koa origin', () => {
  const ctx = {
    origin: 'http://127.0.0.1:8102',
    protocol: 'http',
    headers: {
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'oj.example.com',
      host: '127.0.0.1:8102',
    },
  };

  assert.strictEqual(getRequestOrigin(ctx, 8102), 'https://oj.example.com');
});
