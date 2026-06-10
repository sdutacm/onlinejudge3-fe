'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadGetPathParamsModule() {
  const filePath = path.join(__dirname, '../../src/utils/getPathParams.ts');
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
      if (id === 'react-router') {
        return {
          matchPath: (pathname, options) => {
            const names = [];
            const pattern = options.path.replace(/:([^/]+)/g, (_, name) => {
              names.push(name);
              return '([^/]+)';
            });
            const match = String(pathname).match(new RegExp(`^${pattern}(?:/)?$`));
            if (!match) {
              return null;
            }
            return {
              params: names.reduce((params, name, index) => {
                params[name] = match[index + 1];
                return params;
              }, {}),
            };
          },
        };
      }
      return require(id);
    },
    process,
    URL,
  });

  vm.runInContext(output, context, { filename: filePath });
  return module.exports;
}

test('getPathParamId matches ordinary client pathnames', () => {
  const { getPathParamId } = loadGetPathParamsModule();

  assert.strictEqual(getPathParamId('/sets/16', '/sets/:id'), 16);
});

test('getPathParamId matches absolute SSR pathnames', () => {
  const { getPathParamId } = loadGetPathParamsModule();

  assert.strictEqual(getPathParamId('http://127.0.0.1:8102/sets/16', '/sets/:id'), 16);
});

test('getPathParamId strips the configured app base from absolute URLs', () => {
  const prevBase = process.env.BASE;
  process.env.BASE = '/onlinejudge3/';
  try {
    const { getPathParamId } = loadGetPathParamsModule();

    assert.strictEqual(
      getPathParamId('http://127.0.0.1:8102/onlinejudge3/sets/16?from=home', '/sets/:id'),
      16,
    );
  } finally {
    if (prevBase === undefined) {
      delete process.env.BASE;
    } else {
      process.env.BASE = prevBase;
    }
  }
});
