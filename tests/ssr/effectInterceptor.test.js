'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadEffectInterceptorInNodeContext() {
  const source = fs.readFileSync(
    path.join(__dirname, '../../src/utils/effectInterceptor.ts'),
    'utf-8',
  );
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require: () => ({}),
  });

  vm.runInContext(transpiled, context);
  return module.exports;
}

test('requestEffect is inert during Node SSR', () => {
  const { requestEffect } = loadEffectInterceptorInNodeContext();
  let dispatchCount = 0;

  requestEffect(() => {
    dispatchCount += 1;
  }, { type: 'problems/getDetail' });

  assert.strictEqual(dispatchCount, 0);
});
