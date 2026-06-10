'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

function transpileModule(filePath) {
  const source = fs.readFileSync(filePath, 'utf-8');
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
}

function loadModule(relativePath, globals = {}, requireOverrides = {}) {
  const module = { exports: {} };
  const filePath = path.join(__dirname, '../..', relativePath);
  const context = vm.createContext({
    ...globals,
    module,
    exports: module.exports,
    require: (id) => {
      if (Object.prototype.hasOwnProperty.call(requireOverrides, id)) {
        return requireOverrides[id];
      }
      return require(id);
    },
  });

  vm.runInContext(transpileModule(filePath), context, { filename: filePath });
  return module.exports;
}

function loadHydrationHelper(windowObj) {
  return loadModule(
    'src/utils/pageAnimationHydration.ts',
    windowObj ? { window: windowObj } : {},
  );
}

function loadPageAnimation(windowObj) {
  const helper = loadHydrationHelper(windowObj);
  const mod = loadModule(
    'src/components/PageAnimation.tsx',
    windowObj ? { window: windowObj } : {},
    {
      react: React,
      dva: { connect: () => (Component) => Component },
      classnames: require('classnames'),
      '@/utils/pageAnimationHydration': helper,
    },
  );
  return mod.default || mod;
}

function renderPageAnimation(Component) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(Component, { improveAnimation: true }, React.createElement('span', null, 'page')),
  );
}

test('SSR render omits page fade animation class', () => {
  const PageAnimation = loadPageAnimation();
  const html = renderPageAnimation(PageAnimation);

  assert.match(html, /class="duration-400 fadeInUpPage"/);
  assert.doesNotMatch(html, /\banimated\b/);
});

test('SSR hydration skips only the initial page animation batch', () => {
  const windowObj = { g_useSSR: true };
  const FirstPageAnimation = loadPageAnimation(windowObj);
  const firstHtml = renderPageAnimation(FirstPageAnimation);

  assert.match(firstHtml, /class="duration-400 fadeInUpPage"/);
  assert.doesNotMatch(firstHtml, /\banimated\b/);

  const mounted = new FirstPageAnimation({
    improveAnimation: true,
    children: React.createElement('span', null, 'page'),
  });
  mounted.componentDidMount();

  const NextPageAnimation = loadPageAnimation(windowObj);
  const nextHtml = renderPageAnimation(NextPageAnimation);

  assert.match(nextHtml, /\banimated\b/);
});

test('layout clears the SSR animation skip even if the first page has no PageAnimation', () => {
  const layoutSource = fs.readFileSync(
    path.join(__dirname, '../../src/layouts/index.tsx'),
    'utf-8',
  );

  assert.match(
    layoutSource,
    /import \{ markInitialPageAnimationMounted \} from '@\/utils\/pageAnimationHydration';/,
  );
  assert.match(layoutSource, /markInitialPageAnimationMounted\(\);/);

  const windowObj = { g_useSSR: true };
  const helper = loadHydrationHelper(windowObj);

  assert.strictEqual(helper.shouldSkipInitialPageAnimation(), true);
  helper.markInitialPageAnimationMounted();
  assert.strictEqual(helper.shouldSkipInitialPageAnimation(), false);
});

test('plain CSR first render keeps page fade animation class', () => {
  const PageAnimation = loadPageAnimation({});
  const html = renderPageAnimation(PageAnimation);

  assert.match(html, /\banimated\b/);
});
