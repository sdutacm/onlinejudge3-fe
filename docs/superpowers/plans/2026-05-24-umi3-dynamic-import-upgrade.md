# Umi3 Dynamic Import Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the legacy Umi 2 + dva + React frontend to the Umi 3 line and enable route-level page lazy loading without changing business behavior, UI, or class-component development style.

**Architecture:** Keep the app as an Umi conventional-routing app with global dva models registered at startup. Move Umi 2 plugin configuration into Umi 3 top-level config, enable `dynamicImport` for page components, and preserve the current `base`, `publicPath`, dark-mode Less pipeline, custom `splitChunks`, proxy, and build targets.

**Tech Stack:** Umi 3, `@umijs/preset-react`, dva, React 17, antd 3, Less, npm, Node 16, Playwright smoke tests.

---

## Summary

This plan targets the P0 technical debt: initial page load is slow because all page modules are bundled into the initial payload. The selected path is **Umi 3 P0**:

- Upgrade Umi from `2.13.x` to `3.5.x`.
- Replace `umi-plugin-react` with `@umijs/preset-react`.
- Upgrade dva to the Umi 3-compatible `2.6.0-beta.x` line.
- Upgrade React only to `17.0.2`, not React 18.
- Keep antd at `3.11.6`.
- Keep npm, `package-lock.json`, Node `v16.15.0`, and TypeScript `3.9.x`.
- Enable route-level `dynamicImport` with the existing `PageLoading` component.
- Add deterministic smoke tests before depending on manual backend verification.

The P2 optional targets are intentionally deferred:

- antd v3 -> v4 is a separate project because this codebase has many `Form.create`, `getFieldDecorator`, old `Icon type`, and dark-mode Less overrides.
- pnpm migration is a separate project because it changes lockfile, peer dependency behavior, CI cache behavior, and install semantics.
- Node and TypeScript upgrades are separate projects because current typechecking already has historical errors and should not be mixed with the bundler migration.

## Researched Facts

- Current declared core stack in `package.json`: `umi ^2.7.0`, `umi-plugin-react ^1.8.0`, `dva ~2.5.0-beta.2`, `react ^16.8.6`, `react-dom ^16.8.6`, `antd 3.11.6`, `typescript ^3.7.3`.
- Current installed versions from `npm ls`: `umi@2.13.17`, `umi-plugin-react@1.15.8`, `dva@2.5.0-beta.2`, `react@16.14.0`, `react-dom@16.14.0`, `typescript@3.9.10`.
- Current Umi config is `.umirc.js`; it uses `umi-plugin-react` with `dva`, `antd`, `routes.exclude`, `title`, `dynamicImport: null`, `chunks`, and a large `chainWebpack` override.
- Current route generation is conventional routing from `src/pages/**`; generated `src/pages/.umi/router.js` uses synchronous `require(...)` for page components.
- Current generated `src/pages/.umi/dva.js` registers global models and page models synchronously at startup.
- Current dark mode depends on `src/theme_dark.less`, `src/dark.less`, `src/dark_duplicated4auto.less`, `src/styles/dark_antd/**`, and `src/styles/dark_antd_duplicated4auto/**`.
- Current real test script is absent; `npm test` exits with an error. CI only builds and deploys on `master`.
- `tsc --noEmit` currently fails before migration, mainly due historical type issues and duplicate React types in transitive packages; it is not a P0 acceptance gate.

## Implementation Tasks

### Task 1: Record Baseline Build And Bundle Facts

**Files:**
- Read: `package.json`
- Read: `.umirc.js`
- Read: `package-lock.json`
- Output notes in implementation summary, not in repo unless requested.

- [ ] Run the current install/build baseline on Node `v16.15.0`.

```bash
npm ci
npm run build
npm run build:competition-side
```

Expected:
- `npm ci` succeeds with existing `package-lock.json`.
- `npm run build` outputs `onlinejudge3/`.
- `npm run build:competition-side` outputs `onlinejudge3_cs/`.

