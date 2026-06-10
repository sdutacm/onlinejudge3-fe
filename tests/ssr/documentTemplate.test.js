'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const documentTemplatePath = path.join(__dirname, '../../src/pages/document.ejs');

test('document template exposes the SSR mount marker only once', () => {
  const template = fs.readFileSync(documentTemplatePath, 'utf-8');
  const mountMarker = '<div id="root"></div>';
  const matches = template.match(new RegExp(mountMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || [];

  assert.strictEqual(
    matches.length,
    1,
    'umi SSR replaces the first exact mount marker; duplicates can inject markup into comments',
  );
});
