'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadCurrentTimeModule(globals = {}) {
  const filePath = path.join(__dirname, '../../src/utils/currentTime.ts');
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
    ...globals,
    module,
    exports: module.exports,
  });

  vm.runInContext(output, context, { filename: filePath });
  return module.exports;
}

test('getCurrentTime works during SSR without window', () => {
  const { getCurrentTime } = loadCurrentTimeModule({
    Date: {
      now: () => 1000,
    },
  });

  assert.strictEqual(getCurrentTime(), 1000);
});

test('getCurrentTime applies client server-time offset when available', () => {
  const { getCurrentTime } = loadCurrentTimeModule({
    Date: {
      now: () => 1000,
    },
    window: {
      _t_diff: 123,
    },
  });

  assert.strictEqual(getCurrentTime(), 877);
});
