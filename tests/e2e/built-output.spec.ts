import { expect, Page, test } from '@playwright/test';
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

function expectHealthyBuiltRoute(monitor: SmokeMonitor, chunkName: string) {
  expect(monitor.consoleErrors).toEqual([]);
  expect(monitor.resourceFailures).toEqual([]);
  expect(monitor.scriptFailures).toEqual([]);
  expect(monitor.pageErrors).toEqual([]);
  expect(
    hasLoadedChunk(monitor, chunkName),
    `expected built route chunk ${chunkName}`,
  ).toBeTruthy();
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function luminance(rgb: string) {
  const values = rgb
    .match(/\d+(\.\d+)?/g)
    ?.slice(0, 3)
    .map(Number) || [0, 0, 0];
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}

async function expectRouteProgressUsesCurrentPrimaryColor(page: Page) {
  const colors = await page.evaluate(() => {
    const bar = document.querySelector('#nprogress .bar') as HTMLElement | null;
    const peg = document.querySelector('#nprogress .peg') as HTMLElement | null;
    if (!bar || !peg) {
      throw new Error('Expected nprogress to be visible');
    }

    const primaryProbe = document.createElement('button');
    primaryProbe.className = 'ant-btn ant-btn-primary';
    primaryProbe.textContent = 'Primary';
    primaryProbe.style.position = 'fixed';
    primaryProbe.style.left = '-9999px';
    primaryProbe.style.top = '-9999px';
    document.body.appendChild(primaryProbe);

    const result = {
      barBackground: window.getComputedStyle(bar).backgroundColor,
      pegShadow: window.getComputedStyle(peg).boxShadow,
      primaryBackground: window.getComputedStyle(primaryProbe).backgroundColor,
    };
    primaryProbe.remove();
    return result;
  });

  expect(colors.barBackground).toBe(colors.primaryBackground);
  expect(colors.pegShadow).toContain(colors.primaryBackground);
}

test('regular built output loads homepage route chunk', async ({ page }) => {
  const monitor = await setupMockApi(page);

  await page.goto('/onlinejudge3/');

  await expect(page.getByText('SDUT OJ').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Problems' })).toBeVisible();
  expect(monitor.apiCalls).toContain('/getSession');
  expectHealthyBuiltRoute(monitor, 'p__index');
});

test('built output prefetches internal route chunks on link intent', async ({ page }) => {
  const monitor = await setupMockApi(page);
  const prefetchSeen = deferred();
  let prefetchedChunkUrl = '';

  await page.route(/\/onlinejudge3\/.*p__problems__index.*\.js(?:\?|$)/, async (route) => {
    prefetchedChunkUrl = route.request().url();
    prefetchSeen.resolve();
    await route.continue();
  });

  await page.goto('/onlinejudge3/');
  await page
    .getByRole('link', { name: 'Problems' })
    .first()
    .hover();
  await prefetchSeen.promise;

  await expect(page).toHaveURL(/\/onlinejudge3\/$/);
  await expect(page.locator('#nprogress')).toHaveCount(0);
  expect(prefetchedChunkUrl).toContain('p__problems__index');
  expectHealthyBuiltRoute(monitor, 'p__index');
});

test('built output keeps previous route visible while the next route chunk loads', async ({
  page,
}) => {
  const monitor = await setupMockApi(page);
  const chunkGate = deferred();
  let delayedChunkUrl = '';

  await page.route(/\/onlinejudge3\/.*p__problems__index.*\.js(?:\?|$)/, async (route) => {
    delayedChunkUrl = route.request().url();
    await chunkGate.promise;
    await route.continue();
  });

  await page.goto('/onlinejudge3/');

  await expect(page.getByRole('heading', { name: 'Recent Competitions' })).toBeVisible();

  const clickPromise = page
    .getByRole('link', { name: 'Problems' })
    .first()
    .click();

  await expect(page).toHaveURL(/\/onlinejudge3\/problems$/);
  await expect(page.getByRole('heading', { name: 'Recent Competitions' })).toBeVisible();
  await expect(page.locator('#nprogress .bar')).toBeVisible();
  await expectRouteProgressUsesCurrentPrimaryColor(page);
  await expect.poll(() => monitor.apiCalls.includes('/getProblemList')).toBeTruthy();
  expect(delayedChunkUrl).toContain('p__problems__index');

  chunkGate.resolve();
  await clickPromise;

  await expect(page.getByRole('link', { name: '1000 - A + B Problem' })).toBeVisible();
  await expect(page.locator('#nprogress')).toHaveCount(0);
  expectHealthyBuiltRoute(monitor, 'p__problems__index');
});

test('built output keeps previous route visible and retries when the next route chunk fails', async ({
  page,
}) => {
  const monitor = await setupMockApi(page);
  let shouldFailChunk = true;

  await page.route(/\/onlinejudge3\/.*p__problems__index.*\.js(?:\?|$)/, async (route) => {
    if (shouldFailChunk) {
      shouldFailChunk = false;
      await route.fulfill({
        status: 404,
        headers: {
          'content-type': 'application/javascript',
        },
        body: '',
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/onlinejudge3/');

  await expect(page.getByRole('heading', { name: 'Recent Competitions' })).toBeVisible();

  await page
    .getByRole('link', { name: 'Problems' })
    .first()
    .evaluate((link: HTMLAnchorElement) => link.click());

  await expect(page).toHaveURL(/\/onlinejudge3\/problems$/);
  await expect(page.getByRole('heading', { name: 'Recent Competitions' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Page resources failed to load.');
  expect(monitor.scriptFailures.some((failure) => failure.includes('p__problems__index'))).toBe(
    true,
  );
  expect(monitor.pageErrors).toEqual([]);

  await page.getByRole('button', { name: 'Retry' }).click();

  await expect(page.getByRole('link', { name: '1000 - A + B Problem' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(hasLoadedChunk(monitor, 'p__problems__index')).toBeTruthy();
});

test('dark built output route progress uses dark primary color', async ({ page }) => {
  const monitor = await setupMockApi(page, { theme: 'dark' });
  const chunkGate = deferred();

  await page.route(/\/onlinejudge3\/.*p__problems__index.*\.js(?:\?|$)/, async (route) => {
    await chunkGate.promise;
    await route.continue();
  });

  await page.goto('/onlinejudge3/');

  await expect(page.locator('body')).toHaveClass(/dark/);

  const clickPromise = page
    .getByRole('link', { name: 'Problems' })
    .first()
    .click();

  await expect(page).toHaveURL(/\/onlinejudge3\/problems$/);
  await expect(page.locator('#nprogress .bar')).toBeVisible();
  await expectRouteProgressUsesCurrentPrimaryColor(page);

  chunkGate.resolve();
  await clickPromise;

  await expect(page.getByRole('link', { name: '1000 - A + B Problem' })).toBeVisible();
  await expect(page.locator('#nprogress')).toHaveCount(0);
  expectHealthyBuiltRoute(monitor, 'p__problems__index');
});

test('light built output keeps project CSS overrides after async route chunks load', async ({
  page,
}) => {
  const monitor = await setupMockApi(page, {
    problemListSize: 3,
    theme: 'light',
  });

  await page.goto('/onlinejudge3/problems');

  await expect(page.getByRole('link', { name: '1000 - A + B Problem' })).toBeVisible();

  const metrics = await page.evaluate(() => {
    const header = document.querySelector('.ant-layout-header') as HTMLElement | null;
    const nav = document.querySelector('.ant-layout-header .ant-menu') as HTMLElement | null;
    const selectedItem = document.querySelector(
      '.ant-menu-horizontal > .ant-menu-item-selected',
    ) as HTMLElement | null;
    const row = document.querySelector('.ant-table-tbody > tr') as HTMLElement | null;
    const cell = document.querySelector('.ant-table-tbody > tr > td') as HTMLElement | null;
    const hiddenHeader = document.querySelector('.no-header-table thead') as HTMLElement | null;
    if (!header || !nav || !selectedItem || !row || !cell || !hiddenHeader) {
      throw new Error('Expected light problem list layout to be rendered');
    }

    const cellStyle = window.getComputedStyle(cell);

    return {
      cellPaddingBottom: cellStyle.paddingBottom,
      cellPaddingTop: cellStyle.paddingTop,
      headerBackground: window.getComputedStyle(header).backgroundColor,
      navBorderBottomWidth: window.getComputedStyle(nav).borderBottomWidth,
      rowHeight: row.getBoundingClientRect().height,
      selectedBorderBottomWidth: window.getComputedStyle(selectedItem).borderBottomWidth,
      tableHeaderDisplay: window.getComputedStyle(hiddenHeader).display,
    };
  });

  expect(luminance(metrics.headerBackground)).toBeGreaterThan(200);
  expect(metrics.navBorderBottomWidth).toBe('0px');
  expect(metrics.selectedBorderBottomWidth).toBe('0px');
  expect(metrics.cellPaddingTop).toBe('8px');
  expect(metrics.cellPaddingBottom).toBe('8px');
  expect(metrics.rowHeight).toBeLessThan(70);
  expect(metrics.tableHeaderDisplay).toBe('none');
  expectHealthyBuiltRoute(monitor, 'p__problems__index');
});

test('dark long problem list lays out above a dark footer', async ({ page }) => {
  const monitor = await setupMockApi(page, {
    problemListSize: 40,
    theme: 'dark',
  });

  await page.goto('/onlinejudge3/problems');

  await expect(
    page.getByRole('link', { name: '1039 - A+B for Input-Output Practice (39)' }),
  ).toBeVisible();

  const metrics = await page.evaluate(() => {
    const listCard = document.querySelector('.list-card') as HTMLElement | null;
    const footer = document.querySelector('.ant-layout-footer') as HTMLElement | null;
    const footerLink = footer?.querySelector('a') as HTMLElement | null;
    if (!listCard || !footer || !footerLink) {
      throw new Error('Expected long problem list and footer to be rendered');
    }

    const cardRect = listCard.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const footerStyle = window.getComputedStyle(footer);
    const footerLinkStyle = window.getComputedStyle(footerLink);

    return {
      cardBottom: cardRect.bottom + window.scrollY,
      footerBackground: footerStyle.backgroundColor,
      footerColor: footerStyle.color,
      footerLinkColor: footerLinkStyle.color,
      footerTop: footerRect.top + window.scrollY,
    };
  });

  expect(metrics.footerTop).toBeGreaterThanOrEqual(metrics.cardBottom - 1);
  expect(luminance(metrics.footerBackground)).toBeLessThan(40);
  expect(luminance(metrics.footerColor)).toBeGreaterThan(120);
  expect(luminance(metrics.footerLinkColor)).toBeGreaterThan(120);
  expectHealthyBuiltRoute(monitor, 'p__problems__index');
});

test('regular built output loads problem detail route chunk', async ({ page }) => {
  const monitor = await setupMockApi(page, { session: 'user' });

  await page.goto('/onlinejudge3/problems/1000');

  await expect(page.getByRole('heading', { name: 'A + B Problem' })).toBeVisible();
  await expect(page.getByText('Sample #1')).toBeVisible();
  expect(monitor.apiCalls).toContain('/getProblemDetail');
  expectHealthyBuiltRoute(monitor, 'p__problems__$id');
});

test('regular built output loads contest ranklist route chunk', async ({ page }) => {
  const monitor = await setupMockApi(page, { session: 'user' });

  await page.goto('/onlinejudge3/contests/1/ranklist');

  await expect(page.getByRole('heading', { name: 'Smoke Contest' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Alice AC' }).first()).toBeVisible();
  expect(monitor.apiCalls).toContain('/getContestRanklist');
  expectHealthyBuiltRoute(monitor, 'p__contests__$id__ranklist');
});

test('competition-side built output loads competition overview route chunk', async ({ page }) => {
  const monitor = await setupMockApi(page, { session: 'user' });

  await page.goto('/onlinejudge3_cs/competitions/1/overview');

  await expect(page.getByRole('heading', { name: 'Smoke Competition' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'A + B Problem' })).toBeVisible();
  expect(monitor.apiCalls).toContain('/getCompetitionDetail');
  expect(monitor.apiCalls).toContain('/getCompetitionProblems');
  expectHealthyBuiltRoute(monitor, 'p__competitions__$id__overview');
});
