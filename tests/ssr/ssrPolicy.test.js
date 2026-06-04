'use strict';

const { test } = require('node:test');
const assert = require('node:assert');

const { isSSREnabledForPath } = require('../../src/configs/ssr');

test('home and public list/detail pages are SSR-enabled', () => {
  for (const p of [
    '/',
    '/problems',
    '/problems/1234',
    '/posts',
    '/posts/5',
    '/users',
    '/users/42',
    '/sets',
    '/sets/7',
    '/sets/7/stats',
    '/groups',
    '/groups/3',
  ]) {
    assert.strictEqual(isSSREnabledForPath(p), true, `${p} should be SSR-enabled`);
  }
});

test('contest/competition LIST pages stay SSR-enabled, DETAIL families are denied', () => {
  // lists stay on
  assert.strictEqual(isSSREnabledForPath('/contests'), true);
  assert.strictEqual(isSSREnabledForPath('/competitions'), true);
  // detail families off
  for (const p of [
    '/contests/1',
    '/contests/1/overview',
    '/contests/1/ranklist',
    '/contests/1/problems/2',
    '/competitions/9',
    '/competitions/9/overview',
    '/competitions/9/userManagement',
  ]) {
    assert.strictEqual(isSSREnabledForPath(p), false, `${p} should be denied`);
  }
});

test('competitions-public is NOT affected by the competitions detail deny rule', () => {
  assert.strictEqual(isSSREnabledForPath('/competitions-public/9/intro'), true);
  assert.strictEqual(isSSREnabledForPath('/competitions-public/9/participants'), true);
});

test('permission-gated / user-specific / realtime modules are CSR-only', () => {
  for (const p of [
    '/admin',
    '/admin/users',
    '/admin/problems/1/data',
    '/topics',
    '/topics/3',
    '/solutions',
    '/solutions/3',
    '/favorites',
    '/messages',
    '/notes',
    '/stats/judge',
    '/beta',
    '/OJBK',
  ]) {
    assert.strictEqual(isSSREnabledForPath(p), false, `${p} should be CSR-only`);
  }
});

test('trailing slashes are normalized', () => {
  assert.strictEqual(isSSREnabledForPath('/contests/'), true); // still the list
  assert.strictEqual(isSSREnabledForPath('/admin/'), false);
  assert.strictEqual(isSSREnabledForPath('/problems/'), true);
});

test('query/hash suffixes do not change the decision', () => {
  assert.strictEqual(isSSREnabledForPath('/problems?page=2'), true);
  assert.strictEqual(isSSREnabledForPath('/admin?x=1#y'), false);
});
