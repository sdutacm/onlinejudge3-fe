'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('competition public intro avoids direct window time reads during SSR render', () => {
  const filePath = path.join(__dirname, '../../src/pages/competitions-public/$id/intro.tsx');
  const source = fs.readFileSync(filePath, 'utf-8');

  assert.doesNotMatch(source, /Date\.now\(\)\s*-\s*\(\(window as any\)\._t_diff/);
  assert.match(source, /getCurrentTime/);
});