Stage status: not independently captured before the migration in this document. The post-migration command set is recorded in the stage summary.

- [ ] Capture current generated route loading shape.

```bash
rg -n "component: require|dynamic\\(" src/pages/.umi/router.js
```

Expected:
- Current baseline shows many `component: require(...)` entries.
- This is the before-state proving pages are synchronously loaded.

Stage status: not independently captured before the migration in this document. The post-migration generated route shape is verified as dynamic in Task 5.

- [ ] Capture current build asset size.

```bash
find onlinejudge3 -maxdepth 1 -type f -name "*.js" -print -exec du -h {} \;
find onlinejudge3_cs -maxdepth 1 -type f -name "*.js" -print -exec du -h {} \;
```

Expected:
- The initial JS assets include all route modules.
- These numbers become the comparison baseline for Done when.

Stage status: not independently captured before the migration in this document, so numeric before/after bundle comparison remains open.

### Task 2: Add Deterministic Smoke Test Harness

**Files:**
- Modify: `package.json`
- Create: `playwright.config.js`
- Create: `tests/e2e/smoke.spec.ts`
- Create: `tests/e2e/helpers/mockApi.ts`
- Create: `tests/e2e/helpers/fixtures.ts`

- [x] Add dev dependency `@playwright/test@1.44.1`.

```bash
npm install --save-dev @playwright/test@1.44.1
```

Expected:
- `package.json` and `package-lock.json` update.
- Version `1.44.1` is chosen because it supports Node `>=16`; newer Playwright versions require Node `>=18`.

- [x] Add scripts to `package.json`.

```json
{
  "scripts": {
    "e2e:smoke": "playwright test tests/e2e/smoke.spec.ts",
    "e2e:smoke:headed": "playwright test tests/e2e/smoke.spec.ts --headed"
  }
}
```

Expected:
- Existing scripts remain unchanged except for the two additions.

- [x] Create `playwright.config.js` with a local dev-server dependency.

```js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  use: {
    baseURL: 'http://127.0.0.1:8000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run start',
    url: 'http://127.0.0.1:8000/onlinejudge3/',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

Expected:
- `npm run e2e:smoke` can boot Umi dev or reuse an existing dev server.
- Tests address the deployed base path through `/onlinejudge3/`.

- [x] Implement `mockApi.ts` as the single API interception point.

Required behavior:
- Intercept `**/onlinejudge3/api/*`.
- Return successful `IApiResponse` objects for session, language config, unread messages, stats, problem list/detail, solution list/detail, contest list/session/detail/problems/ranklist, and admin list APIs used by smoke paths.
- Return a generic success payload for unknown write endpoints used only to open/submit modals.
- Include a `date` response header because `src/utils/request.ts` reads it to compute `window._t_diff`.

Expected:
- Tests do not depend on `7001` or database state.
- Mock endpoint names match `routesBe` URLs such as `/getSession`, `/getProblemList`, `/getProblemDetail`, `/getLanguageConfig`, `/getSolutionList`, `/getContestList`, and `/getContestRanklist`.

- [x] Implement `fixtures.ts` with stable sample entities.

Required fixtures:
- Anonymous session.
- Logged-in normal user session.
- Admin user session.
- One problem with samples and display metadata.
- One accepted solution with code.
- One contest with session, problems, and ranklist rows.
- Admin list rows for problems, contests, and users.

Expected:
- Smoke tests assert visible UI text from fixtures rather than network implementation details.

- [x] Implement `smoke.spec.ts` paths.

Required smoke scenarios:
- Visit `/onlinejudge3/`; assert the global layout, site title/logo, and primary navigation render.
- Open the login/join modal; assert form fields and validation render.
- Visit `/onlinejudge3/problems`; assert problem table/list and fixture problem title render.
- Visit `/onlinejudge3/problems/1000`; assert problem detail, samples, and submit modal language selector render.
- Visit `/onlinejudge3/solutions`; assert solution list renders.
- Visit `/onlinejudge3/solutions/2000`; assert solution detail/code area renders.
- Visit `/onlinejudge3/contests`; assert contest list renders.
- Visit `/onlinejudge3/contests/1/ranklist`; assert ranklist rows render.
- Visit `/onlinejudge3/admin/problems`, `/onlinejudge3/admin/contests`, and `/onlinejudge3/admin/users` with admin session mock; assert each page renders a list.

Expected:
- `npm run e2e:smoke` passes before any dependency upgrade.

Stage status: the harness exists and passes after the Umi 3 migration. The final suite has 10 scenarios, including competition overview for the dva verification path.

### Task 3: Migrate Umi 2 Config To Umi 3 Shape

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.umirc.js`
- Modify: `tsconfig.json`

- [x] Update core dependencies.

Use these target versions:

```json
{
  "dependencies": {
    "dva": "2.6.0-beta.23",
    "react": "17.0.2",
    "react-dom": "17.0.2"
  },
  "devDependencies": {
    "@types/react": "17.0.2",
    "@types/react-dom": "17.0.2",
    "@umijs/preset-react": "2.1.7",
    "umi": "3.5.43"
  }
}
```

Remove:

```json
{
  "devDependencies": {
    "umi-plugin-react": "...",
    "umi-types": "..."
  }
}
```

Expected:
- `antd` remains `3.11.6`.
- `typescript` remains on the current `3.9.x` resolved line.
- No `pnpm-lock.yaml` is introduced.

- [x] Regenerate `package-lock.json`.

```bash
npm install
```

Expected:
- npm lockfile remains the package manager source of truth.
- `npm ls umi @umijs/preset-react dva react react-dom antd typescript --depth=0` shows the selected target stack.

- [x] Refactor `.umirc.js` from plugin-nested config to top-level config.

Preserve these existing top-level behaviors:
- `buildTarget` selection.
- `base`, `publicPath`, and `outputPath`.
- `hash: true`.
- all current `define` values.
- `theme`.
- `proxy`.
- `urlLoaderExcludes`.
- SVG `chainWebpack` behavior.
- custom `splitChunks` cache groups unless they actively break dynamic chunks.

Move these out of `umi-plugin-react`:

```js
dva: {
  immer: true,
},
antd: {},
title: {
  defaultTitle: 'SDUT OnlineJudge',
  separator: '|',
  format: '{current} {separator} {parent}',
},
dynamicImport: {
  loading: '@/components/PageLoading',
},
conventionRoutes: {
  exclude: [/models\//, /services\//],
},
chunks: [
  'vendors',
  'raincloud',
  'ui',
  'time-is-money',
  'talk-is-cheap',
  'mathematics-is-the-queen-of-the-sciences',
  'ms-excel-suite-2022-customized-for-sdut_powered-by-ms-cn',
  'draw-some-higher-dimensions-shapes',
  'of-all-that-has-been-written_i-love-only-that-which-was-written-in-blood',
  'umi',
],
```

Expected:
- No `plugins: [['umi-plugin-react', ...]]` remains.
- `dynamicImport` is not `null`.
- Conventional routes still exclude `models` and `services`.

Stage status: complete with Umi 3.5.43-specific adjustments. The planned `title` object, `conventionRoutes`, and `urlLoaderExcludes` keys were not retained because this stack rejects them during config validation. Generated routes were verified to exclude `models` and `services`.

- [x] Add Umi 3 `@@` alias to `tsconfig.json`.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@@/*": ["src/.umi/*"]
    }
  }
}
```

Expected:
- Existing `@/*` alias remains unchanged.

### Task 4: Fix Umi 3 Runtime Compatibility Issues

**Files:**
- Modify only files that fail to compile or crash under Umi 3.
- Likely files: `.umirc.js`, `src/layouts/index.tsx`, `src/plugins/onError.ts`, files importing Umi 2-specific router APIs if failures appear.

- [x] Run Umi 3 build and inspect the first concrete failure.

```bash
npm run build
```

Expected:
- If it fails, fix the smallest compatibility issue and rerun.
- Do not refactor business components or convert class components.

- [x] Replace Umi 2-only imports only if build/runtime proves it is required.

Likely examples:

```ts
import router from 'umi/router';
```

Preferred Umi 3-compatible shape if needed:

```ts
import { history } from 'umi';
```

Expected:
- Keep call sites semantically equivalent: `router.push(...)` becomes `history.push(...)` only if required.

- [x] Keep route props and class components intact.

Expected:
- Do not rewrite components to hooks.
- Do not switch Umi 3 to Umi 4-style `Outlet`.
- Do not change `matchPath` behavior unless a runtime failure proves it necessary.

- [x] Verify model registration stays eager.

```bash
rg -n "app\\.model|namespace: 'problems'|namespace: 'competitions'" src/.umi src/pages/.umi
```

Expected:
- Global and page models are still registered before route rendering.
- No P0 work attempts model-level lazy loading.

### Task 5: Verify Dynamic Chunk Output And Public Paths

**Files:**
- Modify: `.umirc.js` only if chunk loading fails.

- [x] Build regular target.

```bash
npm run build
```

Expected:
- `onlinejudge3/` contains multiple route/page chunk JS files.
- `index.html` includes only initial chunks plus `umi`.

- [x] Build competition-side target.

```bash
npm run build:competition-side
```

Expected:
- `onlinejudge3_cs/` contains multiple route/page chunk JS files.
- Competition-side base and public path remain `/onlinejudge3_cs/` unless `CDN_URL` is set.

- [x] Confirm generated router uses dynamic loading.

```bash
rg -n "dynamic\\(|webpackChunkName|import\\(" src/.umi src/pages/.umi
```

Expected:
- Route components are dynamically loaded.
- The old all-page synchronous `component: require(...)` pattern is gone or no longer dominant for pages.

- [ ] Preview built output for async chunk 404s.

Use a static server from the repository root or the output directory. One acceptable command:

```bash
npx --yes serve -l 5050 .
```

Then verify:

- `http://127.0.0.1:5050/onlinejudge3/`
- `http://127.0.0.1:5050/onlinejudge3/problems/1000`
- `http://127.0.0.1:5050/onlinejudge3/contests/1/ranklist`
- `http://127.0.0.1:5050/onlinejudge3_cs/competitions/1/overview`

Expected:
- Initial JS and async route chunks return 200.
- No white screen from chunk loading failures.

Stage status: replaced for CI by `npm run check:built-assets`, which verifies output public paths and key async chunks. Full built-output browser preview remains open because local Chromium failed to launch reliably during review.

### Task 6: Update CI To Validate Without Deploying On PRs

**Files:**
- Modify: `.github/workflows/ci.yml`

- [x] Add pull request trigger.

```yaml
on:
  pull_request:
  push:
    branches:
      - master
```

Expected:
- PRs run validation.
- Existing `master` push deployment behavior remains.

- [x] Add a validation job that does not upload CDN assets.

Required job behavior:
- checkout with submodules.
- setup Node 16.
- cache npm.
- run `npm ci --registry=https://registry.npmjs.org`.
- run `npm run build`.
- run `npm run build:competition-side`.
- install or use Playwright Chromium as required by `@playwright/test@1.44.1`.
- run `npm run e2e:smoke`.

Expected:
- PR validation catches build, route chunk, and smoke regressions before deploy.
- Existing deploy jobs still run only for push to `master`.

### Task 7: Final Regression Pass

**Files:**
- No planned source changes.

- [x] Run full accepted command set.

```bash
npm ci
npm run build
npm run build:competition-side
npm run e2e:smoke
```

Expected:
- All commands pass.

Stage status: passed after `npm ci --registry=https://registry.npmjs.org --cache /private/tmp/oj3-npm-cache`. Direct `~/.npm` cache use failed on this machine because of root-owned cache files.

- [ ] Run manual backend smoke using already-running services on `7001` and `7002`.

Recommended manual paths:
- `/onlinejudge3/`
- `/onlinejudge3/problems`
- `/onlinejudge3/problems/1000`
- `/onlinejudge3/solutions`
- `/onlinejudge3/contests`
- `/onlinejudge3/contests/1/ranklist`
- `/onlinejudge3/admin/problems`
- `/onlinejudge3_cs/competitions/1/overview`

Expected:
- No white screen.
- No repeated redirect loop.
- No chunk 404.
- Global layout still performs session fetch, VIN check, socket setup, and theme class application.

Stage status: not completed in this stage. Deterministic mocked smoke passed.

- [ ] Compare bundle output with the baseline from Task 1.

Expected:
- Initial JS size is lower than baseline.
- Route pages appear in async chunks.
- Vendor chunks may remain large because antd v3 and global models are intentionally retained.

Stage status: route async chunks are verified, but numeric before/after comparison remains open because Task 1 baseline numbers were not captured in this document.

## Done When

- `npm ci` passes on Node `v16.15.0`.
- `npm run build` passes and produces `onlinejudge3/`.
- `npm run build:competition-side` passes and produces `onlinejudge3_cs/`.
- `npm run e2e:smoke` passes with deterministic mocked API responses.
- Generated router uses dynamic loading for page components.
- Built regular and competition-side deployments load async chunks from the correct `base` and `publicPath`.
- Initial JS total size is lower than the recorded Umi 2 baseline.
- Existing business routes, class components, dva namespaces, dark-mode behavior, and visual layout remain semantically unchanged.

## Stop If

- The migration requires converting class components to hooks or rewriting page/component business logic.
- Umi 3 requires a route migration that changes existing public URLs.
- Async chunks 404 under `/onlinejudge3/` or `/onlinejudge3_cs/` and the issue cannot be solved by `base`, `publicPath`, `chunks`, or `splitChunks` configuration.
- React 17 causes a critical third-party runtime incompatibility that cannot be fixed narrowly; in that case, retry Umi 3 with React `16.14.0`.
- antd v3 blocks Umi 3 build in a way that requires antd v4 migration; stop and split antd upgrade into its own project.
- Smoke tests can only pass by using old `mock/api2` routes rather than current `routesBe` endpoint names.

## Explicit Non-Goals

- Do not upgrade antd in this P0 plan.
- Do not remove or redesign the current dark-mode Less duplication pipeline.
- Do not migrate from npm to pnpm.
- Do not upgrade Node beyond `v16.15.0`.
- Do not upgrade TypeScript beyond the current `3.9.x` resolved line.
- Do not make model registration lazy in P0.
- Do not rewrite the UI, interaction patterns, route URLs, or business logic.

## Follow-Up Plans

- antd v4/dark-mode plan: migrate Icon usage, then Form usage, then rebuild dark theme strategy, then visual-regression-test tables, modals, menus, and forms.
- package-manager plan: migrate npm lockfile to pnpm only after Umi 3 P0 is stable.
- runtime/tooling plan: evaluate Node 18 and TypeScript 4.9 after typecheck debt is isolated.

## Stage Summary - 2026-05-24

Status: **P0 implementation reviewed and verified locally.** The app is now on Umi 3 with route-level dynamic imports enabled, React 17, `@umijs/preset-react`, and Umi 3-compatible dva. The main route components are emitted as async chunks, while dva models remain eagerly registered at app startup.

### Completed

- Migrated `.umirc.js` from `umi-plugin-react` nested config to Umi 3 top-level config.
- Replaced `umi-plugin-react` and `umi-types` with `@umijs/preset-react@2.1.7` and `umi@3.5.43`.
- Upgraded the runtime stack to `react@17.0.2`, `react-dom@17.0.2`, `dva@2.6.0-beta.23`, and TypeScript's resolved `3.9.10` line.
- Added Umi 2 compatibility shims for legacy `umi/router`, `umi/link`, and `umi/withRouter` imports.
- Added route normalization for legacy `$id` conventional route segments so public URLs still use `:id` semantics.
- Added deterministic Playwright smoke coverage for global layout, auth modal, problems, solutions, contests, admin pages, and competition overview.
- Added `check:dva-models` to assert generated Umi 3 dva runtime registers every global and page model.
- Added `check:built-assets` to assert regular and competition-side build outputs have the expected public paths and key route async chunks.
- Added a CI validation job for pull requests while keeping CDN deploy jobs gated to `push` on `master`.

### Dva Finding

The important dva result is: **dva works in the new dynamic route mode because models are still eager, not because models were made lazy.** Umi 3 generated `src/.umi/plugin-dva/dva.ts` imports all model files and calls `app.model(...)` for 23 namespaces before route rendering. Smoke coverage now includes `/onlinejudge3/competitions/1/overview`, which loads a lazy competition page and exercises the `competitions` model effects.

This means the old blocker was real in the model-splitting sense: this P0 migration does **not** attempt model-level lazy loading. It only splits page components.

### Verified Evidence

All commands below were run on Node `v16.15.0` after `npm ci`:

```bash
npm ci --registry=https://registry.npmjs.org --cache /private/tmp/oj3-npm-cache
npm run build
npm run check:dva-models
npm run build:competition-side
npm run check:built-assets
npm run e2e:smoke
npm ls umi @umijs/preset-react dva react react-dom antd typescript @playwright/test --depth=0
git diff --check
```

Results:

- `npm ci` passed with a temporary cache. Direct use of `~/.npm` failed on this machine because the cache contains root-owned files.
- `npm run build` passed and produced `onlinejudge3/` with route async chunks.
- `npm run build:competition-side` passed and produced `onlinejudge3_cs/` with route async chunks.
- `npm run check:dva-models` passed: `Verified 23 dva model registrations.`
- `npm run check:built-assets` passed: regular and competition-side public paths and key async chunks were found.
- `npm run e2e:smoke` passed: `10 passed`.
- `npm ls ... --depth=0` confirmed `umi@3.5.43`, `@umijs/preset-react@2.1.7`, `dva@2.6.0-beta.23`, `react@17.0.2`, `react-dom@17.0.2`, `antd@3.11.6`, `typescript@3.9.10`, and `@playwright/test@1.44.1`.
- `src/.umi/core/routes.ts` uses `dynamic({ loader: () => import(...) })` with `webpackChunkName` for page routes.
- `src/.umi/core/routes.ts` has no `component: require`, `models/`, or `services/` route entries.

### Plan Deviations And Follow-Ups

- Umi 3.5.43 rejected the originally planned `title` object config, so the migrated config uses `title: 'SDUT OnlineJudge'`.
- Umi 3.5.43 rejected `conventionRoutes` and `urlLoaderExcludes` as config keys in this stack. Route exclusion was verified from generated routes instead, and SVG handling is preserved through webpack issuer-specific rules.
- Built-output browser preview was not retained as a CI gate because local Chromium later failed to launch even for a minimal Playwright browser session. The CI gate uses deterministic `check:built-assets` instead.
- Manual smoke against real backend services on `7001` and `7002` has not been completed in this stage.
- Pre-migration bundle baseline numbers were not recorded in this document, so the current stage proves route async chunking and passing behavior, but not a numeric before/after size delta.
- `npm ci` reports existing audit/deprecation/engine warnings from the legacy dependency tree. These are not addressed by this P0 migration.

## References

- Umi 3 config and `dynamicImport`: https://v3.umijs.org/config#dynamicimport
- Umi 4 migration notes for why Umi 4 is out of P0 scope: https://umijs.org/docs/introduce/upgrade-to-umi-4
- Ant Design v3 to v4 migration notes for why antd is out of P0 scope: https://4x.ant.design/docs/react/migration-v4
