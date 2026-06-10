'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const pages = {
  index: '/',
  problems: { index: '/problems' },
  solutions: { index: '/solutions' },
  users: { index: '/users', detail: '/users/:id' },
  contests: { index: '/contests' },
  competitions: { index: '/competitions' },
  sets: { index: '/sets' },
  groups: { index: '/groups' },
  posts: { index: '/posts' },
  messages: { index: '/messages' },
  favorites: { index: '/favorites' },
  topics: { index: '/topics' },
  admin: { index: '/admin' },
};

function Link({ to, children, onClick }) {
  return React.createElement('a', { href: typeof to === 'string' ? to : String(to), onClick }, children);
}

function makeAntd() {
  function Menu({ className, mode, selectable, children }) {
    return React.createElement('ul', { className, 'data-mode': mode, 'data-selectable': selectable }, children);
  }
  Menu.Item = ({ className, children, onClick }) =>
    React.createElement('li', { className, onClick }, children);
  Menu.SubMenu = ({ className, title, children }) =>
    React.createElement('li', { className }, title, React.createElement('ul', null, children));
  Menu.ItemGroup = ({ title, children }) =>
    React.createElement('li', null, title, React.createElement('ul', null, children));

  return {
    Menu,
    Icon: ({ type, component: Component }) =>
      Component
        ? React.createElement(Component, null)
        : React.createElement('i', { 'data-icon': type }, type),
    Spin: () => React.createElement('span', null, 'loading'),
    Avatar: () => React.createElement('span', null, 'avatar'),
    Badge: ({ children, count, dot }) =>
      React.createElement('span', { 'data-badge': count || dot || undefined }, children),
    Popover: ({ children }) => React.createElement(React.Fragment, null, children),
  };
}

function formatUrl(template, options = {}) {
  let url = template;
  Object.entries(options.param || {}).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });
  const query = options.query || {};
  const queryString = Object.keys(query)
    .map((key) => `${key}=${query[key]}`)
    .join('&');
  return queryString ? `${url}?${queryString}` : url;
}

function loadNavMenu() {
  const filePath = path.join(__dirname, '../../src/layouts/components/NavMenu.tsx');
  const source = fs.readFileSync(filePath, 'utf-8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require: (id) => {
      if (id === 'react') {
        return React;
      }
      if (id === 'dva') {
        return { connect: () => (Component) => Component };
      }
      if (id === 'react-router-dom') {
        return { Link };
      }
      if (id === 'antd') {
        return makeAntd();
      }
      if (id === '@/configs/pages') {
        return { __esModule: true, default: pages };
      }
      if (id === '@/configs/constants') {
        return { __esModule: true, default: { indicatorDisplayDelay: 0 } };
      }
      if (id === '@/utils/format') {
        return { formatAvatarUrl: (avatar) => avatar || '', urlf: formatUrl };
      }
      if (id === './ResponsiveNav.less') {
        return {
          avatarDefault: 'avatarDefault',
          navDesktop: 'navDesktop',
          navMain: 'navMain',
          navActions: 'navActions',
        };
      }
      if (id === '@/general.less') {
        return { iconRight: 'iconRight' };
      }
      if (id === './JoinModal' || id === '@/components/SettingsModal' || id === '@/components/AchievementsModal') {
        return { __esModule: true, default: ({ children }) => React.createElement(React.Fragment, null, children) };
      }
      if (id === '@/components/MessageList' || id === '@/components/IdeaNotes') {
        return { __esModule: true, default: () => React.createElement('span', null) };
      }
      if (id === '@/assets/svg/note.svg') {
        return { __esModule: true, default: () => React.createElement('svg', null) };
      }
      if (id === '@/utils/msg') {
        return { __esModule: true, default: { auto: () => undefined } };
      }
      if (id === '@/utils/tracker') {
        return { __esModule: true, default: { event: () => undefined } };
      }
      if (id === '@/utils/permission') {
        return { checkPerms: () => false };
      }
      if (id === '@/common/configs/perm.config') {
        return { EPerm: { AdminAccess: 'AdminAccess' } };
      }
      if (id === '@/common/enums') {
        return {
          EUserAchievementStatus: { received: 'received' },
          EUserType: { team: 'team' },
        };
      }
      if (id === 'umi/router') {
        return { __esModule: true, default: { push: () => undefined } };
      }
      return require(id);
    },
  });

  vm.runInContext(output, context, { filename: filePath });
  return module.exports.default || module.exports;
}

function renderDesktopNav(props = {}) {
  const NavMenu = loadNavMenu();
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(NavMenu, {
      mobileVersion: false,
      className: 'nav',
      loading: false,
      location: { pathname: '/problems', query: {} },
      session: { loggedIn: true, user: { userId: 1, nickname: 'tester', avatar: '', type: 'user' } },
      unreadMessagesLoading: false,
      unreadMessages: { count: 0, rows: [] },
      proMode: true,
      hasUnreadProfileMessages: false,
      dispatch: () => Promise.resolve({ success: true }),
      ...props,
    }),
  );
}

function captureMenu(html, className) {
  const match = html.match(new RegExp(`<ul class="[^"]*\\b${className}\\b[^"]*"[^>]*>([\\s\\S]*?)</ul>`));
  assert.ok(match, `expected ${className} menu to render`);
  return match[1];
}

test('desktop nav keeps Posts in the main menu when pro mode adds Solutions', () => {
  const html = renderDesktopNav();
  const mainMenu = captureMenu(html, 'navMain');
  const actionMenu = captureMenu(html, 'navActions');

  assert.match(mainMenu, />Solutions</);
  assert.match(mainMenu, />Posts</);
  assert.ok(mainMenu.indexOf('Standings') < mainMenu.indexOf('Posts'));
  assert.doesNotMatch(actionMenu, />Posts</);
  assert.match(actionMenu, /data-icon="setting"/);
  assert.match(actionMenu, />avatar</);
});

test('desktop nav remounts AntD menus when hydrated client-only items change', () => {
  const filePath = path.join(__dirname, '../../src/layouts/components/NavMenu.tsx');
  const source = fs.readFileSync(filePath, 'utf-8');

  assert.match(source, /key=\{`main-\$\{proMode \? 'pro' : 'basic'\}/);
  assert.match(source, /key=\{`actions-\$\{loading \? 'loading' : session\.loggedIn \? 'auth' : 'guest'\}`\}/);
});

test('desktop header constrains overflow to main navigation before actions', () => {
  const layoutSource = fs.readFileSync(
    path.join(__dirname, '../../src/layouts/index.tsx'),
    'utf-8',
  );
  const layoutStyles = fs.readFileSync(
    path.join(__dirname, '../../src/layouts/index.less'),
    'utf-8',
  );
  const navStyles = fs.readFileSync(
    path.join(__dirname, '../../src/layouts/components/ResponsiveNav.less'),
    'utf-8',
  );

  assert.match(layoutSource, /<Row style=\{\{ display: 'flex', minWidth: 0 \}\}>/);
  assert.match(layoutSource, /<Col style=\{\{ flex: '0 0 auto' \}\}>/);
  assert.match(layoutSource, /<Col style=\{\{ flex: 1, minWidth: 0 \}\}>/);
  assert.match(layoutStyles, /\.logo \{[\s\S]*white-space: nowrap;/);
  assert.match(navStyles, /\.navMain \{[\s\S]*overflow: hidden;/);
  assert.match(navStyles, /\.navActions \{[\s\S]*flex: 0 0 auto;/);
});
