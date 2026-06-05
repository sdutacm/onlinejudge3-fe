const { defineConfig, devices } = require('@playwright/test');

const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const chromiumLaunchOptions = chromiumExecutablePath
  ? {
      launchOptions: {
        executablePath: chromiumExecutablePath,
      },
    }
  : {};
const builtOutputPort = process.env.OJ3_BUILT_PORT || process.env.PORT || '5050';
const builtOutputBaseUrl = `http://127.0.0.1:${builtOutputPort}`;

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  use: {
    baseURL: builtOutputBaseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `cross-env PORT=${builtOutputPort} node tasks/serve-built-output.js`,
    url: `${builtOutputBaseUrl}/onlinejudge3/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ...chromiumLaunchOptions },
    },
  ],
});
