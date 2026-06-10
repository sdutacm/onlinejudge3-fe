'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadSettingsModel(storedSettings, windowObj = {}) {
  const filePath = path.join(__dirname, '../../src/models/settings.ts');
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
  const storage = {
    settings: JSON.stringify(storedSettings),
  };
  const classes = new Set();
  const context = vm.createContext({
    module,
    exports: module.exports,
    require: (id) => {
      if (id === '@/utils/localStorage') {
        return {
          __esModule: true,
          default: {
            get: (key) => JSON.parse(storage[key] || 'null'),
            set: (key, value) => {
              storage[key] = JSON.stringify(value);
              return true;
            },
          },
        };
      }
      if (id === 'lodash-es') {
        return {
          merge: require('lodash/merge'),
          omit: require('lodash/omit'),
        };
      }
      return require(id);
    },
    document: {
      body: {
        classList: {
          add: (name) => classes.add(name),
          remove: (name) => classes.delete(name),
          contains: (name) => classes.has(name),
        },
      },
    },
    window: windowObj,
  });

  vm.runInContext(output, context, { filename: filePath });
  return {
    model: module.exports.default || module.exports,
    storage,
    classes,
  };
}

test('settings keep SSR defaults for the first hydration render', () => {
  const { model } = loadSettingsModel(
    {
      theme: 'dark',
      color: 'colorblind-dp',
      improveAnimation: false,
      proMode: true,
      useAbsoluteTime: true,
    },
    { g_useSSR: true },
  );

  assert.deepStrictEqual(JSON.parse(JSON.stringify(model.state)), {
    theme: 'auto',
    themeLocked: false,
    color: 'default',
    improveAnimation: true,
    proMode: false,
    useAbsoluteTime: false,
  });
});

test('settings can rehydrate SSR default state from client storage', () => {
  const { model, classes } = loadSettingsModel({
    theme: 'dark',
    themeLocked: true,
    color: 'colorblind-dp',
    improveAnimation: false,
    proMode: true,
    useAbsoluteTime: true,
  });
  const state = {
    theme: 'auto',
    themeLocked: false,
    color: 'default',
    improveAnimation: true,
    proMode: false,
    useAbsoluteTime: false,
  };

  model.reducers.hydrateFromLocalStorage(state);

  assert.deepStrictEqual(state, {
    theme: 'dark',
    themeLocked: false,
    color: 'colorblind-dp',
    improveAnimation: false,
    proMode: true,
    useAbsoluteTime: true,
  });
  assert.strictEqual(classes.has('dark'), true);
  assert.strictEqual(classes.has('auto'), false);
  assert.strictEqual(classes.has('colorblind-dp'), true);
});

test('settings subscription requests client storage hydration', () => {
  const { model } = loadSettingsModel({ proMode: true });
  const actions = [];

  model.subscriptions.setup({
    dispatch: (action) => actions.push(action),
  });

  assert.deepStrictEqual(JSON.parse(JSON.stringify(actions)), [{ type: 'hydrateFromLocalStorage' }]);
});

test('settings subscription defers client storage hydration during SSR hydration', () => {
  const scheduled = [];
  const { model } = loadSettingsModel(
    { proMode: true },
    {
      g_useSSR: true,
      setTimeout: (fn, delay) => {
        scheduled.push({ fn, delay });
      },
    },
  );
  const actions = [];

  model.subscriptions.setup({
    dispatch: (action) => actions.push(action),
  });

  assert.deepStrictEqual(JSON.parse(JSON.stringify(actions)), []);
  assert.strictEqual(scheduled.length, 1);
  assert.strictEqual(scheduled[0].delay, 0);

  scheduled[0].fn();

  assert.deepStrictEqual(JSON.parse(JSON.stringify(actions)), [{ type: 'hydrateFromLocalStorage' }]);
});
