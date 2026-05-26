# Umi3 Manual Backend Smoke Checklist - 2026-05-24

Use this checklist when local backend services are available. This is intentionally manual so CI does not depend on local database or service state.

## Prerequisites

- Node `v24.16.0` dependencies are installed with `pnpm install --frozen-lockfile`.
- Backend service for normal OJ APIs is running at `http://127.0.0.1:7001`.
- Competition-side backend service, if separate in the local setup, is running at `http://127.0.0.1:7002`.
- The frontend dev server is running with `pnpm run start`.
- For competition-side checks, also verify `COMPETITION_SIDE=1 pnpm run start` or the equivalent local launch command when needed.

## Regular Site Paths

- [ ] Open `http://127.0.0.1:8000/onlinejudge3/`.
  - Expected: global layout renders, session fetch completes, VIN check does not block rendering, and no white screen appears.
- [ ] Open `http://127.0.0.1:8000/onlinejudge3/problems`.
  - Expected: problem list loads or displays an intentional empty state without runtime errors.
- [ ] Open `http://127.0.0.1:8000/onlinejudge3/problems/1000`.
  - Expected: problem detail route loads an async chunk and renders the problem or a clear not-found/error state from backend data.
- [ ] Open `http://127.0.0.1:8000/onlinejudge3/solutions`.
  - Expected: solution list route renders and does not loop redirects.
- [ ] Open `http://127.0.0.1:8000/onlinejudge3/contests`.
  - Expected: contest list route renders and does not load stale Umi 2 chunks.
- [ ] Open `http://127.0.0.1:8000/onlinejudge3/contests/1/ranklist`.
  - Expected: contest layout and ranklist route render, with no async chunk 404.
- [ ] Open `http://127.0.0.1:8000/onlinejudge3/admin/problems` with an admin account.
  - Expected: admin layout guard behaves correctly; authorized users see the list, unauthorized users are redirected or blocked intentionally.

## Competition-Side Path

- [ ] Open `http://127.0.0.1:8000/onlinejudge3_cs/competitions/1/overview` in the competition-side launch mode.
  - Expected: competition layout renders, `competitions` dva effects run, no repeated redirect loop appears, and no async chunk 404 occurs.

## Browser Observations To Record

- [ ] Console has no uncaught runtime errors.
- [ ] Network tab has no failed `.js` route chunks.
- [ ] `publicPath` requests use `/onlinejudge3/` or `/onlinejudge3_cs/` as expected.
- [ ] Socket setup failures, if backend/socket service is unavailable, are understood and do not block app rendering.

## Result Notes

- Status: pending human run with local backend services.
- Date/time:
- Backend branch/commit:
- Frontend branch/commit:
- Passed paths:
- Failed paths and screenshots:
