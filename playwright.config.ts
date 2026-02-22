import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { LogLevel } from '@slack/web-api';

/**
 * Read environment variables from file.
 * We will load them conditionally or rely on cross-env if needed.
 */
// require('dotenv').config({ path: path.resolve(__dirname, 'config', 'qa.env') });

import { generateCustomLayout } from './src/utils/slackCustomLayout';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html'],
        [
      'playwright-smart-reporter',
      {
        outputFolder: 'smart-report',
        open: true,
      },
    ],
        [
            'playwright-slack-report/dist/src/SlackReporter.js',
            {
                slackOAuthToken: process.env.SLACK_BOT_USER_OAUTH_TOKEN,
                channels: [process.env.SLACK_CHANNEL_ID || 'C0AGAMQE8G5'], // fallback
                sendResults: 'always',
                layout: generateCustomLayout,
                slackLogLevel: LogLevel.ERROR,
            },
        ],
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'Google Chrome',
            use: {
                ...devices['Desktop Chrome'],
                channel: 'chrome',
                viewport: { width: 1400, height: 1000 },
            },
        },
        {
            name: 'Safari',
            use: {
                browserName: 'webkit',
                ...devices['Desktop Safari'],
                viewport: { width: 1400, height: 1000 },
            },
        },
        {
            name: 'Firefox',
            use: {
                browserName: 'firefox',
                ...devices['Desktop Firefox'],
            },
        },
    ],
});