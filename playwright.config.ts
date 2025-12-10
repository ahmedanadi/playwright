import fs from 'fs';
import yaml from 'js-yaml';
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

// load YAML config and pick section based on process.env.CI
const yamlPath = new URL('./env-config.yaml', import.meta.url).pathname;
let fileConfig: any = {};
try {
  const raw = fs.readFileSync(yamlPath, 'utf8');
  fileConfig = (yaml.load(raw) as any) || {};
} catch (e) {
  // file optional — fall back to defaults
}

const envKey = process.env.CI ? 'ci' : 'local';
const envConfig = fileConfig[envKey] || {};
Object.assign(process.env, envConfig.env || {});

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: envConfig.playwright?.retries ?? (process.env.CI ? 2 : 0),
  /* Opt out of parallel tests on CI. */
  workers: envConfig.playwright?.workers ?? (process.env.CI ? 1 : undefined),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: envConfig.playwright?.reporter ?? 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL ?? envConfig.env?.BASE_URL,
    headless: !!process.env.CI ? true : false,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: (envConfig.browsers ?? ['chromium', 'firefox', 'webkit']).map((name: string) => {
    const deviceMap: Record<string, any> = {
      chromium: { ...devices['Desktop Chrome'] },
      firefox: { ...devices['Desktop Firefox'] },
      webkit: { ...devices['Desktop Safari'] },
    };
    return { name, use: deviceMap[name] || {} };
  }),

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
