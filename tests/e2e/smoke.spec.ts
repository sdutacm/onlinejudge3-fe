import { expect, test } from '@playwright/test';
import { setupMockApi, SmokeMonitor } from './helpers/mockApi';

function hasLoadedChunk(monitor: SmokeMonitor, chunkName: string) {
  return monitor.scriptUrls.some((url) => {
    try {
      return decodeURIComponent(url).includes(chunkName);
    } catch (e) {
      return url.includes(chunkName);
    }
  });
}

function expectHealthyRoute(monitor: SmokeMonitor, chunkName?: string) {
  expect(monitor.consoleErrors).toEqual([]);
  expect(monitor.resourceFailures).toEqual([]);
  expect(monitor.scriptFailures).toEqual([]);
  expect(monitor.pageErrors).toEqual([]);
  if (chunkName) {
    expect(hasLoadedChunk(monitor, chunkName), `expected route chunk ${chunkName}`).toBeTruthy();
  }
}

test('global layout, title, and primary navigation render', async ({ page }) => {
  const monitor = await setupMockApi(page);

  await page.goto('/onlinejudge3/');

  await expect(page.getByText('SDUT OJ').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Problems' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contests', exact: true })).toBeVisible();
  await expect(page.getByText('Current Active Users: 3')).toBeVisible();
  expect(monitor.apiCalls).toContain('/getSession');
  expectHealthyRoute(monitor, 'p__index');
});

test('login and join modal renders form fields and validation', async ({ page }) => {
  const monitor = await setupMockApi(page);

  await page.goto('/onlinejudge3/');
  await page.getByText('Join').click();

  await expect(page.getByRole('dialog', { name: 'Login' })).toBeVisible();
  await expect(page.getByLabel('Email or Username')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();

  await page.getByText('Register', { exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Register' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Verification Code')).toBeVisible();
  await expect(page.getByLabel('Username')).toBeVisible();
  expectHealthyRoute(monitor, 'p__index');
});

test('problem list renders fixture problem', async ({ page }) => {
  const monitor = await setupMockApi(page);

  await page.goto('/onlinejudge3/problems');

  await expect(page.getByRole('link', { name: '1000 - A + B Problem' })).toBeVisible();
  await expect(page.getByText('1 problems')).toBeVisible();
  expect(monitor.apiCalls).toContain('/getProblemList');
  expectHealthyRoute(monitor, 'p__problems__index');
});

test('problem detail renders samples and submit modal language selector', async ({ page }) => {
  const monitor = await setupMockApi(page, { session: 'user' });

  await page.goto('/onlinejudge3/problems/1000');

  await expect(page.getByRole('heading', { name: 'A + B Problem' })).toBeVisible();
  await expect(page.getByText('Sample #1')).toBeVisible();
  await expect(page.getByText('1 2')).toBeVisible();

  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('dialog', { name: 'Submit a Solution' })).toBeVisible();
  await expect(page.locator('label[for="language"]')).toBeVisible();
  await expect(page.getByText('GCC 11')).toBeVisible();
  expect(monitor.apiCalls).toContain('/getProblemDetail');
  expect(monitor.apiCalls).toContain('/getLanguageConfig');
  expectHealthyRoute(monitor, 'p__problems__$id');
});

test('solution list renders fixture solution', async ({ page }) => {
  const monitor = await setupMockApi(page, { session: 'user' });

  await page.goto('/onlinejudge3/solutions');

  await expect(page.getByText('2000')).toBeVisible();
  await expect(page.getByRole('link', { name: '1000' })).toBeVisible();
  expect(monitor.apiCalls).toContain('/getSolutionList');
  expectHealthyRoute(monitor, 'p__solutions__index');
});

test('solution detail renders code area', async ({ page }) => {
  const monitor = await setupMockApi(page, { session: 'user' });

  await page.goto('/onlinejudge3/solutions/2000');

  await expect(page.getByText('Make Public')).toBeVisible();
  await expect(page.locator('pre').filter({ hasText: '#include <iostream>' })).toBeVisible();
  expect(monitor.apiCalls).toContain('/getSolutionDetail');
  expectHealthyRoute(monitor, 'p__solutions__$id');
});

test('contest list renders fixture contest', async ({ page }) => {
  const monitor = await setupMockApi(page);

  await page.goto('/onlinejudge3/contests');

  await expect(page.getByText('Smoke Contest')).toBeVisible();
  await expect(page.getByText('1 contests')).toBeVisible();
  expect(monitor.apiCalls).toContain('/getContestList');
  expectHealthyRoute(monitor, 'p__contests__index');
});

test('contest ranklist renders fixture rows', async ({ page }) => {
  const monitor = await setupMockApi(page, { session: 'user' });

  await page.goto('/onlinejudge3/contests/1/ranklist');

  await expect(page.getByRole('heading', { name: 'Smoke Contest' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Alice AC' }).first()).toBeVisible();
  expect(monitor.apiCalls).toContain('/getContestRanklist');
  expectHealthyRoute(monitor, 'p__contests__$id__ranklist');
});

test('competition overview loads competition model data from a lazy route', async ({ page }) => {
  const monitor = await setupMockApi(page, { session: 'user' });

  await page.goto('/onlinejudge3/competitions/1/overview');

  await expect(page.getByRole('heading', { name: 'Smoke Competition' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'A + B Problem' })).toBeVisible();
  expect(monitor.apiCalls).toContain('/getCompetitionSession');
  expect(monitor.apiCalls).toContain('/getCompetitionDetail');
  expect(monitor.apiCalls).toContain('/getCompetitionProblems');
  expect(monitor.apiCalls).toContain('/getCompetitionProblemSolutionStats');
  expectHealthyRoute(monitor, 'p__competitions__$id__overview');
});

test('admin list pages render with admin session', async ({ page }) => {
  const monitor = await setupMockApi(page, { session: 'admin' });

  await page.goto('/onlinejudge3/admin/problems');
  await expect(page.getByText('A + B Problem')).toBeVisible();

  await page.goto('/onlinejudge3/admin/contests');
  await expect(page.getByText('Contest is deprecated')).toBeVisible();
  await expect(page.getByText('Smoke Contest')).toBeVisible();

  await page.goto('/onlinejudge3/admin/users');
  await expect(page.getByText('alice', { exact: true })).toBeVisible();
  await expect(page.getByText('Root Admin')).toBeVisible();
  expect(monitor.apiCalls).toContain('/getProblemList');
  expect(monitor.apiCalls).toContain('/getContestList');
  expect(monitor.apiCalls).toContain('/getUserList');
  expectHealthyRoute(monitor, 'p__admin__users');
});
