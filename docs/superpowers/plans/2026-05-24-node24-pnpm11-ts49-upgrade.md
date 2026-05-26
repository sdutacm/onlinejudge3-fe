# Node 24 + pnpm 11 + TypeScript 4.9 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the frontend toolchain to Node 24, pnpm 11, and TypeScript 4.9 without changing app runtime behavior.

**Architecture:** Keep Umi 3, React 17, dva, and antd versions stable. Migrate package management from npm to pnpm, add the OpenSSL legacy provider workaround required by Webpack 4 on Node 24, and record typecheck/peer-dependency debt as reports instead of new CI gates.

**Tech Stack:** Node 24, pnpm 11, TypeScript 4.9, Umi 3, Webpack 4, Playwright.

---

## Tasks

- [x] Set the Node and package-manager contract to Node `v24.16.0` and pnpm `11.2.2`.
- [x] Pin top-level dependencies to the currently verified resolved versions, except TypeScript `4.9.5`.
- [x] Replace nested npm script usage with pnpm script usage.
- [x] Add a pnpm build-script allowlist for current install-time build dependencies.
- [x] Add `NODE_OPTIONS=--openssl-legacy-provider` to Umi dev/build entrypoints.
- [x] Add TypeScript and pnpm peer baseline reporting scripts.
- [x] Update CI to use Corepack, pnpm install, pnpm cache, and pnpm commands.
- [x] Update README commands and prerequisites.
- [x] Generate `pnpm-lock.yaml`, remove `package-lock.json`, and run the Node 24 verification chain.

## Acceptance

- `pnpm install --frozen-lockfile` works on Node `v24.16.0`.
- `pnpm run build`, `pnpm run build:competition-side`, and `pnpm run check:built-assets` pass.
- `pnpm run report:typecheck-baseline` writes the TypeScript 4.9 baseline and exits 0 even with existing type errors.
- `pnpm run report:pnpm-peer-baseline` records known peer dependency debt and exits 0.
- `pnpm run e2e:smoke` remains the lazy-route/dva runtime confidence check.

## Implementation Notes

- pnpm 11 stores project settings in `pnpm-workspace.yaml`; package-level `pnpm.overrides` is ignored.
- `h2x-parse@1.1.1` declares `jsdom >=11.0.0`, which allowed pnpm to resolve `jsdom@29.1.1`. That pulled ESM-only transitive code into `@svgr/webpack@3.1.0` and broke Umi/Webpack 4 SVG loading on Node 24. The workspace override pins `h2x-parse@1.1.1>jsdom` to `19.0.0`, matching the previous npm lock behavior.
- The TypeScript 4.9 report is informational. `typecheck` is intentionally not a CI gate in this phase.
- `pnpm peers check` remains non-zero by design and is captured as a baseline report.

## Verification - 2026-05-24

| Command | Result | Notes |
| --- | --- | --- |
| `corepack enable` | Passed | Ran under Node `v24.16.0`. |
| `corepack prepare pnpm@11.2.2 --activate` | Passed | Ran under Node `v24.16.0`. |
| `pnpm install --frozen-lockfile` | Passed | After adding the pnpm build-script allowlist and `h2x-parse` override. |
| `pnpm ls umi @umijs/preset-react dva react react-dom antd typescript @playwright/test --depth=0` | Passed | Confirms Umi `3.5.43`, dva `2.6.0-beta.23`, React `17.0.2`, antd `3.11.6`, TypeScript `4.9.5`. |
| `pnpm run build` | Passed | Requires `NODE_OPTIONS=--openssl-legacy-provider`. |
| `pnpm run check:dva-models` | Passed | Verified 23 dva model registrations. |
| `pnpm run build:competition-side` | Passed | Requires `NODE_OPTIONS=--openssl-legacy-provider`. |
| `pnpm run check:built-assets` | Passed | Verified built output public paths and route chunks. |
| `pnpm run report:built-assets` | Passed | Refreshed `docs/superpowers/reports/2026-05-24-umi3-built-assets.md`. |
| `pnpm run report:typecheck-baseline` | Passed | Wrote `docs/superpowers/reports/2026-05-24-ts49-typecheck-baseline.md`; underlying `typecheck` exit status remains 2. |
| `pnpm exec playwright install --with-deps chromium` | Passed with escalation | The sandboxed run hung; running outside the sandbox completed immediately. |
| `pnpm run e2e:built` | Blocked locally | Playwright bundled Chromium exits with `Received signal 6` before app navigation. Intended CI gate remains enabled. |
| `pnpm run e2e:smoke` | Blocked locally | Same local Chromium launch failure; the lazy-route/dva smoke test exists but did not reach navigation in this environment. |
| `pnpm peers check` | Expected failure | Recorded in `docs/superpowers/reports/2026-05-24-pnpm-peer-baseline.md`. |
| `git diff --check` | Passed | No whitespace errors. |
