# Umi3 Stabilization Follow-Up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase confidence in the Umi 3 dynamic import migration with built-output smoke tests, a current bundle snapshot, and a manual real-backend checklist.

**Architecture:** Keep business code unchanged. Add verification-only scripts and documents around the existing Umi 3 build outputs, Playwright smoke fixtures, and CI validation job.

**Tech Stack:** Umi 3, Playwright, Node 16, npm, GitHub Actions.

---

## Tasks

- [x] Add a static SPA server for `onlinejudge3/` and `onlinejudge3_cs/` build previews.
- [x] Add built-output Playwright smoke coverage for regular and competition-side routes.
- [x] Extend mocked API routing to support both `/onlinejudge3/api/**` and `/onlinejudge3_cs/api/**`.
- [x] Add npm scripts for `serve:built`, `e2e:built`, and `report:built-assets`.
- [x] Add bundle snapshot tooling and generate `docs/superpowers/reports/2026-05-24-umi3-built-assets.md`.
- [x] Add `docs/superpowers/checklists/2026-05-24-umi3-manual-backend-smoke.md`.
- [x] Update CI validation to run built-output smoke before dev smoke.
- [x] Run the accepted verification command set and record any blockers.

## Acceptance

- `npm run e2e:built` verifies built output route chunks without relying on a backend service.
- `npm run report:built-assets` writes the current bundle snapshot report.
- The manual backend checklist is human-run only and does not add backend coupling to CI.
- No app runtime API, route URL, backend contract, or component behavior changes.

## Implementation Summary

- Added `tasks/serve-built-output.js` for static built-output previews with SPA fallback for both public paths.
- Added `playwright.built.config.js` and `tests/e2e/built-output.spec.ts` covering the four accepted built URLs.
- Reused the shared Playwright mock fixtures and expanded API matching to cover both `/onlinejudge3/api/**` and `/onlinejudge3_cs/api/**`.
- Added bundle snapshot tooling in `tasks/report-built-assets.js`; the current baseline lives in `docs/superpowers/reports/2026-05-24-umi3-built-assets.md`.
- Added the manual backend smoke checklist in `docs/superpowers/checklists/2026-05-24-umi3-manual-backend-smoke.md`.
- Updated CI to run built-output smoke before dev smoke.

## Verification Notes

- `npm ci --registry=https://registry.npmjs.org --cache /private/tmp/oj3-npm-cache`: passed with existing engine/deprecation/audit warnings.
- `npm run build`: passed.
- `npm run check:dva-models`: passed, verifying 23 dva model registrations.
- `npm run build:competition-side`: passed.
- `npm run check:built-assets`: passed.
- `npm run report:built-assets`: passed and regenerated the snapshot report.
- `npm run e2e:smoke`: passed, 10 tests. This includes the lazy competition overview route, so the mocked `dva` model path works in the new route-loading mode.
- `npm run e2e:built`: blocked in this local environment before app navigation. Playwright's bundled Chromium exits with `Received signal 6` during `browserType.launch`; a minimal `chromium.launch()` reproduces the same local failure. The intended CI gate remains `e2e:built`.
- Static built server fallback was checked by HTTP for `/onlinejudge3/`, `/onlinejudge3/problems/1000`, `/onlinejudge3/contests/1/ranklist`, and `/onlinejudge3_cs/competitions/1/overview`; all returned `200 text/html`.
- Manual real-backend smoke is still pending a human run with local backend services on `7001` and `7002`.
