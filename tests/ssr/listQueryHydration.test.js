'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadListQueryModule() {
  const filePath = path.join(__dirname, '../../src/utils/listQuery.ts');
  const source = fs.readFileSync(filePath, 'utf-8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      esModuleInterop: true,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require: (id) => {
      if (id === 'lodash-es') {
        return { isEqual: require('lodash/isEqual') };
      }
      if (id === '@/utils/misc') {
        return { isStateExpired: (savedState) => !savedState || !savedState._et || savedState._et < Date.now() };
      }
      return require(id);
    },
    Date,
  });

  vm.runInContext(output, context, { filename: filePath });
  return module.exports;
}

test('contest list query normalization preserves category=0', () => {
  const { normalizeContestListQuery } = loadListQueryModule();

  assert.deepStrictEqual(JSON.parse(JSON.stringify(normalizeContestListQuery({ category: '0' }))), {
    page: 1,
    category: 0,
    order: [['contestId', 'DESC']],
  });
});

test('fresh list data suppresses only redundant list loading', () => {
  const { normalizeContestListQuery, shouldShowListLoadingForQuery } = loadListQueryModule();
  const expectedQuery = normalizeContestListQuery({ category: '0' });
  const freshList = {
    _query: expectedQuery,
    _et: Date.now() + 60 * 1000,
    rows: [{ contestId: 1 }],
  };

  assert.strictEqual(shouldShowListLoadingForQuery(true, freshList, expectedQuery), false);
  assert.strictEqual(
    shouldShowListLoadingForQuery(true, freshList, normalizeContestListQuery({ category: '2' })),
    true,
  );
  assert.strictEqual(
    shouldShowListLoadingForQuery(true, { ...freshList, _et: Date.now() - 1 }, expectedQuery),
    true,
  );
  assert.strictEqual(shouldShowListLoadingForQuery(false, freshList, expectedQuery), false);
});
