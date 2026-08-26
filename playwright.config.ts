import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 8000);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;
const SSR_PORT = 13714;
const isCI = Boolean(process.env.CI);

/**
 * Two layers of coverage, because the full matrix does not pay for itself.
 *
 * `cross/` runs on every browser: it is looking for rendering and hydration
 * faults, which are exactly the things that differ between engines.
 *
 * `deep/` runs on Chromium only: admin CRUD, the rich-text editor and the
 * performance probes are not engine-specific, and running them four more times
 * would multiply the suite's runtime without testing anything new. The
 * performance APIs are Chromium-only anyway.
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    /*
     * Capped deliberately. `php artisan serve` is PHP's built-in server, which
     * serves ONE request at a time (PHP_CLI_SERVER_WORKERS is Unix-only, and
     * this project develops on Windows). Left unbounded, six browser projects
     * saturate it and tests fail on queued-request timeouts that look exactly
     * like real UI faults — the worst kind of flake to debug.
     */
    workers: isCI ? 2 : 4,
    reporter: isCI
        ? [['github'], ['html', { open: 'never' }]]
        : [['list'], ['html', { open: 'never' }]],

    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'off',
        // The site is Indonesian; a browser advertising en-US can change how
        // dates and number formatting render.
        locale: 'id-ID',
        timezoneId: 'Asia/Jakarta',
    },

    projects: [
        {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
        },

        // Cross-browser layer — desktop.
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /cross\/.*\.spec\.ts/,
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            testMatch: /cross\/.*\.spec\.ts/,
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            testMatch: /cross\/.*\.spec\.ts/,
        },
        {
            name: 'edge',
            use: { ...devices['Desktop Edge'], channel: 'msedge' },
            testMatch: /cross\/.*\.spec\.ts/,
        },

        // Cross-browser layer — mobile. ~80% of this site's traffic is mobile
        // (prd-01), so these are not an afterthought.
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
            testMatch: /cross\/.*\.spec\.ts/,
        },
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 12'] },
            testMatch: /cross\/.*\.spec\.ts/,
        },

        // Deep layer — Chromium only.
        {
            name: 'admin',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /deep\/admin\.spec\.ts/,
            dependencies: ['setup'],
        },

        /*
         * Separate project because Core Web Vitals are a measurement, not an
         * assertion about markup: run alongside five other browsers they report
         * the machine's load rather than the page's speed. `npm run
         * test:e2e:perf` runs this one alone.
         */
        {
            name: 'perf',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /deep\/perf\.spec\.ts/,
        },
    ],

    /**
     * Both processes matter: without the SSR server the public pages quietly
     * fall back to client rendering, and seo.spec.ts is written to fail loudly
     * when that happens rather than let FR6-1 rot unnoticed.
     */
    webServer: [
        {
            command: 'php artisan inertia:start-ssr',
            port: SSR_PORT,
            reuseExistingServer: !isCI,
            timeout: 60_000,
            stdout: 'pipe',
            stderr: 'pipe',
        },
        {
            command: `php artisan serve --port=${PORT}`,
            port: PORT,
            reuseExistingServer: !isCI,
            timeout: 60_000,
        },
    ],
});
